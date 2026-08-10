# Product Personas
## KSU Campus Parking Management System

> **Scope note:** This document describes the three *product personas* — the real human users of the system. The technical `ADMIN` database role is an operational/system role, not a primary product persona. It is documented separately under "System Roles" below.

---

## Primary Personas

### Persona 1 — The Student
**Name:** Ahmed Al-Rashidi (fictional demo character)
**Role:** Undergraduate student, King Saud University

**Goals:**
- Find an available parking space quickly before class
- Reserve a space in advance to avoid circling
- Receive instant notification if a space becomes available in a preferred zone
- Know exactly how full each zone is before driving to campus

**Pain Points:**
- Wastes 10–20 minutes searching for parking on busy days
- No visibility into which zones are full before arriving
- No way to reserve a space — first-come, first-served only
- Receives parking violation notices with no prior warning

**Behaviours:**
- Checks parking before leaving home via smartphone browser
- Prefers visual map over text-based availability lists
- Wants push notifications rather than email

**Success Metrics:**
- Average parking search time reduced from ~15 min to < 5 min
- Reservation success rate > 80% during peak hours
- Notification read rate > 60%

---

### Persona 2 — The Security Staff Member
**Name:** Khalid Al-Zahrani (fictional demo character)
**Role:** Campus security officer, King Saud University

**Goals:**
- Quickly verify whether a vehicle is registered on campus
- Log parking violations accurately with evidence (photo + notes)
- Track the status of open violations from issue to resolution
- Monitor zone occupancy in real time from the security dashboard

**Pain Points:**
- Manual paper-based violation logging is slow and error-prone
- No centralised record of repeat offenders
- Cannot verify vehicle registration status on the spot
- No real-time visibility into zone occupancy levels

**Behaviours:**
- Works in field with a tablet or smartphone
- Logs violations on-the-spot; adds photos as evidence
- Reviews violation queue at start and end of shift
- Escalates unresolved violations to supervisor

**Success Metrics:**
- Violation logging time reduced from ~8 min (paper) to < 2 min
- Violation resolution rate > 70% within 48 hours
- Zero unresolved violations older than 7 days

---

### Persona 3 — The Visitor
**Name:** Nora Al-Hamdan (fictional demo character)
**Role:** Campus visitor (parent, conference attendee, prospective student)

**Goals:**
- Find available visitor parking quickly without needing an account
- Know which zone has visitor parking before entering campus
- Register their vehicle for temporary access

**Pain Points:**
- Unfamiliar with campus layout
- No signage or digital guidance to visitor zones
- Cannot check availability before arriving

**Behaviours:**
- One-time or infrequent visit
- Accesses the system via a web browser — no app installed
- Does not want to create an account for a single visit

**Success Metrics:**
- Visitor finds parking in < 5 minutes from campus entrance
- Visitor zone utilisation increases (zones no longer overflow into student zones)

---

## System Role (Not a Product Persona)

### System Admin (`ADMIN` technical role)
**Who holds this role:** IT staff, parking administration team

**Purpose:** Operational configuration of the system — managing zones, user accounts, reviewing analytics, exporting data. Not a primary product stakeholder or end-user persona.

**Key tasks:**
- Add/edit/remove parking zones and capacity
- Manage user accounts and assign roles
- Review analytics dashboards and export reports
- Configure system thresholds (violation timers, simulator settings)

> This role is distinct from the three product personas above. It does not represent a student, security officer, or visitor.

---

## Persona Summary Table

| Persona | Auth Required | Primary Feature | Mobile Priority |
|---|---|---|---|
| Student | Yes (account) | Parking map + reservation | High (V1) |
| Security Staff | Yes (account) | Violations dashboard | Medium (V1) |
| Visitor | No (public map) | Zone availability | Low (V2) |
| Admin *(system role)* | Yes (account) | Zone/user management | Low |
