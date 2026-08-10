// src/config/socket.ts
// Socket.IO server singleton — attached to the HTTP server in index.ts.
// Rooms: user:{userId}  zone:{zoneId}

import { Server, Socket } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import { env } from './env';
import { JwtPayload } from '../middlewares/auth.middleware';

let _io: Server | null = null;

export function initSocket(server: http.Server): Server {
  _io = new Server(server, {
    cors: { origin: env.clientUrl, credentials: true },
  });

  _io.use((socket: Socket, next) => {
    // Accept unauthenticated sockets for the public zone room
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) { next(); return; }
    try {
      const payload = jwt.verify(token, env.jwt.secret) as JwtPayload;
      (socket as Socket & { user?: JwtPayload }).user = payload;
    } catch { /* invalid token — continue as unauthenticated */ }
    next();
  });

  _io.on('connection', (socket: Socket) => {
    const user = (socket as Socket & { user?: JwtPayload }).user;

    // Authenticated users join their personal room
    if (user?.sub) socket.join(`user:${user.sub}`);

    // Clients join zone rooms they want to watch
    socket.on('zone:subscribe', (zoneId: string) => {
      socket.join(`zone:${zoneId}`);
    });
    socket.on('zone:unsubscribe', (zoneId: string) => {
      socket.leave(`zone:${zoneId}`);
    });
  });

  return _io;
}

/** Emit to a specific user's room. */
export function emitToUser(userId: string, event: string, payload: unknown): void {
  _io?.to(`user:${userId}`).emit(event, payload);
}

/** Emit zone availability update to all subscribers of that zone. */
export function emitZoneUpdate(zoneId: string, payload: unknown): void {
  _io?.to(`zone:${zoneId}`).emit('parking:zone_updated', payload);
}

/** Broadcast to every connected client (used for full-map refresh). */
export function emitBroadcast(event: string, payload: unknown): void {
  _io?.emit(event, payload);
}
