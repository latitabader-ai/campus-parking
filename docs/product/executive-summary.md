# Executive Summary
## KSU Intelligent Campus Parking Management System

**Prepared for:** University senior management
**Status:** MVP prototype — simulated data, not deployed infrastructure

---

## The Problem

King Saud University in Riyadh is one of the largest universities in the Arab world, with tens of thousands of daily commuters. Parking management currently relies on physical signage and manual security patrols, resulting in:

- **Extended search times during peak arrival hours**, with no way for a driver to assess availability before setting out
- **No real-time visibility** into which zones have capacity
- **Manual, paper-based violation logging** that is slow and leaves no searchable record
- **No utilisation data** for campus administration to plan capacity or identify pressure points
- **No digital guidance for visitors** to visitor-designated areas

The underlying issue is not a shortage of spaces alone — it is **uncertainty**. A driver who knows a zone is full can choose another; a driver who knows nothing must search.

---

## The Solution

A full-stack, API-first web application addressing these problems through:

- **An interactive parking map** built on real KSU campus geography (OpenStreetMap), showing **10 parking zones** spanning the main campus, the female campus, faculty housing, and the sports complex — with colour-coded availability (green ≤60%, amber 61–85%, red >85%)
- **Parking space reservation** — students hold an available space for 15 minutes, converting uncertainty into a guarantee
- **Security staff tools** — digital violation logging with photo evidence, a live dashboard, and vehicle plate lookup
- **Automated violation detection** — simulated in the MVP; designed for replacement by real sensors or ANPR without changing the API
- **Analytics** — occupancy trends, violation statistics, and peak-hour analysis for campus operations

Zone coverage was deliberately extended across **both campuses**. A system serving only the male campus would exclude a substantial share of daily commuters.

---

## What Was Built (MVP)

A fully functional prototype comprising:

- **Backend** — Node.js + Express REST API, Socket.IO real-time layer, PostgreSQL database
- **Frontend** — React 18 web application with a Leaflet map, Tailwind CSS, and live updates
- **Data** — 10 zones positioned on real KSU parking-lot coordinates; 4,000 simulated spaces with per-lot capacity
- **Three authenticated interfaces** — Student portal, Security staff dashboard, Admin panel
- **One public view** — zone availability visible without login

> **Important:** The MVP uses simulated occupancy data and approximate zone boundaries. Zone centres correspond to real parking lots, but the boundaries themselves are not surveyed and do not represent official KSU parking infrastructure. Real sensors and verified zone data are planned for V1.

---

## MVP Delivery Metrics

| Metric | Result |
|---|---|
| Parking zones modelled | 10, across both campuses, faculty housing, and the sports complex |
| Simulated spaces seeded | 4,000, with per-lot capacity ranging 240–620 |
| API endpoints delivered | 30+ across 9 modules |
| User roles implemented | 3 authenticated (Student, Security, Admin) + 1 public (Visitor) |
| Violation lifecycle states | 4 — Pending → Acknowledged → Resolved / Dismissed |
| Product deliverables completed | 7 of 7 |

> Response times were consistently below one second in local development. No formal load or performance testing has been conducted; these figures are indicative of the prototype environment only.

---

## Product Scope by Release

| Release | Key Capability | Hardware |
|---|---|---|
| **MVP (current)** | Simulated availability, reservation, violations, analytics, responsive web | None required |
| **V1** | Surveyed zone boundaries, Arabic/RTL interface, admin UI, optional real sensors, mobile web (PWA) | Optional IoT sensors |
| **V2** | Native iOS/Android app, real ANPR, KSU system integration | Cameras + sensors + institutional APIs |

---

## Technology Choices

| Layer | Technology | Rationale |
|---|---|---|
| Backend API | Node.js + Express + Prisma | Fast I/O, real-time capable, type-safe ORM |
| Database | PostgreSQL | Relational integrity plus JSON columns for geospatial data |
| Real-time | Socket.IO | Live map updates and notifications without polling |
| Map | Leaflet + OpenStreetMap | Open-source, no API key cost, real campus geography |
| Frontend | React 18 + Vite + TypeScript | Maintainable, mobile-adaptable, strict type checking |
| Deployment | Railway / Render (PaaS) | Zero-config; free tier sufficient for an MVP demonstration |

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Simulated data does not reflect real occupancy patterns | The MVP is a proof of concept. Real sensors replace the simulator behind the same API contract, so no client changes are required |
| Zone boundaries do not match actual KSU parking areas | Boundaries are labelled as approximate throughout the interface and documentation. Zone data is editable via the REST API; a dedicated admin UI is planned for V1 |
| Staff adoption resistance | Minimal data entry per violation; designed for tablet and mobile field use |
| Scalability at full campus load | Indexed PostgreSQL queries and Socket.IO rooms to limit event fan-out. Not yet validated under load |
| Institutional data integration may not be granted | The system operates fully standalone. Integration with KSU identity and vehicle registration systems is a V2 enhancement, not a dependency |

---

## Development Approach

This system was designed and implemented as part of an IBM-facilitated product development exercise. Development was AI-assisted using **IBM Bob** (a Claude-based coding assistant), with human judgment applied to:

- Product requirements definition and persona design
- Scope decisions across MVP, V1, and V2
- Geographic context decisions — real KSU coordinates versus simulated occupancy
- Ethical boundaries — no fabrication of official KSU data
- Architecture validation and trade-off decisions
- Correction of AI output that was plausible but wrong, including uniform zone capacities, occupancy logic that made one of three map states unreachable, and zone coordinates placed on buildings rather than parking lots

The accompanying reflective memo documents this collaboration in detail, including the specific cases where automated output required human correction.

---

## Recommendation

The MVP demonstrates that the core problem — uncertainty about parking availability — can be addressed with software alone, before any hardware investment. We recommend proceeding to **V1** with two priorities: obtaining surveyed parking-lot boundaries from KSU facilities management, and piloting real occupancy sensors in a single high-pressure zone to validate the simulator's replacement path.