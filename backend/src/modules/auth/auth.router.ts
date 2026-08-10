// src/modules/auth/auth.router.ts
// Auth routes — all public except GET /me which requires a valid access token.

import { Router } from 'express';
import * as authController from './auth.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// Public routes
router.post('/register', authController.register);
router.post('/login',    authController.login);
router.post('/refresh',  authController.refresh);
router.post('/logout',   authController.logout);

// Protected — returns the currently authenticated user's profile
router.get('/me', authMiddleware, authController.me);

export default router;
