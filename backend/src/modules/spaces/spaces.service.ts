// src/modules/spaces/spaces.service.ts
// Space business logic: paginated listing per zone and admin status overrides.

import { prisma } from '../../config/database';
import { toSkipTake, toPaginationMeta } from '../../utils/pagination';
import { SpaceStatus } from '@prisma/client';
import { PatchSpaceStatusInput } from './spaces.schemas';

const SPACE_SELECT = {
  id: true, zoneId: true, spaceNumber: true,
  status: true, vehiclePlate: true,
  coordinates: true, lastUpdatedAt: true,
};

export async function getSpacesByZone(
  zoneId: string,
  page: number,
  limit: number,
  statusFilter?: SpaceStatus,
) {
  const where = {
    zoneId,
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const [spaces, total] = await Promise.all([
    prisma.space.findMany({
      where,
      select:  SPACE_SELECT,
      orderBy: { spaceNumber: 'asc' },
      ...toSkipTake(page, limit),
    }),
    prisma.space.count({ where }),
  ]);

  return { spaces, pagination: toPaginationMeta(total, page, limit) };
}

export async function getSpaceById(id: string) {
  const space = await prisma.space.findUnique({
    where:  { id },
    select: SPACE_SELECT,
  });
  if (!space) {
    const err = new Error('Space not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }
  return space;
}

export async function patchSpaceStatus(id: string, input: PatchSpaceStatusInput) {
  await getSpaceById(id); // 404 guard

  const updated = await prisma.space.update({
    where: { id },
    data: {
      status:        input.status as SpaceStatus,
      vehiclePlate:  input.status === 'OCCUPIED' ? (input.vehiclePlate ?? null) : null,
      lastUpdatedAt: new Date(),
    },
    select: SPACE_SELECT,
  });
  return updated;
}
