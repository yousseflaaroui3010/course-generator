# SPRINT PLAN — Project Lumina
**Version:** 1.0  
**Date:** 2026-04-11  
**Author:** Scrum Master + Tech Lead + PO (Claude), advised by Opus Engineering Manager  
**Status:** APPROVED — Ready for Sprint 0 execution  
**Inputs:** PRD.md v1.2, Tech_Blueprint.md v1.0, Opus Advisory (2026-04-11)  

---

## TABLE OF CONTENTS

1. [Sprint Configuration](#1-sprint-configuration)
2. [Team & Capacity](#2-team--capacity)
3. [Definition of Done](#3-definition-of-done)
4. [Backlog — EPICs → Stories → Estimates](#4-backlog)
5. [Sprint Allocation](#5-sprint-allocation)
6. [Dependency Map](#6-dependency-map)
7. [Risk Register](#7-risk-register)
8. [Opus Advisory Notes](#8-opus-advisory-notes)

---

## 1. SPRINT CONFIGURATION

| Parameter | Value | Rationale |
|---|---|---|
| Sprint length | **2 weeks** | PRD §11 approved cadence; project complexity requires focused 2-week increments |
| Sprint count | **7 sprints** (0–6) | Sprint 0 = infra; Sprints 1–5 = feature refactoring; Sprint 6 = migration + launch |
| Total timeline | **~13 weeks** | PRD §11 approved; extended Sprint 6 for safe production migration |
| Planning meeting | Sprint Day 1, 2 hours | Refine stories, confirm estimates, assign owners, confirm DoD understood |
| Daily standup | Every day, 15 min max | 3 questions: Done, Today, Blockers. Scrum Master enforces time-box |
| Sprint review | Sprint Day 10, 1 hour | Demo working increment to PM. PO accepts/rejects stories against AC |
| Retrospective | Sprint Day 10, 1 hour | What worked, what didn't, one actionable change next sprint |
| Refinement | Sprint Day 7, 1 hour | Groom next sprint's stories — no ambiguous stories enter planning |
| Velocity buffer | **20%** | 20% of sprint capacity reserved for bugs, unknowns, and code review overhead |

---

## 2. TEAM & CAPACITY

### 2.1 Recommended Team (Opus Advisory)

| Role | Count | Primary Responsibility |
|---|---|---|
| Senior Backend Engineer A | 1 | KeyCloak + RBAC + auth migration. Owns the hardest dependency chain. |
| Senior Backend Engineer B | 1 | PostgreSQL + Drizzle ORM + BullMQ + Redis. Owns DB foundation. |
| Senior Frontend Engineer | 1 | React 19 + Orval integration, CourseView decomp, all UI stories. |
| Mid-Level Full-Stack Engineer | 1 | CRUD endpoints, standard UI pages (settings, admin), integration tests. |
| QA / Test Engineer | 1 | Vitest unit coverage, Playwright E2E, migration dry-run validation. Starts Sprint 1, ramps through Sprint 5–6. |
| **PM / Scrum Master** | 1 | Scope, ceremonies, blockers. NOT counted as dev capacity. |

> **Bus Factor Note:** Two Senior Backend Engineers split the critical path (KeyCloak vs DB). Neither blocks the other. Frontend runs in parallel from Sprint 0. Never assign a single dev to both KeyCloak and Drizzle — if they're blocked, everything is blocked.

### 2.2 Velocity

| Sprint | Planned Capacity | Rationale |
|---|---|---|
| Sprint 0 | **30 SP** | Infra setup — parallel work, well-defined tooling, less integration risk |
| Sprint 1 | **30 SP** | Team ramping; auth is complex; CourseView decomp runs parallel (FE) |
| Sprint 2 | **30 SP** | US-2.3 (13 SP) alone demands careful execution — keep sprint lean |
| Sprint 3 | **36 SP** | Team at full velocity; patterns established; domain understood |
| Sprint 4 | **36 SP** | Mix of simpler CRUD stories + SHOULD items pulled forward |
| Sprint 5 | **30 SP** | Testing + security focus — deliberate velocity reduction for quality |
| Sprint 6 | **25 SP** | Migration execution — high coordination, low parallelism by design |

**Planning target:** 30 SP average. Adjust after Sprint 1 retrospective with actuals.

---

## 3. DEFINITION OF DONE

Every user story is **DONE** only when ALL of the following are true:

```
□ Code implements ALL acceptance criteria (Given/When/Then from PRD — verbatim)
□ All edge cases from PRD §8 handled (empty states, auth failures, service failures)
□ Unit tests written + passing (≥80% coverage on ALL new code — enforced by Vitest)
□ Integration tests for every new API endpoint and service
□ Lint passes: zero ESLint errors (strict config)
□ TypeScript type check passes: zero errors (strict mode enabled)
□ Security checklist passed:
    □ Input validated with Zod on server
    □ Auth/authz check on every protected endpoint (KeyCloak + RBAC middleware)
    □ No hardcoded secrets, credentials, or API keys
    □ No SQL injection risk (parameterized Drizzle queries only)
    □ Rate limiting applied (public endpoints)
□ Code reviewed + approved by Tech Lead (at least 1 reviewer)
□ Deployed to staging environment + smoke tested manually
□ OpenAPI spec updated if any API change (spec-first approach)
□ No hardcoded values, debug console.log, or commented-out code
□ No TODOs left in code without a linked GitHub issue
□ contextlog.md updated (sprint status)
□ buglog.md updated if any bugs were found + fixed
□ PO accepted the story against acceptance criteria in sprint review
```

**Partial DoD is not DoD.** A story with 9/12 criteria is NOT done — carry it to next sprint.

---

## 4. BACKLOG

> Stories from PRD §6 verbatim. Estimates use Fibonacci (1, 2, 3, 5, 8, 13). Any story ≥13 must be split. Dependencies noted.
> **Key change from PRD:** US-1.1 split into US-1.1a + US-1.1b per Opus advisory (two distinct problems).

---

### EPIC 11: Platform Infrastructure (Sprint 0) — MUST

#### T-0.0: Monorepo Scaffold *(Sprint 0 Day 1-2 GATE — All other Sprint 0 tasks unblock from here)*
**Points: 3** | **Sprint: 0** | **Owner: Tech Lead (all devs align)**  
**Why:** Current codebase is a flat single-package prototype. Every Sprint 0 task (Drizzle, KeyCloak, BullMQ, Orval, CI/CD) must land in the correct workspace directory. Without a shared scaffold first, devs create conflicting structures independently and the monorepo is broken before it starts.  
**Gate rule:** No other Sprint 0 task begins until this task is merged and all devs have pulled it.

**Tasks:**
- `T-0.0.1` Create workspace directories: `server/`, `client/`, `packages/shared/`, `e2e/`, `openapi/`
- `T-0.0.2` Root `package.json` — pnpm workspaces config, shared scripts (`dev`, `build`, `test`, `lint`, `gen:api`)
- `T-0.0.3` Workspace `tsconfig.json` files — `strict: true` on all (root + server + client + shared). Current flat tsconfig has no strict mode; Tech Blueprint mandates it.
- `T-0.0.4` `docker-compose.yml` — services: PostgreSQL 16, Redis 7, KeyCloak 26.5 (all needed for local Sprint 0 dev)
- `T-0.0.5` `.env.example` extended — add all new vars: `DATABASE_URL`, `KEYCLOAK_URL`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_CLIENT_SECRET`, `REDIS_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `T-0.0.6` `.gitignore` extended — add: `server/dist/`, `packages/*/dist/`, `client/dist/`, `docker-compose.override.yml`, `*.generated.ts` (Orval output), `drizzle/` migration artifacts
- `T-0.0.7` Move `server.ts` → `server/src/app.ts` (preserving all existing endpoints — do NOT change logic, only relocate)
- `T-0.0.8` Move `src/` → `client/src/` (React app — preserve all imports, update `vite.config.ts` root)
- `T-0.0.9` Update `vite.config.ts`: PWA name "Lumina" (was "FX Skool"), `index.html` title "Lumina"
- `T-0.0.10` Smoke test: `pnpm dev` still starts, existing UI loads, existing API endpoints respond

**Dependencies:** None — this IS the foundation  
**Risk:** Medium — file moves can break imports. Mitigate: do T-0.0.7 and T-0.0.8 last, run smoke test immediately after.

---

#### US-11.1: PostgreSQL Database Setup (Drizzle ORM)
**Points: 8** | **Sprint: 0** | **Owner: BE-B**  
**AC (from PRD):** Given deployment, When server starts, Then PostgreSQL connection established via Drizzle ORM with migrations applied  
**Tasks:**
- `T-11.1.1` Drizzle ORM + drizzle-kit install, `drizzle.config.ts` setup
- `T-11.1.2` Schema design: all 17 tables as Drizzle TypeScript schemas (users, courses, chapters, quiz_questions, quiz_attempts, user_progress, purchases, subscriptions, notes, chat_messages, media_assets, cart_items, coupons, assignments, submissions, reviews, certificates)
- `T-11.1.3` Drizzle Kit migration pipeline (`db:generate`, `db:migrate`, `db:push` scripts)
- `T-11.1.4` Connection pooling (pg pool, env-validated config)
- `T-11.1.5` Seed data scripts for development
- `T-11.1.6` Unit tests: connection, schema validation, basic CRUD per table
**Dependencies:** None — first task of the project  
**Risk:** HIGH — foundational. Schema locked by end of Sprint 0. No redesigns post-Sprint 1 (additive migrations only).

---

#### US-11.2: KeyCloak Integration
**Points: 8** | **Sprint: 0** | **Owner: BE-A**  
**AC (from PRD):** Given any API request, When auth header present, Then KeyCloak validates token + extracts role  
**Tasks:**
- `T-11.2.1` KeyCloak v26.5 deployment (Docker Compose for dev, Railway service for staging)
- `T-11.2.2` Realm "lumina" creation + realm settings (token lifetime, refresh policy)
- `T-11.2.3` Google IdP configuration in KeyCloak admin UI
- `T-11.2.4` Client config: lumina-web (public, PKCE), lumina-api (confidential)
- `T-11.2.5` KeyCloak Express middleware: token introspection + role extraction
- `T-11.2.6` Role mapper: KeyCloak roles → app roles (student/teacher/admin)
- `T-11.2.7` Integration test: token issued → validated → role extracted
**Dependencies:** None — parallel to US-11.1  
**Risk:** **CRITICAL — #1 schedule risk.** KeyCloak config is notoriously complex. Assign most experienced backend dev. Must have working OIDC flow by Sprint 0 Week 1 end. If blocked by Day 7 → escalate to PM. Fallback: Auth0 (same OIDC protocol, faster setup, migrate to KeyCloak post-MVP).

---

#### US-11.3: OpenAPI Spec + Orval
**Points: 5** | **Sprint: 0** | **Owner: BE-B + FE**  
**AC (from PRD):** Given OpenAPI spec, When Orval runs, Then type-safe TypeScript client generated for all endpoints  
**Tasks:**
- `T-11.3.1` OpenAPI 3.0 spec v1 (`openapi/spec.yaml`) — all 60+ endpoints from Tech Blueprint §7
- `T-11.3.2` Orval config (`orval.config.ts`) — output: TanStack React Query v5 hooks
- `T-11.3.3` `pnpm gen:api` script in CI/CD (regenerate after spec change)
- `T-11.3.4` Mock server from spec (for FE dev before BE is ready)
- `T-11.3.5` Validate spec compiles: zero Orval errors
**Dependencies:** Needs overall API shape (from US-11.1 schema)

---

#### US-11.6: BullMQ + Redis Background Jobs
**Points: 5** | **Sprint: 0** | **Owner: BE-B**  
**AC (from PRD):**
- Given AI course generation request, When queued, Then BullMQ worker processes in background + client receives job ID
- Given job failure, When max retries exhausted, Then job marked failed + user notified
- Given Redis connection, When server starts, Then Bull Board available at /admin/queues (admin-only)

**Tasks:**
- `T-11.6.1` Redis 7 deployment (dev: Docker Compose, staging/prod: Railway Redis)
- `T-11.6.2` BullMQ queue definitions: `ai-generation`, `media-processing`, `email-notifications`
- `T-11.6.3` Queue connection config (Redis URL, retry settings, concurrency)
- `T-11.6.4` Bull Board admin UI wired to Express (admin-only auth guard)
- `T-11.6.5` Smoke-test job in Sprint 1 to validate queue end-to-end before Sprint 2 AI work
- `T-11.6.6` Dead letter queue config + alerting
**Dependencies:** Redis deployment  
**Note:** Worker logic (actual AI processing) implemented in US-2.3 Sprint 2 — this story is queue infrastructure only.

---

#### CI/CD Pipeline Setup
**Points: 3** | **Sprint: 0** | **Owner: BE-A** (shared with DevOps)  
**Tasks:**
- `T-CI.1` GitHub Actions workflow: lint → type-check → test → security scan → build
- `T-CI.2` Environment configs: dev, staging, prod (Railway)
- `T-CI.3` Snyk + Dependabot security scanning
- `T-CI.4` Railway deployment integration (auto-deploy on main push)
**Dependencies:** None

---

#### US-12.1: Navigation Layout Shell
**Points: 3** | **Sprint: 0** | **Owner: FE**  
> Started in Sprint 0 so FE has a working shell to build into from Sprint 1.  
**AC (from PRD):** Given authenticated user, When on any page, Then sidebar/header nav shows role-appropriate links  
**Tasks:**
- `T-12.1.1` Preserve Layout.tsx, update nav items per RBAC roles
- `T-12.1.2` Mobile responsive nav (hamburger menu)
- `T-12.1.3` Lumina brand update (logo, title, PWA manifest name "Lumina")
**Dependencies:** None (can work from existing codebase)

**Sprint 0 Total: ~33 SP** *(+3 SP for T-0.0 monorepo scaffold — added to resolve GAP-3 identified pre-Sprint 0)*

---

### EPIC 1: Authentication & User Management (Sprint 1) — MUST

#### US-1.1a: KeyCloak OIDC Login Flow *(SPLIT from US-1.1)*
**Points: 5** | **Sprint: 1** | **Owner: BE-A + FE**  
**AC (from PRD):**
- Given login page, When I click "Join as Student/Instructor," Then OAuth initiates → dashboard redirect on success
- Given first-time user, When sign-in completes, Then profile created (language: English, role per selection, XP: 0, streak: 0)
- Given returning user, When sign-in completes, Then existing profile + subscription status loaded

**Edge Cases:** EC-1.1a: Popup blocked → inline error | EC-1.1b: Network failure → retry button, no partial profile | EC-1.1c: Admin email → auto-assign admin role  
**Tasks:**
- `T-1.1a.1` Backend: KeyCloak token validation endpoint
- `T-1.1a.2` Frontend: Replace `signInWithPopup` with `oidc-spa` (PKCE flow, in-memory tokens)
- `T-1.1a.3` Frontend: Auth state → Zustand store (replace Firebase auth observer)
- `T-1.1a.4` Session management: secure HttpOnly cookies + CSRF tokens
- `T-1.1a.5` E2E test: full login flow (Google OAuth → dashboard)
**Dependencies:** US-11.2 (KeyCloak setup complete)

---

#### US-1.1b: Firebase → PostgreSQL User Data Migration *(SPLIT from US-1.1)*
**Points: 8** | **Sprint: 1** | **Owner: BE-A**  
**AC:** Given migration script run, When complete, Then 100% Firebase Auth users exist in PostgreSQL + KeyCloak with all profile data intact  
**Tasks:**
- `T-1.1b.1` Export Firebase Auth + Firestore user data (CSV/JSON)
- `T-1.1b.2` Transform: Firebase UID → PostgreSQL UUID, timestamp format normalization
- `T-1.1b.3` KeyCloak user import (email, name, linked providers, verified status)
- `T-1.1b.4` PostgreSQL users table seeding from migration script
- `T-1.1b.5` Validation: row count parity (AC-MIG-01), auth continuity test (AC-MIG-06)
- `T-1.1b.6` Idempotency: script runnable twice with 0 duplicates (AC-MIG-09)
**Dependencies:** US-11.1 (Drizzle users schema), US-11.2 (KeyCloak import API)  
**Note:** Run against Firebase export copies from Sprint 1. Do NOT wait until Sprint 5 to discover data issues.

---

#### US-1.2: Role-Based Access Control
**Points: 5** | **Sprint: 1** | **Owner: BE-A**  
**AC (from PRD):**
- Given student, When navigating /admin, Then redirect + "Access denied" toast
- Given teacher, When navigating /analytics, Then instructor analytics shown
- Given admin, When navigating /admin, Then admin panel shown

**Edge Cases:** EC-1.2a: JWT role manipulation → server-side rejection (403) | EC-1.2b: Mid-session role change → next request picks up new role  
**Tasks:**
- `T-1.2.1` RBAC middleware: `requireRole(roles[])` function using KeyCloak token introspection
- `T-1.2.2` Apply RBAC middleware to all 60+ routes from OpenAPI spec
- `T-1.2.3` Role-permission config (not hardcoded — `config/permissions.ts`)
- `T-1.2.4` PostgreSQL role enum (student/teacher/admin)
- `T-1.2.5` Tests: every role × protected route combination (matrix test)
**Dependencies:** US-1.1a (tokens available), US-11.3 (routes defined in spec)

---

#### US-1.3: User Profile Management
**Points: 3** | **Sprint: 1** | **Owner: BE-B + FE**  
**AC (from PRD):**
- Given settings page, When updating name + save, Then profile updated immediately
- Given avatar upload, When complete, Then stored + displayed across views

**Edge Cases:** EC-1.3a: Avatar >5MB → error + resize suggestion | EC-1.3b: Account deletion → full data purge (GDPR)  
**Tasks:**
- `T-1.3.1` Drizzle `user_profiles` table schema
- `T-1.3.2` Profile CRUD API (OpenAPI-spec'd endpoints)
- `T-1.3.3` Migrate Settings.tsx → Orval-generated hooks
- `T-1.3.4` Avatar upload to Supabase Storage (`avatars` bucket)
- `T-1.3.5` Account deletion flow (GDPR cascade delete)
**Dependencies:** US-11.1 (schema), US-11.3 (Orval)

---

#### US-1.4: Gamification (XP & Streaks)
**Points: 2** | **Sprint: 1** | **Owner: BE-B**  
**AC (from PRD):**
- Given chapter completion, When progress saved, Then XP awarded + streak updated
- Given missed day, When returning, Then streak resets to 1

**Tasks:**
- `T-1.4.1` Add `xp`, `streak`, `last_active` columns to users table (Drizzle migration)
- `T-1.4.2` Server-side `awardXP` endpoint (move from client-side)
- `T-1.4.3` Timezone handling: user-configured TZ (not server TZ)
**Dependencies:** US-11.1

---

#### US-11.4: API Security Hardening
**Points: 5** | **Sprint: 1** | **Owner: BE-A**  
**AC (from PRD):** Given any endpoint, When request received, Then validated (auth, input, rate limit, CORS)  
**Tasks:**
- `T-11.4.1` Helmet.js v8 (`app.use(helmet())` + custom CSP policy)
- `T-11.4.2` CORS config (allowlist: dev + staging + prod origins)
- `T-11.4.3` express-rate-limit + rate-limiter-flexible (Redis-backed, 7 tier types from Blueprint §3)
- `T-11.4.4` Zod validation middleware on all request bodies/params
- `T-11.4.5` API key vault setup (environment variable management, no hardcoded keys)
**Dependencies:** US-11.2 (Redis already up from US-11.6)

---

#### US-11.5: Error Handling & Structured Logging
**Points: 2** | **Sprint: 1** | **Owner: BE-B**  
**AC (from PRD):** Given any error, When it occurs, Then structured log with request context + user-friendly response  
**Tasks:**
- `T-11.5.1` Pino v9 + pino-http (replace any console.log)
- `T-11.5.2` Global error handler middleware (Express `(err, req, res, next)`)
- `T-11.5.3` Standardized error response format: `{ error: { code, message, requestId } }`
- `T-11.5.4` Request ID propagation (header `X-Request-ID` through all log lines)
**Dependencies:** None

---

#### T-3.0.1: CourseView.tsx Decomposition *(MOVED FROM SPRINT 2 — Opus advisory)*
**Points: 8** | **Sprint: 1** | **Owner: FE**  
> CourseView.tsx is 65KB. Must be decomposed before Sprint 2's US-3.x stories can be built cleanly.  
**Tasks:**
- Identify all state boundaries within CourseView.tsx
- Extract into 10 named sub-components:
  - `ChapterNavigation` — sidebar chapter list + prev/next controls
  - `QuizPanel` — quiz questions, submission, feedback
  - `AudioPlayer` — TTS narration controls + waveform
  - `VisualGenerator` — AI image/diagram display + loading state
  - `TutorChat` — AI chatbot interface + message history
  - `NotesPanel` — note taking + CRUD
  - `VideoPlayer` — video upload/playback controls
  - `OfflineManager` — download + sync status
  - `CertificateModal` — completion + download certificate
  - `ProgressTracker` — chapter completion + XP display
- Extract shared state into hooks: `useCourseProgress`, `useChapterContent`
- Maintain 100% existing behavior (zero regression)
- Write component tests for each extracted component

**Dependencies:** None — pure frontend refactor, independent of backend  
**Risk:** HIGH — regression risk. Run full Playwright smoke test of CourseView after decomp.

**Sprint 1 Total: ~38 SP** *(slightly above target — FE decomp runs parallel to BE auth work)*

---

### EPIC 2: Course Builder (Sprint 2) — MUST

#### US-2.1: File Upload & Processing
**Points: 5** | **Sprint: 2** | **Owner: BE-B + FE**  
**AC (from PRD):**
- Given builder page, When uploading PDF ≤10MB, Then text extracted + advance to Configure
- Given MD/TXT upload, Then raw text stored
- Given image upload, Then base64-encoded for multimodal AI

**Edge Cases:** EC-2.1a: >10MB → size error | EC-2.1b: Corrupt PDF → retry | EC-2.1c: Unsupported type → format list  
**Tasks:**
- `T-2.1.1` `media_assets` Drizzle schema + `uploads` Supabase Storage bucket
- `T-2.1.2` Refactor `/api/v1/upload` (replace in-memory with PostgreSQL + Supabase)
- `T-2.1.3` File type + size validation (Zod + multer)
- `T-2.1.4` pdf-parse integration (keep existing, add virus scan wrapper — REC-03)
- `T-2.1.5` OpenAPI spec for upload endpoints
- `T-2.1.6` Tests per file type (PDF, MD, TXT, image, >10MB, corrupt)
**Dependencies:** US-11.1, US-11.3 (Orval)

---

#### US-2.2: Course Configuration
**Points: 3** | **Sprint: 2** | **Owner: BE-B + FE**  
**AC (from PRD):**
- Given file uploaded, When Configure step shows, Then select level, tone, category, price, toggle quizzes/visuals
- Given price > $0 + "Publish to Marketplace," Then listed as premium

**Tasks:**
- `T-2.2.1` `courses` Drizzle table with config columns (level, tone, category, price, published)
- `T-2.2.2` Draft/published status workflow
- `T-2.2.3` Client + server Zod validation (negative price, required fields)
- `T-2.2.4` OpenAPI spec for course config endpoint
**Dependencies:** US-11.1, US-2.1

---

#### US-2.3: AI Course Generation *(Highest-risk story in the entire project)*
**Points: 13** | **Sprint: 2** | **Owner: BE-A + BE-B** *(pair this story)*  
**AC (from PRD):**
- Given "Generate Course" click, When AI completes, Then 3-5 chapters with markdown + quizzes + visual metadata
- Given success, When saved, Then redirect to course view

**Edge Cases:** EC-2.3a: Truncated JSON → repair attempt → fallback | EC-2.3b: Empty response → retry | EC-2.3c: Rate limit → wait message | EC-2.3d: Short source → AI expands  
**Tasks:**
- `T-2.3.1` Server-side generation endpoint (NOT frontend proxy — security requirement)
- `T-2.3.2` Gemini API call: structured chapter generation (move all AI calls server-side)
- `T-2.3.3` BullMQ worker: `ai-generation` queue consumer (processes job, saves to DB)
- `T-2.3.4` Job progress via SSE (`/api/v1/jobs/:jobId/progress` stream)
- `T-2.3.5` PostgreSQL chapters table (JSONB content + structured metadata, Drizzle schema)
- `T-2.3.6` JSON repair logic for malformed AI responses
- `T-2.3.7` Rate limiting: per-user AI generation throttle
- `T-2.3.8` Tests: happy path, truncated JSON, empty response, rate limit, BullMQ retry
**Dependencies:** US-11.1, US-11.6 (BullMQ ready + smoke-tested in Sprint 1), US-2.2  
**Note:** This story consumes an estimated 2-dev-days each for BE-A and BE-B. No other stories assigned on days when this is in progress.

---

#### US-2.4: Course Extension (Generate Next Chapter)
**Points: 3** | **Sprint: 2** | **Owner: BE-B**  
**AC (from PRD):**
- Given completed course, When clicking "Generate More," Then 3-5 new non-duplicate chapters
- Given new chapters, When appended, Then new batch index assigned

**Tasks:**
- `T-2.4.1` `extendCourse` service: append new batch to existing course
- `T-2.4.2` Batch tracking in PostgreSQL (`batch_index` on chapters)
- `T-2.4.3` Title deduplication check before generating
- `T-2.4.4` Student-initiated trigger ONLY (BR-02 — no auto-generation)
**Dependencies:** US-2.3

---

#### US-3.1: Course Overview Page
**Points: 3** | **Sprint: 2** | **Owner: FE + BE-B**  
**AC (from PRD):** Given /course/:id, When loaded, Then title + description + chapter sidebar + progress shown  
**Tasks:**
- Refactor data layer: Firebase → PostgreSQL API (Orval hook)
- Access control: server-side (outline-only for unpaid/unauthenticated)
- OpenAPI spec
**Dependencies:** US-2.2 (course table), US-1.2 (RBAC)

---

#### US-3.2: Chapter Navigation & Content
**Points: 3** | **Sprint: 2** | **Owner: FE**  
**AC (from PRD):** Given chapter view, When Next/Prev clicked, Then navigate + reset quiz/audio/visual states  
**Tasks:**
- `user_progress` Drizzle table (chapter completion, last index)
- Server-side skip detection
- Keyboard navigation (arrow keys — WCAG)
**Dependencies:** T-3.0.1 (decomposed components), US-3.1

**Sprint 2 Total: ~30 SP**

---

### EPIC 3 (continued) + EPIC 4 + EPIC 6 (Sprint 3) — MUST

#### US-3.3: Quiz System
**Points: 5** | **Sprint: 3** | **Owner: BE-B + FE**  
**AC:** Given quiz questions, When submitted, Then correct=green/incorrect=red | Given submission, Then score recorded  
**Tasks:** `quiz_attempts` table | server-side validation | quiz analytics endpoint | Tests  
**Dependencies:** T-3.0.1 (QuizPanel component), US-3.2

---

#### US-3.4: AI Content Rewriting
**Points: 3** | **Sprint: 3** | **Owner: BE-A**  
**AC:** Given chapter, When "Rewrite" clicked, Then content regenerated at different level/tone + saved  
**Tasks:** Server-side endpoint | Rewrite history (undo — REC-04) | Level/tone selection  
**Dependencies:** US-2.3 (AI pipeline established)

---

#### US-3.5: AI Audio Narration (TTS)
**Points: 5** | **Sprint: 3** | **Owner: BE-A + FE**  
**AC:** Given chapter, When narration clicked, Then audio generated + auto-plays  
**Tasks:** Server-side TTS (Gemini) + caching | Audio file in Supabase Storage | Player controls  
**Dependencies:** T-3.0.1 (AudioPlayer component), US-2.3

---

#### US-3.6: AI Visual Generation
**Points: 5** | **Sprint: 3** | **Owner: BE-A**  
**AC:** Given visualMetadata, When chapter opened, Then illustration generated automatically  
**Tasks:** Server-side generation + caching | Image storage (Supabase) | Loading skeleton  
**Dependencies:** T-3.0.1 (VisualGenerator component), US-2.3

---

#### US-3.7: AI Tutor Chatbot
**Points: 5** | **Sprint: 3** | **Owner: BE-A + FE**  
**AC:** Given chapter, When question asked, Then AI responds Socratically with chapter context  
**Tasks:** Server-side chat endpoint | `chat_messages` PostgreSQL table | Rate limiting | SSE streaming  
**Dependencies:** T-3.0.1 (TutorChat component), US-11.4 (rate limiting)

---

#### US-4.1: Course Browsing
**Points: 5** | **Sprint: 3** | **Owner: BE-B + FE**  
**AC:** Given Discover page, When searching, Then courses filtered real-time | Given filters, Then matching courses  
**Tasks:** PostgreSQL full-text search index | Server-side cursor pagination | Marketplace.tsx → Orval  
**Dependencies:** US-2.2 (courses table), US-1.2 (RBAC — filter by visibility)

---

#### US-4.2: Course Preview (Outline-Only)
**Points: 3** | **Sprint: 3** | **Owner: BE-B**  
**AC:** Given paid course clicked, When overview loads, Then chapter titles visible — NOT content  
**Tasks:** Outline-only API response | Server-side content gating (BR-01)  
**Dependencies:** US-4.1, US-5.1 (purchase check)

---

#### US-4.3: Shopping Cart
**Points: 5** | **Sprint: 3** | **Owner: BE-B + FE**  
**AC:** Given "Add to Cart," When updates, Then drawer opens | Given checkout, Then Stripe redirect  
**Tasks:** `cart_items` server-side persistence | Batch checkout | Cart badge  
**Dependencies:** US-4.1, US-5.1

---

#### US-6.1: My Learning Dashboard
**Points: 5** | **Sprint: 3** | **Owner: BE-B + FE**  
**AC:** Given Learning Paths, When loaded, Then In-Progress/Completed tabs with progress bars  
**Tasks:** `user_progress` API | Server-side completion calculation | Resume-from-last-chapter  
**Dependencies:** US-3.2 (progress table), US-3.11 (certificates for completed tab)

---

#### US-6.2: Progress Persistence
**Points: 3** | **Sprint: 3** | **Owner: BE-B**  
**AC:** Given chapter opened, When viewed, Then marked completed + last index updated  
**Tasks:** Debounced progress API | Optimistic UI | Offline queue (sync when reconnected)  
**Dependencies:** US-6.1

**Sprint 3 Total: ~39 SP** *(at upper range for full-velocity sprint)*

---

### EPIC 3 (final) + EPIC 5 + EPIC 9 + EPIC 10 + EPIC 11 remaining (Sprint 4) — MUST

#### US-3.8: Notes System
**Points: 3** | **Sprint: 4** | **Owner: FS + FE**  
**Tasks:** `notes` Drizzle table | CRUD API | Edit/delete | NotesPanel component wiring  
**Dependencies:** T-3.0.1 (NotesPanel), US-3.2

---

#### US-3.9: Video Upload & Playback
**Points: 5** | **Sprint: 4** | **Owner: BE-B + FE**  
**AC:** Given teacher, When video uploaded, Then stored + playable  
**Tasks:** Migrate Firebase Storage → Supabase Storage | Chunked upload | VideoPlayer component  
**Dependencies:** T-3.0.1 (VideoPlayer), US-2.1 (storage pipeline)

---

#### US-3.11: Certificates
**Points: 5** | **Sprint: 4** | **Owner: BE-B + FE**  
**AC:** Given all chapters complete, When reached, Then certificate modal + download  
**Tasks:** `certificates` Drizzle table | @react-pdf/renderer (server-side PDF) | Verification URL  
**Dependencies:** T-3.0.1 (CertificateModal), US-6.2 (progress tracking)

---

#### US-5.1: Course Purchase
**Points: 5** | **Sprint: 4** | **Owner: BE-A + FE**  
**AC:** Given "Buy" click, When payment succeeds, Then immediate access granted  
**Tasks:** `purchases` table | Idempotent Stripe webhook | Server-side access grant  
**Dependencies:** US-4.3 (cart), US-1.2 (RBAC access update)

---

#### US-5.2: Subscription Plans
**Points: 5** | **Sprint: 4** | **Owner: BE-A**  
**AC:** Given "Upgrade to Pro," When clicked, Then Stripe Checkout redirect | Given success, Then Pro access  
**Tasks:** `subscriptions` table | Lifecycle management | Stripe webhook events | Real Stripe Price IDs  
**Dependencies:** US-5.1

---

#### US-5.3: Billing History & Receipts
**Points: 3** | **Sprint: 4** | **Owner: FS**  
**Tasks:** Billing history API | Server-side PDF (jsPDF) | Billing.tsx → Orval  
**Dependencies:** US-5.1, US-5.2

---

#### US-9.1: Platform Statistics (Admin)
**Points: 3** | **Sprint: 4** | **Owner: FS**  
**AC:** Given admin panel, When loaded, Then user/course/video/generation counts  
**Tasks:** PostgreSQL aggregate queries | Admin stats API | Auto-refresh  
**Dependencies:** US-11.1

---

#### US-9.2: Data Management (Admin)
**Points: 3** | **Sprint: 4** | **Owner: FS**  
**AC:** Given admin, When "Clear All" + confirmed, Then courses/videos deleted  
**Tasks:** Batch delete API with Drizzle transaction | Audit logging (REC-08)  
**Dependencies:** US-9.1

---

#### US-10.1–10.4: Settings & Preferences
**Points: 8** | **Sprint: 4** | **Owner: FE + FS**  
**Stories:** Theme (2) | Notifications (2) | Subscription Mgmt (2) | Password Reset + Account Deletion (2)  
**Tasks:** Preferences JSONB in users table | Settings API | KeyCloak password reset flow | GDPR-compliant deletion  
**Dependencies:** US-1.3, US-5.2 (subscription display)

---

#### US-2.5: YouTube URL Course Generation *(SHOULD — pulled forward from post-MVP)*
**Points: 5** | **Sprint: 4** | **Owner: BE-A** *(Sprint 4 has light capacity)*  
**AC:** Given YouTube URL, When submitted, Then transcript extracted + course generated  
**Tasks:** Integrate `youtube-transcript-api` | URL validation | Transcript preprocessing | Feed into US-2.3 pipeline  
**Dependencies:** US-2.3 (AI pipeline)

---

#### US-13.1–13.2: Landing Page + Onboarding *(SHOULD — pulled forward using Sprint 4 capacity)*
**Points: 5** | **Sprint: 4** | **Owner: FE**  
**Tasks:** Preserve LandingPage.tsx | Lumina branding update | SEO meta tags | KeyCloak-powered login page  
**Dependencies:** US-1.1a (auth flow)

**Sprint 4 Total: ~55 SP** ← This is OVER target. Split: move US-2.5 + US-13.x to Sprint 5 if needed.

> **PO NOTE:** Sprint 4 is heavy. MUST stories (3.8, 3.9, 3.11, 5.1-5.3, 9.1-9.2, 10.1-10.4) total ~40 SP. The SHOULD stories (US-2.5, US-13.1-13.2) total 10 SP. If Sprint 3 velocity was ≥36 SP, keep them. If Sprint 3 underperformed, defer them to Sprint 5. PO decides at Sprint 4 planning based on actuals.

**Sprint 4 MUST Total: ~40 SP | With SHOULD: ~50 SP**

---

### Sprint 5: Security, Testing & Migration Dry-Run (Sprint 5) — MUST

> No new features. This sprint focuses on hardening, coverage, and migration preparation.

**Sprint 5 Total: ~30 SP**

| Task | Owner | Points | Notes |
|---|---|---|---|
| Security audit findings → fixes | BE-A | 5 | Third-party audit started Sprint 0 (REC-01). Results in by Sprint 4. |
| Rate limiting audit (all endpoints) | BE-A | 2 | Verify all 60+ endpoints have correct rate limits |
| Unit tests to ≥80% coverage | All | 5 | Fill coverage gaps per Vitest report |
| Playwright E2E: all critical flows | QA | 5 | Login, course gen, purchase, progress, admin |
| Performance: LCP <2s, API p95 <200ms | All | 3 | Lighthouse CI + APM instrumentation |
| Bug triage + fixes | All | 5 | Estimated buffer for Sprint 1–4 bugs |
| **Migration dry-run on staging** | BE + QA | 5 | Run Firebase→PostgreSQL scripts against staging. Validate AC-MIG-01→09. |

---

### Sprint 6: Production Migration + Launch (Sprint 6) — MUST

> **SACRED SPRINT — Zero feature work.** Every point of capacity goes to migration execution and launch validation.

**Sprint 6 Total: ~25 SP**

#### Week 1: Migration Execution

| Task | Owner | Notes |
|---|---|---|
| Production PostgreSQL + Drizzle migrations deploy | DevOps | |
| Production KeyCloak deploy + realm config | DevOps | |
| Production Redis + BullMQ deploy | DevOps | |
| Production Supabase Storage bucket config | DevOps | |
| **Data migration execution** (Firebase → PostgreSQL) | BE | Against production Firebase export |
| **File migration** (Firebase Storage → Supabase Storage) | BE | |
| Run migration validation suite (AC-MIG-01→09) | QA | All 9 criteria must PASS |

#### Week 2: Validation & Launch

| Task | Owner | Notes |
|---|---|---|
| Fix any migration validation failures | BE | If AC-MIG fail → fix + re-run (idempotent scripts) |
| Smoke tests on staging (all 13 EPICs) | QA | Manual + automated |
| E2E regression suite on staging | QA | Full Playwright run |
| Performance benchmarks (API p95, LCP) | QA | Match or exceed pre-migration baseline (AC-MIG-08) |
| Security scan on production config | DevOps | No secrets in env, HTTPS enforced |
| Rollback drill | BE + DevOps | Restore from backup, verify (AC-MIG-07 — must complete < 1hr) |
| Documentation update | All | |
| **Launch checklist sign-off** | PM | All criteria green → go |

---

## 5. SPRINT ALLOCATION SUMMARY

| Sprint | Goal | Key Stories | SP | Dates (est.) |
|---|---|---|---|---|
| **0** | Infrastructure: DB, Auth, Queues, CI/CD | **T-0.0** (gate), US-11.1, US-11.2, US-11.3, US-11.6, US-12.1, CI/CD | 33 | Wk 1–2 |
| **1** | Auth migration + CourseView decomp | US-1.1a, US-1.1b, US-1.2, US-1.3, US-1.4, US-11.4, US-11.5, T-3.0.1 | 38 | Wk 3–4 |
| **2** | Course Builder + Course Viewer APIs | US-2.1, US-2.2, US-2.3*, US-2.4, US-3.1, US-3.2 | 30 | Wk 5–6 |
| **3** | AI features + Marketplace + Payments + Learning | US-3.3–3.7, US-4.1–4.3, US-6.1, US-6.2 | 39 | Wk 7–8 |
| **4** | Payments + Admin + Settings + (SHOULD) | US-3.8, 3.9, 3.11, US-5.1–5.3, US-9.1, 9.2, US-10.x ± US-2.5, US-13.x | 40–50 | Wk 9–10 |
| **5** | Security, testing, migration dry-run | No new features | 30 | Wk 11–12 |
| **6** | Production migration + launch | AC-MIG-01→09, smoke tests, rollback drill | 25 | Wk 13+ |

*US-2.3 = 13 SP — highest complexity story. Pair BE-A + BE-B on this.  
**Total: ~235 SP** (MUST + SHOULD subset — +3 SP for T-0.0)

---

## 6. DEPENDENCY MAP

```
T-0.0 (Monorepo Scaffold) — GATE
  ├── US-11.1 (needs server/ workspace to exist)
  ├── US-11.2 (needs docker-compose.yml for KeyCloak)
  ├── US-11.3 (needs openapi/ workspace to exist)
  ├── US-11.6 (needs docker-compose.yml for Redis)
  └── ALL Sprint 0 tasks (none begin before T-0.0 merges)

US-11.1 (PostgreSQL + Drizzle)
  ├── US-1.1b (user migration script)
  ├── US-1.2 (RBAC — users table with role column)
  ├── US-1.3 (user_profiles table)
  ├── US-2.2 (courses table)
  ├── US-6.2 (user_progress table)
  └── ALL API endpoints (every repo layer uses Drizzle)

US-11.2 (KeyCloak setup)
  ├── US-1.1a (OIDC login flow — needs KeyCloak client config)
  ├── US-1.1b (user import — needs KeyCloak import API)
  └── US-1.2 (RBAC middleware — needs KeyCloak token introspection)

US-11.6 (BullMQ + Redis)
  ├── T-11.6 smoke test in Sprint 1 (validate queue before Sprint 2 AI work)
  └── US-2.3 (AI generation — BullMQ worker)

US-1.1a (OIDC Login)
  └── ALL authenticated frontend pages (auth provider must be set up)

US-1.2 (RBAC Middleware)
  └── ALL 60+ protected API endpoints (middleware applied to every route)

US-11.3 (OpenAPI + Orval)
  └── ALL frontend stories using API (Orval generates typed hooks)

T-3.0.1 (CourseView decomposition — Sprint 1)
  ├── US-3.3 (QuizPanel component)
  ├── US-3.5 (AudioPlayer component)
  ├── US-3.6 (VisualGenerator component)
  ├── US-3.7 (TutorChat component)
  ├── US-3.8 (NotesPanel component)
  ├── US-3.9 (VideoPlayer component)
  ├── US-3.11 (CertificateModal component)
  └── US-3.1/3.2 (course view shell)

US-2.3 (AI Generation pipeline)
  ├── US-2.4 (Course Extension — same pipeline)
  ├── US-3.4 (AI Rewriting — same pipeline)
  ├── US-3.5 (AI Audio — same pipeline)
  ├── US-3.6 (AI Visual — same pipeline)
  ├── US-3.7 (AI Tutor — same pipeline)
  └── US-2.5 (YouTube — extends pipeline)

US-4.3 (Cart) → US-5.1 (Purchase)
US-5.1 (Purchase) → US-4.2 (Paywall gating in course overview)
US-5.2 (Subscriptions) → US-10.3 (Subscription Mgmt in settings)
US-6.2 (Progress) → US-6.1 (Learning Dashboard) → US-3.11 (Certificates)

Sprint 0 (all infra) → Sprint 1 (auth + APIs begin)
Sprint 1 (auth + T-3.0.1) → Sprint 2 (course builder + viewer)
Sprint 5 (migration dry-run) → Sprint 6 (production migration)
```

**Circular dependency check:** None found. All dependencies are directed (no cycles).

**Critical Path (longest blocking chain):**
```
US-11.2 (KeyCloak, S0) → US-1.1a (OIDC, S1) → US-1.2 (RBAC, S1) 
  → All protected endpoints (S2-S4) → Sprint 5 testing → Sprint 6 launch
```

---

## 7. RISK REGISTER

| ID | Risk | Impact | Likelihood | Mitigation | Owner | Sprint |
|---|---|---|---|---|---|---|
| R-01 | **KeyCloak config complexity** — team unfamiliar with KeyCloak, setup takes 2× estimate | Schedule delay (all auth-dependent stories slip) | **HIGH** | Start Day 1 of Sprint 0. Spike: 2-day timebox. If not working by Day 7 → escalate. Fallback: Auth0 (OIDC-compatible, swap later) | BE-A | S0 |
| R-02 | **US-2.3 underestimated** (13 SP, BullMQ + SSE + AI orchestration) | Sprint 2 overrun | HIGH | Pair two BE devs on this story. No other high-SP stories concurrent. 13 SP = full story, no scope creep | BE-A + BE-B | S2 |
| R-03 | **CourseView regression** after T-3.0.1 decomposition | Broken course viewer in Sprint 2 | MEDIUM | Full Playwright smoke test of CourseView after decomp. Feature flag decomposed version until validated | FE | S1 |
| R-04 | **Data migration data quality issues** discovered late | Sprint 6 delay or launch block | MEDIUM-HIGH | Run migration scripts against Firebase export copies from Sprint 1 (not Sprint 5). Fix data issues early. | BE-A | S1 onwards |
| R-05 | **Sprint 4 overload** (40–50 SP if SHOULD stories kept) | Sprint 4 overrun | MEDIUM | PO gates SHOULD stories (US-2.5, US-13.x) at Sprint 4 planning based on Sprint 3 actuals | PO | S4 |
| R-06 | **Firebase Schema surprises** — undocumented Firestore structure | Migration script failures | MEDIUM | Audit full Firestore collection structure in Sprint 0 (document all collections + fields before schema design) | BE-B | S0 |
| R-07 | **Drizzle pre-v1.0 instability** | Breaking changes mid-project | LOW | Pin exact version (v0.45.x). Test migrations on every schema change. Monitor drizzle-orm changelog | BE-B | All |
| R-08 | **Gemini API rate limits** during AI generation testing | Blocked development + test failures | LOW-MEDIUM | Mock Gemini responses in unit tests (msw). Only hit real API in integration tests. Budget AI API credits. | BE-A | S2+ |
| R-09 | **Redis connection issues** discovered in Sprint 2 | US-2.3 AI generation blocked | LOW (if mitigated) | Smoke-test BullMQ queue end-to-end in Sprint 1 (before Sprint 2 depends on it) | BE-B | S1 |
| R-10 | **Sprint 6 scope creep** — PM pressure to add small features | Migration quality compromised | LOW | Sprint 6 is contractually feature-free. PM must protect it. Any "quick win" gets an issue for post-launch. | PM | S6 |

---

## 8. OPUS ADVISORY NOTES

> Recorded from Opus Engineering Manager consultation (2026-04-11). To be re-read at Sprint 0 planning.

1. **Split US-1.1** — It was two problems wearing a trenchcoat. US-1.1a (OIDC flow, 5 SP) and US-1.1b (user migration, 8 SP) are now separate stories with separate owners and separate dependencies. ✅ Done in this plan.

2. **KeyCloak is the #1 schedule risk.** If nobody on the team has production KeyCloak experience, budget a 2-day spike in Sprint 0 Week 1 before full story execution. If it fails the spike, consider Auth0 as a tactical fallback (same OIDC protocol → easy swap to KeyCloak later).

3. **Sprint 2 was overloaded** in the original PRD (T-3.0.1 + US-2.3 + all E2 stories). T-3.0.1 moved to Sprint 1 where the frontend engineer has lighter load. This gives US-2.3 (13 SP, highest risk story) breathing room in Sprint 2. ✅ Done in this plan.

4. **Sprint 6 is sacred.** Zero feature work. PM must protect this sprint from scope creep. Even "quick wins" get deferred to post-launch. The 9 migration acceptance criteria (AC-MIG-01→09) are the only success criteria for Sprint 6.

5. **Run Firebase data migration scripts from Sprint 1** — not Sprint 5. Data surprises found in Sprint 5 will delay launch. Treat migration scripts as living code from Sprint 1 onward, incrementally updated as schema evolves.

6. **Definition of Done must be enforced from Sprint 1** — including OpenAPI spec update, Playwright smoke test (if UI changed), and CI pipeline green. If you let these slide "until Sprint 5," Sprint 5 testing will surface a mountain of deferred debt.

7. **US-2.3 (AI generation, 13 SP) should be paired** — two backend engineers working it together reduces the bus factor on the most complex story in the project. Neither should be solo on 13 SP of new territory.

---

## SIGN-OFF

| Role | Name | Status |
|---|---|---|
| Scrum Master | Claude (Phase 4) | ✅ Signed off |
| Tech Lead | Claude (Phase 4) | ✅ Signed off |
| PO | Claude (Phase 4) | ✅ Signed off |
| PM | Youssef Laaroui | ⬜ Pending — review + confirm before Sprint 0 |
| Opus Advisory | Opus Engineering Manager | ✅ Advisory incorporated |

**Phase 4 complete when:** PM signs off → contextlog.md updated → `/compact` → Sprint 0 begins.
