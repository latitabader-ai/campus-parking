# AGENTS.md

This file provides guidance to agents when working with code in this repository.

---

## Project

**KSU Intelligent Campus Parking Management System** — React + Vite + Tailwind frontend; Express + Prisma + PostgreSQL backend. All data is simulated (no real sensors). Always include `SimulatedDataBanner` on every map/availability view.

```
campus-parking/
├── backend/      Node.js 20 + Express + Prisma 5 + PostgreSQL
├── frontend/     React 18 + Vite + TypeScript + Tailwind 3 + Leaflet + Recharts
└── docs/product/ 7 required product deliverables (personas, PRD, MoSCoW, etc.)
```

---

## Commands

All commands must be run from their respective sub-directories.

### Backend (`campus-parking/backend/`)
```
npm run dev          ts-node-dev dev server
npm run lint         ESLint on src/
npx tsc --noEmit     TypeScript check (no separate test runner — manual only)
npm run db:migrate   prisma migrate dev
npm run db:seed      ts-node prisma/seed.ts
npm run db:reset     migrate reset --force + seed
```
> Schema changes: always use `prisma migrate dev --name <name>`, never `db push` in this project.

### Frontend (`campus-parking/frontend/`)
```
npm run dev          Vite dev server → http://localhost:5173
npm run build        tsc && vite build
npm run lint         ESLint --max-warnings 0
npx tsc --noEmit     TypeScript check
```

---

## Non-Obvious Architecture Rules

### API response envelope
Every endpoint returns `{ success, data, message?, pagination? }`.
**Always** use `sendSuccess()` / `sendError()` from `backend/src/utils/response.ts` — never `res.json()` directly.

### Route registration
New backend modules must be imported and mounted in `backend/src/app.ts`. The `zoneSpacesRouter` is mounted at `/api/v1/zones/:zoneId/spaces` (separate from `zonesRouter`).

### Prisma singleton
Import `prisma` from `backend/src/config/database.ts`. Never instantiate `new PrismaClient()` in a module.
Exception: `prisma/seed.ts` creates its own instance (intentional — it runs standalone).

### Frontend API client
All HTTP calls go through `frontend/src/api/client.ts` (single Axios instance, auto-attaches Bearer token, one-retry 401 refresh). Never create a second Axios instance.

### Auth token flow
Token lives **in memory only** (`_token` variable in `client.ts`, synced to Zustand `authStore`). There is no localStorage. On page reload, `App.tsx` restores the session via a silent `/auth/me` + `/auth/refresh` chain.

### Zone geometry
`Zone.coordinates` is a `Json` column storing a GeoJSON Polygon `{ type: "Polygon", coordinates: [[[lng, lat], ...]] }`. Note: GeoJSON uses `[lng, lat]` order, but Leaflet expects `[lat, lng]`. The helper `toLatLng()` in `MapPage.tsx` performs this swap — always use it when rendering zone polygons.

### Zone color thresholds
Single source of truth: `frontend/src/utils/zoneColor.ts`.
- ≤60% occupied → green `#22c55e` / `badge-green`
- 61–85% → yellow `#f59e0b` / `badge-yellow`
- >85% → red `#ef4444` / `badge-red`
**Do not change or duplicate these values.** The availability legend on the map must remain green/amber/red (semantic colors — not subject to brand recolor).

### Tailwind brand colors
Current config (`frontend/tailwind.config.js`) defines `ksu-green` / `ksu-green-light` for the brand, and `avail-green` / `avail-yellow` / `avail-red` for availability.
> ⚠️ The brand color is still green in the current codebase — a KSU blue rebranding (`ksu-blue: #0089C4`) is a pending task and not yet applied.

### Leaflet + Vite icon fix
Required at the top of any file that uses Leaflet markers:
```ts
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon   from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });
```

### Scheduler
`backend/src/scheduler/index.ts`, gated by `SIMULATOR_ENABLED=true`.
- 2 min: simulates occupancy churn on spaces
- 10 min: writes `OccupancySnapshot` rows
- 1 min: expires timed-out reservations and frees spaces

### Reservation lifecycle
`ACTIVE → FULFILLED | EXPIRED | CANCELLED`
Expiry is handled **both passively** (on reservation read) and **actively** (1-min cron). One active reservation per user, enforced in `reservations.service.ts`.

### RBAC
`roleGuard('SECURITY', 'ADMIN')` from `backend/src/middlewares/role-guard.middleware.ts`. Public `POST /auth/register` is locked to `STUDENT` role only — roles are not user-selectable.

### Pagination
Default `limit=20`, max `limit=100` via `backend/src/utils/pagination.ts`. Always use `toSkipTake()` / `toPaginationMeta()` — never hand-roll `skip`/`take`.

### Soft delete
`User` and `Zone` use `deletedAt` timestamp. Never hard-delete. `Space` and `Violation` are never deleted — use `status` field.

### Socket.IO singletons
Server: `backend/src/config/socket.ts` — `emitToUser(userId, event, payload)` and `emitZoneUpdate(zoneId, payload)`.

---

## Seed Data Facts

- Zones Z1–Z8, each 500 spaces (4,000 total), coordinates are axis-aligned rectangular approximations via `makePolygon()` in `seed.ts`.
- Plate format in seed: `ABC-1234` (3 uppercase letters + hyphen + 4 digits).
- Seed uses a seeded LCG (`makeLcg(42)`) — do not use `Math.random()` in seed files.
- Demo password for all users: `Demo@12345`
- Roles: `student@demo.ksu` / `security@demo.ksu` / `admin@demo.ksu`

---

## Pending Issues (not yet implemented)

These are known gaps — do not assume they are done:

| Issue | Description |
|---|---|
| Issue 2 | Cascading Zone→Space dropdown in SecurityPage; `getZoneSpaces()` missing from `frontend/src/api/zones.ts` |
| Issue 3 | KSU blue rebranding (`#0089C4`) — tailwind config still has `ksu-green` |
| Issue 4 | Zone polygons still rectangular (`makePolygon()`); no `geometry` column yet |
| Issue 5 | All 8 zones are on main (male) campus only; female campus / faculty housing / stadium not covered |
| Issue 6 | All zones have equal 500-space capacity; proportional sizing not done |
| Issue 7 | Navbar role label is inline next to links — user chip refactor not done |
| Issue 8 | Seed plates are `ABC-1234`; Saudi dual-script format (`أ ب ج 1234 / ABJ-1234`) not done |

---

## Environment

DB: PostgreSQL (local, `parking_user`/`parking_pass`, DB `campus_parking`). No Docker.
Setup once: `campus-parking\setup-db.ps1` (PowerShell, Windows).
Key env vars: `DATABASE_URL`, `JWT_SECRET`, `SIMULATOR_ENABLED`, `VITE_API_URL` (→ `http://localhost:4000`).
Full list in `backend/.env.example`.

---

## Product Personas

1. **Student** — map, reserve, view own violations (`STUDENT` role, `/student`)
2. **Security Staff** — violations dashboard, plate lookup (`SECURITY` role, `/security`)
3. **Visitor** — public map, no login (`/map` is a public route using `/zones/public`)

Admin (`ADMIN` role, `/admin`) is system/operational only, not a primary product persona.
