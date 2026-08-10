// src/modules/vehicles/vehicles.schemas.ts
// Zod schemas for vehicle registration and plate lookup.
//
// DISCLAIMER: Plate validation uses a simplified romanised Saudi-style format
// (ABC-1234) for MVP demo purposes only. Real ANPR/OCR is not implemented.

import { z } from 'zod';

// Saudi plate demo format: 3 uppercase letters, hyphen, 4 digits  e.g. "ABC-1234"
// Accepts with or without hyphen; normalisation happens in the util below.
const PLATE_REGEX = /^[A-Z]{3}-?\d{4}$/;

export const RegisterVehicleSchema = z.object({
  plate: z
    .string()
    .min(1, 'Plate is required')
    .transform(v => v.toUpperCase().replace(/\s/g, ''))
    .refine(v => PLATE_REGEX.test(v), {
      message: 'Plate must be in Saudi-style format: ABC-1234 (letters + 4 digits)',
    }),
  make:  z.string().max(50).optional().nullable(),
  model: z.string().max(50).optional().nullable(),
  color: z.string().max(30).optional().nullable(),
});

export const PlateQuerySchema = z.object({
  plate: z
    .string()
    .min(1, 'plate query param is required')
    .transform(v => v.toUpperCase().replace(/\s/g, '')),
});

export type RegisterVehicleInput = z.infer<typeof RegisterVehicleSchema>;
