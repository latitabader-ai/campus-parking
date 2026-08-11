# KSU Intelligent Campus Parking Management System

> **MVP Demo — Simulated Data**
> Parking zones, space counts, and occupancy figures are simulated approximations placed on real KSU campus geography. They do **not** represent official King Saud University parking data, verified zone designations, or deployed sensor infrastructure.

---

## The Challenge

King Saud University (KSU) in Riyadh, Saudi Arabia is one of the largest universities in the Arab world, with tens of thousands of daily commuters. Campus parking currently relies on physical signage and manual security patrols, leading to:

- Extended search times during peak arrival hours, with no way to know availability before setting out
- No real-time visibility into zone availability
- Manual, paper-based violation logging with no searchable record
- No way for students to reserve a space in advance
- No occupancy data for campus operations to plan capacity

---

## The Solution

A full-stack, **API-first responsive web application** that enables:

1. **Students** — View a live colour-coded parking map, reserve a space in 15-minute holds, and receive violation notifications
2. **Security Staff** — Log and manage violations digitally, look up vehicle registrations, and monitor a live dashboard
3. **Visitors** — Check zone availability on a public map without creating an account

The system uses **real KSU campus geography** (OpenStreetMap) for the map base, with **10 logical MVP zones** and **4,000 simulated parking spaces** spanning the main campus, the female campus, faculty housing, the sports complex, and the south gate.

---

## Official Product Personas

| Persona | Access | Core Journey |
|---|---|---|
| **Student** | Login required | Map → Reserve space → View active reservation → Cancel → View own violations |
| **Security Staff** | Login required | Dashboard → Plate lookup → Log violation → Manage violation lifecycle |
| **Visitor** | **No login required** | Public map → Zone availability at a glance |

> **Admin** is a **technical/system role**, not a primary product persona. It handles zone management, user administration, and analytics access.

---

## MVP Capabilities

- **Real-time parking map** — 10 zones on OpenStreetMap (Leaflet), colour-coded: green ≤60%, yellow 61–85%, red >85% occupied. Zone centres are taken from real parking-lot coordinates, and capacity varies by lot (240–620 spaces) rather than being uniform
- **Parking reservation** — 15-minute hold with automatic expiry and space release
- **Vehicle management** — Registration, plate lookup (Security/Admin), Saudi-style plate validation
- **Violation management** — Full lifecycle: PENDING → ACKNOWLEDGED → RESOLVED/DISMISSED; evidence attachment
- **In-app notifications** — Via Socket.IO; email via SMTP (configurable)
- **Analytics** — Occupancy trends, violation statistics, CSV export (Admin)
- **Occupancy simulation** — Cron-based simulator; designed for replacement by real IoT sensors in V1

---

## Product Scope by Release

| Release | Capability | Infrastructure |
|---|---|---|
| **MVP (current)** | Simulated availability, reservation, violations, analytics, responsive web | No hardware required |
| **V1** | Arabic/RTL UI, surveyed zone boundaries, optional real IoT sensors, responsive mobile web (PWA) | Optional parking sensors |
| **V2** | Native iOS/Android app, real ANPR/OCR, KSU system integration | Cameras + sensors + institutional APIs |

> **The current application is a responsive web application with an API-first backend.**
> A native mobile application is planned for **V1**, not the current MVP.
> AI/predictive and advanced IoT capabilities are planned for **V2**.

---

## Technology Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js 20 LTS |
| Framework | Express.js |
| Database | PostgreSQL 18 (local) |
| ORM | Prisma 5 |
| Real-time | Socket.IO |
| Auth | JWT (access token) + HttpOnly cookie (refresh) |
| Validation | Zod |
| Scheduler | node-cron |
| Email | Nodemailer (SMTP, optional) |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| State | Zustand |
| Routing | React Router v6 |
| Map | Leaflet + React-Leaflet + OpenStreetMap |
| HTTP | Axios + TanStack React Query |
| Styling | Tailwind CSS |

---

## Prerequisites

- Node.js 20+
- PostgreSQL 18 (running locally on port 5432)
- npm

Docker is **not required** — PostgreSQL runs natively.

---

## Setup

### 1. One-time database setup

Open a PowerShell terminal in `campus-parking/` and run:

```powershell
.\setup-db.ps1
```

Enter your PostgreSQL superuser (`postgres`) password when prompted.
This creates `parking_user`, the `campus_parking` database, and writes `campus-parking/.env`.

> Prisma reads `.env` from the directory it runs in. Copy it into `backend/` as well:
> `Copy-Item ..\.env .env`
>
> `prisma migrate dev` also creates a temporary shadow database, which requires the
> `CREATEDB` privilege:
> `ALTER USER parking_user CREATEDB;`

### 2. Apply schema and seed data

```powershell
cd backend
npm install
npm run db:migrate   # Creates all tables
npm run db:seed      # Seeds 10 zones, 4,000 spaces, demo users, vehicles, violations
```

### 3. Start the backend

```powershell
# In campus-parking/backend/
npm run dev
# Server: http://localhost:4000
# Health: http://localhost:4000/health
```

### 4. Start the frontend

```powershell
# In campus-parking/frontend/
npm install
npm run dev
# App: http://localhost:5173
```

Run the backend and frontend in two separate terminals, and leave both open.

---

## Demo Credentials

**Password for all accounts: `Demo@12345`**

| Account | Email | Role | Go to |
|---|---|---|---|
| Student | `student@demo.ksu` | STUDENT | `/student` |
| Security Staff | `security@demo.ksu` | SECURITY | `/security` |
| Admin | `admin@demo.ksu` | ADMIN | `/admin` |
| Visitor | *(no login)* | — | `/map` |

---

## API

All endpoints are under `/api/v1/`. Full route listing:

| Module | Base path | Key endpoints |
|---|---|---|
| Auth | `/auth` | POST login, register, refresh, logout; GET me |
| Zones | `/zones` | GET public (no auth); GET / :id (auth); CRUD (admin) |
| Spaces | `/zones/:zoneId/spaces` | GET paginated + filtered |
| Vehicles | `/vehicles` | POST register; GET my, lookup (staff); DELETE |
| Violations | `/violations` | Full CRUD + status lifecycle + evidence |
| Reservations | `/reservations` | POST create; GET active, my; DELETE cancel |
| Notifications | `/notifications` | GET list; PATCH read / read-all |
| Analytics | `/analytics` | GET summary, occupancy, violations; CSV export |

---

## Project Structure

```
campus-parking/
├── backend/                   Express + Prisma API
│   ├── prisma/                schema.prisma + seed.ts
│   └── src/
│       ├── modules/           auth, zones, spaces, vehicles, violations,
│       │                      reservations, notifications, analytics
│       ├── config/            env, database, socket, mailer
│       ├── middlewares/       auth, role-guard, error
│       ├── scheduler/         occupancy simulation + reservation expiry
│       └── utils/             response envelope, pagination
├── frontend/                  React 18 + Vite + Tailwind
│   └── src/
│       ├── api/               axios hooks per module
│       ├── pages/             LoginPage, MapPage, StudentPage,
│       │                      SecurityPage, AdminPage, RegisterPage
│       ├── components/        NavBar, SimulatedDataBanner, ZoneStatusBadge,
│       │                      Spinner, ErrorMessage
│       ├── store/             authStore (Zustand)
│       └── utils/             zoneColor, mapConfig, plateValidator
├── docs/product/              Product deliverables (see below)
├── setup-db.ps1               One-time DB setup script (Windows)
├── docker-compose.yml         Optional: PostgreSQL in Docker
├── .env.example               All environment variable keys
└── AGENTS.md                  Developer/agent guidance
```

---

## Product Documentation

All seven required product deliverables are in [`docs/product/`](docs/product/):

| Document | Description |
|---|---|
| [personas.md](docs/product/personas.md) | Three product personas (Student, Security Staff, Visitor) + Admin system role |
| [PRD.md](docs/product/PRD.md) | Full Product Requirements Document — user stories, functional & non-functional requirements |
| [MoSCoW.md](docs/product/MoSCoW.md) | Must Have / Should Have / Could Have / Won't Have prioritisation |
| [competitive-analysis.md](docs/product/competitive-analysis.md) | Analysis vs T2 Systems, ParkWhiz, Google Maps, Parkmobile |
| [roadmap.md](docs/product/roadmap.md) | MVP → V1 → V2 feature and infrastructure roadmap |
| [executive-summary.md](docs/product/executive-summary.md) | One-page stakeholder summary |
| [reflective-memo.md](docs/product/reflective-memo.md) | Reflection on AI-human collaboration (IBM Bob + human judgment) |

---

## Data Disclaimer

This MVP uses **entirely simulated data**:

- Zone boundaries are approximate rectangles placed on real KSU campus coordinates (OpenStreetMap). Zone centres correspond to actual parking lots, but the boundaries themselves are **not** surveyed and do **not** represent official KSU parking zones.
- The 4,000 parking spaces and all occupancy figures are generated by a seeded simulator and drifted by a cron job.
- All user accounts, vehicle plates, and violations are fictional demo data.
- Saudi-style plate format (`ABJ 2201` — three permitted Latin letters plus digits, displayed alongside the Arabic form) is used for demo purposes only; no real ANPR/OCR is implemented.

The **KSU campus geography** (base map tiles, campus location, coordinates) is real via OpenStreetMap.

---

## Development Commands

```powershell
# Backend
npm run dev          # Dev server with hot reload
npm run db:migrate   # Apply/update Prisma schema
npm run db:seed      # Reseed all demo data
npm run db:studio    # Open Prisma Studio (DB browser)
npm run db:reset     # Drop + migrate + seed

# Frontend
npm run dev          # Vite dev server (http://localhost:5173)
npm run build        # Production build
npm run lint         # ESLint
```

---

## AI Assistance Disclosure

This prototype was developed with assistance from **IBM Bob** (Claude-based AI coding assistant).
All product decisions — personas, scope, prioritisation, geographic distinctions, and ethical boundaries — were made by humans.
See [`docs/product/reflective-memo.md`](docs/product/reflective-memo.md) for a full account of the AI-human collaboration, including the specific cases where AI output was plausible but wrong and required human correction.