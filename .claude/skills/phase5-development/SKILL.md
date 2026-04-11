---
name: phase5-development
description: >
  Phase 5: Development Sprints. Coding, APIs, frontend, backend, testing, security.
triggers:
  - "phase 5"
  - "development"
  - "sprint"
  - "implement"
  - "code"
  - "build"
  - "feature"
  - "refactor"
---

# PHASE 5 — DEVELOPMENT SPRINTS

## SPRINT DISCIPLINE
Work in MICRO-SPRINTS (1 user story per cycle) to manage context:
1. State user story + acceptance criteria → Plan → Implement → Test → Verify
2. Update contextlog.md (DONE/ONGOING/LEFT/BLOCKED) + buglog.md
3. `/compact` after each story. `/clear` after each full sprint or feature area switch.
4. Logs ARE your memory across sessions — always persist before compact/clear.

## PRE-CODE (every story)
Read: user story + acceptance criteria (PRD) → architecture (Tech_Blueprint) → design specs → CLIENT.txt.
Identify edge cases (PRD §8). Plan files, data flow, errors, tests BEFORE coding.
Ambiguous? → gapslog.md → PM. Never guess. Never hallucinate requirements.

## THINK → CODE → VERIFY
1. **Understand** — what's required, what could break
2. **Research** — search online for current best practice, check lib versions
3. **Plan** — files, functions, data flow, error handling, test cases
4. **Implement** — follow plan, write tests alongside code
5. **Verify** — run tests + lint + types + security scan, check edge cases vs acceptance criteria
6. **Document** — update logs, comment WHY never WHAT

**Debugging:** Read full error → ask WHY not how to silence → search official docs → trace data flow → fix root cause → log in buglog.md → add regression test. Never hack, wrap-and-ignore, or change tests to match bugs.

## CODE STANDARDS

**SOLID:** Single Responsibility (one job per unit) · Open/Closed (extend, don't modify) · Liskov (subclasses honor contracts) · Interface Segregation (small interfaces) · Dependency Inversion (depend on abstractions, inject deps).

**Clean Code:** DRY (appears twice → extract) · KISS (simplest correct solution) · YAGNI (don't build what's not in this sprint) · Separation of Concerns (UI ≠ logic ≠ data) · Composition over inheritance.

**Functions:** Max 20 lines, max 3 params (object if more), one abstraction level, early return, pure where possible.

**Naming:** Descriptive verbs for functions (`getUserById`), `is/has/can` for booleans, `UPPER_SNAKE` constants, `PascalCase` classes, `camelCase`/`snake_case` vars. No abbreviations.

**Files:** One class/component per file, max 300 lines, group by feature not type, zero circular deps.

## SECURITY (OWASP 2025)
Every feature must:
- Validate all input server-side (type, length, format, range) — never trust frontend
- Escape output for context (HTML, SQL, JSON). Parameterized queries only — never concatenate
- Check auth (logged in?) + authz (THIS user owns THIS resource?) on every endpoint
- Rate limit endpoints. CORS restricted (no wildcards). CSRF protection active
- Generic errors to users, details to logs. No stack traces, paths, or versions exposed
- HTTPS only. Passwords: bcrypt/argon2. Secrets: env vars or secret manager, never in code
- Log security events. Fail CLOSED on errors. Timeout all external calls
- Lock dependency versions, audit regularly, review before adding new packages

## ERROR HANDLING
- Layered: Route (→HTTP status) → Service (→typed exceptions) → Data (→catch & wrap, never leak)
- Consistent response: `{ error: { code, message, status, requestId } }`
- Handle: null/empty input, wrong types, duplicates, concurrent edits, expired sessions, wrong file types, unauthorized access, network failures mid-action, empty states, max-data states

## TESTING
Pyramid: many unit (≥80% coverage) → moderate integration → few e2e (critical paths).
Arrange-Act-Assert. One behavior per test. Independent. Descriptive names.
Test: happy path + edge cases + errors + security. CI blocks merge on failure.

## TYPE SAFETY
`strict: true` (TS) / `mypy --strict` (Python). Zero `any`. Zero `@ts-ignore` without buglog entry.
Runtime schema validation on all API responses (zod/valibot/joi). DTOs at boundaries — never expose raw DB models. Enums for finite states. Env vars validated at startup.

## API & DATABASE
**API:** Plural nouns (`/users`), standard status codes, pagination on all lists (default 20, max 100), runtime schema validation, OpenAPI spec, breaking changes = new version.
**DB:** Every table: id + created_at + updated_at. Migrations for all changes (reversible, never modify deployed). Indexes on FKs + WHERE cols. EXPLAIN new queries. No SELECT *. Transactions for multi-step ops. Constraints at DB level.

## GIT
Branches: `feature/E001-US001-desc`, `fix/BUG-042-desc`, `hotfix/SEC-003-desc`.
Commits: `<type>(<scope>): <desc>` — feat/fix/security/refactor/test/docs/chore/perf.
PR required, CI must pass, code review before merge, delete branch after.

**Review:** Acceptance criteria met? Edge cases? Auth/authz? No secrets? SOLID/DRY? Tests? No N+1? Logs updated?

## ROLES (all: search online first, verify versions, log decisions, no hacks)
- **Tech Lead:** Architecture, PR approval, unblock devs, enforce standards
- **Frontend:** UI per specs, a11y (WCAG 2.1 AA), perf (Lighthouse ≥90), strict TS
- **Backend:** APIs per contracts, service layer, DB/migrations, auth, structured logging
- **Security:** OWASP review per feature, dep audit, pen test critical paths
- **DevOps:** CI/CD <10min, staging=prod mirror, secrets managed, infra-as-code

## SPRINT CLOSE
□ Stories merged □ Tests pass □ Lint+types clean □ Security scan clean
□ Code reviewed □ On staging □ PO verified criteria □ PM verified vs CLIENT.txt
□ Logs updated □ No debug/commented code left → `/compact` → `/clear`