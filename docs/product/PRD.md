# Product Requirements Document (PRD)
## KSU Intelligent Campus Parking Management System

**Version:** 1.0 — MVP
**Status:** Prototype complete; simulated data
**Audience:** Product, engineering, and university stakeholders

---

## 1. Problem Statement

King Saud University in Riyadh is a large campus with thousands of daily commuters across two campus areas. Students, staff, and visitors currently have no real-time visibility into parking availability, leading to:

- **Time lost searching for parking** during peak arrival hours, with no way to assess availability before setting out
- **Congestion at zone entrances** caused by drivers circling lots that are already full
- **Inefficient use of capacity** — some lots overflow while others sit underused, with no mechanism to redistribute demand
- **Manual, paper-based violation management** that is slow, error-prone, and leaves no searchable record
- **No utilisation data** for campus operations to understand demand patterns or plan capacity

The underlying problem is **uncertainty**, not simply a shortage of spaces. A driver who knows a zone is full can choose another; a driver who knows nothing must search.

---

## 2. Product Vision

Enable every KSU commuter to find, reserve, and navigate to available parking from their phone or browser — while giving security staff and administrators real-time tools to manage violations and understand utilisation.

---

## 3. Scope & Boundaries

### In Scope — MVP

- Real-time zone-level parking availability (simulated occupancy data)
- Interactive parking map (OpenStreetMap base, real KSU campus geography)
- Parking space reservation with a 15-minute hold timer
- Vehicle registration and plate lookup
- Automated violation detection (simulated) and manual violation logging
- Evidence management (photo and note attachment)
- In-app and email notifications for violations and reservations
- Security staff dashboard
- Parking utilisation analytics
- Role-based access control (Student, Security Staff, Admin)
- Public availability view for Visitors, requiring no login
- API-first architecture to support a future mobile client

### Out of Scope — MVP (planned for V1 / V2)

- Real IoT sensor integration (physical hardware)
- Real ANPR / OCR (camera-based licence plate recognition)
- Native mobile application (iOS / Android)
- Payment processing for reservations or fines
- Integration with KSU student information systems
- Multi-campus support beyond KSU
- Real-time CCTV feeds
- Dedicated administrative user interface (management is via REST API in the MVP)

### Explicit Disclaimers

- The **10 parking zones** are logical MVP zones. Their centres correspond to real parking lots identified on OpenStreetMap, but the zone **boundaries are approximate rectangles**, not surveyed geometry. They do not represent official KSU parking zones or verified parking infrastructure.
- The **4,000 parking spaces** and all occupancy figures are entirely simulated.
- KSU geography — base map tiles, campus location, and lot coordinates — is real via OpenStreetMap. Zone extent and capacity are approximations.

---

## 4. User Stories

### Student

| ID | Story | Priority |
|---|---|---|
| S-01 | As a student, I want to see a map of all parking zones with colour-coded availability so I can choose where to park before I leave home. | Must Have |
| S-02 | As a student, I want to reserve an available parking space for 15 minutes so I don't lose it while driving to campus. | Must Have |
| S-03 | As a student, I want to receive a notification when my reservation is about to expire so I can cancel or fulfil it. | Must Have |
| S-04 | As a student, I want to register my vehicle so the system can notify me about violations related to my plate. | Must Have |
| S-05 | As a student, I want to see the occupancy percentage of each zone so I can plan my route. | Must Have |
| S-06 | As a student, I want to see availability on the campus I'm actually heading to, not only the main campus. | Must Have |
| S-07 | As a student, I want to receive a notification if I receive a parking violation. | Should Have |

### Security Staff

| ID | Story | Priority |
|---|---|---|
| SEC-01 | As a security officer, I want to log a parking violation with a photo and notes from my tablet so I don't need paper forms. | Must Have |
| SEC-02 | As a security officer, I want to look up a vehicle plate and see its registration status instantly. | Must Have |
| SEC-03 | As a security officer, I want to see a real-time dashboard of all open violations sorted by urgency. | Must Have |
| SEC-04 | As a security officer, I want to update a violation's status (Acknowledged, Resolved, Dismissed) to track progress. | Must Have |
| SEC-05 | As a security officer, I want to select the specific space a violation occurred in, not just the zone, so the record is precise enough to act on. | Must Have |
| SEC-06 | As a security officer, I want a live notification when a new automated violation is detected in my patrol zone. | Should Have |

### Visitor

| ID | Story | Priority |
|---|---|---|
| V-01 | As a visitor, I want to see which zones have parking available without creating an account. | Must Have |
| V-02 | As a visitor, I want to know which campus area my destination is on so I park on the correct side. | Should Have |
| V-03 | As a visitor, I want to register my vehicle as a guest so I am tracked for that visit. | Should Have |

### Admin

| ID | Story | Priority |
|---|---|---|
| A-01 | As an admin, I want to view occupancy analytics by zone and time period to plan capacity. | Must Have |
| A-02 | As an admin, I want to add or edit parking zones and their capacity **via the management API**. | Must Have |
| A-03 | As an admin, I want to manage user accounts and assign roles **via the management API**. | Must Have |
| A-04 | As an admin, I want to export violation data as CSV for reporting. | Should Have |
| A-05 | As an admin, I want a dedicated web interface for zone and user management rather than direct API calls. | **Deferred to V1** |

> **Note on A-02 / A-03:** In the MVP these capabilities are delivered through the versioned REST API, not a graphical interface. This is a deliberate scoping decision — the API is the system of record and the future mobile client consumes the same endpoints. A dedicated admin UI (A-05) adds convenience, not capability, and was deferred accordingly.

---

## 5. Functional Requirements

### FR-01: Real-Time Parking Map

- Display **10 logical zones** on an OpenStreetMap base map via Leaflet
- Zones span the main campus, the female campus, faculty housing, and the sports complex
- Colour code by occupancy: green ≤60%, amber 61–85%, red >85%
- Zone tooltip: name, total capacity, occupied, available, occupancy percentage, status
- Click a zone to open a drawer with detailed statistics
- Live updates via Socket.IO without page refresh
- Public endpoint (no authentication) serving the visitor map
- A single shared map viewport across all roles — the map does not change centre or zoom based on who is logged in

### FR-02: Parking Reservation

- Student selects an available space or zone and creates a reservation
- System places the space into `RESERVED` status
- 15-minute hold timer; on expiry the space returns to `AVAILABLE`
- Status lifecycle: `ACTIVE → FULFILLED | EXPIRED | CANCELLED`
- Expiry is enforced both passively (on read) and actively (scheduled sweep)
- One active reservation per user
- In-app notification on creation, fulfilment, and expiry

### FR-03: Vehicle Management

- Register a vehicle with plate, make, model, and colour
- **Saudi plate format validation** — three permitted Latin letters plus 1–4 digits (e.g. `ABJ 2201`). Only the 17 letters with official Arabic equivalents are accepted. The interface displays the dual form alongside the Latin, e.g. `ا ب ح ٢٢٠١ / ABJ 2201`
- Plate lookup for security staff, returning owner details if the vehicle is registered
- Students may view only their own vehicles

### FR-04: Violation Management

- Manual violation logging by security staff: plate, zone, **specific space**, type, photo, notes
- Space selection is a cascading Zone → Space choice; the record stores the space identifier, not the zone as a proxy
- Automated violation detection by the scheduler (overstay, no permit, unauthorised zone)
- Status lifecycle: `PENDING → ACKNOWLEDGED → RESOLVED | DISMISSED`
- Evidence attachment (image or note) per violation
- Audit log entry on every status change

### FR-05: Notifications

- In-app real-time notifications via Socket.IO
- Email notifications via SMTP for violations, where the vehicle owner is registered
- Types: `VIOLATION_DETECTED`, `SPACE_AVAILABLE`, `SYSTEM_ALERT`
- Mark as read; mark all as read; unread badge count

### FR-06: Analytics (Admin)

- Occupancy trend charts by zone over time, sourced from the `OccupancySnapshot` table
- Violations by type, zone, and date
- Peak-hour view (average occupancy by hour)
- CSV export

---

## 6. Non-Functional Requirements

| Category | Requirement |
|---|---|
| API-first | All features exposed via a versioned REST API (`/api/v1/`) so a future mobile client requires no backend changes |
| Real-time | Zone availability updates delivered via Socket.IO within 2 seconds of a status change |
| Performance | API responses under 200 ms for zone and space reads under normal load. *Not yet validated under load testing* |
| Security | JWT authentication with refresh token rotation; bcrypt password hashing; HttpOnly cookies; no token persisted to browser storage |
| Scalability | Architecture supports replacing the occupancy simulator with real IoT feeds behind the same API contract, without client changes |
| Data integrity | Soft delete for users and zones; no hard delete on violations or audit logs |
| Accessibility | Availability status is conveyed by text label as well as colour, so the map is usable without colour discrimination. Full WCAG 2.1 AA audit deferred to V1 |
| Localisation | English interface in the MVP. Arabic and RTL support deferred to V1 — a significant gap for the intended user base, and prioritised accordingly |

---

## 7. Technical Architecture Summary

- **Backend:** Node.js 20 + Express + Prisma + PostgreSQL
- **Real-time:** Socket.IO, with rooms scoped per zone and per user
- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS + Leaflet
- **Map:** OpenStreetMap via Leaflet — no API key required, no per-request cost
- **Auth:** JWT access token in memory + HttpOnly refresh cookie, with role-based access control
- **Deployment target:** Railway or Render (PaaS, zero-config)
- **Future mobile:** React Native or Flutter, consuming the same `/api/v1/` endpoints

---

## 8. Success Metrics (Post-Deployment Targets)

> **These are targets for a deployed system, not measurements of the MVP prototype.** The MVP validates that the workflows exist and function end to end; measuring their effect requires real users, real occupancy data, and a measured pre-deployment baseline. No such baseline has been collected.

| Metric | Target | Baseline status |
|---|---|---|
| Average parking search time | Under 5 minutes | Baseline not yet measured |
| Reservation success rate at peak | Above 80% | No real demand data |
| Violation logging time | Under 2 minutes | Paper-based baseline not yet measured |
| Violation resolution within 48 hours | Above 70% | No current process data |
| Zone map load time | Under 3 seconds | Meets target in local development; not load tested |
| System uptime | Above 99% | Applies to a production deployment, not the demo environment |

Establishing the pre-deployment baseline — timing a sample of arrivals and a sample of paper violation reports — is a prerequisite for V1 and is listed as such on the roadmap.

---

## 9. Open Questions

| Question | Owner | Needed by |
|---|---|---|
| Can KSU facilities management provide surveyed parking lot boundaries? | Product / Facilities | V1 planning |
| Which zones are eligible for a sensor pilot, and who funds the hardware? | Operations | V1 planning |
| Is integration with KSU identity (SSO) feasible, and under what access terms? | IT | V2 planning |
| What is the current, measured violation processing time on paper? | Security operations | Before V1 metrics are set |