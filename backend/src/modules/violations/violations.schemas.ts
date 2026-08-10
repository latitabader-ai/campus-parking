// src/modules/violations/violations.schemas.ts

import { z } from 'zod';

export const CreateViolationSchema = z.object({
  spaceId:       z.string().uuid('spaceId must be a valid UUID'),
  vehiclePlate:  z
    .string()
    .min(1)
    .transform(v => v.toUpperCase().replace(/\s/g, '')),
  violationType: z.enum([
    'UNAUTHORIZED_ZONE', 'OVERSTAY', 'NO_PERMIT', 'DOUBLE_PARK', 'OTHER',
  ]),
  notes: z.string().max(1000).optional().nullable(),
});

// Valid forward transitions enforced by the service
export const UpdateStatusSchema = z.object({
  status: z.enum(['ACKNOWLEDGED', 'RESOLVED', 'DISMISSED']),
  notes:  z.string().max(1000).optional().nullable(),
});

export const ViolationFilterSchema = z.object({
  status:        z.enum(['PENDING', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED']).optional(),
  violationType: z.enum(['UNAUTHORIZED_ZONE', 'OVERSTAY', 'NO_PERMIT', 'DOUBLE_PARK', 'OTHER']).optional(),
  zoneId:        z.string().uuid().optional(),
  plate:         z.string().optional().transform(v => v ? v.toUpperCase().replace(/\s/g, '') : v),
  page:          z.coerce.number().int().positive().optional().default(1),
  limit:         z.coerce.number().int().positive().max(100).optional().default(20),
});

// Evidence attachment
export const AddEvidenceSchema = z.object({
  fileUrl:  z.string().url('fileUrl must be a valid URL'),
  fileType: z.enum(['IMAGE', 'VIDEO', 'NOTE']),
  notes:    z.string().max(500).optional().nullable(),
});

export type CreateViolationInput  = z.infer<typeof CreateViolationSchema>;
export type UpdateStatusInput     = z.infer<typeof UpdateStatusSchema>;
export type ViolationFilterInput  = z.infer<typeof ViolationFilterSchema>;
export type AddEvidenceInput      = z.infer<typeof AddEvidenceSchema>;
