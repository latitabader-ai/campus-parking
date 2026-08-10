// src/modules/spaces/spaces.controller.ts

import { Request, Response, NextFunction } from 'express';
import * as spacesService from './spaces.service';
import { PatchSpaceStatusSchema } from './spaces.schemas';
import { sendSuccess } from '../../utils/response';
import { parsePagination } from '../../utils/pagination';
import { SpaceStatus } from '@prisma/client';

export async function getSpacesByZone(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { zoneId } = req.params;
    const { page, limit } = parsePagination(req.query as Record<string, unknown>);
    const statusFilter = req.query.status as SpaceStatus | undefined;

    const result = await spacesService.getSpacesByZone(zoneId, page, limit, statusFilter);
    sendSuccess(res, result.spaces, undefined, 200, result.pagination);
  } catch (err) { next(err); }
}

export async function getSpaceById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const space = await spacesService.getSpaceById(req.params.id);
    sendSuccess(res, space);
  } catch (err) { next(err); }
}

export async function patchSpaceStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = PatchSpaceStatusSchema.parse(req.body);
    const space = await spacesService.patchSpaceStatus(req.params.id, input);
    sendSuccess(res, space, 'Space status updated');
  } catch (err) { next(err); }
}
