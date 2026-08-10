// src/config/env.ts
// Centralises all environment variable access with defaults and validation.

import dotenv from 'dotenv';
dotenv.config();

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

function optional(key: string, fallback = ''): string {
  return process.env[key] ?? fallback;
}

export const env = {
  nodeEnv: optional('NODE_ENV', 'development'),
  port: parseInt(optional('PORT', '4000'), 10),
  clientUrl: optional('CLIENT_URL', 'http://localhost:5173'),

  database: {
    url: required('DATABASE_URL'),
  },

  jwt: {
    secret: optional('JWT_SECRET', 'dev_jwt_secret'),
    refreshSecret: optional('JWT_REFRESH_SECRET', 'dev_refresh_secret'),
    expiresIn: optional('JWT_EXPIRES_IN', '15m'),
    refreshExpiresIn: optional('JWT_REFRESH_EXPIRES_IN', '7d'),
  },

  smtp: {
    host: optional('SMTP_HOST'),
    port: parseInt(optional('SMTP_PORT', '587'), 10),
    user: optional('SMTP_USER'),
    pass: optional('SMTP_PASS'),
    from: optional('SMTP_FROM', 'noreply@ksu-parking.local'),
    enabled: !!(optional('SMTP_HOST') && optional('SMTP_USER')),
  },

  cloudinary: {
    cloudName: optional('CLOUDINARY_CLOUD_NAME'),
    apiKey: optional('CLOUDINARY_API_KEY'),
    apiSecret: optional('CLOUDINARY_API_SECRET'),
    enabled: !!(optional('CLOUDINARY_CLOUD_NAME') && optional('CLOUDINARY_API_KEY')),
  },

  simulator: {
    enabled: optional('SIMULATOR_ENABLED', 'true') === 'true',
  },
} as const;
