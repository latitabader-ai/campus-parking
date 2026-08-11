# MoSCoW Prioritisation
## KSU Intelligent Campus Parking Management System — MVP

**Framework:** MoSCoW (Must Have / Should Have / Could Have / Won't Have)
**Scope:** MVP release

---

## Must Have
*Core functionality without which the MVP is not viable.*

| ID | Feature | Rationale |
|---|---|---|
| M-01 | Interactive parking map on real KSU campus geography (OpenStreetMap) | Core value proposition; without this the product does not exist |
| M-02 | Real-time zone availability with colour-coded status (green / amber / red) | Directly addresses the search problem |
| M-03 | Parking space reservation with a 15-minute hold timer | The differentiating feature; addresses uncertainty rather than merely reporting it |
| M-04 | Automatic reservation expiry returning the space to `AVAILABLE` | Required for system integrity — without it, spaces deadlock permanently |
| M-05 | Student account and vehicle registration | Required for personalised notifications and violation attribution |
| M-06 | Security staff manual violation logging (plate, zone, space, type, photo, notes) | Core security workflow |
| M-07 | Violation status lifecycle (`PENDING → ACKNOWLEDGED → RESOLVED / DISMISSED`) | Required for the security workflow to be usable rather than merely recorded |
| M-08 | Vehicle plate lookup for security staff | Required for on-the-spot verification |
| M-09 | Role-based access control (Student, Security, Admin) | Required for data isolation and feature gating |
| M-10 | JWT authentication with refresh tokens | Required for a secure API-first architecture |
| M-11 | Public zone availability with no login (Visitor) | Visitor persona requirement — an account barrier defeats the use case |
| M-12 | In-app real-time notifications (Socket.IO) | Required for reservation and violation flows to feel live |
| M-13 | Simulated occupancy data (scheduler) | Required for a usable demonstration without hardware investment |
| M-14 | Zone and user management via the REST API | Required to keep zone data accurate post-launch. A graphical admin interface is convenience, not capability — see W-11 |
| M-15 | `OccupancySnapshot` collection from day one | Required for analytics; historical data cannot be reconstructed retroactively |
| M-16 | API versioning (`/api/v1/`) | Required so a future mobile client does not force breaking changes |
| M-17 | Zone coverage across both campuses, faculty housing, and the sports complex | Equity of service. A system covering only the main campus would exclude a substantial share of daily commuters, including most female students |
| M-18 | Per-lot capacity and per-zone occupancy rates | Uniform figures across all zones are implausible and make the availability legend meaningless — every zone renders the same colour |
| M-19 | Saudi plate format validation with dual-script display | A plate field that rejects the local format is unusable in the deployment context |

---

## Should Have
*Important features that significantly improve the product but do not block the MVP.*

| ID | Feature | Rationale |
|---|---|---|
| SH-01 | Email notifications for violations (SMTP) | Useful fallback when the user is not in-app; SMTP remains optional and configurable |
| SH-02 | Analytics dashboard — occupancy trends, violations by zone and type | Adds operational value; depends on `OccupancySnapshot` data accumulating |
| SH-03 | CSV export of violations and occupancy data | Useful for reporting; low implementation cost |
| SH-04 | Automated violation detection (scheduler sweep) | Reduces manual staff workload; valuable but not blocking |
| SH-05 | Visitor guest vehicle registration | Improves visitor tracking; the public map works without it |
| SH-06 | Evidence gallery per violation (multiple photos) | Improves evidentiary quality; single-photo capture is covered by M-06 |
| SH-07 | Notification bell with unread count | UX improvement; the underlying notifications are Must Have |
| SH-08 | Pagination on violations and spaces | Performance safeguard as datasets grow |

---

## Could Have
*Desirable if time and resources allow; no significant impact if deferred.*

| ID | Feature | Rationale |
|---|---|---|
| CH-01 | Dark mode | UX preference; low effort with Tailwind |
| CH-02 | Violation history timeline per vehicle | Useful for repeat-offender tracking; a natural V1 feature |
| CH-03 | Peak-hours heatmap | Attractive analytics visualisation; the trend chart covers the core need |
| CH-04 | Multiple vehicles per student account | Most students have one vehicle; an edge case for the MVP |
| CH-05 | Configurable violation thresholds via the interface | Currently set through environment variables; interface control is convenience |
| CH-06 | Cloud storage for evidence (e.g. Cloudinary) | Local file storage is sufficient for a demonstration |
| CH-07 | Inter-zone availability comparison view | Useful, but the map already answers the same question |
| CH-08 | Print-friendly violation report | Useful for paper handoff during transition; low priority |

---

## Won't Have (this release)
*Explicitly deferred. Naming the deferral target prevents both scope creep and the impression that these were overlooked.*

| ID | Feature | Deferred to | Rationale |
|---|---|---|---|
| W-01 | Surveyed zone boundaries (true lot polygons) | **V1** | Requires geometry data from KSU facilities management. MVP uses labelled approximations |
| W-02 | Arabic and RTL localisation | **V1** | Significant gap for the intended user base, and the highest-priority V1 item. Requires string extraction and a layout audit, not translation alone |
| W-03 | Real IoT sensor integration | **V1 (pilot)** | Requires hardware procurement. The adapter layer is designed for it; a single-lot pilot validates the path |
| W-04 | Full WCAG 2.1 AA audit | **V1** | Partial compliance in MVP — status is conveyed by text as well as colour. Full audit needs dedicated testing |
| W-05 | Browser push notifications | **V1** | In-app notifications cover the MVP flows |
| W-06 | Offline mode | **V1 / V2** | Requires PWA or native shell |
| W-07 | Native mobile application (iOS / Android) | **V2** | MVP is responsive web with an API-first backend; the API is already mobile-ready |
| W-08 | Real ANPR / OCR plate recognition | **V2** | Requires cameras or a cloud OCR contract; simulated in MVP |
| W-09 | Payment processing (fees or fines) | **V2** | Requires a gateway integration and, more importantly, a university policy decision — KSU parking is currently free |
| W-10 | KSU student information system integration | **V2** | Requires institutional API access outside the product team's control; must not become a critical-path dependency |
| W-11 | Dedicated administrative web interface | **V1** | Management capability exists via the API (M-14). The interface adds convenience for non-technical administrators |
| W-12 | Multi-campus support beyond KSU | **V2** | Single-institution value must be proven first |
| W-13 | Real-time CCTV feed integration | **Not planned** | Surveillance infrastructure with privacy implications well beyond parking management |

---

## Prioritisation Rationale

The Must Have list follows directly from the problem statement: reduce the uncertainty that causes search time, and make violation management workable. Features requiring hardware, native applications, or institutional integrations are deferred because they cannot be validated within the MVP and would block delivery without adding demonstrable value at this stage.

Three inclusions deserve explanation, because each was elevated after review rather than being obvious from the outset:

**Reservation (M-03)** was elevated to Must Have because it addresses the root cause rather than the symptom. Without it, the product tells a student a zone is 88% full — accurate, and actionable only as discouragement. Reservation converts information into a guarantee, which is the actual job the user needs done.

**Campus coverage (M-17)** was elevated after the initial implementation placed all zones on the main campus. This is not a distribution detail; a parking system that omits the female campus is not a campus parking system. Coverage is a correctness requirement, not a nice-to-have.

**Varied capacity and occupancy (M-18)** was elevated after uniform values produced a map where the "Full" state could never occur. The availability legend advertised three states while only one was reachable. A feature that cannot be observed is not implemented, regardless of whether the code compiles.

The reverse also holds. **Administrative interface work (W-11)** was demoted once it became clear that the underlying capability already existed through the API. The distinction between *capability* and *convenience* was the deciding test throughout, and applying it consistently is what kept the Must Have list at a deliverable size.