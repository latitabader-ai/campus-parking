// src/modules/notifications/notifications.router.ts

import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import * as svc from './notifications.service';
import { sendSuccess, sendError } from '../../utils/response';

const router = Router();

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    if (!req.user) { sendError(res, 'Unauthorized', 401); return; }
    const notifications = await svc.getMyNotifications(req.user.sub);
    const unread = notifications.filter(n => !n.isRead).length;
    sendSuccess(res, { notifications, unreadCount: unread });
  } catch (err) { next(err); }
});

router.patch('/:id/read', authMiddleware, async (req, res, next) => {
  try {
    if (!req.user) { sendError(res, 'Unauthorized', 401); return; }
    await svc.markRead(req.params.id, req.user.sub);
    sendSuccess(res, null, 'Marked as read');
  } catch (err) { next(err); }
});

router.patch('/read-all', authMiddleware, async (req, res, next) => {
  try {
    if (!req.user) { sendError(res, 'Unauthorized', 401); return; }
    await svc.markAllRead(req.user.sub);
    sendSuccess(res, null, 'All notifications marked as read');
  } catch (err) { next(err); }
});

export default router;
