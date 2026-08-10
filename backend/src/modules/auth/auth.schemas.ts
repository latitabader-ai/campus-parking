// src/modules/auth/auth.schemas.ts
// Zod schemas for all auth request bodies. Shared across controller and service.

import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  role: z.enum(['STUDENT', 'SECURITY', 'ADMIN']).optional().default('STUDENT'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const RefreshSchema = z.object({
  // refresh token comes from HttpOnly cookie — no body field needed.
  // This schema is a placeholder for future body-based refresh (mobile).
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput    = z.infer<typeof LoginSchema>;
