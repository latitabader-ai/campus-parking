// src/modules/reservations/reservations.service.ts
// Reservation lifecycle: create (15-min hold), view, cancel, expiry sweep.
// Students only. One active reservation per user at a time.

import { prisma } from '../../config/database';
import { ReservationStatus, SpaceStatus } from '@prisma/client';
import { CreateReservationInput, RESERVATION_HOLD_MINUTES } from './reservations.schemas';

const SELECT = {
  id: true, status: true, expiresAt: true, createdAt: true,
  space: {
    select: {
      id: true, spaceNumber: true, zoneId: true,
      zone: { select: { id: true, code: true, name: true } },
    },
  },
  userId: true,
};

function notFound() {
  const e = new Error('Reservation not found') as Error & { status: number };
  e.status = 404; return e;
}

// ── Public helpers (also called by scheduler) ─────────────────────────────────

/** Expire reservations whose hold time has elapsed. Called by scheduler & on-read. */
export async function expireStale(): Promise<number> {
  const stale = await prisma.reservation.findMany({
    where:  { status: ReservationStatus.ACTIVE, expiresAt: { lte: new Date() } },
    select: { id: true, spaceId: true },
  });
  if (stale.length === 0) return 0;

  await prisma.$transaction([
    // Release each space back to AVAILABLE
    ...stale.map(r =>
      prisma.space.update({
        where: { id: r.spaceId },
        data:  { status: SpaceStatus.AVAILABLE, vehiclePlate: null, lastUpdatedAt: new Date() },
      })
    ),
    // Mark reservations expired
    prisma.reservation.updateMany({
      where: { id: { in: stale.map(r => r.id) } },
      data:  { status: ReservationStatus.EXPIRED, updatedAt: new Date() },
    }),
  ]);
  return stale.length;
}

// ── Service methods ───────────────────────────────────────────────────────────

export async function createReservation(input: CreateReservationInput, userId: string) {
  // Expire any stale reservations first (passive cleanup)
  await expireStale();

  // Enforce one active reservation per user
  const existing = await prisma.reservation.findFirst({
    where: { userId, status: ReservationStatus.ACTIVE },
    select: { id: true, expiresAt: true },
  });
  if (existing) {
    const e = new Error(
      'You already have an active reservation. Cancel it before creating a new one.'
    ) as Error & { status: number };
    e.status = 409; throw e;
  }

  // Confirm zone exists
  const zone = await prisma.zone.findFirst({
    where: { id: input.zoneId, deletedAt: null },
    select: { id: true },
  });
  if (!zone) {
    const e = new Error('Zone not found') as Error & { status: number };
    e.status = 404; throw e;
  }

  // Find a target space — either the requested one or the next AVAILABLE in zone
  let space: { id: string; status: SpaceStatus } | null = null;

  if (input.spaceId) {
    space = await prisma.space.findFirst({
      where: { id: input.spaceId, zoneId: input.zoneId },
      select: { id: true, status: true },
    });
    if (!space) {
      const e = new Error('Space not found in the requested zone') as Error & { status: number };
      e.status = 404; throw e;
    }
    if (space.status !== SpaceStatus.AVAILABLE) {
      const e = new Error('The requested space is not available') as Error & { status: number };
      e.status = 409; throw e;
    }
  } else {
    space = await prisma.space.findFirst({
      where:   { zoneId: input.zoneId, status: SpaceStatus.AVAILABLE },
      orderBy: { spaceNumber: 'asc' },
      select:  { id: true, status: true },
    });
    if (!space) {
      const e = new Error('No available spaces in the requested zone') as Error & { status: number };
      e.status = 409; throw e;
    }
  }

  const expiresAt = new Date(Date.now() + RESERVATION_HOLD_MINUTES * 60 * 1000);

  // Atomically mark the space RESERVED and create the reservation record
  const [, reservation] = await prisma.$transaction([
    prisma.space.update({
      where: { id: space.id },
      data:  { status: SpaceStatus.RESERVED, lastUpdatedAt: new Date() },
    }),
    prisma.reservation.create({
      data:   { userId, spaceId: space.id, expiresAt },
      select: SELECT,
    }),
  ]);

  return reservation;
}

export async function getMyReservations(userId: string) {
  await expireStale();
  return prisma.reservation.findMany({
    where:   { userId },
    select:  SELECT,
    orderBy: { createdAt: 'desc' },
    take:    20,
  });
}

export async function getActiveReservation(userId: string) {
  await expireStale();
  return prisma.reservation.findFirst({
    where:  { userId, status: ReservationStatus.ACTIVE },
    select: SELECT,
  });
}

export async function cancelReservation(reservationId: string, userId: string) {
  await expireStale();
  const reservation = await prisma.reservation.findUnique({
    where:  { id: reservationId },
    select: { id: true, userId: true, status: true, spaceId: true },
  });
  if (!reservation) throw notFound();
  if (reservation.userId !== userId) {
    const e = new Error('You can only cancel your own reservations') as Error & { status: number };
    e.status = 403; throw e;
  }
  if (reservation.status !== ReservationStatus.ACTIVE) {
    const e = new Error(`Reservation is already ${reservation.status}`) as Error & { status: number };
    e.status = 422; throw e;
  }

  const [, updated] = await prisma.$transaction([
    prisma.space.update({
      where: { id: reservation.spaceId },
      data:  { status: SpaceStatus.AVAILABLE, lastUpdatedAt: new Date() },
    }),
    prisma.reservation.update({
      where:  { id: reservationId },
      data:   { status: ReservationStatus.CANCELLED, updatedAt: new Date() },
      select: SELECT,
    }),
  ]);

  return updated;
}

/** Admin/Security: list all reservations with optional status filter. */
export async function listAllReservations(status?: string) {
  await expireStale();
  return prisma.reservation.findMany({
    where:   status ? { status: status as ReservationStatus } : {},
    select:  SELECT,
    orderBy: { createdAt: 'desc' },
    take:    100,
  });
}
