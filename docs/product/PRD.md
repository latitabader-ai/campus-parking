# Product Requirements Document (PRD)
## KSU Intelligent Campus Parking Management System

**Version:** 1.0 — MVP
**Status:** In Development
**Date:** 2025

---

## 1. Problem Statement

King Saud University (KSU) in Riyadh, Saudi Arabia is a large campus with thousands of daily commuters. Students and visitors currently have no real-time visibility into parking availability, leading to:

- Significant time wasted searching for parking (estimated 10–20 minutes per visit during peak hours)
- Congestion at zone entrances caused by drivers circling full zones
- Inefficient use of parking capacity — some zones overflow while others remain underutilised
- Manual, paper-based violation management that is slow, error-prone, and unscalable
- No data for campus operations to understand utilisation patterns or plan capacity

---

## 2. Product Vision

> Enable every KSU commuter to find, reserve, and navigate to available parking in under 5 minutes — from their phone or browser — while giving security staff and administrators real-time tools to manage violations and utilisation.

---

## 3. Scope & Boundaries

### In Scope — MVP
- Real-time zone-level parking availability (simulated occupancy data)
- Interactive parking map (OpenStreetMap base, KSU campus geography)
- Parking space reservation with 15-minute hold timer
- Vehicle registration and plate lookup
- Automated violation detection (simulated) and manual violation logging
- Evidence management (photo/note attachment)
- In-app and email notifications (violations, reservations, availability)
- Security staff dashboard
- Parking utilisation analytics
- Role-based access (Student, Security Staff, Admin)
- Public availability view for Visitors (no login required)
- API-first architecture for future mobile app

### Out of Scope — MVP (planned for V1/V2)
- Real IoT sensor integration (physical hardware)
- Real ANPR / OCR (camera-based licence plate recognition)
- Native mobile app (iOS/Android)
- Payment processing for reserved spaces or fines
- Integration with KSU student information systems
- Multi-campus support
- Real-time CCTV feeds

### Explicit Disclaimers
- The 8 parking zones are **logical MVP zones** placed on the real KSU campus geography. They do **not** represent official KSU parking zones or verified parking infrastructure.
- The 4,000 parking spaces and their occupancy data are **entirely simulated**.
- KSU geography (OpenStreetMap base map, campus coordinates) is real. Zone boundaries and capacity are approximated for the MVP.

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
| S-06 | As a student, I want to receive a notification if I receive a parking violation. | Should Have |

### Security Staff
| ID | Story | Priority |
|---|---|---|
| SEC-01 | As a security officer, I want to log a parking violation with a photo and notes from my tablet so I don't need paper forms. | Must Have |
| SEC-02 | As a security officer, I want to look up a vehicle plate and see its registration status instantly. | Must Have |
| SEC-03 | As a security officer, I want to see a real-time dashboard of all open violations sorted by urgency. | Must Have |
| SEC-04 | As a security officer, I want to update a violation's status (Acknowledged, Resolved, Dismissed) to track progress. | Must Have |
| SEC-05 | As a security officer, I want to receive a live notification when a new automated violation is detected in my patrol zone. | Should Have |

### Visitor
| ID | Story | Priority |
|---|---|---|
| V-01 | As a visitor, I want to see which zones have visitor parking available without creating an account. | Must Have |
| V-02 | As a visitor, I want to register my vehicle as a guest so I am tracked for that visit. | Should Have |

### Admin
| ID | Story | Priority |
|---|---|---|
| A-01 | As an admin, I want to view occupancy analytics by zone and time period to plan capacity. | Must Have |
| A-02 | As an admin, I want to export violation data as CSV for reporting. | Should Have |
| A-03 | As an admin, I want to add or edit parking zones and their capacity. | Must Have |
| A-04 | As an admin, I want to manage user accounts and assign roles. | Must Have |

---

## 5. Functional Requirements

### FR-01: Real-Time Parking Map
- Display 8 logical zones on OpenStreetMap base map (Leaflet)
- Colour code: green ≤60% occupied, yellow 61–85%, red >85%
- Zone tooltip: name, total capacity, occupied, available, occupancy %, status
- Click zone → drawer with detailed stats
- Live updates via Socket.IO without page refresh
- Public endpoint (no login) for visitor map

### FR-02: Parking Reservation
- Student selects an available space/zone and creates a reservation
- System places space into RESERVED status
- 15-minute hold timer; expiry returns space to AVAILABLE
- Status lifecycle: ACTIVE → FULFILLED | EXPIRED | CANCELLED
- In-app notification on reservation creation, fulfilment, expiry

### FR-03: Vehicle Management
- Register vehicle with plate, make, model, colour
- Saudi plate format validation (demo: ABC-1234 style)
- Plate lookup for security staff (any plate; returns owner if registered)
- Student views own vehicles only

### FR-04: Violation Management
- Manual violation logging by security staff (plate, zone, type, photo, notes)
- Automated violation detection by scheduler (overstay, no permit, unauthorized zone)
- Status lifecycle: PENDING → ACKNOWLEDGED → RESOLVED | DISMISSED
- Evidence attachment (image/note) per violation
- Audit log entry on every status change

### FR-05: Notifications
- In-app real-time notifications via Socket.IO
- Email notifications via SMTP for violations (if vehicle owner registered)
- Notification types: VIOLATION_DETECTED, SPACE_AVAILABLE, SYSTEM_ALERT
- Mark as read; mark all as read; unread badge count

### FR-06: Analytics (Admin)
- Occupancy trend charts by zone over time (OccupancySnapshot table)
- Violations by type, zone, date
- Peak hours heatmap (average occupancy by hour)
- CSV export

---

## 6. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **API-first** | All features exposed via versioned REST API (`/api/v1/`) for future mobile app |
| **Real-time** | Zone availability updates delivered via Socket.IO within 2 seconds of status change |
| **Performance** | API responses < 200ms for zone/space reads under normal load |
| **Security** | JWT auth with refresh token rotation; bcrypt passwords; HttpOnly cookies |
| **Scalability** | Architecture supports replacing simulated sensor data with real IoT feeds without redesign |
| **Data integrity** | Soft-delete for users/zones; no hard delete on violations or audit logs |
| **Accessibility** | Colour-coded map includes text labels (not colour alone) for WCAG compliance |

---

## 7. Technical Architecture Summary

- **Backend:** Node.js 20 + Express + Prisma + PostgreSQL
- **Real-time:** Socket.IO (rooms per zone and per user)
- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS + Leaflet
- **Map:** OpenStreetMap via Leaflet (no API key required)
- **Auth:** JWT (access) + HttpOnly cookie (refresh), RBAC
- **Deployment target:** Railway/Render (PaaS, zero-config)
- **Future mobile:** React Native or Flutter consuming the same `/api/v1/` endpoints

---

## 8. Success Metrics

| Metric | Target |
|---|---|
| Average parking search time | < 5 minutes |
| Reservation success rate (peak) | > 80% |
| Violation logging time (staff) | < 2 minutes |
| Zone map load time | < 3 seconds |
| System uptime | > 99% (MVP demo environment) |
