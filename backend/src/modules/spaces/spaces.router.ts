// src/modules/spaces/spaces.router.ts
//
// Route layout (mounted under /api/v1):
//   GET  /zones/:zoneId/spaces         — auth — paginated space list for a zone
//   GET  /spaces/:id                   — auth — single space detail
//   PATCH /spaces/:id/status           — ADMIN — manual status override

import { Router } from 'express';
import * as ctrl from './spaces.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleGuard }      from '../../middlewares/role-guard.middleware';

// Zone-scoped spaces router — mounted at /api/v1/zones/:zoneId/spaces
export const zoneSpacesRouter = Router({ mergeParams: true });
zoneSpacesRouter.get('/', authMiddleware, ctrl.getSpacesByZone);

// Standalone spaces router — mounted at /api/v1/spaces
export const spacesRouter = Router();
spacesRouter.get('/:id',        authMiddleware, ctrl.getSpaceById);
spacesRouter.patch('/:id/status', authMiddleware, roleGuard('ADMIN'), ctrl.patchSpaceStatus);
