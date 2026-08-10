// src/modules/zones/zones.controller.ts

import { Request, Response, NextFunction } from 'express';
import * as zonesService from './zones.service';
import { CreateZoneSchema, UpdateZoneSchema } from './zones.schemas';
import { sendSuccess, sendError } from '../../utils/response';

export async function getPublicZones(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const zones = await zonesService.getPublicZones();
    sendSuccess(res, zones);
  } catch (err) { next(err); }
}

export async function getAllZones(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const zones = await zonesService.getAllZones();
    sendSuccess(res, zones);
  } catch (err) { next(err); }
}

export async function getZoneById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const zone = await zonesService.getZoneById(req.params.id);
    sendSuccess(res, zone);
  } catch (err) { next(err); }
}

export async function createZone(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = CreateZoneSchema.parse(req.body);
    const zone  = await zonesService.createZone(input);
    sendSuccess(res, zone, 'Zone created', 201);
  } catch (err) { next(err); }
}

export async function updateZone(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = UpdateZoneSchema.parse(req.body);
    const zone  = await zonesService.updateZone(req.params.id, input);
    sendSuccess(res, zone, 'Zone updated');
  } catch (err) { next(err); }
}

export async function deleteZone(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await zonesService.deleteZone(req.params.id);
    sendSuccess(res, null, 'Zone deleted');
  } catch (err) { next(err); }
}
