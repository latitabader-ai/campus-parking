// src/config/database.ts
// Prisma client singleton — import this everywhere instead of instantiating new PrismaClient().

import { PrismaClient } from '@prisma/client';

declare global {
  // Prevent multiple PrismaClient instances during hot-reload in development.
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}
