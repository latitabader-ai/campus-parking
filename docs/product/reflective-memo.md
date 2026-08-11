# Reflective Memo
## KSU Intelligent Campus Parking Management System

**Subject:** Reflection on AI-assisted product development — process, decisions, and lessons learned
**Context:** IBM product development challenge

---

## 1. The Challenge

The task was to design and build an Intelligent Campus Parking Management System for a campus with roughly 4,000 parking spaces and multiple user types. The system needed to be real-time, API-first, and grounded in a real campus location.

Two parallel tracks ran throughout: **product design** — personas, requirements, prioritisation, roadmap — and **technical implementation** of a full-stack prototype.

---

## 2. How AI Assistance Was Used

IBM Bob, a Claude-based coding assistant, contributed to:

| Task | AI contribution |
|---|---|
| Technology stack proposal | Node.js + Express + Prisma + PostgreSQL + React + Leaflet |
| Architecture design | Folder structure, database schema, module boundaries |
| Code implementation | Backend modules, middlewares, seed script; React pages and components |
| Implementation planning | Structured multi-task delivery plan |
| Product documentation | Initial drafts of PRD, personas, MoSCoW, competitive analysis, roadmap |
| Debugging | TypeScript compilation errors, PostgreSQL connection issues, Vite and Leaflet configuration |

What it could not do:

- Verify that a generated coordinate corresponds to a real parking lot
- Decide scope boundaries between MVP, V1, and V2
- Distinguish a product persona from a database role
- Know the university's visual identity
- Judge whether generated data looked plausible to someone who has seen a real car park
- Recognise when its own output answered a different question than the one asked

---

## 3. Decisions Made Through Human Judgment

**Geographic authenticity boundary.** Use real KSU geography from OpenStreetMap, but label every zone boundary and capacity figure as a simulated approximation. Fabricating "official KSU parking data" would be misleading in an academic submission; real geography makes the prototype credible without making false claims.

**Persona definition.** Three product personas — Student, Security Staff, Visitor — with Admin explicitly classified as a technical role. The AI initially treated database roles and product personas as the same thing.

**Reservation elevated to Must Have.** The generated plan included reservation but did not prioritise it. Human review identified it as the feature that addresses the root problem. Without it, the product tells a student a zone is 88% full — accurate, and actionable only as discouragement.

**Mobile scoping.** MVP is responsive web; native mobile is V2. Generated text repeatedly implied a mobile app was in MVP scope.

**Disclaimer standards.** Explicit simulated-data notices in every document and on every data view in the interface.

---

## 4. Incidents Requiring Human Intervention

Beyond high-level product decisions, day-to-day execution surfaced concrete failures where AI output was plausible but wrong. These are recorded because they illustrate the *nature* of the oversight required, not merely its necessity.

### Intent misinterpretation

Asked to implement eight defined interface fixes, the assistant twice produced **project documentation instead** — thorough, well-structured documentation that solved none of the stated problems. The generated files even contained a table listing the eight issues as "not yet implemented," which was accurate and entirely beside the point.

The fix was not a better-worded request but an explicit mode declaration: *"MODE: agent. Write code, do not write documentation."* The lesson is that an assistant optimises for a plausible interpretation of a request, and documentation is a plausible response to "here are eight problems."

### Resource constraints forcing re-prioritisation

The assistant operated under a fixed usage quota. Roughly 90% was consumed before the fixes were complete, forcing a mid-project triage: five visually verifiable interface issues were batched into a single pass, while three data-layer issues — zone redistribution, capacity variation, and true lot-boundary polygons — were deferred. Two were later implemented manually; the third was accepted as a V1 item.

This is MoSCoW prioritisation applied to the development process itself, not just to the product backlog. It was not planned for, and it was the most instructive constraint of the project.

### Statistically implausible generated data

The seed script assigned **exactly 500 spaces to all eight zones**. Technically valid, internally consistent, and immediately implausible to anyone who has seen a real car park — lots differ in size. Corrected to a 240–620 range varying by lot.

No test could have caught this. Uniformity is not an error condition.

### Status logic that made a feature unreachable

The occupancy generator applied a single 58% rate to every zone. The map legend advertised three states — Available, Limited, Full — but **the "Full" state could never occur**. Every zone rendered green, in every session, indefinitely.

There was no failed build, no exception, no warning. The defect was found by looking at the map and asking why one of three legend colours had never appeared. The fix introduced per-zone occupancy rates ranging 0.40 to 0.91.

### Geographic placement without ground truth

Generated zone rectangles sat on top of **building footprints rather than parking lots**, and all eight clustered on the main campus — omitting the female campus and faculty housing entirely. On a campus where a substantial share of students attend the female campus, this was a coverage failure, not a cosmetic one.

Correction required reading coordinates directly from OpenStreetMap and applying them manually. This took four iterations, because visual estimation from a screenshot is itself unreliable — a limitation that applies to human and machine alike. The reliable method was reading the coordinate from the map source, not estimating from an image of it.

### Institutional context

The interface was generated in dark green. King Saud University's visual identity is light blue and white. Brand identity is external knowledge the model does not hold and cannot infer.

### Confident numbers without provenance

Across four generated documents, the assistant produced specific quantitative claims — average search times, paper-based processing baselines, response latencies, uptime targets — presented with the same confidence as verifiable facts. **None had a source.**

The pattern is consistent: generated prose fills a "metrics" slot with plausible figures because the document structure calls for numbers, not because the numbers were measured. Every such claim required either sourcing or restating explicitly as an unvalidated target. This was the most pervasive issue in the documentation, and the easiest to miss, because a confident number reads as a researched one.

---

## 5. Collaboration Observations

### Where AI assistance was effective

- **Scaffolding speed.** A full-stack skeleton — backend modules, database schema, frontend pages — in hours rather than days.
- **Internal consistency.** Response envelope, error handling, and naming conventions applied uniformly across every module without being restated.
- **Self-contained debugging.** Where a problem had a clear error message and lived inside one file, diagnosis was fast and usually correct.

### Where it was unreliable

- **Problems requiring external verification.** Geographic accuracy, brand identity, and whether generated data resembles reality are all judgments against a world the model cannot observe.
- **Silent logic errors.** Defects that produce valid output — the never-red legend, the uniform capacities — pass every automated check.
- **Scope discipline.** The tendency is toward completeness rather than minimalism; "not yet" is a human sentence.
- **Distinguishing a request from a plausible neighbour of that request.** See §4.

### What this means for velocity claims

Implementation velocity was substantially higher than solo development would have allowed — the scaffold genuinely took hours. But that figure excludes the review and correction cycles documented in §4, which consumed a meaningful share of the time saved. A single percentage for "productivity gain" would misrepresent the shape of the work: acceleration in generation, offset by a new and unfamiliar review burden.

---

## 6. Lessons Learned

1. **Prompt precision matters more than prompt length.** "Build a parking app" produces generic output. "Use real KSU geography but label zone data as simulated" produces appropriate output.

2. **State the mode, not just the task.** The clearest failure in this project came from an assistant choosing documentation when code was wanted. Naming the output type explicitly cost one line and would have saved two cycles.

3. **Visual inspection catches what tests do not.** Three of the most significant defects produced no errors, no failed builds, and no exceptions. They were found by looking at the screen and asking whether the output was plausible.

4. **Treat every generated number as unsourced until proven otherwise.** This is the single highest-yield review habit for AI-assisted documentation.

5. **Scope discipline must be enforced by humans.** The assistant will implement everything that seems related to the brief.

6. **Budget the assistant, not just the schedule.** A usage quota is a project constraint like any other, and it should be planned against from the start rather than discovered at 90% consumption.

7. **Simulated data has legitimate value in prototyping.** A working prototype with simulated data is more useful for stakeholder validation than a real-data system that requires hardware investment before anything can be shown.

---

## 7. What Would Be Different in a Real Deployment

| MVP simulation | Real deployment requirement |
|---|---|
| Simulated occupancy via scheduled jobs | Real IoT parking sensors |
| Approximate rectangular zone boundaries | Surveyed lot boundaries from KSU facilities management |
| Fictional vehicle plates | Integration with KSU vehicle registration |
| Demo user accounts | SSO with the university identity provider |
| Local file storage for evidence | Cloud storage with access control |
| English-only interface | Full Arabic and RTL localisation |
| Free-tier PaaS | University infrastructure or managed cloud |
| No measured baseline | Pre-deployment measurement of search and processing times |

---

## 8. Conclusion

AI assistance produced a working prototype at a pace that would not have been possible otherwise. It also produced eight zones of identical size, a legend colour that could never appear, parking zones on top of buildings, an entire campus omitted, the wrong brand colour, documentation when code was requested, and a series of confident numbers with no source behind them.

Both statements are true, and the second is the more useful one. The generated output was never obviously wrong — it was plausible, consistent, and well-formed in every case. That is precisely what made human review necessary: the failure mode of a capable assistant is not obvious error but confident plausibility.

The most important contributions to this project were not technical. They were the decisions about what to build, who it is for, what is real, what is labelled as simulated — and, repeatedly, the judgment that something which looked correct was not.