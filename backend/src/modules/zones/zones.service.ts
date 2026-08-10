// src/modules/zones/zones.service.ts
// Zone business logic: availability aggregation, CRUD, public summary.
//
// DISCLAIMER: All zone boundaries, capacities, and occupancy figures are
// simulated/approximated MVP data. They do not represent official KSU
// parking infrastructure or verified zone designations.

import { prisma } from '../../config/database';
import { CreateZoneInput, UpdateZoneInput } from './zones.schemas';
import { SpaceStatus, UserRole } from '@prisma/client';

// ── Availability helper ───────────────────────────────────────────────────────

async function aggregateAvailability(zoneId: string) {
  const counts = await prisma.space.groupBy({
    by: ['status'],
    where: { zoneId },
    _count: { status: true },
  });

  const get = (s: SpaceStatus) =>
    counts.find(c => c.status === s)?._count.status ?? 0;

  const occupied     = get(SpaceStatus.OCCUPIED);
  const available    = get(SpaceStatus.AVAILABLE);
  const reserved     = get(SpaceStatus.RESERVED);
  const maintenance  = get(SpaceStatus.MAINTENANCE);
  const total        = occupied + available + reserved + maintenance;
  const occupancyPct = total > 0 ? Math.round((occupied / total) * 100) : 0;

  return { occupied, available, reserved, maintenance, total, occupancyPct };
}

function deriveStatus(occupancyPct: number): 'AVAILABLE' | 'LIMITED' | 'FULL' {
  if (occupancyPct > 85) return 'FULL';
  if (occupancyPct > 60) return 'LIMITED';
  return 'AVAILABLE';
}

// ── Shape returned to clients ─────────────────────────────────────────────────

export interface ZoneWithAvailability {
  id:             string;
  name:           string;
  code:           string;
  description:    string;
  totalSpaces:    number;
  permittedRoles: UserRole[];
  coordinates:    unknown;
  centerLat:      number;
  centerLng:      number;
  occupied:       number;
  available:      number;
  reserved:       number;
  maintenance:    number;
  occupancyPct:   number;
  status:         'AVAILABLE' | 'LIMITED' | 'FULL';
  createdAt:      Date;
  updatedAt:      Date;
}

async function enrichZone(zone: {
  id: string; name: string; code: string; description: string;
  totalSpaces: number; permittedRoles: UserRole[];
  coordinates: unknown; centerLat: number; centerLng: number;
  createdAt: Date; updatedAt: Date;
}): Promise<ZoneWithAvailability> {
  const avail = await aggregateAvailability(zone.id);
  return {
    ...zone,
    ...avail,
    status: deriveStatus(avail.occupancyPct),
  };
}

// ── Service methods ───────────────────────────────────────────────────────────

const ZONE_SELECT = {
  id: true, name: true, code: true, description: true,
  totalSpaces: true, permittedRoles: true,
  coordinates: true, centerLat: true, centerLng: true,
  createdAt: true, updatedAt: true,
};

export async function getAllZones(): Promise<ZoneWithAvailability[]> {
  const zones = await prisma.zone.findMany({
    where:   { deletedAt: null },
    select:  ZONE_SELECT,
    orderBy: { code: 'asc' },
  });
  return Promise.all(zones.map(enrichZone));
}

/** Public summary — anonymised, no auth required. Returns only zone-level counts. */
export async function getPublicZones() {
  const zones = await getAllZones();
  return zones.map(z => ({
    id:           z.id,
    name:         z.name,
    code:         z.code,
    coordinates:  z.coordinates,
    centerLat:    z.centerLat,
    centerLng:    z.centerLng,
    totalSpaces:  z.totalSpaces,
    available:    z.available,
    occupied:     z.occupied,
    occupancyPct: z.occupancyPct,
    status:       z.status,
  }));
}

export async function getZoneById(id: string): Promise<ZoneWithAvailability> {
  const zone = await prisma.zone.findFirst({
    where:  { id, deletedAt: null },
    select: ZONE_SELECT,
  });
  if (!zone) {
    const err = new Error('Zone not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }
  return enrichZone(zone);
}

export async function createZone(input: CreateZoneInput): Promise<ZoneWithAvailability> {
  const existing = await prisma.zone.findUnique({ where: { code: input.code } });
  if (existing && !existing.deletedAt) {
    const err = new Error(`Zone with code '${input.code}' already exists`) as Error & { status: number };
    err.status = 409;
    throw err;
  }
  const zone = await prisma.zone.create({
    data: {
      name:           input.name,
      code:           input.code,
      totalSpaces:    input.totalSpaces,
      description:    input.description ?? '',
      permittedRoles: input.permittedRoles as UserRole[],
      coordinates:    input.coordinates,
      centerLat:      input.centerLat,
      centerLng:      input.centerLng,
    },
    select: ZONE_SELECT,
  });
  return enrichZone(zone);
}

export async function updateZone(id: string, input: UpdateZoneInput): Promise<ZoneWithAvailability> {
  await getZoneById(id); // throws 404 if not found/deleted
  const zone = await prisma.zone.update({
    where:  { id },
    data:   {
      ...(input.name           !== undefined && { name:           input.name           }),
      ...(input.code           !== undefined && { code:           input.code           }),
      ...(input.totalSpaces    !== undefined && { totalSpaces:    input.totalSpaces    }),
      ...(input.description    !== undefined && { description:    input.description    }),
      ...(input.permittedRoles !== undefined && { permittedRoles: input.permittedRoles as UserRole[] }),
      ...(input.coordinates    !== undefined && { coordinates:    input.coordinates    }),
      ...(input.centerLat      !== undefined && { centerLat:      input.centerLat      }),
      ...(input.centerLng      !== undefined && { centerLng:      input.centerLng      }),
    },
    select: ZONE_SELECT,
  });
  return enrichZone(zone);
}

export async function deleteZone(id: string): Promise<void> {
  await getZoneById(id); // throws 404 if already deleted
  await prisma.zone.update({
    where: { id },
    data:  { deletedAt: new Date() },
  });
}
