// src/app.ts
// Express application factory. Kept separate from index.ts so it can be
// imported by tests without binding to a port.

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env';
import { errorMiddleware } from './middlewares/error.middleware';

// ── Route imports (added as sub-tasks are implemented) ───────────────────────
import authRouter                             from './modules/auth/auth.router';
import zonesRouter                            from './modules/zones/zones.router';
import { spacesRouter, zoneSpacesRouter }     from './modules/spaces/spaces.router';
import vehiclesRouter                         from './modules/vehicles/vehicles.router';
import violationsRouter                       from './modules/violations/violations.router';
import reservationsRouter                     from './modules/reservations/reservations.router';
import notificationsRouter                    from './modules/notifications/notifications.router';
import analyticsRouter                        from './modules/analytics/analytics.router';

export function createApp() {
  const app = express();

  // ── Global middleware ───────────────────────────────────────────────────────
  app.use(cors({
    origin: env.clientUrl,
    credentials: true,
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  if (env.nodeEnv !== 'test') {
    app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
  }

  // ── Health check ────────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({
      success: true,
      data: {
        status: 'ok',
        service: 'KSU Campus Parking API',
        timestamp: new Date().toISOString(),
        environment: env.nodeEnv,
      },
    });
  });

  // ── API routes (uncommented as sub-tasks complete) ──────────────────────────
  app.use('/api/v1/auth',                  authRouter);
  app.use('/api/v1/zones',                 zonesRouter);
  app.use('/api/v1/zones/:zoneId/spaces',  zoneSpacesRouter);
  app.use('/api/v1/spaces',                spacesRouter);
  app.use('/api/v1/vehicles',              vehiclesRouter);
  app.use('/api/v1/violations',            violationsRouter);
  app.use('/api/v1/reservations',          reservationsRouter);
  app.use('/api/v1/notifications',         notificationsRouter);
  app.use('/api/v1/analytics',             analyticsRouter);

  // ── 404 fallthrough ─────────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ success: false, data: null, message: 'Route not found' });
  });

  // ── Global error handler ────────────────────────────────────────────────────
  app.use(errorMiddleware);

  return app;
}
