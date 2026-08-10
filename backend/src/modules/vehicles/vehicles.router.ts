// src/modules/vehicles/vehicles.router.ts
//
// Route layout:
//   POST   /              — auth (any role)   — register a vehicle
//   GET    /my            — auth (any role)   — student's own vehicles
//   GET    /lookup?plate= — SECURITY | ADMIN  — plate lookup with owner info
//   DELETE /:id           — auth (any role)   — owner or admin deregisters

import { Router } from 'express';
import * as ctrl from './vehicles.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleGuard }      from '../../middlewares/role-guard.middleware';

const router = Router();

router.post('/',                 authMiddleware, ctrl.registerVehicle);
router.get('/my',                authMiddleware, ctrl.getMyVehicles);
router.get('/lookup',            authMiddleware, roleGuard('SECURITY', 'ADMIN'), ctrl.lookupByPlate);
router.delete('/:id',            authMiddleware, ctrl.deregisterVehicle);

export default router;
