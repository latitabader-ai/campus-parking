// src/modules/violations/violations.controller.ts

import { Request, Response, NextFunction } from 'express';
import * as svc from './violations.service';
import {
  CreateViolationSchema, UpdateStatusSchema,
  ViolationFilterSchema, AddEvidenceSchema,
} from './violations.schemas';
import { sendSuccess, sendError } from '../../utils/response';
import { UserRole } from '@prisma/client';

export async function createViolation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input      = CreateViolationSchema.parse(req.body);
    const reportedBy = req.user?.sub ?? null;
    const violation  = await svc.createViolation(input, reportedBy);
    sendSuccess(res, violation, 'Violation recorded', 201);
  } catch (err) { next(err); }
}

export async function listViolations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) { sendError(res, 'Unauthorized', 401); return; }
    const filter = ViolationFilterSchema.parse(req.query);
    const result = await svc.listViolations(filter, req.user.sub, req.user.role as UserRole);
    sendSuccess(res, result.violations, undefined, 200, result.pagination);
  } catch (err) { next(err); }
}

export async function getViolationById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) { sendError(res, 'Unauthorized', 401); return; }
    const violation = await svc.getViolationById(req.params.id, req.user.sub, req.user.role as UserRole);
    sendSuccess(res, violation);
  } catch (err) { next(err); }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) { sendError(res, 'Unauthorized', 401); return; }
    const input     = UpdateStatusSchema.parse(req.body);
    const violation = await svc.updateViolationStatus(req.params.id, input, req.user.sub);
    sendSuccess(res, violation, 'Violation status updated');
  } catch (err) { next(err); }
}

export async function addEvidence(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) { sendError(res, 'Unauthorized', 401); return; }
    const input    = AddEvidenceSchema.parse(req.body);
    const evidence = await svc.addEvidence(req.params.id, input, req.user.sub);
    sendSuccess(res, evidence, 'Evidence attached', 201);
  } catch (err) { next(err); }
}

export async function listEvidence(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const evidence = await svc.listEvidence(req.params.id);
    sendSuccess(res, evidence);
  } catch (err) { next(err); }
}
