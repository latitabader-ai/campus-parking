// src/modules/analytics/analytics.router.ts
// Minimal analytics for Admin dashboard: occupancy trends + violations summary.

import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleGuard }      from '../../middlewares/role-guard.middleware';
import { prisma }         from '../../config/database';
import { sendSuccess }    from '../../utils/response';
import { SpaceStatus }    from '@prisma/client';

const router = Router();
const adminOnly = [authMiddleware, roleGuard('ADMIN')];

// GET /analytics/occupancy — latest snapshot per zone
router.get('/occupancy', ...adminOnly, async (_req, res, next) => {
  try {
    const zones = await prisma.zone.findMany({
      where:  { deletedAt: null },
      select: { id: true, code: true, name: true, totalSpaces: true },
      orderBy: { code: 'asc' },
    });
    const result = await Promise.all(zones.map(async z => {
      // Last 24 snapshots (~4 hrs at 10-min interval)
      const snapshots = await prisma.occupancySnapshot.findMany({
        where:   { zoneId: z.id },
        orderBy: { snapshotAt: 'desc' },
        take:    24,
        select:  { occupied: true, available: true, total: true, snapshotAt: true },
      });
      return { ...z, snapshots: snapshots.reverse() };
    }));
    sendSuccess(res, result);
  } catch (err) { next(err); }
});

// GET /analytics/violations — grouped counts by type and status
router.get('/violations', ...adminOnly, async (_req, res, next) => {
  try {
    const byType   = await prisma.violation.groupBy({ by: ['violationType'], _count: { id: true } });
    const byStatus = await prisma.violation.groupBy({ by: ['status'],        _count: { id: true } });
    const total    = await prisma.violation.count();
    sendSuccess(res, { total, byType, byStatus });
  } catch (err) { next(err); }
});

// GET /analytics/summary — quick dashboard numbers
router.get('/summary', authMiddleware, roleGuard('SECURITY', 'ADMIN'), async (_req, res, next) => {
  try {
    const [totalSpaces, occupied, pending, active, users] = await Promise.all([
      prisma.space.count(),
      prisma.space.count({ where: { status: SpaceStatus.OCCUPIED } }),
      prisma.violation.count({ where: { status: 'PENDING' } }),
      prisma.reservation.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { deletedAt: null } }),
    ]);
    sendSuccess(res, {
      totalSpaces, occupied,
      available:         totalSpaces - occupied,
      globalOccupancyPct: totalSpaces > 0 ? Math.round((occupied / totalSpaces) * 100) : 0,
      pendingViolations: pending,
      activeReservations: active,
      registeredUsers:   users,
    });
  } catch (err) { next(err); }
});

// GET /analytics/export/violations — CSV download
router.get('/export/violations', ...adminOnly, async (_req, res, next) => {
  try {
    const violations = await prisma.violation.findMany({
      select: {
        id: true, vehiclePlate: true, violationType: true,
        status: true, detectedAt: true, resolvedAt: true, notes: true,
        space: { select: { spaceNumber: true, zone: { select: { code: true } } } },
      },
      orderBy: { detectedAt: 'desc' },
      take: 1000,
    });
    const header = 'id,plate,type,status,zone,space,detectedAt,resolvedAt,notes';
    const rows = violations.map(v =>
      [
        v.id, v.vehiclePlate, v.violationType, v.status,
        v.space.zone.code, v.space.spaceNumber,
        v.detectedAt.toISOString(),
        v.resolvedAt?.toISOString() ?? '',
        `"${(v.notes ?? '').replace(/"/g, '""')}"`,
      ].join(',')
    );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="violations.csv"');
    res.send([header, ...rows].join('\n'));
  } catch (err) { next(err); }
});

export default router;
