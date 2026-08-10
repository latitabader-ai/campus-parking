// src/types/index.ts
// Shared TypeScript interfaces used across all frontend modules.
// Kept in sync with backend Prisma model shapes.

export type UserRole = 'STUDENT' | 'SECURITY' | 'ADMIN';

export type SpaceStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';

export type ZoneAvailabilityStatus = 'AVAILABLE' | 'LIMITED' | 'FULL';

export type ViolationType =
  | 'UNAUTHORIZED_ZONE'
  | 'OVERSTAY'
  | 'NO_PERMIT'
  | 'DOUBLE_PARK'
  | 'OTHER';

export type ViolationStatus = 'PENDING' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED';

export type NotificationType =
  | 'VIOLATION_DETECTED'
  | 'SPACE_AVAILABLE'
  | 'SYSTEM_ALERT';

// GeoJSON Polygon geometry (used for zone boundaries)
export interface GeoJsonPolygon {
  type: 'Polygon';
  coordinates: number[][][]; // [ring][point][lng, lat]
}

export interface Zone {
  id: string;
  name: string;
  code: string;
  totalSpaces: number;
  description: string;
  permittedRoles: UserRole[];
  coordinates: GeoJsonPolygon;
  centerLat: number;
  centerLng: number;
  // Computed availability (returned by API)
  occupied: number;
  available: number;
  occupancyPercent: number;
  status: ZoneAvailabilityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Space {
  id: string;
  zoneId: string;
  spaceNumber: string;
  status: SpaceStatus;
  vehiclePlate: string | null;
  lastUpdatedAt: string;
  coordinates: { lat: number; lng: number } | null;
}

export interface Vehicle {
  id: string;
  plate: string;
  ownerId: string | null;
  make: string | null;
  model: string | null;
  color: string | null;
  isRegistered: boolean;
  registeredAt: string;
}

export interface Violation {
  id: string;
  spaceId: string;
  vehiclePlate: string;
  violationType: ViolationType;
  detectedAt: string;
  status: ViolationStatus;
  notes: string | null;
  reportedBy: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  vehiclePlate: string | null;
  createdAt: string;
}

// API response envelope
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
