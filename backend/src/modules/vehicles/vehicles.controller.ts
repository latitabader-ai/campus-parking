// src/modules/vehicles/vehicles.controller.ts

import { Request, Response, NextFunction } from 'express';
import * as vehiclesService from './vehicles.service';
import { RegisterVehicleSchema, PlateQuerySchema } from './vehicles.schemas';
import { sendSuccess, sendError } from '../../utils/response';

/** POST /vehicles — register a vehicle.
 *  Authenticated users link it to their account.
 *  The owner defaults to the logged-in user (STUDENT).
 *  ADMIN may register on behalf of anyone by passing ownerId in body (future).
 */
export async function registerVehicle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input    = RegisterVehicleSchema.parse(req.body);
    const ownerId  = req.user?.sub ?? null;   // null only on a truly public route (not wired here)
    const vehicle  = await vehiclesService.registerVehicle(input, ownerId);
    sendSuccess(res, vehicle, 'Vehicle registered', 201);
  } catch (err) { next(err); }
}

/** GET /vehicles/my — student's own vehicles. */
export async function getMyVehicles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.sub) { sendError(res, 'Unauthorized', 401); return; }
    const vehicles = await vehiclesService.getMyVehicles(req.user.sub);
    sendSuccess(res, vehicles);
  } catch (err) { next(err); }
}

/** GET /vehicles/lookup?plate=ABC-1234 — Security/Admin plate lookup. */
export async function lookupByPlate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { plate } = PlateQuerySchema.parse(req.query);
    const vehicle   = await vehiclesService.lookupByPlate(plate);
    sendSuccess(res, vehicle);
  } catch (err) { next(err); }
}

/** DELETE /vehicles/:id — owner (student) or admin deregisters. */
export async function deregisterVehicle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.sub) { sendError(res, 'Unauthorized', 401); return; }
    await vehiclesService.deregisterVehicle(req.params.id, req.user.sub, req.user.role);
    sendSuccess(res, null, 'Vehicle deregistered');
  } catch (err) { next(err); }
}
