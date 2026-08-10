// src/middlewares/error.middleware.ts
// Global Express error handler — always returns the standard envelope.

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/response';

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    sendError(res, 'Validation failed', 422, err.flatten().fieldErrors);
    return;
  }

  if (err instanceof Error) {
    const status = (err as Error & { status?: number }).status ?? 500;
    const message = status < 500 ? err.message : 'Internal server error';
    if (status >= 500) console.error('[Error]', err);
    sendError(res, message, status);
    return;
  }

  console.error('[UnknownError]', err);
  sendError(res, 'Internal server error', 500);
}
