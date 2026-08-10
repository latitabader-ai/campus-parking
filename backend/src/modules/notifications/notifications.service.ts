// src/modules/notifications/notifications.service.ts
// In-app notification CRUD. Socket.IO emit is called at creation time.

import { prisma } from '../../config/database';
import { NotificationType } from '@prisma/client';
import { emitToUser } from '../../config/socket';

export async function createNotification(params: {
  userId:   string;
  type:     NotificationType;
  title:    string;
  message:  string;
}): Promise<void> {
  const notification = await prisma.notification.create({
    data:   params,
    select: { id: true, type: true, title: true, message: true, createdAt: true },
  });
  // Push to user's Socket.IO room (no-op if user is offline)
  emitToUser(params.userId, 'notifications:new', notification);
}

export async function getMyNotifications(userId: string) {
  return prisma.notification.findMany({
    where:   { userId },
    select:  { id: true, type: true, title: true, message: true, isRead: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take:    50,
  });
}

export async function markRead(notificationId: string, userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data:  { isRead: true },
  });
}

export async function markAllRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data:  { isRead: true },
  });
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, isRead: false } });
}
