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
New backend modules must be imported and mounted in `backend/src/app.ts`. The `zoneSpacesRouter` is mounted at `/api/v1/zones/:zoneId/spaces` (separate from `zonesRouter`, not a sub-route of it).

### Prisma singleton
Import `prisma` from `backend/src/config/database.ts`. Never instantiate `new PrismaClient()` in a module.
Exception: `prisma/seed.ts` creates its own instance (intentional — it runs standalone).

### Frontend API client
All HTTP calls go through `frontend/src/api/client.ts` (single Axios instance, auto-attaches Bearer token, one-retry 401 refresh). Never create a second Axios instance.

### Auth token flow
Token lives **in memory only** (`_token` variable in `client.ts`, synced to Zustand `authStore`). There is no localStorage. On page reload, `App.tsx` restores the session via a silent `/auth/me` + `/auth/refresh` chain.

### Map viewport
`frontend/src/utils/mapConfig.ts` is the single source of truth for `MAP_CENTER`, `MAP_ZOOM`, `MAX_BOUNDS`, `TILE_URL`, and `TILE_ATTRIBUTION`. All roles (Student, Security, Admin, public Visitor) share the same viewport — do not add role-specific overrides. `MapPage.tsx` is the only file that instantiates a Leaflet map.

### Zone geometry
`Zone.coordinates` is a `Json` column storing a GeoJSON Polygon `{ type: "Polygon", coordinates: [[[lng, lat], ...]] }`. Note: GeoJSON uses `[lng, lat]` order, but Leaflet expects `[lat, lng]`. The helper `toLatLng()` in `MapPage.tsx` performs this swap — always use it when rendering zone polygons.

### Zone color thresholds
Single source of truth: `frontend/src/utils/zoneColor.ts`.
- ≤60% occupied → green `#22c55e` / `badge-green`
- 61–85% → yellow `#f59e0b` / `badge-yellow`
- \>85% → red `#ef4444` / `badge-red`

**Do not change or duplicate these values.** The availability legend on the map must remain green/amber/red (semantic colors — not subject to brand recolor).

### Tailwind brand colors
Brand palette is KSU blue, taken from the university's visual identity:

| Token | Value | Use |
|---|---|---|
| `ksu-blue` | `#0089C4` | navbar, primary buttons, headings, links |
| `ksu-blue-dark` | `#006E9E` | hover/pressed states; small text on blue (contrast) |
| `ksu-blue-tint` | `#E6F4FA` | subtle backgrounds, selected rows, info panels |

White-on-`#0089C4` is roughly 3.4:1 — acceptable for large text and UI chrome only. Use `#006E9E` for small body text on blue.

> The availability tokens (`avail-green` / `avail-yellow` / `avail-red`) are **semantic status indicators**, not brand colors. Never recolor them.

### Plate format
Saudi-style: three permitted Latin letters + space + 1–4 digits, e.g. `ABJ 2201`. Only 17 Latin letters are valid (A B D E G H J K L N R S T U V X Z), each mapping to an Arabic glyph. Stored in the database in Latin form; the UI renders the dual form (`ا ب ح ٢٢٠١ / ABJ 2201`) at display time. Validation lives in `backend/src/modules/vehicles/vehicles.schemas.ts` and `frontend/src/utils/plateValidator.ts`.

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

> The simulator will drift seeded occupancy rates over time. If a demo needs stable zone colors, set `SIMULATOR_ENABLED=false` and restart the backend.

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

- **10 zones (Z1–Z10)** totalling ~4,000 spaces, with **per-zone capacity** (240–620) rather than a uniform count.
- Each zone carries an **`occupancy` rate** (0.40–0.91) passed to `randomSpaceStatus(occRate)`. This is what makes all three legend states — green, amber and red — actually occur. A single global rate would render every zone green.
- Zone coverage spans the **main campus, the female campus, faculty housing, the sports complex, and the south gate**. Zone centres were taken from real OpenStreetMap parking-lot coordinates.
- Boundaries remain **axis-aligned rectangles** via `makePolygon()` — an approximation, not surveyed geometry. See Pending Issues.
- Plate format in seed: `ABJ 2201` (Saudi-style; see Plate format above).
- Seed uses a **seeded LCG** (`makeLcg(42)`) — do not use `Math.random()` in seed files.
- Demo password for all users: `Demo@12345`
- Roles: `student@demo.ksu` / `security@demo.ksu` / `admin@demo.ksu`

---

## Pending Issues

| Issue | Status |
|---|---|
| True lot-boundary polygons | **Deferred to V1.** Zones are rectangular approximations produced by `makePolygon()`. A real implementation needs a dedicated `geometry` column plus polygon extraction from OpenStreetMap. Accepted for MVP: the `SimulatedDataBanner` states explicitly that boundaries are approximate. |

All other previously tracked issues — unified map viewport, cascading Zone→Space selector, KSU blue rebranding, campus-wide zone distribution, proportional capacity, navbar user chip, and Saudi plate format — are **implemented**.

---

## Environment

DB: PostgreSQL (local, `parking_user` / `parking_pass`, DB `campus_parking`). No Docker required.
Setup once: `campus-parking\setup-db.ps1` (PowerShell, Windows).
Key env vars: `DATABASE_URL`, `JWT_SECRET`, `SIMULATOR_ENABLED`, `VITE_API_URL` (→ `http://localhost:4000`).
Full list in `backend/.env.example`.

> `setup-db.ps1` calls `psql` through `Invoke-PsqlFile`. `psql` writes `NOTICE` lines to **stderr**, which PowerShell treats as terminating errors under `$ErrorActionPreference = 'Stop'`. The function therefore sets `Continue` locally around the call and judges success by `$LASTEXITCODE`, not by the presence of stderr output. Do not "simplify" this away.

---

## Product Personas

1. **Student** — map, reserve, view own violations (`STUDENT` role, `/student`)
2. **Security Staff** — violations dashboard, plate lookup (`SECURITY` role, `/security`)
3. **Visitor** — public map, no login (`/map` is a public route using `/zones/public`)

Admin (`ADMIN` role, `/admin`) is system/operational only, not a primary product persona.