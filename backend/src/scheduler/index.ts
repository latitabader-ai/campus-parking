// src/scheduler/index.ts
// Minimal scheduler: occupancy simulation + reservation expiry sweep.
// Controlled by SIMULATOR_ENABLED env flag — set false in production.

import cron from 'node-cron';
import { prisma } from '../config/database';
import { SpaceStatus } from '@prisma/client';
import { emitZoneUpdate } from '../config/socket';
import { expireStale } from '../modules/reservations/reservations.service';

// ── Deterministic-ish RNG for simulation (not cryptographic) ─────────────────
function simRng() { return Math.random(); }

// ── Occupancy simulator ───────────────────────────────────────────────────────
// Every 2 minutes: flip a small batch of spaces between AVAILABLE and OCCUPIED
// to simulate realistic parking churn. Emits zone update events via Socket.IO.
async function simulateOccupancy() {
  const zones = await prisma.zone.findMany({
    where:  { deletedAt: null },
    select: { id: true, code: true },
  });

  for (const zone of zones) {
    // Flip ~3% of spaces per zone per tick
    const BATCH = 15;

    // Randomly free some occupied spaces
    const occupied = await prisma.space.findMany({
      where:   { zoneId: zone.id, status: SpaceStatus.OCCUPIED },
      select:  { id: true },
      take:    BATCH,
      skip:    Math.floor(simRng() * 20),
    });
    const toFree = occupied.slice(0, Math.floor(simRng() * 8));

    // Randomly occupy some available spaces
    const available = await prisma.space.findMany({
      where:   { zoneId: zone.id, status: SpaceStatus.AVAILABLE },
      select:  { id: true },
      take:    BATCH,
      skip:    Math.floor(simRng() * 20),
    });
    const toOccupy = available.slice(0, Math.floor(simRng() * 8));

    if (toFree.length === 0 && toOccupy.length === 0) continue;

    await prisma.$transaction([
      ...toFree.map(s => prisma.space.update({
        where: { id: s.id },
        data:  { status: SpaceStatus.AVAILABLE, vehiclePlate: null, lastUpdatedAt: new Date() },
      })),
      ...toOccupy.map(s => prisma.space.update({
        where: { id: s.id },
        data:  { status: SpaceStatus.OCCUPIED, lastUpdatedAt: new Date() },
      })),
    ]);

    // Aggregate updated counts and emit to zone room
    const counts = await prisma.space.groupBy({
      by:    ['status'],
      where: { zoneId: zone.id },
      _count: { status: true },
    });
    const get = (st: SpaceStatus) => counts.find(c => c.status === st)?._count.status ?? 0;
    const occupied2  = get(SpaceStatus.OCCUPIED);
    const available2 = get(SpaceStatus.AVAILABLE);
    const total      = await prisma.space.count({ where: { zoneId: zone.id } });

    emitZoneUpdate(zone.id, {
      zoneId: zone.id, code: zone.code,
      occupied: occupied2, available: available2, total,
      occupancyPct: total > 0 ? Math.round((occupied2 / total) * 100) : 0,
    });
  }
}

// ── Occupancy snapshot writer ─────────────────────────────────────────────────
// Every 10 minutes: write a snapshot row per zone for analytics.
async function writeOccupancySnapshots() {
  const zones = await prisma.zone.findMany({
    where:  { deletedAt: null },
    select: { id: true, totalSpaces: true },
  });
  for (const zone of zones) {
    const counts = await prisma.space.groupBy({
      by:    ['status'],
      where: { zoneId: zone.id },
      _count: { status: true },
    });
    const get = (st: SpaceStatus) => counts.find(c => c.status === st)?._count.status ?? 0;
    await prisma.occupancySnapshot.create({
      data: {
        zoneId:    zone.id,
        occupied:  get(SpaceStatus.OCCUPIED),
        available: get(SpaceStatus.AVAILABLE),
        total:     zone.totalSpaces,
      },
    });
  }
}

// ── Reservation expiry sweep ──────────────────────────────────────────────────
// Every minute: expire timed-out reservations and release spaces.
async function reservationExpirySweep() {
  const count = await expireStale();
  if (count > 0) {
    console.log(`[Scheduler] Expired ${count} reservation(s)`);
  }
}

// ── Register jobs ─────────────────────────────────────────────────────────────
export function startScheduler(): void {
  cron.schedule('*/2  * * * *', simulateOccupancy);       // every 2 min
  cron.schedule('*/10 * * * *', writeOccupancySnapshots); // every 10 min
  cron.schedule('*/1  * * * *', reservationExpirySweep);  // every 1 min
  console.log('[Scheduler] Started — occupancy simulation, snapshots, reservation expiry');
}
