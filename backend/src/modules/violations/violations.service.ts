// src/modules/violations/violations.service.ts
// Violation lifecycle: create, list (with filters), status transitions, evidence.

import { prisma } from '../../config/database';
import { toSkipTake, toPaginationMeta } from '../../utils/pagination';
import {
  CreateViolationInput, UpdateStatusInput,
  ViolationFilterInput, AddEvidenceInput,
} from './violations.schemas';
import {
  ViolationStatus, ViolationType, EvidenceFileType, UserRole,
} from '@prisma/client';

// ── Allowed status transitions ────────────────────────────────────────────────
const TRANSITIONS: Record<ViolationStatus, ViolationStatus[]> = {
  PENDING:      [ViolationStatus.ACKNOWLEDGED, ViolationStatus.RESOLVED, ViolationStatus.DISMISSED],
  ACKNOWLEDGED: [ViolationStatus.RESOLVED, ViolationStatus.DISMISSED],
  RESOLVED:     [],
  DISMISSED:    [],
};

// ── Select shapes ─────────────────────────────────────────────────────────────
const VIOLATION_SUMMARY = {
  id: true, vehiclePlate: true, violationType: true,
  detectedAt: true, status: true, notes: true,
  spaceId: true,
  space: { select: { spaceNumber: true, zoneId: true, zone: { select: { code: true, name: true } } } },
  reportedById: true,
  resolvedById: true, resolvedAt: true,
};

const VIOLATION_DETAIL = {
  ...VIOLATION_SUMMARY,
  evidence: {
    select: { id: true, fileUrl: true, fileType: true, createdAt: true,
              uploadedBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' as const },
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function notFound() {
  const e = new Error('Violation not found') as Error & { status: number };
  e.status = 404; return e;
}

// ── Service methods ───────────────────────────────────────────────────────────

export async function createViolation(
  input: CreateViolationInput,
  reportedById: string | null,       // null = system-generated
) {
  // Confirm space exists — spaceId is already validated as UUID by Zod schema
  const space = await prisma.space.findUnique({
    where:  { id: input.spaceId },
    select: { id: true, zoneId: true },
  });
  if (!space) {
    const e = new Error(`Space not found: no space exists with id "${input.spaceId}". Select a valid space from the zone dropdown.`) as Error & { status: number };
    e.status = 400; throw e;
  }

  return prisma.violation.create({
    data: {
      spaceId:       input.spaceId,
      vehiclePlate:  input.vehiclePlate,
      violationType: input.violationType as ViolationType,
      notes:         input.notes ?? null,
      reportedById,
    },
    select: VIOLATION_SUMMARY,
  });
}

export async function listViolations(
  filter: ViolationFilterInput,
  requesterId: string,
  requesterRole: UserRole,
) {
  // Students see only violations tied to their own plates
  let plateFilter: string | undefined = filter.plate;
  if (requesterRole === UserRole.STUDENT) {
    const myVehicles = await prisma.vehicle.findMany({
      where:  { ownerId: requesterId },
      select: { plate: true },
    });
    const myPlates = myVehicles.map(v => v.plate);

    // If student specified a plate that isn't theirs, return empty
    if (plateFilter && !myPlates.includes(plateFilter)) {
      return { violations: [], pagination: toPaginationMeta(0, filter.page, filter.limit) };
    }
    // Otherwise restrict to their plates
    if (!plateFilter && myPlates.length === 0) {
      return { violations: [], pagination: toPaginationMeta(0, filter.page, filter.limit) };
    }
    plateFilter = plateFilter ?? undefined;
    // For student with no explicit plate filter, scope to their plates
    if (!filter.plate) {
      const result = await _listByPlates(myPlates, filter);
      return result;
    }
  }

  const where = buildWhereClause(filter, plateFilter);
  const [violations, total] = await Promise.all([
    prisma.violation.findMany({
      where,
      select:  VIOLATION_SUMMARY,
      orderBy: { detectedAt: 'desc' },
      ...toSkipTake(filter.page, filter.limit),
    }),
    prisma.violation.count({ where }),
  ]);
  return { violations, pagination: toPaginationMeta(total, filter.page, filter.limit) };
}

async function _listByPlates(plates: string[], filter: ViolationFilterInput) {
  const where = {
    vehiclePlate: { in: plates },
    ...(filter.status        ? { status:        filter.status        as ViolationStatus        } : {}),
    ...(filter.violationType ? { violationType: filter.violationType as ViolationType } : {}),
  };
  const [violations, total] = await Promise.all([
    prisma.violation.findMany({
      where,
      select:  VIOLATION_SUMMARY,
      orderBy: { detectedAt: 'desc' },
      ...toSkipTake(filter.page, filter.limit),
    }),
    prisma.violation.count({ where }),
  ]);
  return { violations, pagination: toPaginationMeta(total, filter.page, filter.limit) };
}

function buildWhereClause(filter: ViolationFilterInput, plateFilter?: string) {
  return {
    ...(filter.status        ? { status:        filter.status        as ViolationStatus        } : {}),
    ...(filter.violationType ? { violationType: filter.violationType as ViolationType } : {}),
    ...(plateFilter          ? { vehiclePlate:  plateFilter                                    } : {}),
    ...(filter.zoneId        ? { space: { zoneId: filter.zoneId }                              } : {}),
  };
}

export async function getViolationById(
  id: string,
  requesterId: string,
  requesterRole: UserRole,
) {
  const violation = await prisma.violation.findUnique({
    where:  { id },
    select: VIOLATION_DETAIL,
  });
  if (!violation) throw notFound();

  // Students may only see violations against their own plates
  if (requesterRole === UserRole.STUDENT) {
    const mine = await prisma.vehicle.findFirst({
      where: { ownerId: requesterId, plate: violation.vehiclePlate },
    });
    if (!mine) throw notFound(); // treat as not found to avoid info leak
  }
  return violation;
}

export async function updateViolationStatus(
  id: string,
  input: UpdateStatusInput,
  resolverId: string,
) {
  const violation = await prisma.violation.findUnique({
    where: { id }, select: { id: true, status: true },
  });
  if (!violation) throw notFound();

  const allowed = TRANSITIONS[violation.status];
  if (!allowed.includes(input.status as ViolationStatus)) {
    const e = new Error(
      `Cannot transition from ${violation.status} to ${input.status}`,
    ) as Error & { status: number };
    e.status = 422; throw e;
  }

  const isTerminal = input.status === 'RESOLVED' || input.status === 'DISMISSED';
  return prisma.violation.update({
    where: { id },
    data: {
      status:      input.status as ViolationStatus,
      notes:       input.notes ?? undefined,
      resolvedById: isTerminal ? resolverId : undefined,
      resolvedAt:   isTerminal ? new Date()  : undefined,
    },
    select: VIOLATION_DETAIL,
  });
}

export async function addEvidence(
  violationId: string,
  input: AddEvidenceInput,
  uploadedById: string,
) {
  // Confirm violation exists
  const violation = await prisma.violation.findUnique({
    where: { id: violationId }, select: { id: true },
  });
  if (!violation) throw notFound();

  return prisma.evidence.create({
    data: {
      violationId,
      fileUrl:      input.fileUrl,
      fileType:     input.fileType as EvidenceFileType,
      uploadedById,
    },
    select: {
      id: true, fileUrl: true, fileType: true, createdAt: true,
      uploadedBy: { select: { id: true, name: true } },
    },
  });
}

export async function listEvidence(violationId: string) {
  const violation = await prisma.violation.findUnique({
    where: { id: violationId }, select: { id: true },
  });
  if (!violation) throw notFound();

  return prisma.evidence.findMany({
    where:   { violationId },
    select: {
      id: true, fileUrl: true, fileType: true, createdAt: true,
      uploadedBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
}
