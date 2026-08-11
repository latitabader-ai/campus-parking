# Product Personas
## KSU Campus Parking Management System

> **Scope note:** This document describes the three **product personas** — the human users of the system. The `ADMIN` database role is an operational/system role, not a primary product persona. It is documented separately under "System Role" below.

> **On metrics:** The success metrics in this document are **targets**, not measurements. No pre-deployment baseline has been collected — timing a sample of arrivals and of paper-based violation reports is a prerequisite for V1. Where a "current" figure appears, it is an estimate offered for context, not a measured value.

---

## Primary Personas

### Persona 1 — The Student

**Name:** Ahmed Al-Rashidi *(fictional demo character)*
**Role:** Undergraduate student, King Saud University

**Goals**
- Find an available parking space quickly before class
- Reserve a space in advance rather than circling a full lot
- Know how full each zone is *before* driving to campus
- Be notified if a space opens in a preferred zone

**Pain points**
- Loses time searching for parking on busy days
- No visibility into which zones are full before arriving
- No way to reserve — parking is strictly first-come, first-served
- Receives violation notices with no prior warning

**Behaviours**
- Checks parking before leaving home, via a smartphone browser
- Prefers a visual map over a text list of availability
- Wants push notifications rather than email

**Success targets**
| Target | Baseline status |
|---|---|
| Average search time under 5 minutes | Current time not yet measured |
| Reservation success rate above 80% at peak | No real demand data |
| Notification read rate above 60% | No usage data |

---

### Persona 2 — The Security Staff Member

**Name:** Khalid Al-Zahrani *(fictional demo character)*
**Role:** Campus security officer, King Saud University

**Goals**
- Verify quickly whether a vehicle is registered on campus
- Log violations accurately, with photo evidence and notes
- Track open violations from issue through to resolution
- Record the **specific space** involved, not just the zone, so the report is precise enough to act on
- Monitor zone occupancy in real time from the dashboard

**Pain points**
- Paper-based logging is slow and error-prone
- No centralised record, so repeat offenders go unnoticed
- Cannot verify registration status on the spot
- No real-time view of occupancy levels

**Behaviours**
- Works in the field with a tablet or smartphone
- Logs violations on the spot and attaches photos as evidence
- Reviews the violation queue at the start and end of each shift
- Escalates unresolved cases to a supervisor

**Success targets**
| Target | Baseline status |
|---|---|
| Violation logging under 2 minutes | Paper-based time not yet measured |
| Resolution rate above 70% within 48 hours | No current process data |
| No unresolved violations older than 7 days | No current process data |

---

### Persona 3 — The Visitor

**Name:** Nora Al-Hamdan *(fictional demo character)*
**Role:** Campus visitor — parent, conference attendee, or prospective student

**Goals**
- Find available parking quickly, without creating an account
- **Identify which campus area her destination is on** — main campus, female campus, or faculty housing — and park on the correct side
- Know availability before entering campus, while route options still exist
- Register a vehicle for temporary access if needed

**Pain points**
- Unfamiliar with the campus layout and its separate areas
- No signage or digital guidance toward visitor parking
- Cannot check availability before arriving
- Risks parking on the wrong campus and having to relocate

**Behaviours**
- Visits once or infrequently
- Uses a web browser — will not install an application
- Will not create an account for a single visit

> **Design implication:** Nora has no demo account in the seeded data, and this is deliberate. The visitor journey must work with **no authentication at all** — an account barrier would defeat the persona. The public map at `/map` exists specifically for her.

**Success targets**
| Target | Baseline status |
|---|---|
| Parking found within 5 minutes of campus entry | Not yet measured |
| Reduced overflow of visitors into student zones | No current utilisation data |

---

## System Role (Not a Product Persona)

### System Admin — `ADMIN` technical role

**Who holds it:** IT staff and the parking administration team

**Purpose:** Operational configuration — managing zones, user accounts, reviewing analytics, exporting data. This is not a product stakeholder whose needs shape the product; it is the role that keeps the product running.

**Key tasks**
- Add, edit, or remove parking zones and their capacity
- Manage user accounts and assign roles
- Review analytics dashboards and export reports
- Configure system thresholds (violation timers, simulator settings)

> In the MVP these tasks are performed **through the REST API**, not a graphical interface. A dedicated admin UI is a V1 item — it adds convenience for non-technical administrators, not capability.

This role is deliberately excluded from the persona set. Conflating a database role with a product persona is a common framing error: it shifts design attention toward whoever administers the system rather than whoever it is for.

---

## Persona Summary

| Persona | Auth required | Primary feature | Campus coverage need | Mobile priority |
|---|---|---|---|---|
| **Student** | Yes | Parking map + reservation | Whichever campus they study on | High (V2 native) |
| **Security Staff** | Yes | Violations dashboard | Their assigned patrol zones | Medium (V2) |
| **Visitor** | **No** | Public zone availability | Must identify the correct campus | Low |
| *Admin (system role)* | Yes | Zone and user management | All zones | Low |

---

## Why Coverage Matters Across Personas

All three personas share one requirement that a single-campus system cannot meet: **the zone they need must be in the system**.

King Saud University operates separate main and female campus areas, plus faculty housing. A student attending the female campus, a visitor heading there, and a security officer patrolling it are all excluded by a system that models only the main campus — not partially served, but entirely unserved.

This is why campus-wide coverage is a **Must Have** (M-17 in the prioritisation document) rather than a distribution refinement. It is a correctness requirement for every persona in this document.