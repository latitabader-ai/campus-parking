# Product Roadmap
## KSU Intelligent Campus Parking Management System

**Date:** 2025
**Horizon:** MVP → V1 → V2

---

## Roadmap Overview

```
MVP (now)           V1 (next)              V2 (future)
─────────────────   ────────────────────   ───────────────────────
Simulated data      Real sensor option     IoT sensors deployed
Web-only            Responsive + PWA       Native iOS / Android
English UI          Arabic / RTL           Full localisation
Manual violations   ANPR simulation        Real ANPR camera feed
KSU single campus   KSU full deployment    Multi-campus
```

---

## MVP — Current State

**Goal:** Validate core product concept with a functional prototype. No real hardware. All parking data simulated.

| Feature | Status |
|---|---|
| Interactive parking map (OpenStreetMap, KSU campus) | ✅ In development |
| Real-time zone availability with colour coding | ✅ In development |
| Parking space reservation (15-minute hold) | ✅ In development |
| Student account + vehicle registration | ✅ In development |
| Security staff violation logging + evidence | ✅ In development |
| Automated violation detection (scheduler/simulation) | ✅ In development |
| Security dashboard (live violation queue) | ✅ In development |
| In-app notifications (Socket.IO) | ✅ In development |
| Email notifications (SMTP, configurable) | ✅ In development |
| Parking analytics (occupancy trends, violations) | ✅ In development |
| Visitor public map (no login) | ✅ In development |
| Admin zone + user management | ✅ In development |
| API-first architecture (REST + WebSocket) | ✅ In development |
| **Simulated occupancy data** | ✅ Intentional — no hardware required |

**Explicit MVP Limitations:**
- Zone boundaries are approximate (not official KSU parking zones)
- 4,000 spaces are simulated — not from real sensors
- No Arabic/RTL UI
- No native mobile app
- No payment processing

---

## V1 — Responsive Web + Optional Real Sensors

**Goal:** Deployable at KSU. Responsive design optimised for mobile browsers. Optional connection to real parking sensors.

| Feature | Description |
|---|---|
| Arabic / RTL localisation | Full right-to-left UI; Arabic content |
| Responsive mobile web | Optimised for smartphone browsers (PWA optional) |
| Real sensor adapter | Pluggable adapter layer; replace simulator with real IoT sensor API |
| Push notifications (browser) | Web Push API for background notifications |
| Enhanced ANPR simulation | Camera input → simulated plate extraction (no real OCR) |
| Violation history per vehicle | Repeat-offender tracking |
| Configurable thresholds (admin UI) | Overstay duration, zone capacity alerts |
| Full WCAG 2.1 AA accessibility | Colour + text labels; keyboard navigation |
| Production hardening | Rate limiting, security headers, HTTPS enforcement |
| Deployment to KSU infrastructure | On-premise or university cloud |

---

## V2 — Native Mobile + Real IoT + ANPR

**Goal:** Full production deployment with real hardware integration and native mobile apps.

| Feature | Description |
|---|---|
| Native iOS app | React Native or Flutter; map, reservation, notifications |
| Native Android app | React Native or Flutter |
| Real IoT sensor integration | Replace simulator with live sensor feeds (LoRaWAN / REST / MQTT) |
| Real ANPR / OCR | Camera-based licence plate recognition (OpenALPR or cloud API) |
| Payment gateway | Optional: fine payment or reservation premium pricing |
| KSU student system integration | Verify student registration; auto-link vehicle plate from student ID |
| Multi-campus support | Extend to other KSU campuses or Saudi university network |
| Advanced analytics | Predictive occupancy modelling; capacity planning recommendations |
| Offline mode (mobile) | Cached zone data when connectivity is poor |

---

## Feature Versioning Table

| Feature | MVP | V1 | V2 |
|---|---|---|---|
| Map + availability | ✅ Simulated | ✅ Real option | ✅ Real |
| Reservation | ✅ | ✅ Enhanced | ✅ + Payment |
| Violations | ✅ Manual + simulated auto | ✅ + History | ✅ + ANPR |
| Notifications | ✅ In-app + email | ✅ + Push | ✅ |
| Analytics | ✅ Basic charts | ✅ + Heatmaps | ✅ + Predictive |
| Arabic UI | ❌ | ✅ | ✅ |
| Mobile app | ❌ (responsive web) | ❌ (PWA) | ✅ Native |
| Real sensors | ❌ (simulated) | 🔌 Optional | ✅ |
| ANPR | ❌ (simulated) | 🔌 Simulated enhanced | ✅ Real |
| Payments | ❌ | ❌ | ✅ Optional |

---

## Assumptions & Dependencies

- V1 Arabic localisation requires UI string extraction and RTL CSS audit
- V1 real sensor adapter depends on KSU providing a sensor API or data feed
- V2 ANPR depends on procurement of compatible cameras or cloud OCR contract
- V2 KSU integration depends on institutional IT cooperation
- All versions maintain backward-compatible `/api/v1/` REST endpoints
