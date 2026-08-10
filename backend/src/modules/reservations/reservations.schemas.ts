// src/modules/reservations/reservations.schemas.ts

import { z } from 'zod';

export const CreateReservationSchema = z.object({
  // Student picks a zone; system assigns the next available space.
  // Optionally they can request a specific spaceId.
  zoneId:  z.string().uuid('zoneId must be a valid UUID'),
  spaceId: z.string().uuid().optional(), // if omitted, system picks first AVAILABLE
});

export type CreateReservationInput = z.infer<typeof CreateReservationSchema>;

export const RESERVATION_HOLD_MINUTES = 15;
