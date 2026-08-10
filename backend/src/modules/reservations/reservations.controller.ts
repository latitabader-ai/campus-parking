// src/modules/reservations/reservations.controller.ts

import { Request, Response, NextFunction } from 'express';
import * as svc from './reservations.service';
import { CreateReservationSchema } from './reservations.schemas';
import { sendSuccess, sendError } from '../../utils/response';

export async function createReservation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.sub) { sendError(res, 'Unauthorized', 401); return; }
    const input       = CreateReservationSchema.parse(req.body);
    const reservation = await svc.createReservation(input, req.user.sub);
    sendSuccess(res, reservation, 'Reservation created', 201);
  } catch (err) { next(err); }
}

export async function getMyReservations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.sub) { sendError(res, 'Unauthorized', 401); return; }
    const reservations = await svc.getMyReservations(req.user.sub);
    sendSuccess(res, reservations);
  } catch (err) { next(err); }
}

export async function getActiveReservation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.sub) { sendError(res, 'Unauthorized', 401); return; }
    const reservation = await svc.getActiveReservation(req.user.sub);
    sendSuccess(res, reservation ?? null);
  } catch (err) { next(err); }
}

export async function cancelReservation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.sub) { sendError(res, 'Unauthorized', 401); return; }
    const reservation = await svc.cancelReservation(req.params.id, req.user.sub);
    sendSuccess(res, reservation, 'Reservation cancelled');
  } catch (err) { next(err); }
}

export async function listAllReservations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const status = req.query.status as string | undefined;
    const reservations = await svc.listAllReservations(status);
    sendSuccess(res, reservations);
  } catch (err) { next(err); }
}
