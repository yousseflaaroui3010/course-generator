---
name: phase4-sprint-setup
description: >
  Phase 4: Agile Project Setup. Turn PRD into executable sprint plan.
  Epics, stories, tasks, estimates, sprint allocation, DoD, ceremonies.
triggers:
  - "phase 4"
  - "sprint setup"
  - "scrum"
  - "backlog"
  - "sprint plan"
  - "estimation"
  - "jira"
  - "board setup"
---

# PHASE 4 — AGILE PROJECT SETUP (SCRUM INIT)

## PURPOSE
PRD is ready. Design is done. Architecture is locked. This phase converts all of that into an executable sprint board the dev team can start coding from on day one of Phase 5. No ambiguity, no guessing.

## INPUTS & VERIFICATION
Read ALL before starting:
- PRD.md — epics, stories, tasks, MoSCoW, acceptance criteria, edge cases
- Tech_Blueprint.md — architecture, stack, API contracts, data model
- Design_Package — mockups, flows, component specs, design system
- CLIENT.txt — verify nothing drifted from client intent

If any input is incomplete or contradictory → gapslog.md → PM. Don't proceed on assumptions.

## SEQUENCE
```
PRD.md + Tech_Blueprint.md + Design_Package
  → Scrum Master + Tech Lead: define DoD, ceremonies, sprint cadence
  → Tech Lead + Devs: decompose stories → tasks, estimate, identify dependencies
  → PO: prioritize backlog, allocate stories to sprints
  → PM: final review — sprint plan matches CLIENT.txt scope + timeline
```
`/compact` after backlog is built. `/compact` again after sprint allocation. `/clear` when phase complete.

## DELIVERABLE: Sprint_Plan.md

### 1. Sprint Configuration
- Sprint cadence: 1 or 2 weeks (justify choice based on project size)
- Ceremonies: planning, daily standup (15min max), review, retrospective — with schedule
- Team capacity per sprint (account for meetings, reviews, overhead — typically 70-80% of hours)
- Velocity assumption for Sprint 1 (will calibrate after)

### 2. Definition of Done (DoD)
Every story is DONE only when ALL of these are true:
```
□ Code implements all acceptance criteria (Given/When/Then from PRD)
□ Edge cases from PRD §8 handled
□ Unit tests written + passing (≥80% coverage on new code)
□ Integration tests for new endpoints/services
□ Lint + type check clean (zero errors)
□ Security checklist passed (OWASP — see Phase 5 skill)
□ Code reviewed + approved by Tech Lead
□ Deployed to staging + smoke tested
□ No hardcoded values, debug logs, or commented code
□ contextlog.md + buglog.md updated
□ PO accepted against acceptance criteria
```

### 3. Backlog — Epics → Stories → Tasks
Take PRD §4 (Feature Inventory) and produce:

```
EPIC: E-001 [Name] — Priority: MUST
│
├── US-001: [User story text]
│   Priority: MUST | Points: [estimate] | Sprint: [N]
│   Acceptance Criteria: [from PRD — copy exactly, don't rephrase]
│   Dependencies: [other stories, API contracts, design components]
│   ├── TASK: [Backend] — API endpoint + service + DB migration
│   ├── TASK: [Frontend] — Component + state + integration
│   ├── TASK: [Testing] — Unit + integration + edge case tests
│   └── TASK: [Security] — Input validation, auth/authz, review
│
├── US-002: ...
```

**Rules:**
- Stories come directly from PRD. Don't invent new ones. Don't merge or split without PO approval.
- Acceptance criteria copied verbatim from PRD — they're the contract.
- Tasks decomposed enough that each is ≤1 day of work. If bigger → split.
- Every story has at minimum: backend task, frontend task (if UI), testing task.
- Security review task on every story that touches auth, user data, or external input.

### 4. Estimation
- Use story points (Fibonacci: 1, 2, 3, 5, 8, 13) or time-based (hours) — pick one, be consistent.
- 13+ points = too big. Split the story.
- Estimates include: implementation + tests + code review + security review.
- Unknowns get a spike task first (time-boxed research), then re-estimate.
- Tech Lead + dev who'll implement both agree on estimate. Disagreement → discuss, don't average.

### 5. Sprint Allocation
Map stories to sprints respecting:
- **MoSCoW priority:** MUSTs first, then SHOULDs, then COULDs. WON'Ts stay in backlog.
- **Dependencies:** if US-003 depends on US-001's API, US-001 goes in an earlier sprint.
- **Capacity:** don't exceed team capacity. Leave 15-20% buffer for bugs and unknowns.
- **Risk:** risky/uncertain stories early (fail fast, not last-sprint surprises).
- **Vertical slicing:** each sprint delivers a usable increment, not "all backend then all frontend."

```
Sprint 1: [Goal — e.g., "Auth + base layout working end-to-end"]
  - US-001 (8pts) — User login
  - US-002 (5pts) — User registration
  - US-010 (3pts) — Base layout + navigation shell
  Capacity: 16pts | Buffer: 4pts for bugs/unknowns

Sprint 2: [Goal — e.g., "Core dashboard functional"]
  - US-003 (8pts) — Dashboard data display
  - US-004 (5pts) — User profile management
  Depends on: Sprint 1 (auth must work)
  ...
```

### 6. Dependency Map
```
US-001 (login) ← US-003 (dashboard — needs auth)
US-002 (registration) ← US-005 (onboarding flow)
Tech_Blueprint API contract v1 ← all backend tasks
Design system components ← all frontend tasks
DB migrations ← all backend tasks (run migrations first each sprint)
```
Flag circular dependencies as BLOCKED → PM resolves.

### 7. Risk Register
| Risk | Impact | Likelihood | Mitigation | Owner |
|------|--------|-----------|------------|-------|
| Unclear requirement discovered mid-sprint | Delays story | Medium | Pre-flight check in Phase 5 + buffer | PM |
| Third-party API unavailable | Blocks integration | Low | Mock API + adapter pattern | Tech Lead |
| Underestimated complexity | Sprint overrun | Medium | 15-20% buffer + spike tasks | Tech Lead |

## ROLES

**Scrum Master:** Define ceremonies + cadence, protect team capacity, remove blockers, enforce process. DON'T assign tasks (team self-selects) or let ceremonies run over time.

**Tech Lead:** Decompose stories into tasks, validate estimates, identify dependencies + risks, confirm architecture alignment. DON'T over-engineer task breakdown — keep tasks actionable, not bureaucratic.

**PO:** Prioritize backlog (MoSCoW from PRD), accept sprint goals, clarify acceptance criteria on the spot. DON'T add scope mid-sprint without PM approval.

**PM:** Final sign-off — sprint plan covers CLIENT.txt scope, timeline realistic, risks acknowledged. DON'T let the plan diverge from what the client is expecting.

## PHASE 4 COMPLETE WHEN
□ Backlog complete: all PRD stories decomposed into tasks with estimates
□ Sprint allocation done: stories mapped to sprints with dependencies respected
□ DoD defined and agreed by entire team
□ Ceremonies scheduled □ Capacity calculated □ Risk register filled
□ Verified vs PRD.md + CLIENT.txt □ Dev team confirms: "We can start Sprint 1 tomorrow"
□ contextlog.md updated → `/compact` → `/clear`