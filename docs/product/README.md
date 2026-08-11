# Product Documentation Index
## KSU Campus Parking Management System

> All documents in this folder are product deliverables. They describe the
> **intended product** — its users, requirements, and roadmap.
> Technical implementation guidance is in [`AGENTS.md`](../../AGENTS.md).

---

## Documents

| Document | Description |
|---|---|
| [personas.md](personas.md) | The three product personas (Student, Security Staff, Visitor) and the Admin system role |
| [PRD.md](PRD.md) | Full Product Requirements Document — user stories, functional & non-functional requirements |
| [MoSCoW.md](MoSCoW.md) | Feature prioritisation: Must Have / Should Have / Could Have / Won't Have |
| [competitive-analysis.md](competitive-analysis.md) | Analysis of T2 Systems, ParkWhiz, Google Maps and Parkmobile, with a build-vs-buy recommendation |
| [roadmap.md](roadmap.md) | MVP → V1 → V2 feature roadmap |
| [executive-summary.md](executive-summary.md) | One-page summary for university senior management |
| [reflective-memo.md](reflective-memo.md) | Reflection on AI-human collaboration, including the specific cases where AI output required correction |

---

## What Is Real and What Is Simulated

| Real | Simulated or approximate |
|---|---|
| KSU campus geography and location (OpenStreetMap) | Zone **boundaries** — approximate rectangles, not surveyed |
| Zone **centres** — taken from actual parking-lot coordinates | The 4,000-space capacity figure |
| Saudi plate format rules (17 permitted letters) | All occupancy data |
| KSU visual identity (blue and white) | All vehicle plates, user accounts, and violations |
| — | Zone names — descriptive, not official KSU designations |

The system models **10 zones** spanning the main campus, the female campus,
faculty housing, and the sports complex.

---

## MVP vs V1 vs V2

- **MVP (current):** Simulated occupancy, responsive web, English only, no hardware, no measured baseline
- **V1:** Baseline measurement, surveyed boundaries, Arabic/RTL, sensor pilot, admin UI, PWA
- **V2:** Native iOS/Android, real ANPR, KSU system integration, campus-wide sensors

---

## AI Assistance Disclosure

This prototype was developed with assistance from **IBM Bob** (a Claude-based coding assistant).
All product decisions — personas, scope, prioritisation, and ethical boundaries — were made by humans.
See [`reflective-memo.md`](reflective-memo.md) for a detailed account, including seven documented cases where generated output was plausible but wrong.