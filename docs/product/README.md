# Product Documentation Index
## KSU Campus Parking Management System

> All documents in this folder are product deliverables. They describe the **intended product** — its users, requirements, and roadmap.
> Technical implementation details are in [`campus-parking-plan.md`](../../campus-parking-plan.md) and [`AGENTS.md`](../AGENTS.md).

---

## Documents

| Document | Description |
|---|---|
| [personas.md](personas.md) | The three product personas (Student, Security Staff, Visitor) and the Admin system role |
| [PRD.md](PRD.md) | Full Product Requirements Document — user stories, functional & non-functional requirements |
| [MoSCoW.md](MoSCoW.md) | Feature prioritisation: Must Have / Should Have / Could Have / Won't Have |
| [competitive-analysis.md](competitive-analysis.md) | Analysis of T2 Systems, ParkWhiz, Google Maps, Parkmobile vs KSU MVP |
| [roadmap.md](roadmap.md) | MVP → V1 → V2 feature roadmap |
| [executive-summary.md](executive-summary.md) | High-level overview for stakeholders and academic submission |
| [reflective-memo.md](reflective-memo.md) | Honest reflection on AI-human collaboration, decisions made by humans vs AI |

---

## Key Distinctions (important for academic submission)

| Real | Simulated / Approximate |
|---|---|
| KSU campus geography (OpenStreetMap) | 8 zone boundaries and their exact polygons |
| KSU campus location (Riyadh, KSA) | 4,000-space capacity |
| KSU as target institution | All occupancy data |
| General campus area names (Central, North, etc.) | Official KSU parking zone designations |
| Saudi vehicle plate format (demo style) | All vehicle plates and user data |

---

## MVP vs V1 vs V2

- **MVP (current):** Simulated data, responsive web, English only, no real hardware
- **V1:** Optional real sensors, Arabic/RTL, responsive mobile web
- **V2:** Native iOS/Android, real ANPR/OCR, KSU system integration, payments

---

## AI Assistance Disclosure

This prototype was developed with AI assistance from **IBM Bob** (Claude-based coding assistant).
All product decisions — personas, scope, prioritisation, ethical boundaries — were made by humans.
See [`reflective-memo.md`](reflective-memo.md) for full details.
