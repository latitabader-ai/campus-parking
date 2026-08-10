# Project Coding Rules (Non-Obvious Only)

- **Response helper is mandatory**: use `sendSuccess()` / `sendError()` from `backend/src/utils/response.ts` on every route — never `res.json()` or `res.status(x).json()` directly.
- **Prisma singleton**: always import `prisma` from `backend/src/config/database.ts`. The only exception is `prisma/seed.ts` which creates its own instance because it runs standalone.
- **Axios singleton**: all frontend HTTP calls must go through `frontend/src/api/client.ts`. Never create a second Axios instance — the interceptor chain (token injection, 401 retry) lives there.
- **Zone polygon coordinate order**: GeoJSON stores `[lng, lat]`, Leaflet expects `[lat, lng]`. Use `toLatLng()` from `MapPage.tsx` to convert — don't manually swap inline.
- **Availability colors must not be changed**: `frontend/src/utils/zoneColor.ts` is the single source of truth for zone availability colors (green/amber/red). These are semantic, not brand colors, and must stay unchanged even during brand recolors.
- **New routes must be registered in `app.ts`**: `backend/src/app.ts` is the only place routes are mounted. The `zoneSpacesRouter` (`GET /api/v1/zones/:zoneId/spaces`) is already mounted there — don't remount it.
- **Pagination helpers**: always use `toSkipTake(page, limit)` and `toPaginationMeta(total, page, limit)` from `backend/src/utils/pagination.ts` — never compute `skip` manually.
- **Seed determinism**: `prisma/seed.ts` uses a seeded LCG (`makeLcg(42)`) so every run produces identical data. Do not use `Math.random()` in seed scripts.
- **Violation status transitions are enforced by service**: the `TRANSITIONS` map in `violations.service.ts` is the authoritative state machine — do not add transition logic elsewhere.
- **Schema changes**: run `prisma migrate dev --name <name>`, never `db push` (this project tracks migrations).
- **Frontend path alias**: `@/` resolves to `frontend/src/` (configured in Vite). Use it for all cross-directory imports in the frontend.
- **`npm run lint` is strict**: `--max-warnings 0` on the frontend — any warning is a build failure.
