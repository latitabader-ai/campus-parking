# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project

**KSU Campus Parking Management System** — Full-stack API-first web application.
King Saud University campus geography is real (OpenStreetMap); 8 parking zones, 4,000-space capacity, and occupancy data are simulated for the MVP.
Always include "MVP Demo — Simulated Data" disclaimer in UI, docs, and comments.

## Monorepo Structure

```
campus-parking/
├── backend/      Node.js 20 + Express + Prisma + PostgreSQL
├── frontend/     React 18 + Vite + TypeScript + Tailwind + Leaflet
└── docker-compose.yml
```

## Commands

### Backend (`campus-parking/backend/`)
| Task | Command |
|---|---|
| Dev server | `npm run dev` |
| TypeScript check | `npx tsc --noEmit` |
| Prisma migrate | `npm run db:migrate` |
| Seed database | `npm run db:seed` |
| Prisma studio | `npm run db:studio` |
| Reset + reseed | `npm run db:reset` |

### Frontend (`campus-parking/frontend/`)
| Task | Command |
|---|---|
| Dev server | `npm run dev` |
| TypeScript check | `npx tsc --noEmit` |
| Production build | `npm run build` |
| Lint | `npm run lint` |

### Docker (run from `campus-parking/`)
```
# Start PostgreSQL only (local backend dev)
docker-compose up postgres -d

# Start full stack
docker-compose up --build
```

## Critical Non-Obvious Conventions

### API Response Envelope
Every endpoint returns `{ success: boolean, data: T, message?: string, pagination?: {...} }`.
Use `sendSuccess()` and `sendError()` from `backend/src/utils/response.ts` — never `res.json()` directly.

### Route Registration
Backend routes are registered in `backend/src/app.ts`. Each is commented out with a sub-task label.
Uncomment the import + `app.use(...)` line when the corresponding module is implemented.

### Socket.IO + Scheduler Bootstrap
`backend/src/index.ts` has placeholder comments for attaching Socket.IO (`Sub-Task 7`) and starting the scheduler (`Sub-Task 8`). Uncomment those lines at the right sub-task — do not move the bootstrap logic elsewhere.

### Prisma Client
Always import the singleton from `backend/src/config/database.ts`. Never instantiate `new PrismaClient()` in a module.

### Frontend API Client
All HTTP calls go through `frontend/src/api/client.ts` (Axios instance). Do not use `fetch` or create another Axios instance.

### Zone Color Utility
`frontend/src/utils/zoneColor.ts` is the single source of truth for occupancy thresholds.
- ≤60% → green `#22c55e`
- 61–85% → yellow `#f59e0b`
- >85% → red `#ef4444`
Never hardcode these colours elsewhere.

### Leaflet in Vite — Known Gotcha
When adding `react-leaflet` components, Leaflet's default marker icon paths break under Vite.
Fix: import marker icon assets explicitly at the top of `ParkingMap.tsx`:
```ts
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, shadowUrl: markerShadow });
```

### KSU Map Coordinates
- Campus centre: `lat 24.7246, lng 46.6183` — use as `MapContainer` default centre
- Default zoom: `15`
- OSM tile URL: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` (no API key)
- Zone codes: `Z1`–`Z8`; space numbers: `Z{n}-001` through `Z{n}-500`

### Saudi Plate Format
Vehicle plates in seed and validation use Saudi format: `XXX-0000` (3 letters + 4 digits).
Plate normalisation: uppercase, strip spaces — see `backend/src/modules/vehicles/` (Sub-Task 5).

### Pagination
Large tables (spaces, violations) use offset pagination via helpers in `backend/src/utils/pagination.ts`.
Default `limit=20`, max `limit=100`.

### Soft Delete
Users and Zones use soft delete (`deleted_at` timestamp). Never hard-delete these records.
Spaces and Violations are never deleted — use status fields instead.

### Environment Variables
- `SIMULATOR_ENABLED=true/false` — controls cron jobs; set `false` in production
- `SMTP_HOST` + `SMTP_USER` must both be set to enable email; system logs a skip message otherwise
- `CLOUDINARY_CLOUD_NAME` + `CLOUDINARY_API_KEY` must both be set to enable Cloudinary; falls back to local `/uploads`
