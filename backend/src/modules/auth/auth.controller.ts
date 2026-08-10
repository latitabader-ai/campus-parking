// src/modules/auth/auth.controller.ts
// Thin controller layer — validates request, calls service, sets/clears cookies.

import { Request, Response, NextFunction } from 'express';
import { RegisterSchema, LoginSchema } from './auth.schemas';
import * as authService from './auth.service';
import { sendSuccess, sendError } from '../../utils/response';
import { env } from '../../config/env';

// Cookie options for the HttpOnly refresh token
const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: '/api/v1/auth',
};

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = RegisterSchema.parse(req.body);

    // Public registration is STUDENT-only. SECURITY/ADMIN accounts
    // must be created by an existing ADMIN (enforced in user management module).
    if (input.role && input.role !== 'STUDENT') {
      sendError(res, 'Public registration is restricted to the Student role', 403);
      return;
    }

    const { user, tokens } = await authService.register(input);

    res.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTS);
    sendSuccess(res, { user, accessToken: tokens.accessToken }, 'Account created', 201);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = LoginSchema.parse(req.body);
    const { user, tokens } = await authService.login(input);

    res.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTS);
    sendSuccess(res, { user, accessToken: tokens.accessToken }, 'Login successful');
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token: string | undefined = req.cookies?.refreshToken;
    if (!token) {
      sendError(res, 'No refresh token provided', 401);
      return;
    }
    const { accessToken } = await authService.refresh(token);
    sendSuccess(res, { accessToken }, 'Token refreshed');
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.clearCookie('refreshToken', { ...REFRESH_COOKIE_OPTS, maxAge: 0 });
    sendSuccess(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.sub) {
      sendError(res, 'Unauthorized', 401);
      return;
    }
    const user = await authService.getMe(req.user.sub);
    sendSuccess(res, { user });
  } catch (err) {
    next(err);
  }
}
