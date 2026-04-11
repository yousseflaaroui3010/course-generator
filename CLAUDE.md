# PROJECT ORCHESTRATOR

- **Project:** Lumina
- **Client Brief:** See `docs/CLIENT.txt` (NEVER modify except PM)
- **Active Phase:** PHASE 1
- **PM:** [Your name] — final authority on scope and client communication

## Active Phase Routing

**BEFORE any work, check the Active Phase above and load the correct skill:**

| Phase | Skill to Load | Trigger |
|-------|--------------|---------|
| 1 | `/phase1-discovery` | Discovery, research, PRD |
| 2 | `/phase2-architecture` | Tech stack, architecture, security |
| 3 | `/phase3-design` | UI/UX design, prototyping |
| 4 | `/phase4-sprint-setup` | Scrum init, sprint planning |
| 5 | `/phase5-development` | Coding sprints |
| 6 | `/phase6-qa` | Testing, QA |
| 7 | `/phase7-deployment` | Release, deployment |
| 8 | `/phase8-monitoring` | Monitoring, maintenance |

**Cross-cutting skills (use anytime):**
- `/verify-client-intent` — Validate any deliverable against CLIENT.txt
- `/search-first` — Research protocol (online sources, version checking)
- `/log-update` — Update contextlog.md, gapslog.md, or buglog.md

## Core Rules (Always Active)

### Source of Truth
- `docs/CLIENT.txt` = client's verbatim words. Immutable except by PM.
- Every requirement must trace back to CLIENT.txt or a PM-approved recommendation.
- If CLIENT.txt is ambiguous → flag in gapslog.md → route to PM. NEVER guess.

### No-Hallucination Policy
- If you don't know → say so and log the gap.
- If you're unsure → state confidence % and flag for verification.
- Requirements come from CLIENT.txt. Recommendations come from research.
- Label which is which. Always.

### Search-First Policy
- Before claiming ANY tool, library, framework, or technique is "best" → search online.
- Always use latest stable versions. Check release dates.
- Include source URLs. State confidence and probability of being wrong.

### No Hacks/Shortcuts
- Fix root causes, not symptoms.
- Every solution must be production-grade.
- If proper fix needs more time → flag to PM. PM decides.

### Clarify Before Assuming
- When anything is ambiguous, unclear, or potentially wrong → stop and ask.
- Write your assumption explicitly and get it confirmed.
- Challenge false premises: surface the real problem, don't fulfill misconceptions.

### Code Standards (Phase 5+)
- DRY code — no duplication
- Type checking enabled (strict mode)
- Linting enforced (config in project root)
- Error/exception handling on every external call
- Plan for failure: invalid inputs, edge cases, unauthorized access
- Unit tests for every function, e2e tests for every flow
- Every PR must pass: lint + type check + unit tests + security scan

### Logging Protocol AFTER EVERY SPRINT
- `docs/contextlog.md` — ONGOING / DONE / LEFT / BLOCKED status tracking
- `docs/gapslog.md` — Missing/ambiguous requirements (Phase 1–4)
- `docs/buglog.md` — Bugs and root-cause fixes (Phase 5+)
- Blocking items → log immediately → continue non-blocked work → PM resolves

### Handoff Protocol
- Verify your output against CLIENT.txt before passing downstream.
- Receiving role verifies input before accepting.
- Rejections are specific (line refs), not wholesale. Loop back to fix.
- PM is the tiebreaker on all disputes.

### Documentation Standard (Bus Factor = ∞)
- Every deliverable is versioned, authored, dated.
- Self-contained: readable without verbal explanation.
- Stored in `docs/` as .md files.

## Opus Advisor Protocol

When running on **Sonnet** (default model), use the `Agent` tool with `model: "opus"` to consult Opus as a senior advisor for decisions that benefit from deeper reasoning. Opus is slower and more expensive — use it deliberately, not routinely.

**When to call Opus:**
- Sprint planning decisions (story splitting, estimation, dependency ordering)
- Architecture trade-offs with non-obvious consequences
- Risk assessment before committing to an irreversible approach
- Any time you're unsure and the cost of being wrong is high (data migration, auth flows, schema design)
- Security model decisions

**When NOT to call Opus:**
- Routine coding tasks (file moves, config changes, boilerplate)
- Reading files or searching the codebase
- Tasks already well-defined in Sprint_Plan.md or Tech_Blueprint.md
- Anything where Sonnet can execute with full confidence

**How to call it:**
```
Agent({
  description: "Opus advisory: [topic]",
  model: "opus",
  prompt: "Context: [what we're doing]. Question: [specific decision]. Return: concise recommendation + reasoning."
})
```

Keep Opus prompts focused — one decision per call, full context included, specific output format requested.

## Session Discipline
- One focused task per session.
- `/compact` when context feels heavy or before switching sub-tasks.
- `/clear` when switching phases or starting unrelated work.
- `/memory` audit at session start — prune stale notes.
- `/sandbox` for all untested code.
