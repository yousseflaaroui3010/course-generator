# PROJECT ORCHESTRATOR
<!-- Version: v1.0.0 | KEEP UNDER 200 LINES | Every line here costs tokens on EVERY message -->

## Project Identity
- **Project:** [PROJECT NAME]
- **Client Brief:** `docs/CLIENT.txt` (NEVER modify except PM)
- **Active Phase:** PHASE 1
- **PM:** [Your name] — final authority on scope, client communication, and tie-breaking

## Phase Routing — Load the Right Skill

| Command | Phase | When |
|---------|-------|------|
| `/phase1-discovery` | 1: Discovery & PRD | Research, requirements, PRD |
| `/phase2-architecture` | 2: Architecture | Tech stack, security, data model |
| `/phase3-design` | 3: UI/UX Design | Wireframes, mockups, design system |
| `/phase4-sprint-setup` | 4: Scrum Init | Epics → stories → sprint plan |
| `/phase5-development` | 5: Development | Coding sprints |
| `/phase6-qa` | 6: QA & Testing | Test suites, security audit, UAT |
| `/phase7-deployment` | 7: Release | Deploy, rollback, runbook |
| `/phase8-monitoring` | 8: Monitoring | Uptime, iteration, feedback |

**Utility skills (any phase):**
- `/verify-client-intent` — Check deliverable vs CLIENT.txt
- `/search-first` — Online research with sources
- `/log-update` — Update contextlog / gapslog / buglog

## Source of Truth
- `docs/CLIENT.txt` = verbatim client words. PM-only edits.
- Every requirement traces to CLIENT.txt or a PM-approved recommendation.
- Ambiguity → flag in `docs/gapslog.md` → route to PM. Never guess.

## Absolute Rules

**No Hallucination:** Don't know → say so. Unsure → state confidence %. Requirements from CLIENT.txt only. Recommendations labeled as such.

**Search First:** Before any claim about tools, libs, frameworks → search online. Use latest stable versions. Include source URLs and confidence level.

**No Hacks:** Fix root causes. Production-grade only. Need more time → flag to PM.

**Handoffs:** Verify output vs CLIENT.txt before passing. Receiver verifies before accepting. Rejections are specific (line refs). PM breaks ties.

## Code Standards (Phase 5+)
- DRY. Strict types. Linting enforced. Error handling on every external call.
- Plan for failure: invalid input, unauthorized access, edge cases.
- Unit tests per function. E2E per flow. Security scan before commit.
- Every PR: lint ✓ types ✓ tests ✓ security ✓

## Logs
- `docs/contextlog.md` — ONGOING / DONE / LEFT / BLOCKED
- `docs/gapslog.md` — Missing/ambiguous requirements
- `docs/buglog.md` — Bugs + root-cause fixes (Phase 5+)
- BLOCKED → log immediately → continue non-blocked work → PM resolves

## Documentation (Bus Factor = ∞)
- Every deliverable: versioned, authored, dated, self-contained.
- Stored in `docs/` as .md files.

## Session Rules
- One task per session. `/compact` when heavy. `/clear` between phases.
- `/memory` audit at session start. `/sandbox` for untested code.
