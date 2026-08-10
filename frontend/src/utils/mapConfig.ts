// src/utils/mapConfig.ts
// Single source of truth for the KSU campus map viewport.
// All roles (Student, Security, Admin) use the same centre, zoom, and bounds.
import L from 'leaflet';

export const MAP_CENTER: L.LatLngTuple = [24.7246, 46.6183];
export const MAP_ZOOM = 15;

// Roughly a 4 km × 4 km box around the KSU campus — prevents panning to unrelated areas.
export const MAX_BOUNDS: L.LatLngBoundsLiteral = [
  [24.700, 46.595],  // SW corner
  [24.750, 46.645],  // NE corner
];

export const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
