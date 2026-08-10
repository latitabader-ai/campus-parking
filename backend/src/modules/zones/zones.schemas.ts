// src/modules/zones/zones.schemas.ts
// Zod schemas for zone create/update request bodies (Admin only).

import { z } from 'zod';

const GeoJsonPolygonSchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z
    .array(z.array(z.tuple([z.number(), z.number()])))
    .min(1, 'Polygon must have at least one ring'),
});

const PermittedRoleSchema = z.enum(['STUDENT', 'SECURITY', 'ADMIN']);

export const CreateZoneSchema = z.object({
  name:           z.string().min(2).max(100),
  code:           z.string().min(1).max(10).toUpperCase(),
  totalSpaces:    z.number().int().positive(),
  description:    z.string().max(500).optional().default(''),
  permittedRoles: z.array(PermittedRoleSchema).min(1),
  coordinates:    GeoJsonPolygonSchema,
  centerLat:      z.number().min(-90).max(90),
  centerLng:      z.number().min(-180).max(180),
});

export const UpdateZoneSchema = CreateZoneSchema.partial();

export type CreateZoneInput = z.infer<typeof CreateZoneSchema>;
export type UpdateZoneInput = z.infer<typeof UpdateZoneSchema>;
