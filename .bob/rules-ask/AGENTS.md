# Project Documentation Context (Non-Obvious Only)

- **All zone data is simulated**: zone boundaries, space counts, occupancy figures and vehicle plates are entirely demo/fictional. The map base layer (OSM tiles) is real, campus coordinates are real, but everything drawn on top is simulated.
- **`/map` is the only public route**: it calls `/api/v1/zones/public` (no auth). All other API routes require a JWT Bearer token. Visitors never log in.
- **Token is never persisted**: the access token lives in memory only (`_token` in `client.ts`). On hard reload, `App.tsx` silently restores the session via `/auth/me` then `/auth/refresh`. There is no localStorage or sessionStorage involved.
- **`zoneSpacesRouter` is separate from `zonesRouter`**: spaces belonging to a zone are at `GET /api/v1/zones/:zoneId/spaces`, mounted as a separate router in `app.ts`, not as a sub-route of `zonesRouter`.
- **`docs/product/` files are product deliverables, not developer docs**: the 7 files (personas, PRD, MoSCoW, competitive-analysis, roadmap, executive-summary, reflective-memo) are formal course deliverables. Do not delete or restructure them.
- **Pending issues are not yet applied**: Issues 2–8 described in `campus-parking/AGENTS.md` are planned changes that have NOT been implemented. The codebase still has `ksu-green` branding, rectangular zone polygons, equal 500-space zones, simplified plate format, and the old navbar layout.
- **The `ADMIN` role is not a product persona**: Admin is a system operations role. The three product personas are Student, Security Staff, and Visitor. This distinction matters in documentation and UX discussions.
- **Violation status transitions are server-enforced**: clients cannot set arbitrary statuses — the `TRANSITIONS` map in `violations.service.ts` defines valid forward-only transitions.
