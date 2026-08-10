// src/modules/spaces/spaces.schemas.ts

import { z } from 'zod';

export const PatchSpaceStatusSchema = z.object({
  status:       z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE']),
  vehiclePlate: z.string().optional().nullable(),
});

export type PatchSpaceStatusInput = z.infer<typeof PatchSpaceStatusSchema>;
