// src/utils/response.ts
// Standardised API response envelope: { success, data, message?, pagination? }

import { Response } from 'express';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200,
  pagination?: PaginationMeta
): Response {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(message ? { message } : {}),
    ...(pagination ? { pagination } : {}),
  });
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 400,
  errors?: unknown
): Response {
  return res.status(statusCode).json({
    success: false,
    data: null,
    message,
    ...(errors ? { errors } : {}),
  });
}
