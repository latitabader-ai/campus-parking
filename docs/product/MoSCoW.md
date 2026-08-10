# MoSCoW Prioritisation
## KSU Intelligent Campus Parking Management System — MVP

**Framework:** MoSCoW (Must Have / Should Have / Could Have / Won't Have)
**Scope:** MVP release

---

## Must Have
*Core functionality without which the MVP is not viable.*

| ID | Feature | Rationale |
|---|---|---|
| M-01 | Interactive parking map with real KSU campus geography (OpenStreetMap) | Core value proposition; without this the product does not exist |
| M-02 | Real-time zone availability with colour-coded status (green/yellow/red) | Directly solves the search-time problem |
| M-03 | Parking space reservation with 15-minute hold timer | Differentiating feature; addresses the root cause of uncertainty |
| M-04 | Automatic reservation expiry (space returned to AVAILABLE) | Required for system integrity; without this, spaces deadlock |
| M-05 | Student account and vehicle registration | Required for personalised notifications and violation attribution |
| M-06 | Security staff manual violation logging (plate, zone, type, photo, notes) | Core security workflow |
| M-07 | Violation status lifecycle (PENDING → ACKNOWLEDGED → RESOLVED/DISMISSED) | Required for security workflow to be usable |
| M-08 | Vehicle plate lookup for security staff | Required for on-the-spot verification |
| M-09 | Role-based access control (STUDENT, SECURITY, ADMIN) | Required for data isolation and feature gating |
| M-10 | JWT authentication with refresh tokens | Required for secure API-first architecture |
| M-11 | Public zone availability (Visitor — no login) | Visitor persona requirement |
| M-12 | In-app real-time notifications (Socket.IO) | Required for reservation and violation flows |
| M-13 | Simulated occupancy data (scheduler / cron jobs) | Required for a usable demo without hardware |
| M-14 | Admin zone management (add/edit capacity and boundaries) | Required to keep zone data accurate post-launch |
| M-15 | OccupancySnapshot table and data collection | Required for analytics; must collect from day one |
| M-16 | API versioning (`/api/v1/`) | Required for future mobile app without breaking changes |

---

## Should Have
*Important features that significantly improve the product but are not blocking for MVP.*

| ID | Feature | Rationale |
|---|---|---|
| SH-01 | Email notifications for violations (Nodemailer + SMTP) | Useful fallback when user is not in-app; SMTP is optional/configurable |
| SH-02 | Analytics dashboard — occupancy trends, violations by zone/type | Adds operational value; charts need OccupancySnapshot data to populate |
| SH-03 | CSV export of violations and occupancy data | Useful for reporting; straightforward to implement |
| SH-04 | Automated violation detection (scheduler sweep) | Reduces manual staff workload; valuable but not blocking |
| SH-05 | Admin user management (assign roles, deactivate accounts) | Important for operations; can be deferred to post-MVP if needed |
| SH-06 | Visitor guest vehicle registration form | Improves visitor tracking; not blocking |
| SH-07 | Evidence gallery per violation (multiple photos) | Improves evidentiary quality; single-photo minimum is M-06 |
| SH-08 | Notification bell with unread count badge | UX improvement; core notifications are Must Have |
| SH-09 | Pagination on violations and spaces tables | Performance improvement for large datasets |

---

## Could Have
*Desirable features if time and resources allow; no significant impact if deferred.*

| ID | Feature | Rationale |
|---|---|---|
| CH-01 | Dark mode | UX preference; low effort with Tailwind |
| CH-02 | Violation history timeline per vehicle | Useful for repeat-offender tracking; could be a V1 feature |
| CH-03 | Heatmap of peak parking hours | Nice-to-have analytics visualisation |
| CH-04 | Multiple vehicles per student account | Most students have one vehicle; edge case |
| CH-05 | Configurable violation thresholds via admin UI | Currently set in env vars; UI control is optional |
| CH-06 | Cloudinary integration for evidence storage | Local file storage is sufficient for MVP demo |
| CH-07 | Inter-zone availability comparison view | Useful UX but map achieves the same goal |
| CH-08 | Print-friendly violation report | Useful for paper-based handoff; low priority |

---

## Won't Have (this release)
*Explicitly deferred to V1 or V2. Defining these prevents scope creep.*

| ID | Feature | Rationale |
|---|---|---|
| W-01 | Real IoT sensor integration (physical hardware) | Requires physical deployment; out of MVP scope |
| W-02 | Real ANPR / OCR (camera-based plate recognition) | Requires ML model and hardware; simulated in MVP |
| W-03 | Native mobile app (iOS / Android) | V1 deliverable; MVP is responsive web + API-first |
| W-04 | Payment processing (reservation fees / fines) | Requires payment gateway integration; V2 |
| W-05 | KSU student information system integration | Requires institutional API access; V2 |
| W-06 | Multi-campus support | Single-campus (KSU) scope for MVP |
| W-07 | Real-time CCTV feed integration | Hardware and infrastructure requirement |
| W-08 | Offline mode for mobile | Requires PWA or native app; V1/V2 |
| W-09 | Arabic language (RTL) localisation | Important for KSU deployment; deferred to V1 |
| W-10 | Accessibility audit (WCAG 2.1 AA full compliance) | Partial compliance in MVP; full audit in V1 |

---

## Prioritisation Rationale

The Must Have list is defined by the core problem statement: reducing parking search time and enabling violation management. Features that require hardware (IoT, ANPR), native apps, or institutional integrations are explicitly deferred because they cannot be simulated in the MVP and would block delivery without adding demonstrable value at this stage.

Parking reservation was elevated to **Must Have** because it directly addresses the root cause of the problem (uncertainty about availability) rather than merely informing users about a problem they cannot act on.
