// src/modules/violations/violations.router.ts
//
//   POST   /                    SECURITY | ADMIN   create violation
//   GET    /                    any auth           list (students see own-plate only)
//   GET    /:id                 any auth           detail (students see own-plate only)
//   PATCH  /:id/status          SECURITY | ADMIN   transition status
//   POST   /:id/evidence        SECURITY | ADMIN   attach evidence
//   GET    /:id/evidence        any auth           list evidence

import { Router } from 'express';
import * as ctrl from './violations.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleGuard }      from '../../middlewares/role-guard.middleware';

const router = Router();

const staffOnly = [authMiddleware, roleGuard('SECURITY', 'ADMIN')];

router.post('/',                ctrl.createViolation);          // also callable by system (no auth guard here; reportedBy = null when unauthenticated)
router.get('/',                 authMiddleware, ctrl.listViolations);
router.get('/:id',              authMiddleware, ctrl.getViolationById);
router.patch('/:id/status',     ...staffOnly,   ctrl.updateStatus);
router.post('/:id/evidence',    ...staffOnly,   ctrl.addEvidence);
router.get('/:id/evidence',     authMiddleware, ctrl.listEvidence);

export default router;
