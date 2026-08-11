# Product Roadmap
## KSU Intelligent Campus Parking Management System

**Horizon:** MVP → V1 → V2

---

## Overview

```
MVP (complete)        V1 (next)                  V2 (future)
──────────────────    ────────────────────────   ───────────────────────
Simulated occupancy   Sensor pilot + adapter     IoT sensors deployed
Approximate zones     Surveyed lot boundaries    Full geometry
Responsive web        PWA + admin UI             Native iOS / Android
English UI            Arabic / RTL               Full localisation
Manual violations     + Repeat-offender history  Real ANPR camera feed
No baseline data      Baseline measured          Predictive modelling
```

---

## MVP — Complete

**Goal:** Validate the core product concept with a functional prototype requiring no hardware.

| Capability | Status |
|---|---|
| Interactive parking map (OpenStreetMap, real KSU geography) | ✅ Complete |
| 10 zones across both campuses, faculty housing, and sports complex | ✅ Complete |
| Real-time zone availability with colour coding | ✅ Complete |
| Per-lot capacity (240–620) and per-zone occupancy rates | ✅ Complete |
| Parking space reservation with 15-minute hold | ✅ Complete |
| Student account and vehicle registration | ✅ Complete |
| Saudi dual-script plate format and validation | ✅ Complete |
| Security staff violation logging with evidence | ✅ Complete |
| Cascading Zone → Space selection for violations | ✅ Complete |
| Automated violation detection (simulated) | ✅ Complete |
| Security dashboard with live violation queue | ✅ Complete |
| In-app notifications via Socket.IO | ✅ Complete |
| Email notifications via SMTP (configurable) | ✅ Complete |
| Occupancy and violation analytics with CSV export | ✅ Complete |
| Public visitor map, no login required | ✅ Complete |
| Zone and user management via REST API | ✅ Complete |
| API-first architecture (REST + WebSocket) | ✅ Complete |
| KSU visual identity (blue and white) | ✅ Complete |

### Explicit MVP limitations

- Zone boundaries are **approximate rectangles**, not surveyed geometry. Zone centres correspond to real lots; the extents do not.
- All 4,000 spaces and their occupancy are **simulated**, not sensor-derived.
- Zone and user management is available **via API only** — no dedicated admin interface.
- **No Arabic or RTL** interface.
- No native mobile application; no payment processing.
- **No measured baseline** against which improvement could be demonstrated.

---

## V1 — Deployable at KSU

**Goal:** A system KSU could actually run, with the accuracy and language support that requires.

| Item | Description | Depends on |
|---|---|---|
| **Baseline measurement** | Time a sample of peak-hour arrivals and a sample of paper violation reports, establishing what the system must beat | Security operations cooperation |
| **Surveyed zone boundaries** | Replace rectangles with real lot geometry; add a `geometry` column and render true polygons | KSU facilities management data |
| **Arabic / RTL localisation** | Full right-to-left interface with KSU terminology | String extraction + RTL CSS audit |
| **Sensor pilot** | Deploy occupancy sensors in one high-pressure lot to validate the simulator replacement path | Hardware procurement, single lot |
| **Sensor adapter layer** | Pluggable interface so real feeds replace the simulator behind the same API contract | Sensor pilot data format |
| **Admin web interface** | Zone and user management without direct API calls | — |
| **Responsive mobile web / PWA** | Optimised for smartphone browsers; installable | — |
| **Browser push notifications** | Web Push for background alerts | — |
| **Violation history per vehicle** | Repeat-offender tracking | — |
| **Configurable thresholds** | Overstay duration and capacity alerts, admin-editable | Admin UI |
| **Full WCAG 2.1 AA compliance** | Keyboard navigation, contrast audit, screen reader support | — |
| **Production hardening** | Rate limiting, security headers, HTTPS enforcement, monitoring | — |
| **Deployment to KSU infrastructure** | On-premise or university cloud | Institutional IT |

> **Sequencing note:** Baseline measurement is listed first deliberately. Without it, no V1 outcome can be evaluated — the system would be deployed with no way to demonstrate whether it improved anything.

---

## V2 — Full Production

**Goal:** Production deployment with hardware integration and native applications.

| Item | Description | Depends on |
|---|---|---|
| Native iOS and Android apps | React Native or Flutter, consuming the same API | — |
| Campus-wide IoT sensor deployment | Live feeds via LoRaWAN, REST, or MQTT | V1 pilot results, procurement |
| Real ANPR / OCR | Camera-based plate recognition | Camera procurement or cloud OCR contract |
| KSU identity integration | SSO; auto-link vehicle to student record | Institutional IT cooperation |
| Payment gateway | Optional — fines or premium reservation | Policy decision on paid parking |
| Multi-campus support | Extend beyond KSU | — |
| Predictive occupancy | Forecast availability from historical snapshots | Sufficient real occupancy history |
| Offline mode | Cached zone data for poor connectivity | Native app |

---

## Feature Versioning

| Feature | MVP | V1 | V2 |
|---|---|---|---|
| Map + availability | ✅ Simulated | ✅ Sensor pilot | ✅ Real, campus-wide |
| Zone geometry | ⚠️ Approximate | ✅ Surveyed | ✅ Surveyed |
| Reservation | ✅ | ✅ Enhanced | ✅ + optional payment |
| Violations | ✅ Manual + simulated auto | ✅ + history | ✅ + real ANPR |
| Notifications | ✅ In-app + email | ✅ + browser push | ✅ + native push |
| Analytics | ✅ Basic charts | ✅ + heatmaps | ✅ + predictive |
| Admin management | ⚠️ API only | ✅ Web UI | ✅ |
| Arabic / RTL | ❌ | ✅ | ✅ |
| Mobile | ❌ Responsive web | ⚠️ PWA | ✅ Native |
| Real sensors | ❌ | 🔌 Pilot | ✅ Deployed |
| Baseline metrics | ❌ | ✅ Measured | ✅ Tracked |

---

## Assumptions & Dependencies

- **Surveyed boundaries** require KSU facilities management to share lot geometry. Without it, V1 zones remain approximate.
- **The sensor pilot** requires hardware budget and a nominated lot. Scope is deliberately one lot — enough to validate the adapter, small enough to abandon cheaply.
- **Arabic localisation** requires a full string extraction pass and an RTL layout audit; it is not a translation task alone.
- **KSU system integration** in V2 depends on institutional IT granting API access, which is outside the product team's control and should not be a critical path dependency.
- **All versions maintain backward-compatible `/api/v1/` endpoints**, so a future mobile client requires no backend rework.

---

## Deferred Indefinitely

Items considered and consciously excluded rather than scheduled:

| Item | Reason |
|---|---|
| Gate and barrier control | Enforcement by hardware changes the product from informational to restrictive — a policy decision, not a product one |
| Reservation fees | KSU parking is free; introducing a charge is a university policy question |
| Real-time CCTV feeds | Surveillance infrastructure with privacy implications well beyond parking management |
| Multi-university network | Attractive but premature; single-campus value must be proven first |