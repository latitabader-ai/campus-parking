// src/modules/zones/zones.router.ts
//
// Route layout:
//   GET  /public          — no auth — visitor/public availability summary
//   GET  /                — auth    — full zone list with availability
//   GET  /:id             — auth    — single zone detail
//   POST /                — ADMIN   — create zone
//   PUT  /:id             — ADMIN   — update zone
//   DELETE /:id           — ADMIN   — soft-delete zone

import { Router } from 'express';
import * as ctrl from './zones.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleGuard }      from '../../middlewares/role-guard.middleware';

const router = Router();

// ── Public (no auth) ─────────────────────────────────────────────────────────
router.get('/public', ctrl.getPublicZones);

// ── Authenticated ─────────────────────────────────────────────────────────────
router.get('/',    authMiddleware, ctrl.getAllZones);
router.get('/:id', authMiddleware, ctrl.getZoneById);

// ── Admin only ────────────────────────────────────────────────────────────────
router.post('/',    authMiddleware, roleGuard('ADMIN'), ctrl.createZone);
router.put('/:id',  authMiddleware, roleGuard('ADMIN'), ctrl.updateZone);
router.delete('/:id', authMiddleware, roleGuard('ADMIN'), ctrl.deleteZone);

export default router;
