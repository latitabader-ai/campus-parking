// src/modules/vehicles/vehicles.service.ts
// Vehicle business logic: registration, ownership, plate lookup.
//
// DISCLAIMER: Vehicle and plate data in the MVP is simulated/demo data.
// Real ANPR / OCR is not implemented. Plate format is a simplified
// romanised Saudi-style for demonstration purposes only.

import { prisma } from '../../config/database';
import { RegisterVehicleInput } from './vehicles.schemas';

const VEHICLE_SELECT = {
  id: true, plate: true, make: true, model: true,
  color: true, isRegistered: true, registeredAt: true,
  ownerId: true,
};

// Shape returned when the full owner detail is included (security/admin lookup)
const VEHICLE_WITH_OWNER_SELECT = {
  ...VEHICLE_SELECT,
  owner: {
    select: { id: true, email: true, name: true, role: true },
  },
};

function notFound(): Error & { status: number } {
  const err = new Error('Vehicle not found') as Error & { status: number };
  err.status = 404;
  return err;
}

function forbidden(): Error & { status: number } {
  const err = new Error('You do not have permission to modify this vehicle') as Error & { status: number };
  err.status = 403;
  return err;
}

// ── Service methods ───────────────────────────────────────────────────────────

/** Register a new vehicle. Students own it; visitors/guests pass ownerId = null. */
export async function registerVehicle(input: RegisterVehicleInput, ownerId: string | null) {
  const existing = await prisma.vehicle.findUnique({ where: { plate: input.plate } });
  if (existing) {
    const err = new Error(`A vehicle with plate '${input.plate}' is already registered`) as Error & { status: number };
    err.status = 409;
    throw err;
  }

  return prisma.vehicle.create({
    data: {
      plate:        input.plate,
      ownerId,
      make:         input.make  ?? null,
      model:        input.model ?? null,
      color:        input.color ?? null,
      isRegistered: true,
    },
    select: VEHICLE_SELECT,
  });
}

/** Return all vehicles owned by a specific user. */
export async function getMyVehicles(ownerId: string) {
  return prisma.vehicle.findMany({
    where:   { ownerId },
    select:  VEHICLE_SELECT,
    orderBy: { registeredAt: 'desc' },
  });
}

/** Plate lookup — returns vehicle + owner info. Security/Admin only. */
export async function lookupByPlate(plate: string) {
  const vehicle = await prisma.vehicle.findUnique({
    where:  { plate },
    select: VEHICLE_WITH_OWNER_SELECT,
  });
  if (!vehicle) throw notFound();
  return vehicle;
}

/** Deregister a vehicle. Students can only delete their own. */
export async function deregisterVehicle(id: string, requesterId: string, requesterRole: string) {
  const vehicle = await prisma.vehicle.findUnique({
    where:  { id },
    select: { id: true, ownerId: true },
  });
  if (!vehicle) throw notFound();

  // Students may only delete their own vehicle
  if (requesterRole === 'STUDENT' && vehicle.ownerId !== requesterId) {
    throw forbidden();
  }

  await prisma.vehicle.delete({ where: { id } });
}
