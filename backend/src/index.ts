// src/index.ts
// Entry point — creates the HTTP server, attaches Socket.IO, starts cron jobs.

import http from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './config/database';
import { initSocket } from './config/socket';
import { startScheduler } from './scheduler';

async function bootstrap() {
  await prisma.$connect();
  console.log('[DB] Connected to PostgreSQL');

  const app    = createApp();
  const server = http.createServer(app);

  initSocket(server);
  console.log('[Socket.IO] Attached');

  if (env.simulator.enabled) {
    startScheduler();
  }

  server.listen(env.port, () => {
    console.log(`[Server] KSU Campus Parking API running on port ${env.port}`);
    console.log(`[Server] Environment: ${env.nodeEnv}`);
    console.log(`[Server] Simulator: ${env.simulator.enabled ? 'enabled' : 'disabled'}`);
    console.log(`[Server] Health: http://localhost:${env.port}/health`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('[Server] SIGTERM received — shutting down gracefully');
    await prisma.$disconnect();
    server.close(() => process.exit(0));
  });
}

bootstrap().catch((err) => {
  console.error('[Bootstrap] Fatal error:', err);
  process.exit(1);
});
