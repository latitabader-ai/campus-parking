// src/modules/reservations/reservations.router.ts
//
//   POST   /                 STUDENT | ADMIN    create reservation (zone-based, auto-assigns space)
//   GET    /my               auth               student's reservation history
//   GET    /active           auth               student's current active reservation
//   DELETE /:id/cancel       auth               cancel own reservation
//   GET    /all              SECURITY | ADMIN   list all reservations (staff view)

import { Router } from 'express';
import * as ctrl from './reservations.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleGuard }      from '../../middlewares/role-guard.middleware';

const router = Router();

router.post('/',             authMiddleware, ctrl.createReservation);
router.get('/my',            authMiddleware, ctrl.getMyReservations);
router.get('/active',        authMiddleware, ctrl.getActiveReservation);
router.delete('/:id/cancel', authMiddleware, ctrl.cancelReservation);
router.get('/all',           authMiddleware, roleGuard('SECURITY', 'ADMIN'), ctrl.listAllReservations);

export default router;
