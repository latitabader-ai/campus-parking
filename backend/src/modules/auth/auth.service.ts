// src/modules/auth/auth.service.ts
// Business logic for registration, login, token issuance, refresh, and logout.

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { RegisterInput, LoginInput } from './auth.schemas';
import { UserRole } from '@prisma/client';

// ── Token shapes ──────────────────────────────────────────────────────────────

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  vehiclePlate: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function signAccessToken(user: AuthUser): string {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, name: user.name },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn } as jwt.SignOptions,
  );
}

function signRefreshToken(userId: string): string {
  return jwt.sign(
    { sub: userId, type: 'refresh' },
    env.jwt.refreshSecret,
    { expiresIn: env.jwt.refreshExpiresIn } as jwt.SignOptions,
  );
}

function toAuthUser(user: {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  vehiclePlate: string | null;
}): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    vehiclePlate: user.vehiclePlate,
  };
}

// ── Service methods ───────────────────────────────────────────────────────────

export async function register(input: RegisterInput): Promise<{ user: AuthUser; tokens: TokenPair }> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    const err = new Error('An account with this email already exists') as Error & { status: number };
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name,
      role: (input.role as UserRole) ?? UserRole.STUDENT,
    },
    select: { id: true, email: true, name: true, role: true, vehiclePlate: true },
  });

  const authUser = toAuthUser(user);
  return {
    user: authUser,
    tokens: {
      accessToken:  signAccessToken(authUser),
      refreshToken: signRefreshToken(authUser.id),
    },
  };
}

export async function login(input: LoginInput): Promise<{ user: AuthUser; tokens: TokenPair }> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      id: true, email: true, name: true, role: true,
      vehiclePlate: true, passwordHash: true, deletedAt: true,
    },
  });

  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    const err = new Error('Invalid email or password') as Error & { status: number };
    err.status = 401;
    throw err;
  }

  if (user.deletedAt) {
    const err = new Error('This account has been deactivated') as Error & { status: number };
    err.status = 403;
    throw err;
  }

  const authUser = toAuthUser(user);
  return {
    user: authUser,
    tokens: {
      accessToken:  signAccessToken(authUser),
      refreshToken: signRefreshToken(authUser.id),
    },
  };
}

export async function refresh(token: string): Promise<{ accessToken: string }> {
  let payload: jwt.JwtPayload;
  try {
    payload = jwt.verify(token, env.jwt.refreshSecret) as jwt.JwtPayload;
  } catch {
    const err = new Error('Invalid or expired refresh token') as Error & { status: number };
    err.status = 401;
    throw err;
  }

  if (payload.type !== 'refresh' || !payload.sub) {
    const err = new Error('Invalid refresh token') as Error & { status: number };
    err.status = 401;
    throw err;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, name: true, role: true, vehiclePlate: true, deletedAt: true },
  });

  if (!user || user.deletedAt) {
    const err = new Error('User not found or deactivated') as Error & { status: number };
    err.status = 401;
    throw err;
  }

  return { accessToken: signAccessToken(toAuthUser(user)) };
}

export async function getMe(userId: string): Promise<AuthUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, vehiclePlate: true, deletedAt: true },
  });

  if (!user || user.deletedAt) {
    const err = new Error('User not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  return toAuthUser(user);
}
