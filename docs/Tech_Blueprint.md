# TECH BLUEPRINT — Project Lumina
**Version:** 1.0
**Date:** 2026-04-11
**Author:** Solutions Architect + Tech Lead + Security Engineer (Claude)
**Status:** DRAFT
**Input:** PRD.md v1.2 (APPROVED), BA_Research_Report.md, CLIENT.txt

---

## TABLE OF CONTENTS

1. [Tech Scout Registry](#1-tech-scout-registry)
2. [System Architecture](#2-system-architecture)
3. [Security Model](#3-security-model)
4. [Data Model](#4-data-model)
5. [Project Structure](#5-project-structure)
6. [Design Patterns](#6-design-patterns)
7. [API Contracts](#7-api-contracts)
8. [Infrastructure & CI/CD](#8-infrastructure--cicd)
9. [Threat Model](#9-threat-model)
10. [ADR Log](#10-adr-log)

---

## 1. TECH SCOUT REGISTRY

> For every PRD capability: find best existing tool BEFORE designing. Don't build what exists. Don't pay for what's free. Don't guess — verify.

### 1.1 PM-Decided (Validated)

#### CAPABILITY: Relational Database
```
CHOSEN: PostgreSQL 16.x
  Why: Enterprise-grade, relational integrity, JSONB for flexible schemas,
       full-text search built-in, mature ecosystem, PM decision (PRD S-01)
  Status: Stable LTS | License: PostgreSQL (permissive) | CVEs: None critical current
  Source: https://www.postgresql.org/
  Confidence: 100% | Wrong probability: 0% (PM decision)
```

#### CAPABILITY: ORM & Query Builder
```
CHOSEN: Drizzle ORM v0.45.x
  Why: Type-safe SQL, slim (~7KB), zero runtime overhead, Drizzle Kit for migrations,
       native PostgreSQL support, serverless-ready, schema-as-code in TypeScript
  Integrate: ~1 day setup | Build from scratch: N/A
  Status: v0.45.2 (v1.0 beta in progress) | License: Apache-2.0 | CVEs: None
  Source: https://orm.drizzle.team/ | npm: drizzle-orm
  Companion: drizzle-kit (migrations CLI)
  Confidence: HIGH | Wrong probability: 5% (pre-1.0 but production-proven)
REJECTED: Prisma — heavier runtime, slower cold starts, less SQL control
REJECTED: TypeORM — decorator-based, weaker type inference, maintenance concerns
REJECTED: Knex.js — query builder only, no schema-as-code
```

#### CAPABILITY: Authentication & SSO
```
CHOSEN: KeyCloak v26.5.0
  Why: Open-source, OAuth2/OIDC/SAML, admin UI, self-hosted, enterprise SSO-ready,
       Google/GitHub/Microsoft IdP support, PM decision (PRD S-02)
  Integrate: ~2 days (realm + IdP + OIDC middleware) | Build: ~4 weeks (worse security)
  Status: v26.5.0 (Jan 2026) | License: Apache-2.0 | CVEs: Patched in latest
  Source: https://www.keycloak.org/
  Frontend lib: oidc-spa (PKCE, in-memory tokens, multi-tab sync, React API)
  Backend lib: KeyCloak Node.js adapter (Express middleware, token introspection)
  Confidence: HIGH | Wrong probability: 3%
REJECTED: Auth0 — paid at scale, vendor lock-in
REJECTED: Firebase Auth — Google lock-in, limited SSO, being replaced per PM Q5
REJECTED: Clerk — paid, less enterprise-friendly
```

#### CAPABILITY: Object Storage (Avatars, Media, Uploads)
```
CHOSEN: Supabase Storage (via @supabase/supabase-js v2.103.x)
  Why: S3-compatible, generous free tier, JS SDK, RLS policies, CDN built-in,
       PM decision (PRD S-10a, VG A-02 — "definitely not MinIO")
  Integrate: ~0.5 day | Build: N/A
  Status: v2.103.0 (Apr 2026) | License: Apache-2.0 | CVEs: Path traversal patched
  Source: https://supabase.com/docs/reference/javascript/introduction
  Buckets: avatars (public), course-media (private), uploads (private, temp)
  Confidence: HIGH | Wrong probability: 5%
REJECTED: MinIO — PM explicitly rejected; AGPL license concern for commercial
REJECTED: Cloudflare R2 — good but adds another vendor; Supabase consolidates
```

#### CAPABILITY: Background Job Processing
```
CHOSEN: BullMQ v5.71.x + Redis 7.x
  Why: Production-grade queues, priorities, retries, rate limiting, dead letter queues,
       OpenTelemetry support (bullmq-otel), DAG-style flow producers, PM decision (PRD S-10b)
  Integrate: ~1 day | Build: ~2 weeks (worse reliability)
  Status: v5.71 (Mar 2026) | License: MIT | CVEs: None
  Source: https://bullmq.io/ | https://docs.bullmq.io/
  Admin UI: @bull-board/express v6.21.0 (queue dashboard)
  Queues: ai-generation, media-processing, email-notifications
  Confidence: HIGH | Wrong probability: 2%
REJECTED: Agenda — MongoDB-based, we use PostgreSQL
REJECTED: pg-boss — PostgreSQL-based (simpler but less feature-rich)
REJECTED: Temporal — overkill for our use case
```

#### CAPABILITY: API Contract Generation
```
CHOSEN: Orval v7.x + OpenAPI 3.0
  Why: Generates typed React Query hooks from OpenAPI spec, keeps FE/BE in sync,
       eliminates manual HTTP client code, PM decision (PRD S-03)
  Integrate: ~0.5 day | Build: N/A (manual clients = drift-prone)
  Status: v7.x (actively maintained, npm updated Mar 2026) | License: MIT
  Source: https://orval.dev/
  Output: TanStack React Query v5 hooks (fetch-based, no axios dependency)
  Confidence: HIGH | Wrong probability: 5%
REJECTED: openapi-typescript-codegen — less React Query integration
REJECTED: Manual HTTP clients — drift-prone, tedious, error-prone
```

### 1.2 Existing Codebase (Keep)

#### CAPABILITY: Frontend Framework
```
KEEP: React 19.x + Vite 6.x + TypeScript 5.8.x
  Why: Already in codebase, modern stack, excellent ecosystem, Vite fast HMR/builds
  Current: react@19.0.0, vite@6.2.0, typescript@5.8.2
  Action: Keep. Enable strict mode in tsconfig (currently missing).
  Confidence: 100% | No migration needed
```

#### CAPABILITY: UI Component Library
```
KEEP: Radix UI (Dialog, Dropdown, Label, Progress, Tabs, Toast)
  Why: Accessible (WAI-ARIA), unstyled primitives, composable, already in codebase
  Current: @radix-ui/* various versions (all current)
  Action: Keep. Add Radix Accordion, Select, Tooltip as needed.
  Confidence: 100%
```

#### CAPABILITY: Styling
```
KEEP: Tailwind CSS v4.x + tailwind-merge + clsx + class-variance-authority (CVA)
  Why: Utility-first, design tokens, dark mode built-in, already in codebase
  Current: tailwindcss@4.1.14, tailwind-merge@3.5.0, clsx@2.1.1, cva@0.7.1
  Action: Keep. Migrate inline color values to design tokens.
  Confidence: 100%
```

#### CAPABILITY: Client State Management
```
KEEP: Zustand v5.x
  Why: Minimal, no boilerplate, TypeScript-first, already in codebase (cartStore)
  Current: zustand@5.0.12
  Action: Keep. Expand for auth state, UI state. Server state via React Query.
  Confidence: 100%
```

#### CAPABILITY: Animation
```
KEEP: Motion (framer-motion) v12.x
  Why: Declarative animations, layout animations, gesture support, already in codebase
  Current: motion@12.23.24
  Action: Keep. Respect prefers-reduced-motion (WCAG).
  Confidence: 100%
```

#### CAPABILITY: Charts & Data Visualization
```
KEEP: Recharts v3.x
  Why: React-native charting, composable, already in codebase (InstructorAnalytics)
  Current: recharts@3.8.1
  Action: Keep.
  Confidence: 100%
```

#### CAPABILITY: Markdown Rendering
```
KEEP: react-markdown v10.x + PrismJS v1.30
  Why: Course content is markdown, syntax highlighting for code, already in codebase
  Current: react-markdown@10.1.0, prismjs@1.30.0
  Action: Keep.
  Confidence: 100%
```

#### CAPABILITY: Forms
```
KEEP: react-hook-form v7.x + Zod v4.x
  Why: Performant forms, schema validation with Zod, already in codebase
  Current: react-hook-form@7.72.1, zod@4.3.6
  Action: Keep. Use Zod for BOTH client + server validation (shared schemas).
  Confidence: 100%
```

#### CAPABILITY: Routing
```
KEEP: react-router-dom v7.x
  Why: Standard React routing, already in codebase with all routes defined
  Current: react-router-dom@7.14.0
  Action: Keep.
  Confidence: 100%
```

#### CAPABILITY: Payment Processing
```
KEEP: Stripe (@stripe/stripe-js v9.x + stripe v22.x server SDK)
  Why: PM decision (BR-13), already integrated, webhook handling exists
  Current: @stripe/stripe-js@9.1.0, stripe@22.0.0
  Action: Keep. Harden webhook verification, add idempotency keys.
  Confidence: 100%
```

#### CAPABILITY: AI / LLM
```
KEEP: Google Gemini (@google/genai v1.29.x)
  Why: Already integrated for course gen, rewrite, TTS, image gen, tutor chat, video scripts
  Current: @google/genai@1.29.0
  Action: Keep. Move all AI calls server-side behind BullMQ queues.
  NOTE: openai@6.34.0 also in deps — evaluate if still needed or remove
  Confidence: HIGH | Wrong probability: 5% (Gemini API stability)
```

#### CAPABILITY: PDF Parsing (Upload Processing)
```
KEEP: pdf-parse v1.1.1
  Why: Extracts text from uploaded PDFs for course builder, already in codebase
  Current: pdf-parse@1.1.1
  Action: Keep. Add virus scanning before processing (REC-03).
  Confidence: 100%
```

#### CAPABILITY: PWA / Offline Support
```
KEEP: vite-plugin-pwa v1.2.0 (Workbox)
  Why: Service worker, offline caching, already configured
  Current: vite-plugin-pwa@1.2.0
  Action: Keep. Update manifest from "FX Skool" to "Lumina".
  Confidence: 100%
```

#### CAPABILITY: Unique ID Generation
```
KEEP: uuid v13.x
  Why: Standard UUID generation, already in codebase
  Current: uuid@13.0.0
  Action: Keep for client-side. Server-side: use PostgreSQL gen_random_uuid().
  Confidence: 100%
```

### 1.3 New Capabilities (Scouted)

#### CAPABILITY: Server-Side Data Fetching (Frontend)
```
CHOSEN: TanStack React Query v5.x (via Orval-generated hooks)
  Why: 12.3M weekly downloads, devtools, garbage collection, stale time,
       optimistic updates, Orval generates typed hooks directly, React 19 compatible
  Integrate: ~0.5 day (Orval handles code gen) | Build: N/A
  Status: v5.x (stable) | License: MIT | CVEs: None
  Source: https://tanstack.com/query/
  Confidence: HIGH | Wrong probability: 3%
REJECTED: SWR — fewer features (no devtools, weaker mutations), less Orval integration
REJECTED: RTK Query — requires Redux, we use Zustand
```

#### CAPABILITY: Backend Framework
```
KEEP+HARDEN: Express.js v4.x (migrate to v5 when stable)
  Why: Already in codebase, massive middleware ecosystem (helmet, cors, multer, passport),
       76M weekly downloads, team familiarity. Migration to Fastify/Hono not worth it
       for a refactoring MVP — risk outweighs perf gains.
  Current: express@4.21.2
  Action: Keep. Add Helmet, CORS config, rate limiting, structured error handling.
  Confidence: HIGH | Wrong probability: 10%
  NOTE: If greenfield, would choose Fastify. But Express→Fastify migration during
        a production refactoring adds unnecessary risk. Revisit post-MVP.
REJECTED: Fastify — 2-3x faster but migration cost during refactoring MVP too high
REJECTED: Hono — excellent for new projects, but Express middleware ecosystem needed now
```

#### CAPABILITY: Structured Logging
```
CHOSEN: Pino v9.x + pino-http (Express middleware)
  Why: 6.2x faster than Winston (450ms vs 2800ms for 100K logs), structured JSON,
       low overhead, native OpenTelemetry support, ideal for observability pipelines
  Integrate: ~0.5 day | Build: N/A
  Status: v9.x (stable) | License: MIT | CVEs: None
  Source: https://getpino.io/ | npm: pino
  Companion: pino-pretty (dev formatting), pino-http (Express middleware)
  Confidence: HIGH | Wrong probability: 5%
REJECTED: Winston — 6x slower, more configurable but perf matters at scale
```

#### CAPABILITY: API Security Headers
```
CHOSEN: Helmet.js v8.x
  Why: Sets 13+ security headers (CSP, HSTS, X-Frame-Options, etc.), Express standard
  Integrate: 1 line (app.use(helmet())) | Build: manual header management = error-prone
  Status: v8.1.0 | License: MIT | CVEs: None
  Source: https://helmetjs.github.io/
  Confidence: 100% | Wrong probability: 0%
```

#### CAPABILITY: Rate Limiting
```
CHOSEN: express-rate-limit v8.x + rate-limiter-flexible (Redis store)
  Why: express-rate-limit for simple per-route limits, rate-limiter-flexible for
       distributed Redis-backed limits (multi-instance), tiered by user role
  Integrate: ~0.5 day | Build: ~1 week (custom implementation = bugs)
  Status: express-rate-limit v8.3.2 | License: MIT | CVEs: None
  Source: https://github.com/express-rate-limit
  Store: Redis (shared with BullMQ) for distributed rate limiting
  Confidence: HIGH | Wrong probability: 5%
```

#### CAPABILITY: Input Validation (Server)
```
CHOSEN: Zod v4.x (shared with frontend)
  Why: Already in codebase, TypeScript-first, composable schemas, runtime validation,
       can share schemas between client + server for DRY validation
  Current: zod@4.3.6
  Action: Create shared /packages/schemas/ with Zod schemas used by both FE and BE
  Confidence: 100% | Wrong probability: 0%
```

#### CAPABILITY: PDF Generation (Certificates, Receipts)
```
CHOSEN: @react-pdf/renderer (for certificates) + jsPDF (already in codebase for receipts)
  Why: React-pdf for server-side certificate generation with React components,
       jsPDF already in codebase for billing receipts (Billing.tsx)
  Current: jspdf@4.2.1 (keep), html2canvas@1.4.1 (keep)
  New: @react-pdf/renderer for server-side certificate PDFs
  Integrate: ~1 day | Build: N/A
  Confidence: HIGH | Wrong probability: 10%
REJECTED: Puppeteer — heavy (headless Chrome), overkill for structured PDFs
REJECTED: PDFKit — lower-level, more code for same result
```

#### CAPABILITY: Transactional Email
```
CHOSEN: Resend + React Email
  Why: Modern API, TypeScript SDK, React Email for templating, generous free tier
       (3K emails/month), excellent deliverability, no SMTP management
  Integrate: ~0.5 day | Build: N/A (Nodemailer needs SMTP server management)
  Status: Active, growing (500K weekly downloads) | License: MIT (SDK)
  Source: https://resend.com/
  Use cases: Password reset, purchase confirmation, invoice, weekly reminders
  Confidence: HIGH | Wrong probability: 10%
  FALLBACK: Nodemailer + AWS SES if Resend pricing becomes prohibitive
REJECTED: Nodemailer alone — requires SMTP management, deliverability burden
REJECTED: SendGrid — more expensive, less developer-friendly API
```

#### CAPABILITY: Unit + Integration Testing
```
CHOSEN: Vitest v3.x
  Why: 6x faster cold start than Jest, native ESM/TypeScript, Vite-native (shared config),
       watch mode 9x faster, React Testing Library compatible, 50% less memory
  Integrate: ~0.5 day (replace Jest if any) | Build: N/A
  Status: v3.x (stable) | License: MIT | CVEs: None
  Source: https://vitest.dev/
  Companion: @testing-library/react (component tests), msw (API mocking)
  Confidence: HIGH | Wrong probability: 3%
REJECTED: Jest — 6x slower, requires ESM/TS transform config, declining satisfaction
```

#### CAPABILITY: E2E Testing
```
CHOSEN: Playwright v1.x
  Why: Cross-browser (Chromium/Firefox/WebKit), native parallelism, 290ms/action vs
       Cypress 420ms, free parallelization (no paid dashboard), multi-tab support
  Integrate: ~1 day | Build: N/A
  Status: v1.x (stable, Microsoft-backed) | License: Apache-2.0 | CVEs: None
  Source: https://playwright.dev/
  Confidence: HIGH | Wrong probability: 5%
REJECTED: Cypress — slower, paid parallelization, Chrome-only in free tier
```

#### CAPABILITY: Monitoring & Observability
```
CHOSEN: OpenTelemetry SDK + Grafana Cloud (free tier: 50GB logs, 10K metrics, 50GB traces)
  Why: Vendor-neutral instrumentation, CNCF standard, Grafana free tier sufficient for MVP,
       Pino + BullMQ both have OTel integrations, traces/metrics/logs unified
  Integrate: ~1 day | Build: N/A
  Status: OTel JS SDK stable | License: Apache-2.0
  Source: https://opentelemetry.io/ | https://grafana.com/
  Stack: OTel SDK → Grafana Tempo (traces) + Loki (logs) + Mimir (metrics)
  Confidence: HIGH | Wrong probability: 10% (may need paid tier at scale)
REJECTED: Datadog — expensive ($15/host/month+)
REJECTED: New Relic — expensive at scale
NOTE: Start with Grafana Cloud free tier. Upgrade or self-host if limits hit.
```

#### CAPABILITY: CI/CD Pipeline
```
CHOSEN: GitHub Actions
  Why: Native GitHub integration, free for public repos, generous free minutes for private,
       excellent Node.js/TypeScript support, matrix builds, caching, OIDC deploy
  Integrate: ~0.5 day (workflow files) | Build: N/A
  Status: Stable, widely adopted | License: N/A (service)
  Source: https://github.com/features/actions
  Pipeline: lint → type-check → test → security scan → build → deploy
  Confidence: HIGH | Wrong probability: 3%
REJECTED: GitLab CI — project already on GitHub
REJECTED: CircleCI — more expensive, less native integration
```

#### CAPABILITY: Deployment Platform
```
CHOSEN: Railway (initial) → Fly.io (scale)
  Why: Railway for fastest deploy experience during MVP (git push → production),
       built-in PostgreSQL/Redis provisioning, environment management.
       Migrate to Fly.io when global distribution needed.
  Status: Both active, well-funded | License: N/A (service)
  Source: https://railway.app/ | https://fly.io/
  Services: API server, KeyCloak, Redis, PostgreSQL, worker processes
  Confidence: MEDIUM | Wrong probability: 20% (deployment platform is most swappable)
  NOTE: PM should confirm. VPS (DigitalOcean/Hetzner) also viable if cost-sensitive.
REJECTED: Vercel — frontend-focused, not ideal for Express + KeyCloak + Redis
REJECTED: AWS/GCP — overkill ops burden for MVP team size
```

#### CAPABILITY: Security Scanning
```
CHOSEN: npm audit + Snyk (free tier) + GitHub Dependabot
  Why: npm audit built-in, Snyk catches more CVEs, Dependabot auto-PRs for updates
  Integrate: ~0.5 day | Build: N/A
  Status: All stable | License: Free tiers sufficient
  Confidence: HIGH | Wrong probability: 5%
```

### 1.4 Removals (Post-Migration)

| Package | Reason | Replacement |
|---|---|---|
| `firebase` | Replaced by PostgreSQL + KeyCloak + Supabase Storage | Drizzle + KeyCloak + Supabase |
| `openai` | Evaluate: if unused (only Gemini active), remove | @google/genai only |
| `cors` (npm) | Replace with Helmet's built-in CORS or explicit config | helmet + custom CORS |

---

## 2. SYSTEM ARCHITECTURE

### 2.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│  React 19 + Vite + TypeScript + Tailwind + Radix UI + Zustand  │
│  Orval-generated React Query hooks ←→ OpenAPI spec              │
│  oidc-spa (KeyCloak OIDC/PKCE)                                  │
│  Service Worker (PWA / offline)                                  │
└─────────────────┬───────────────────────────────────────────────┘
                  │ HTTPS (TLS 1.3)
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API GATEWAY / Express                        │
│  Helmet │ CORS │ Rate Limit │ Pino Logger │ Request ID          │
│  KeyCloak Token Introspection (RBAC middleware)                  │
│  Zod Input Validation │ OpenAPI spec enforcement                 │
├─────────────────────────────────────────────────────────────────┤
│                      ROUTE LAYER (/api/v1/*)                    │
│  auth │ users │ courses │ chapters │ quizzes │ progress          │
│  marketplace │ cart │ payments │ billing │ learning-paths         │
│  instructor │ assignments │ admin │ settings │ ai │ media        │
├─────────────────────────────────────────────────────────────────┤
│                     SERVICE LAYER                                │
│  AuthService │ CourseService │ AIService │ PaymentService        │
│  StorageService │ EmailService │ ProgressService │ AdminService  │
├─────────────────────────────────────────────────────────────────┤
│                    REPOSITORY LAYER (Drizzle ORM)                │
│  UserRepo │ CourseRepo │ ProgressRepo │ PaymentRepo │ etc.       │
└──────┬──────────┬──────────┬──────────┬─────────────────────────┘
       │          │          │          │
       ▼          ▼          ▼          ▼
┌──────────┐ ┌────────┐ ┌────────────┐ ┌──────────────────┐
│PostgreSQL│ │ Redis  │ │ Supabase   │ │ External APIs    │
│(Drizzle) │ │        │ │ Storage    │ │                  │
│          │ │ Cache  │ │            │ │ Gemini (AI)      │
│ Users    │ │ Rate   │ │ Avatars    │ │ Stripe (Pay)     │
│ Courses  │ │ Limits │ │ Media      │ │ KeyCloak (Auth)  │
│ Progress │ │ Session│ │ Uploads    │ │ Resend (Email)   │
│ Payments │ │        │ │            │ │                  │
│ etc.     │ ├────────┤ └────────────┘ └──────────────────┘
│          │ │ BullMQ │
│          │ │ Queues │
│          │ │        │
│          │ │ ai-gen │
│          │ │ media  │
│          │ │ email  │
└──────────┘ └────────┘
       ▲          ▲
       │          │
┌──────┴──────────┴───────────────────────────────────────────────┐
│                    WORKER PROCESSES                               │
│  AI Generation Worker │ Media Processing Worker │ Email Worker   │
│  (Separate Node processes consuming BullMQ queues)               │
└─────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OBSERVABILITY                                  │
│  OpenTelemetry SDK → Grafana Cloud                               │
│  Pino logs → Loki │ Metrics → Mimir │ Traces → Tempo            │
│  Bull Board (queue dashboard, admin-only)                        │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Request Flow (Example: AI Course Generation)

```
1. Client: POST /api/v1/courses/generate (file + config)
2. Express: Helmet → CORS → Rate Limit → Pino log → Request ID
3. RBAC Middleware: KeyCloak token introspection → role check (student+)
4. Zod: Validate request body against GenerateCourseSchema
5. CourseService: Save draft course to PostgreSQL (status: "generating")
6. CourseService: Enqueue job to BullMQ "ai-generation" queue
7. Response: 202 Accepted { jobId, statusUrl: "/api/v1/jobs/{jobId}" }
8. Worker: AI Generation Worker picks up job from Redis queue
9. Worker: Calls Gemini API → generates chapters → saves to PostgreSQL
10. Worker: Updates job status → emits SSE event to client
11. Client: React Query polls /api/v1/jobs/{jobId} → receives completed course
```

### 2.3 Component Communication

| From | To | Protocol | Notes |
|---|---|---|---|
| Browser → API | HTTPS | REST (OpenAPI) | All requests authenticated via OIDC bearer token |
| API → PostgreSQL | TCP | Drizzle ORM (pg driver) | Connection pooling (max 20 per instance) |
| API → Redis | TCP | ioredis | Shared: BullMQ queues + rate limiting + session cache |
| API → Supabase | HTTPS | Supabase JS SDK | Pre-signed URLs for uploads, public URLs for reads |
| API → KeyCloak | HTTPS | OIDC/OAuth2 | Token introspection, user management API |
| API → Gemini | HTTPS | @google/genai SDK | Via BullMQ workers, not direct from request handlers |
| API → Stripe | HTTPS | stripe SDK | Payment intents, checkout sessions, webhooks |
| API → Resend | HTTPS | resend SDK | Transactional emails (purchase, reset, reminders) |
| API → Client (async) | HTTPS | SSE (Server-Sent Events) | Job progress, real-time notifications |
| Workers → Redis | TCP | BullMQ | Job consumption, status updates |
| Workers → PostgreSQL | TCP | Drizzle ORM | Write results (courses, media refs) |

### 2.4 Caching Strategy

| Layer | Tool | TTL | What |
|---|---|---|---|
| CDN | Supabase Storage CDN | 1yr | Static assets (avatars, images, audio) |
| Application | Redis | 5min | Course metadata, user profiles, marketplace listings |
| Application | Redis | 1hr | Platform stats (admin dashboard) |
| Client | React Query | 30s (staleTime) | API responses (auto-refetch on window focus) |
| Client | Service Worker | Workbox rules | PWA offline cache (fonts, static assets) |
| Database | PostgreSQL | N/A | Materialized views for analytics queries |

### 2.5 ADR-001: Keep Express over Fastify/Hono

**Context:** The PRD requires a production-grade backend. Fastify is 2-3x faster. Hono is the modern default for greenfield. Express is already in codebase.

**Options:**
- A: Migrate to Fastify — better perf, built-in validation/serialization
- B: Migrate to Hono — modern, TypeScript-first, edge-ready
- C: Keep Express, harden with middleware

**Decision:** **C — Keep Express.** The MVP is a production refactoring, not a rewrite. Migrating the backend framework during a database + auth + storage migration adds compounding risk. Express's middleware ecosystem (Helmet, Multer, CORS, Passport) is immediately available. Performance difference (Express 20K rps vs Fastify 70K rps) is irrelevant at MVP scale (<1K concurrent users).

**Consequences:** Accept lower theoretical throughput. Revisit post-MVP if p95 >200ms target is not met.

**Sources:** [Fastify vs Express vs Hono comparison](https://betterstack.com/community/guides/scaling-nodejs/fastify-vs-express-vs-hono/) | [Express vs Hono 2026](https://www.pkgpulse.com/blog/express-vs-hono-2026)

---

## 3. SECURITY MODEL

### 3.1 Authentication Architecture

```
┌─────────┐    OIDC/PKCE     ┌──────────┐    Token        ┌─────────┐
│ Browser  │ ──────────────→  │ KeyCloak │  Introspection  │ Express │
│ oidc-spa │ ←────────────── │ v26.5    │ ←────────────→  │ API     │
│          │   Access Token   │          │   Valid/Invalid  │         │
└─────────┘   (in-memory)    └──────────┘                  └─────────┘
```

**Flow:**
1. User clicks "Sign In" → `oidc-spa` redirects to KeyCloak login page
2. User authenticates (Google OAuth, email/password, future SSO)
3. KeyCloak issues: Access Token (JWT, 5min TTL) + Refresh Token (30min TTL)
4. `oidc-spa` stores tokens **in-memory only** (not localStorage — XSS protection)
5. Every API request: `Authorization: Bearer <access_token>`
6. Express middleware: introspects token with KeyCloak → extracts `realm_roles`
7. Token refresh: `oidc-spa` handles automatically before expiry, multi-tab sync

**KeyCloak Realm Config:**
- Realm: `lumina`
- Clients: `lumina-spa` (public, PKCE), `lumina-api` (confidential, service account)
- Identity Providers: Google (MVP), GitHub (post-MVP), Microsoft (enterprise)
- Roles: `student`, `teacher`, `admin` (realm-level)
- Token settings: Access 5min, Refresh 30min, SSO session 8hr

### 3.2 Authorization (RBAC)

**Role Hierarchy:** `admin` > `teacher` > `student` > `anonymous`

**Middleware Chain:**
```typescript
// Applied to every /api/v1/* route
app.use('/api/v1', authenticate);  // Verify JWT → req.user
app.use('/api/v1', authorize);     // Check role against route permission map

// Permission map (config, not hardcoded)
const permissions = {
  'POST /courses/generate':   ['student', 'teacher', 'admin'],
  'GET  /admin/stats':        ['admin'],
  'POST /assignments':        ['teacher', 'admin'],
  'GET  /instructor/analytics':['teacher', 'admin'],
  'DELETE /admin/clear':       ['admin'],
  // ... all routes mapped
};
```

**Resource-Level Authorization (beyond role):**
- Course content: `course.creatorId === user.id || user.role === 'admin' || user.subscription.active || course.price === 0` (BR-01, BR-06, BR-08)
- Assignments: teacher can only manage own course assignments
- User data: users can only access own profile/billing/progress (IDOR prevention)

### 3.3 Secrets Management

| Secret | Storage | Rotation |
|---|---|---|
| Database credentials | Environment variables (Railway/Fly secrets) | 90 days |
| KeyCloak client secret | Environment variables | 90 days |
| Stripe API keys | Environment variables | On compromise |
| Gemini API key | Environment variables | 90 days |
| Supabase service key | Environment variables | 90 days |
| Resend API key | Environment variables | 90 days |
| JWT signing key | KeyCloak managed | KeyCloak auto-rotation |
| Redis password | Environment variables | 90 days |

**Rules:**
- NEVER in code, git, or client bundles
- `.env` in `.gitignore` (verified)
- Startup validation: Zod schema validates ALL required env vars → fail-fast if missing
- CI/CD: GitHub Actions secrets (encrypted at rest)

### 3.4 CORS Policy

```typescript
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL,          // e.g., https://lumina.app
    process.env.KEYCLOAK_URL,          // KeyCloak redirects
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24hr preflight cache
};
```

### 3.5 Content Security Policy (via Helmet)

```typescript
helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],  // Tailwind requires
    imgSrc: ["'self'", "data:", "https://*.supabase.co", "https://lh3.googleusercontent.com"],
    connectSrc: ["'self'", process.env.API_URL, process.env.KEYCLOAK_URL,
                  "https://generativelanguage.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
  },
});
```

### 3.6 Rate Limiting Strategy

| Endpoint Category | Limit | Window | Store |
|---|---|---|---|
| Public (landing, health) | 100 req | 15 min | Memory |
| Auth (login, register) | 10 req | 15 min | Redis |
| API (authenticated) | 200 req | 15 min | Redis |
| AI generation | 5 req | 1 hr | Redis |
| File upload | 10 req | 1 hr | Redis |
| Payment | 10 req | 15 min | Redis |
| Admin | 500 req | 15 min | Redis |

**Tiered by subscription:** Pro users get 2x limits. Enterprise: custom.

### 3.7 OWASP 2025 Top 10 Mitigations

| # | Risk | Mitigation |
|---|---|---|
| A01 | Broken Access Control | RBAC middleware + resource-level auth + IDOR checks on every endpoint |
| A02 | Security Misconfiguration | Helmet defaults, env validation at startup, no debug in prod |
| A03 | Injection (SQL, XSS, Command) | Drizzle parameterized queries (zero string interpolation), React auto-escapes JSX, Zod input validation, no `eval()` |
| A04 | Insecure Design | Threat model per feature, principle of least privilege, defense in depth |
| A05 | Security Logging & Monitoring | Pino structured logging, OpenTelemetry traces, Grafana alerts |
| A06 | Vulnerable Components | npm audit + Snyk + Dependabot, automated PR scanning |
| A07 | Auth Failures | KeyCloak (battle-tested), PKCE, token rotation, brute-force protection |
| A08 | Data Integrity Failures | Stripe webhook signature verification, CI/CD pipeline integrity |
| A09 | Security Logging | Pino request/response logging with request IDs, error context |
| A10 | SSRF | No user-controllable URLs in server-side requests (AI prompts sanitized) |

### 3.8 Data Protection

- **Encryption in transit:** TLS 1.3 on all connections
- **Encryption at rest:** PostgreSQL disk encryption (managed by Railway/Fly), Supabase encrypts at rest
- **PII handling:** User email, name, avatar URL stored in PostgreSQL. Deletion cascade on account deletion (GDPR Art. 17)
- **FERPA awareness:** Student progress/grades treated as education records. Access restricted to student + admin.
- **Cookie policy:** HttpOnly, Secure, SameSite=Lax for CSRF protection. No sensitive data in cookies (tokens in-memory via oidc-spa).

---

## 4. DATA MODEL

### 4.1 Entity Relationship Overview

```
users 1──M courses (creator)
users 1──M user_progress (learner)
users 1──M purchases
users 1──M notes
users 1──M quiz_attempts
users 1──M subscriptions
users 1──M chat_messages

courses 1──M chapters
courses 1──M purchases
courses 1──M coupons
courses M──M cart_items ──M users

chapters 1──M quiz_questions
chapters 1──M notes
chapters 1──M chat_messages
chapters 1──M media_assets

assignments 1──M submissions
submissions 1──M reviews

courses 1──M assignments (teacher)
```

### 4.2 Table Definitions (Drizzle Schema)

> All tables use `gen_random_uuid()` for PKs, `created_at`/`updated_at` timestamps, soft delete where noted.

#### users
```
users
├── id              UUID PK DEFAULT gen_random_uuid()
├── keycloak_id     VARCHAR(255) UNIQUE NOT NULL  -- KeyCloak subject ID
├── email           VARCHAR(255) UNIQUE NOT NULL
├── display_name    VARCHAR(100)
├── avatar_url      TEXT                          -- Supabase Storage URL
├── role            ENUM('student','teacher','admin') DEFAULT 'student'
├── xp              INTEGER DEFAULT 0
├── streak          INTEGER DEFAULT 0
├── last_active     TIMESTAMPTZ
├── preferences     JSONB DEFAULT '{}'            -- {dyslexicFont, theme, notifications}
├── created_at      TIMESTAMPTZ DEFAULT now()
├── updated_at      TIMESTAMPTZ DEFAULT now()
└── deleted_at      TIMESTAMPTZ                   -- soft delete (GDPR)
INDEXES: keycloak_id (unique), email (unique), role
```

#### courses
```
courses
├── id              UUID PK
├── creator_id      UUID FK → users.id NOT NULL
├── title           VARCHAR(255) NOT NULL
├── description     TEXT
├── level           ENUM('beginner','intermediate','advanced')
├── tone            VARCHAR(50)
├── category        VARCHAR(100)
├── price           DECIMAL(10,2) DEFAULT 0.00
├── currency        CHAR(3) DEFAULT 'USD'
├── status          ENUM('draft','generating','published','archived') DEFAULT 'draft'
├── is_marketplace  BOOLEAN DEFAULT false
├── source_file_url TEXT                          -- Supabase Storage ref
├── source_type     ENUM('pdf','md','txt','image','youtube')
├── thumbnail_url   TEXT
├── batch_count     INTEGER DEFAULT 1             -- number of generation batches
├── created_at      TIMESTAMPTZ DEFAULT now()
├── updated_at      TIMESTAMPTZ DEFAULT now()
└── deleted_at      TIMESTAMPTZ
INDEXES: creator_id, status, category, is_marketplace, (title gin_trgm for full-text search)
```

#### chapters
```
chapters
├── id              UUID PK
├── course_id       UUID FK → courses.id ON DELETE CASCADE NOT NULL
├── batch_index     INTEGER NOT NULL              -- which generation batch
├── chapter_index   INTEGER NOT NULL              -- order within course
├── title           VARCHAR(255) NOT NULL
├── content         TEXT NOT NULL                  -- Markdown
├── visual_metadata JSONB                         -- {type, prompt, description}
├── created_at      TIMESTAMPTZ DEFAULT now()
├── updated_at      TIMESTAMPTZ DEFAULT now()
INDEXES: course_id + chapter_index (unique), batch_index
```

#### quiz_questions
```
quiz_questions
├── id              UUID PK
├── chapter_id      UUID FK → chapters.id ON DELETE CASCADE NOT NULL
├── question        TEXT NOT NULL
├── options         JSONB NOT NULL                -- ["Option A", "Option B", ...]
├── correct_index   INTEGER NOT NULL
├── explanation     TEXT
├── order_index     INTEGER DEFAULT 0
INDEXES: chapter_id
```

#### quiz_attempts
```
quiz_attempts
├── id              UUID PK
├── user_id         UUID FK → users.id NOT NULL
├── chapter_id      UUID FK → chapters.id NOT NULL
├── answers         JSONB NOT NULL                -- {questionId: selectedIndex}
├── score           DECIMAL(5,2) NOT NULL
├── created_at      TIMESTAMPTZ DEFAULT now()
INDEXES: user_id + chapter_id, user_id
```

#### user_progress
```
user_progress
├── id              UUID PK
├── user_id         UUID FK → users.id NOT NULL
├── course_id       UUID FK → courses.id NOT NULL
├── last_chapter_index INTEGER DEFAULT 0
├── completed_chapters JSONB DEFAULT '[]'         -- [chapterIndex, ...]
├── skipped_chapters   JSONB DEFAULT '[]'
├── percent_complete   DECIMAL(5,2) DEFAULT 0.00
├── started_at      TIMESTAMPTZ DEFAULT now()
├── completed_at    TIMESTAMPTZ                   -- null until 100%
├── updated_at      TIMESTAMPTZ DEFAULT now()
UNIQUE: (user_id, course_id)
INDEXES: user_id, course_id
```

#### purchases
```
purchases
├── id              UUID PK
├── user_id         UUID FK → users.id NOT NULL
├── course_id       UUID FK → courses.id NOT NULL
├── stripe_payment_id VARCHAR(255) UNIQUE
├── amount          DECIMAL(10,2) NOT NULL
├── currency        CHAR(3) DEFAULT 'USD'
├── status          ENUM('pending','completed','refunded','failed') DEFAULT 'pending'
├── coupon_id       UUID FK → coupons.id          -- nullable
├── created_at      TIMESTAMPTZ DEFAULT now()
INDEXES: user_id, course_id, stripe_payment_id (unique)
UNIQUE: (user_id, course_id) -- one purchase per user per course
```

#### subscriptions
```
subscriptions
├── id              UUID PK
├── user_id         UUID FK → users.id UNIQUE NOT NULL
├── stripe_subscription_id VARCHAR(255) UNIQUE
├── plan            ENUM('free','pro','enterprise') DEFAULT 'free'
├── status          ENUM('active','canceled','past_due','trialing') DEFAULT 'active'
├── current_period_start TIMESTAMPTZ
├── current_period_end   TIMESTAMPTZ
├── created_at      TIMESTAMPTZ DEFAULT now()
├── updated_at      TIMESTAMPTZ DEFAULT now()
INDEXES: user_id (unique), stripe_subscription_id (unique), status
```

#### notes
```
notes
├── id              UUID PK
├── user_id         UUID FK → users.id NOT NULL
├── chapter_id      UUID FK → chapters.id NOT NULL
├── content         TEXT NOT NULL
├── created_at      TIMESTAMPTZ DEFAULT now()
├── updated_at      TIMESTAMPTZ DEFAULT now()
INDEXES: user_id + chapter_id
```

#### chat_messages
```
chat_messages
├── id              UUID PK
├── user_id         UUID FK → users.id NOT NULL
├── chapter_id      UUID FK → chapters.id NOT NULL
├── role            ENUM('user','assistant') NOT NULL
├── content         TEXT NOT NULL
├── created_at      TIMESTAMPTZ DEFAULT now()
INDEXES: user_id + chapter_id + created_at
```

#### media_assets
```
media_assets
├── id              UUID PK
├── chapter_id      UUID FK → chapters.id ON DELETE CASCADE
├── course_id       UUID FK → courses.id ON DELETE CASCADE
├── type            ENUM('image','audio','video') NOT NULL
├── storage_path    TEXT NOT NULL                  -- Supabase Storage path
├── public_url      TEXT
├── mime_type       VARCHAR(100)
├── size_bytes      BIGINT
├── metadata        JSONB                         -- {duration, width, height, etc.}
├── created_at      TIMESTAMPTZ DEFAULT now()
INDEXES: chapter_id, course_id, type
```

#### cart_items
```
cart_items
├── id              UUID PK
├── user_id         UUID FK → users.id NOT NULL
├── course_id       UUID FK → courses.id NOT NULL
├── added_at        TIMESTAMPTZ DEFAULT now()
UNIQUE: (user_id, course_id)
INDEXES: user_id
```

#### coupons
```
coupons
├── id              UUID PK
├── course_id       UUID FK → courses.id NOT NULL
├── creator_id      UUID FK → users.id NOT NULL   -- teacher who created it
├── code            VARCHAR(50) UNIQUE NOT NULL
├── discount_percent DECIMAL(5,2) NOT NULL         -- 0-100
├── max_uses        INTEGER
├── current_uses    INTEGER DEFAULT 0
├── expires_at      TIMESTAMPTZ
├── created_at      TIMESTAMPTZ DEFAULT now()
INDEXES: code (unique), course_id, creator_id
```

#### assignments
```
assignments
├── id              UUID PK
├── course_id       UUID FK → courses.id NOT NULL
├── creator_id      UUID FK → users.id NOT NULL   -- teacher
├── title           VARCHAR(255) NOT NULL
├── description     TEXT
├── due_date        TIMESTAMPTZ
├── created_at      TIMESTAMPTZ DEFAULT now()
├── updated_at      TIMESTAMPTZ DEFAULT now()
INDEXES: course_id, creator_id
```

#### submissions
```
submissions
├── id              UUID PK
├── assignment_id   UUID FK → assignments.id NOT NULL
├── student_id      UUID FK → users.id NOT NULL
├── content         TEXT NOT NULL
├── submitted_at    TIMESTAMPTZ DEFAULT now()
├── grade           DECIMAL(5,2)                  -- nullable until graded
UNIQUE: (assignment_id, student_id)
INDEXES: assignment_id, student_id
```

#### reviews (peer review)
```
reviews
├── id              UUID PK
├── submission_id   UUID FK → submissions.id NOT NULL
├── reviewer_id     UUID FK → users.id NOT NULL
├── feedback        TEXT NOT NULL
├── rating          INTEGER CHECK (1-5)
├── created_at      TIMESTAMPTZ DEFAULT now()
UNIQUE: (submission_id, reviewer_id) -- one review per reviewer per submission
INDEXES: submission_id, reviewer_id
```

#### videos (Video Studio)
```
videos
├── id              UUID PK
├── creator_id      UUID FK → users.id NOT NULL
├── title           VARCHAR(255) NOT NULL
├── prompt          TEXT
├── style           VARCHAR(50)
├── voice           VARCHAR(50)
├── audience        VARCHAR(100)
├── objectives      TEXT
├── scenes          JSONB                         -- [{narration, visualDescription, imageUrl, audioUrl}]
├── status          ENUM('draft','generating','complete') DEFAULT 'draft'
├── created_at      TIMESTAMPTZ DEFAULT now()
├── updated_at      TIMESTAMPTZ DEFAULT now()
INDEXES: creator_id, status
```

#### certificates
```
certificates
├── id              UUID PK
├── user_id         UUID FK → users.id NOT NULL
├── course_id       UUID FK → courses.id NOT NULL
├── issued_at       TIMESTAMPTZ DEFAULT now()
├── verification_code VARCHAR(20) UNIQUE NOT NULL
├── pdf_url         TEXT                          -- Supabase Storage
UNIQUE: (user_id, course_id)
INDEXES: verification_code (unique)
```

#### job_logs (BullMQ audit)
```
job_logs
├── id              UUID PK
├── queue_name      VARCHAR(100) NOT NULL
├── job_id          VARCHAR(255) NOT NULL
├── user_id         UUID FK → users.id
├── status          ENUM('queued','active','completed','failed','stalled')
├── payload_hash    VARCHAR(64)                   -- idempotency check
├── error_message   TEXT
├── started_at      TIMESTAMPTZ
├── completed_at    TIMESTAMPTZ
├── created_at      TIMESTAMPTZ DEFAULT now()
INDEXES: queue_name + job_id, user_id, status
```

### 4.3 Migration Strategy

- **Tool:** Drizzle Kit (`drizzle-kit generate` → `drizzle-kit migrate`)
- **Naming:** `NNNN_description.sql` (e.g., `0001_create_users.sql`)
- **Direction:** Forward-only migrations. Rollback via restore from backup (AC-MIG-07).
- **Seed data:** Platform-curated courses (BR-04), admin user, test data for dev/staging
- **Firebase migration scripts:** Sprint 1 (write), Sprint 5 (dry-run), Sprint 6 (execute)

---

## 5. PROJECT STRUCTURE

### 5.1 Monorepo Layout

**ADR-002: Monorepo with shared packages** — Client and server in one repo with shared Zod schemas and TypeScript types. Simpler CI/CD, atomic commits across FE/BE, shared validation logic. Not a workspace monorepo (no Turborepo/Nx) — just organized directories. Revisit if team grows past 5.

```
lumina/
├── .github/
│   └── workflows/
│       ├── ci.yml                  # lint → type-check → test → build
│       ├── deploy-staging.yml
│       └── deploy-production.yml
├── docs/                           # All project documentation
│   ├── CLIENT.txt
│   ├── PRD.md
│   ├── Tech_Blueprint.md
│   ├── BA_Research_Report.md
│   ├── contextlog.md
│   ├── gapslog.md
│   └── buglog.md
├── packages/
│   └── shared/                     # Shared between FE and BE
│       ├── schemas/                # Zod validation schemas
│       │   ├── auth.schema.ts
│       │   ├── course.schema.ts
│       │   ├── payment.schema.ts
│       │   └── index.ts
│       ├── types/                  # Shared TypeScript types
│       │   ├── user.types.ts
│       │   ├── course.types.ts
│       │   ├── api.types.ts
│       │   └── index.ts
│       └── constants/              # Shared constants
│           ├── roles.ts
│           ├── limits.ts
│           └── index.ts
├── server/
│   ├── src/
│   │   ├── app.ts                  # Express app setup (middleware chain)
│   │   ├── server.ts               # Server entry point (listen + graceful shutdown)
│   │   ├── config/
│   │   │   ├── env.ts              # Zod-validated env vars (fail-fast)
│   │   │   ├── database.ts         # Drizzle + pg pool config
│   │   │   ├── redis.ts            # Redis/BullMQ config
│   │   │   ├── keycloak.ts         # KeyCloak OIDC config
│   │   │   ├── supabase.ts         # Supabase client config
│   │   │   └── stripe.ts           # Stripe config
│   │   ├── db/
│   │   │   ├── schema/             # Drizzle table schemas
│   │   │   │   ├── users.ts
│   │   │   │   ├── courses.ts
│   │   │   │   ├── chapters.ts
│   │   │   │   ├── progress.ts
│   │   │   │   ├── payments.ts
│   │   │   │   ├── media.ts
│   │   │   │   └── index.ts        # Re-exports all schemas
│   │   │   ├── migrations/         # Drizzle Kit generated SQL
│   │   │   ├── seed.ts             # Seed data (dev/staging)
│   │   │   └── index.ts            # Drizzle client instance
│   │   ├── middleware/
│   │   │   ├── authenticate.ts     # KeyCloak token introspection → req.user
│   │   │   ├── authorize.ts        # RBAC check against permission map
│   │   │   ├── validate.ts         # Zod schema validation factory
│   │   │   ├── rate-limit.ts       # Rate limiting config
│   │   │   ├── error-handler.ts    # Global error handler
│   │   │   └── request-id.ts       # Attach unique ID to every request
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── course.routes.ts
│   │   │   ├── chapter.routes.ts
│   │   │   ├── quiz.routes.ts
│   │   │   ├── progress.routes.ts
│   │   │   ├── marketplace.routes.ts
│   │   │   ├── cart.routes.ts
│   │   │   ├── payment.routes.ts
│   │   │   ├── billing.routes.ts
│   │   │   ├── subscription.routes.ts
│   │   │   ├── instructor.routes.ts
│   │   │   ├── assignment.routes.ts
│   │   │   ├── admin.routes.ts
│   │   │   ├── settings.routes.ts
│   │   │   ├── ai.routes.ts
│   │   │   ├── media.routes.ts
│   │   │   ├── job.routes.ts       # Job status polling
│   │   │   └── index.ts            # Mount all route groups
│   │   ├── services/               # Business logic (no HTTP awareness)
│   │   │   ├── auth.service.ts
│   │   │   ├── course.service.ts
│   │   │   ├── ai.service.ts
│   │   │   ├── payment.service.ts
│   │   │   ├── storage.service.ts
│   │   │   ├── email.service.ts
│   │   │   ├── progress.service.ts
│   │   │   ├── admin.service.ts
│   │   │   └── certificate.service.ts
│   │   ├── repositories/           # Data access (Drizzle queries only)
│   │   │   ├── user.repo.ts
│   │   │   ├── course.repo.ts
│   │   │   ├── chapter.repo.ts
│   │   │   ├── progress.repo.ts
│   │   │   ├── payment.repo.ts
│   │   │   └── ...
│   │   ├── queues/                 # BullMQ queue definitions + workers
│   │   │   ├── queues.ts           # Queue instances (ai-gen, media, email)
│   │   │   ├── workers/
│   │   │   │   ├── ai-generation.worker.ts
│   │   │   │   ├── media-processing.worker.ts
│   │   │   │   └── email.worker.ts
│   │   │   └── board.ts            # Bull Board admin UI setup
│   │   ├── lib/                    # Utilities
│   │   │   ├── logger.ts           # Pino instance
│   │   │   ├── errors.ts           # Custom error classes (AppError, NotFoundError, etc.)
│   │   │   └── pagination.ts       # Cursor/offset pagination helpers
│   │   └── __tests__/              # Server unit + integration tests
│   ├── drizzle.config.ts           # Drizzle Kit config
│   ├── tsconfig.json               # Server-specific TS config (strict: true)
│   └── package.json                # Server dependencies
├── client/
│   ├── src/
│   │   ├── main.tsx                # React entry point
│   │   ├── App.tsx                 # Router + providers
│   │   ├── api/                    # Orval-generated React Query hooks
│   │   │   └── generated/          # DO NOT EDIT (auto-generated by Orval)
│   │   ├── components/
│   │   │   ├── ui/                 # Radix-based design system primitives
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Dialog.tsx
│   │   │   │   ├── Toast.tsx
│   │   │   │   └── ...
│   │   │   ├── layout/             # Shell components
│   │   │   │   ├── Layout.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   └── course/             # CourseView decomposition (T-3.0.1)
│   │   │       ├── ChapterNavigation.tsx
│   │   │       ├── QuizPanel.tsx
│   │   │       ├── AudioPlayer.tsx
│   │   │       ├── VisualGenerator.tsx
│   │   │       ├── TutorChat.tsx
│   │   │       ├── NotesPanel.tsx
│   │   │       ├── VideoPlayer.tsx
│   │   │       ├── OfflineManager.tsx
│   │   │       ├── CertificateModal.tsx
│   │   │       └── ProgressTracker.tsx
│   │   ├── pages/                  # Route-level page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── CourseView.tsx      # Orchestrator (delegates to components/course/*)
│   │   │   ├── CourseBuilder.tsx
│   │   │   ├── Marketplace.tsx
│   │   │   ├── Settings.tsx
│   │   │   ├── Billing.tsx
│   │   │   ├── LearningPaths.tsx
│   │   │   ├── AdminPanel.tsx
│   │   │   ├── InstructorAnalytics.tsx
│   │   │   ├── VideoStudio.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   └── LoginPage.tsx
│   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── useAuth.ts          # oidc-spa wrapper
│   │   │   └── useTheme.ts
│   │   ├── stores/                 # Zustand stores
│   │   │   ├── cart.store.ts
│   │   │   ├── ui.store.ts
│   │   │   └── auth.store.ts
│   │   ├── providers/              # React context providers
│   │   │   ├── AuthProvider.tsx     # oidc-spa + user profile
│   │   │   ├── ThemeProvider.tsx
│   │   │   └── QueryProvider.tsx    # React Query client
│   │   ├── lib/                    # Client utilities
│   │   │   ├── supabase.ts         # Supabase client (storage only)
│   │   │   └── format.ts           # Date/currency formatters
│   │   └── __tests__/              # Client unit + component tests
│   ├── public/                     # Static assets
│   ├── index.html
│   ├── vite.config.ts
│   ├── orval.config.ts             # Orval code generation config
│   ├── tsconfig.json               # Client-specific TS config (strict: true)
│   └── package.json                # Client dependencies
├── e2e/                            # Playwright E2E tests
│   ├── tests/
│   │   ├── auth.spec.ts
│   │   ├── course-builder.spec.ts
│   │   ├── course-view.spec.ts
│   │   ├── marketplace.spec.ts
│   │   ├── payment.spec.ts
│   │   └── admin.spec.ts
│   └── playwright.config.ts
├── openapi/
│   └── lumina-api.yaml             # OpenAPI 3.0 spec (source of truth for API)
├── .env.example                    # Template (never real values)
├── .gitignore
├── docker-compose.yml              # Local dev: PostgreSQL + Redis + KeyCloak
├── package.json                    # Root: scripts for dev, build, test, generate
├── tsconfig.base.json              # Shared TS config (strict: true)
├── CLAUDE.md
└── README.md
```

### 5.2 Key Structural Decisions

**Layer separation (server):** Routes → Services → Repositories → Database
- Routes: HTTP concerns only (parse request, call service, send response)
- Services: Business logic (no HTTP, no Drizzle queries)
- Repositories: Data access (Drizzle queries only, no business logic)
- This enables: unit testing services with mock repos, swapping DB without touching business logic

**Feature grouping (client):** Pages for routes, components for reusability
- `pages/` = one file per route, orchestrates components
- `components/ui/` = design system (Radix wrappers, shared across all pages)
- `components/course/` = CourseView decomposition (T-3.0.1, 10 sub-components)
- `api/generated/` = Orval output (never hand-edit)

---

## 6. DESIGN PATTERNS

### 6.1 Patterns Used

| Pattern | Where | Why |
|---|---|---|
| **Repository** | `server/repositories/*.repo.ts` | Isolate data access from business logic. Services never call Drizzle directly. |
| **Service Layer** | `server/services/*.service.ts` | Encapsulate business rules. Routes never contain logic beyond request/response. |
| **Factory** | Zod schema → validated object | Zod `parse()` acts as a validated object factory. No raw user input past middleware. |
| **Strategy** | AI visual generation | Different visual types (illustration, chart, flowchart) selected by content analysis. Strategy pattern picks generator. |
| **Observer** | BullMQ job events → SSE | Workers emit events on job progress. API relays to client via SSE stream. |
| **Middleware Chain** | Express middleware stack | Compose cross-cutting concerns (auth, validation, logging, rate limiting). |
| **Singleton** | DB connection, Redis client, Pino logger | One instance shared across the application. Created in config/, imported where needed. |

### 6.2 Anti-Patterns Forbidden

| Anti-Pattern | Why | Enforcement |
|---|---|---|
| God object / fat controller | Routes with business logic become untestable | PR review: routes must delegate to services |
| String SQL queries | SQL injection risk | Drizzle enforces parameterized queries. Lint rule: no `sql` template literals with interpolation |
| Firebase patterns | We're migrating away from Firebase | Lint rule: no `firebase/*` imports in new code |
| Client-side auth checks only | Bypassable via DevTools | Server-side RBAC on every endpoint. Client checks are UX only. |
| Shared mutable state | Race conditions | Zustand (immutable updates), React Query (server state), no global let/var |

---

## 7. API CONTRACTS

### 7.1 API Design Principles

- **Base URL:** `/api/v1/`
- **Format:** JSON request/response, `Content-Type: application/json`
- **Auth:** `Authorization: Bearer <access_token>` on all non-public endpoints
- **Pagination:** Cursor-based for lists (`?cursor=<id>&limit=20`)
- **Error format:** Consistent across all endpoints (see 7.3)
- **Versioning:** URL path (`/api/v1/`, `/api/v2/`). Breaking changes = new version.

### 7.2 Endpoint Inventory

> Full OpenAPI spec will be in `openapi/lumina-api.yaml`. Below is the summary.

#### Auth & Users
| Method | Path | Auth | Role | Description | PRD Ref |
|---|---|---|---|---|---|
| GET | /auth/login | Public | — | Redirect to KeyCloak | US-1.1 |
| GET | /auth/callback | Public | — | OIDC callback handler | US-1.1 |
| POST | /auth/logout | Auth | Any | Revoke session | US-1.1 |
| GET | /users/me | Auth | Any | Get current user profile | US-1.3 |
| PATCH | /users/me | Auth | Any | Update profile | US-1.3 |
| DELETE | /users/me | Auth | Any | Delete account (GDPR) | US-10.4 |
| POST | /users/me/avatar | Auth | Any | Upload avatar | US-1.3 |

#### Courses
| Method | Path | Auth | Role | Description | PRD Ref |
|---|---|---|---|---|---|
| GET | /courses | Auth | Any | List user's courses | US-6.1 |
| GET | /courses/:id | Auth | Any | Get course (access-controlled) | US-3.1 |
| POST | /courses | Auth | Student+ | Create draft course | US-2.2 |
| PATCH | /courses/:id | Auth | Owner | Update course metadata | US-2.2 |
| DELETE | /courses/:id | Auth | Owner/Admin | Delete course | US-9.2 |
| GET | /courses/:id/chapters | Auth | Authorized | List chapters | US-3.2 |
| GET | /courses/:id/chapters/:idx | Auth | Authorized | Get chapter content | US-3.2 |

#### AI & Generation
| Method | Path | Auth | Role | Description | PRD Ref |
|---|---|---|---|---|---|
| POST | /ai/generate-course | Auth | Student+ | Queue course generation | US-2.3 |
| POST | /ai/extend-course/:id | Auth | Owner | Queue chapter extension | US-2.4 |
| POST | /ai/rewrite | Auth | Student+ | Queue content rewrite | US-3.4 |
| POST | /ai/narrate | Auth | Student+ | Queue TTS generation | US-3.5 |
| POST | /ai/generate-visual | Auth | Student+ | Queue visual generation | US-3.6 |
| POST | /ai/chat | Auth | Student+ | AI tutor message | US-3.7 |
| POST | /ai/video-script | Auth | Teacher+ | Queue video script gen | US-8.1 |

#### Jobs (BullMQ status)
| Method | Path | Auth | Role | Description | PRD Ref |
|---|---|---|---|---|---|
| GET | /jobs/:id | Auth | Owner | Get job status/progress | US-11.6 |
| GET | /jobs/:id/stream | Auth | Owner | SSE stream for job progress | US-11.6 |

#### File Upload
| Method | Path | Auth | Role | Description | PRD Ref |
|---|---|---|---|---|---|
| POST | /upload | Auth | Student+ | Upload PDF/MD/TXT/image | US-2.1 |

#### Marketplace
| Method | Path | Auth | Role | Description | PRD Ref |
|---|---|---|---|---|---|
| GET | /marketplace | Auth | Any | Browse/search courses | US-4.1 |
| GET | /marketplace/:id | Auth | Any | Course preview (outline-only for paid) | US-4.2 |

#### Cart & Payments
| Method | Path | Auth | Role | Description | PRD Ref |
|---|---|---|---|---|---|
| GET | /cart | Auth | Any | Get cart items | US-4.3 |
| POST | /cart | Auth | Any | Add to cart | US-4.3 |
| DELETE | /cart/:courseId | Auth | Any | Remove from cart | US-4.3 |
| POST | /checkout | Auth | Any | Create Stripe checkout session | US-5.1 |
| POST | /webhooks/stripe | Public | — | Stripe webhook handler | US-5.1 |
| GET | /billing | Auth | Any | Purchase history | US-5.3 |
| GET | /billing/:id/receipt | Auth | Owner | Download PDF receipt | US-5.3 |
| POST | /subscriptions | Auth | Any | Create subscription checkout | US-5.2 |
| GET | /subscriptions/me | Auth | Any | Current subscription | US-10.3 |

#### Progress & Learning
| Method | Path | Auth | Role | Description | PRD Ref |
|---|---|---|---|---|---|
| GET | /progress | Auth | Any | All course progress | US-6.1 |
| GET | /progress/:courseId | Auth | Owner | Course-specific progress | US-6.2 |
| PUT | /progress/:courseId | Auth | Owner | Update progress | US-6.2 |
| POST | /quizzes/:chapterId/attempt | Auth | Student+ | Submit quiz attempt | US-3.3 |

#### Notes
| Method | Path | Auth | Role | Description | PRD Ref |
|---|---|---|---|---|---|
| GET | /notes/:chapterId | Auth | Owner | Get notes for chapter | US-3.8 |
| POST | /notes/:chapterId | Auth | Owner | Create/update note | US-3.8 |
| DELETE | /notes/:noteId | Auth | Owner | Delete note | US-3.8 |

#### Instructor
| Method | Path | Auth | Role | Description | PRD Ref |
|---|---|---|---|---|---|
| GET | /instructor/analytics | Auth | Teacher+ | Instructor dashboard data | US-7.1 |
| POST | /instructor/coupons | Auth | Teacher+ | Create coupon | US-7.3 |
| GET | /instructor/coupons | Auth | Teacher+ | List coupons | US-7.3 |

#### Assignments
| Method | Path | Auth | Role | Description | PRD Ref |
|---|---|---|---|---|---|
| POST | /assignments | Auth | Teacher+ | Create assignment | US-7.2 |
| GET | /assignments/:courseId | Auth | Any | List assignments | US-7.2 |
| POST | /assignments/:id/submit | Auth | Student | Submit work | US-7.2 |
| POST | /submissions/:id/review | Auth | Student+ | Peer review | US-7.2 |

#### Admin
| Method | Path | Auth | Role | Description | PRD Ref |
|---|---|---|---|---|---|
| GET | /admin/stats | Auth | Admin | Platform statistics | US-9.1 |
| DELETE | /admin/data | Auth | Admin | Clear all data (with confirmation) | US-9.2 |
| GET | /admin/queues | Auth | Admin | Bull Board dashboard (proxy) | US-11.6 |

#### Settings
| Method | Path | Auth | Role | Description | PRD Ref |
|---|---|---|---|---|---|
| GET | /settings | Auth | Any | Get user preferences | US-10.1-2 |
| PATCH | /settings | Auth | Any | Update preferences | US-10.1-2 |
| POST | /settings/reset-password | Auth | Any | Trigger password reset | US-10.4 |

#### Certificates
| Method | Path | Auth | Role | Description | PRD Ref |
|---|---|---|---|---|---|
| POST | /certificates/:courseId | Auth | Owner | Generate certificate | US-3.11 |
| GET | /certificates/verify/:code | Public | — | Verify certificate | US-3.11 |

#### Health
| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| GET | /health | Public | — | Health check (DB, Redis, KeyCloak status) |

### 7.3 Error Response Format

```json
{
  "error": {
    "code": "COURSE_NOT_FOUND",
    "message": "Course with ID abc123 does not exist",
    "status": 404,
    "requestId": "req_7f8a9b2c",
    "timestamp": "2026-04-11T10:30:00Z"
  }
}
```

**Error codes follow pattern:** `ENTITY_ACTION` (e.g., `COURSE_NOT_FOUND`, `AUTH_TOKEN_EXPIRED`, `PAYMENT_FAILED`, `RATE_LIMIT_EXCEEDED`, `VALIDATION_ERROR`)

### 7.4 Pagination Response Format

```json
{
  "data": [...],
  "pagination": {
    "cursor": "uuid-of-last-item",
    "hasMore": true,
    "total": 142
  }
}
```

---

## 8. INFRASTRUCTURE & CI/CD

### 8.1 Environments

| Environment | Purpose | Database | URL Pattern |
|---|---|---|---|
| **Local (dev)** | Developer machine | Docker: PostgreSQL + Redis + KeyCloak | localhost:3000 (client), :4000 (API) |
| **Staging** | Pre-production testing | Railway managed PostgreSQL + Redis | staging.lumina.app |
| **Production** | Live users | Railway/Fly.io managed PostgreSQL + Redis | lumina.app |

### 8.2 Local Development (docker-compose)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: lumina_dev
      POSTGRES_USER: lumina
      POSTGRES_PASSWORD: dev_password
    volumes: [pgdata:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    command: redis-server --requirepass dev_password

  keycloak:
    image: quay.io/keycloak/keycloak:26.5.0
    ports: ["8080:8080"]
    environment:
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
      KC_DB_USERNAME: lumina
      KC_DB_PASSWORD: dev_password
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
    command: start-dev
    depends_on: [postgres]

volumes:
  pgdata:
```

### 8.3 CI/CD Pipeline (GitHub Actions)

```
┌──────────────────────────────────────────────────────────────┐
│ on: push (main, feature/*), pull_request (main)              │
├──────────────────────────────────────────────────────────────┤
│ STAGE 1: Quality Gates (parallel)                            │
│ ┌────────────┐ ┌──────────────┐ ┌─────────────┐             │
│ │ TypeScript  │ │ ESLint       │ │ Format      │             │
│ │ tsc --noEmit│ │ lint check   │ │ check       │             │
│ └────────────┘ └──────────────┘ └─────────────┘             │
├──────────────────────────────────────────────────────────────┤
│ STAGE 2: Tests (parallel, after Stage 1)                     │
│ ┌────────────────┐ ┌────────────────┐ ┌───────────────────┐ │
│ │ Server unit    │ │ Client unit    │ │ Integration       │ │
│ │ (Vitest)       │ │ (Vitest)       │ │ (Vitest + testDB) │ │
│ └────────────────┘ └────────────────┘ └───────────────────┘ │
├──────────────────────────────────────────────────────────────┤
│ STAGE 3: Security (parallel with Stage 2)                    │
│ ┌────────────────┐ ┌────────────────┐                        │
│ │ npm audit      │ │ Snyk scan      │                        │
│ └────────────────┘ └────────────────┘                        │
├──────────────────────────────────────────────────────────────┤
│ STAGE 4: Build (after Stage 2+3 pass)                        │
│ ┌────────────────────┐ ┌────────────────────┐                │
│ │ Vite build (client)│ │ TSC build (server) │                │
│ └────────────────────┘ └────────────────────┘                │
├──────────────────────────────────────────────────────────────┤
│ STAGE 5: Deploy (main branch only, after Stage 4)            │
│ ┌──────────────────────────────────────────────────────┐     │
│ │ Deploy to staging → E2E tests (Playwright) → promote │     │
│ └──────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

**Caching:** npm dependency cache enabled (60-80% job time reduction).
**Node version:** 20.x LTS (matrix test 20 + 22 for library compat).

### 8.4 Deployment Architecture

```
                    ┌─────────────────────────────┐
                    │      Cloudflare CDN          │
                    │  (static assets, DNS, SSL)   │
                    └──────────┬──────────────────┘
                               │
              ┌────────────────┴────────────────┐
              │                                  │
    ┌─────────▼─────────┐           ┌───────────▼──────────┐
    │  Client (Static)  │           │   API Server         │
    │  Vite build →     │           │   Express + Node 20  │
    │  Railway static   │           │   Railway service    │
    │  or Cloudflare    │           │   (auto-scale)       │
    │  Pages            │           └───────────┬──────────┘
    └───────────────────┘                       │
                               ┌────────────────┼────────────────┐
                               │                │                │
                    ┌──────────▼───┐  ┌─────────▼────┐  ┌───────▼──────┐
                    │  PostgreSQL  │  │    Redis     │  │   KeyCloak   │
                    │  (Railway    │  │  (Railway    │  │  (Railway    │
                    │   managed)   │  │   managed)   │  │   service)   │
                    └──────────────┘  └──────────────┘  └──────────────┘
                                              │
                                    ┌─────────▼──────────┐
                                    │   BullMQ Workers   │
                                    │   (Railway service, │
                                    │    separate process) │
                                    └────────────────────┘
```

### 8.5 Monitoring & Alerting

| Signal | Tool | Alert Threshold |
|---|---|---|
| API p95 latency | Grafana + OTel | > 200ms for 5 min |
| Error rate (5xx) | Grafana + Pino/Loki | > 0.1% for 5 min |
| Queue depth (BullMQ) | Bull Board + Grafana | > 100 waiting jobs |
| Failed jobs | BullMQ events + Grafana | Any failed job |
| Database connections | pg pool metrics | > 80% pool used |
| CPU/Memory | Railway metrics | > 80% for 10 min |
| Disk usage | Railway metrics | > 80% |
| Certificate expiry | Uptime monitoring | < 14 days to expiry |

---

## 9. THREAT MODEL

### 9.1 Attack Surface

| Surface | Entry Point | Assets at Risk |
|---|---|---|
| Public API | `/api/v1/marketplace`, `/health`, webhooks | Course data, system info |
| Authenticated API | All `/api/v1/*` with bearer token | User data, courses, payments |
| File upload | `POST /api/v1/upload` | Server integrity (malware), storage |
| AI prompts | `POST /api/v1/ai/*` | Prompt injection → data leak |
| Stripe webhooks | `POST /api/v1/webhooks/stripe` | Payment integrity |
| KeyCloak admin | KeyCloak admin console | All user accounts |
| Bull Board | `/admin/queues` | Queue manipulation |
| Database | PostgreSQL direct (if exposed) | All data |

### 9.2 STRIDE Analysis (Critical Flows)

#### Authentication Flow
| Threat | Category | Mitigation | Priority |
|---|---|---|---|
| Token theft from storage | Spoofing | oidc-spa stores in-memory only (not localStorage) | HIGH — implemented |
| JWT manipulation | Tampering | Server-side KeyCloak introspection on every request | HIGH — implemented |
| Session fixation | Spoofing | PKCE flow, new state param per auth request | HIGH — implemented |
| Brute force login | DoS | KeyCloak brute-force protection + rate limiting | HIGH — implemented |

#### Payment Flow
| Threat | Category | Mitigation | Priority |
|---|---|---|---|
| Webhook forgery | Spoofing | Stripe signature verification (`stripe.webhooks.constructEvent`) | CRITICAL — implemented |
| Price manipulation | Tampering | Server-side price lookup at checkout (never trust client) | CRITICAL — implemented |
| Double-charge | Repudiation | Idempotency keys on Stripe API calls | HIGH — implemented |
| Access without payment | Elevation | Server-side access check: purchase record OR subscription active | CRITICAL — implemented |

#### File Upload Flow
| Threat | Category | Mitigation | Priority |
|---|---|---|---|
| Malware upload | Tampering | File type validation (magic bytes, not just extension) + virus scan (REC-03) | HIGH |
| Path traversal | Tampering | Supabase Storage handles path sanitization. Server: UUID file names only | HIGH — implemented |
| Oversized files | DoS | Multer 10MB limit + client-side check | MEDIUM — implemented |
| Storage exhaustion | DoS | Per-user upload quotas (daily/monthly) | MEDIUM |

#### AI Generation Flow
| Threat | Category | Mitigation | Priority |
|---|---|---|---|
| Prompt injection via uploaded content | Tampering | Sanitize user content before injection into AI prompts. System prompts isolated. | HIGH |
| AI-generated harmful content | Info Disclosure | Content moderation review (post-MVP). System prompt constrains output format. | MEDIUM |
| API key exposure | Info Disclosure | Server-side only. Never in client bundle. Env var validated at startup. | CRITICAL — implemented |
| Cost abuse (mass generation) | DoS | Rate limiting (5 gen/hr) + BullMQ queue depth limits | HIGH — implemented |

### 9.3 Data Classification

| Classification | Examples | Storage | Access | Encryption |
|---|---|---|---|---|
| **Public** | Published course titles, landing page | PostgreSQL | Anyone | TLS transit |
| **Internal** | Course content, chapter text | PostgreSQL | Authenticated + authorized | TLS transit, disk at rest |
| **Confidential** | User email, profile, progress | PostgreSQL | Owner + admin | TLS transit, disk at rest |
| **Restricted** | Payment data, API keys, tokens | Stripe (PCI), env vars | System only | Stripe PCI DSS, encrypted secrets |

---

## 10. ADR LOG

### ADR-001: Keep Express over Fastify/Hono
See Section 2.5.

### ADR-002: Monorepo with Shared Packages
**Context:** Need shared types/schemas between frontend and backend.
**Decision:** Single repo with `packages/shared/`, `server/`, `client/` directories. No Turborepo/Nx — overhead not justified for team size <5.
**Consequences:** Simpler CI, atomic commits. If team grows past 5 or build times exceed 5min, revisit with Turborepo.

### ADR-003: Cursor-Based Pagination over Offset
**Context:** Marketplace and course listings need pagination.
**Decision:** Cursor-based (keyset) pagination using `?cursor=<uuid>&limit=20`. Offset pagination breaks with concurrent inserts/deletes and degrades at high page numbers.
**Consequences:** Slightly more complex implementation. No "jump to page N" (acceptable for our UX — infinite scroll pattern).

### ADR-004: SSE over WebSockets for Job Progress
**Context:** Need real-time updates for AI generation job progress.
**Decision:** Server-Sent Events (SSE) over WebSockets. SSE is simpler (HTTP, unidirectional), auto-reconnects, works through proxies. WebSockets needed only for bidirectional real-time (not our case — client polls or listens).
**Consequences:** Simpler server code. If chat feature needs real-time later, can add WebSocket for that specific use case.

### ADR-005: Railway for MVP Deployment
**Context:** Need deployment platform for PostgreSQL + Redis + KeyCloak + Express + Workers.
**Decision:** Railway for MVP (simplest git-push deploy, managed databases). Migrate to Fly.io when global distribution needed.
**Consequences:** Vendor lock-in is minimal (Docker-based, portable). Cost is usage-based (~$20-50/mo for MVP).
**NOTE:** PM should confirm deployment platform choice. This is a RECOMMENDATION.

### ADR-006: Pino over Winston for Logging
**Context:** Need structured logging for production observability.
**Decision:** Pino (6.2x faster, structured JSON, OpenTelemetry native). Winston is more configurable but performance matters for p95 <200ms API target.
**Consequences:** Less flexible transport routing than Winston. Use Grafana Loki for log aggregation instead of file-based transports.

### ADR-007: Vitest + Playwright over Jest + Cypress
**Context:** Need unit/component testing and E2E testing frameworks.
**Decision:** Vitest (6x faster cold start, Vite-native, ESM/TS zero-config) + Playwright (cross-browser, free parallelization, 290ms/action vs Cypress 420ms).
**Consequences:** Teams familiar with Jest syntax will adapt easily (Vitest is API-compatible). Playwright has steeper initial learning curve than Cypress but better long-term value.

---

## SIGN-OFF

### Blueprint Verification Checklist

- [x] Tech Scout registry covers all PRD capabilities (38 capabilities evaluated)
- [x] Build vs integrate justified for every tool choice
- [x] Tools verified: version, license, CVEs, maintenance status
- [x] ADRs for 7 major decisions
- [x] Security model covers OWASP 2025 Top 10
- [x] API contracts cover all PRD endpoints (60+ endpoints mapped)
- [x] Data model covers all 17 entities from PRD
- [x] Project structure defined (monorepo, layer separation)
- [x] CI/CD pipeline defined (5-stage GitHub Actions)
- [x] Threat model covers STRIDE on 4 critical flows
- [ ] PM confirms deployment platform (ADR-005 — RECOMMENDATION)

### Phase 2 → Phase 3 Handoff

This blueprint provides Phase 3 (Design) with:
- Color palette + typography (PRD Section 5)
- Component inventory (Section 5.1 project structure)
- Page list (13 pages)
- Access matrix (PRD Section 4.2)

This blueprint provides Phase 4 (Sprint Setup) with:
- Complete task breakdown per sprint (PRD Section 11 + this blueprint's structure)
- Tech stack decisions (no open questions except deployment platform)
- Development environment setup (docker-compose)

**Status:** READY for Phase 3 (Design) and Phase 4 (Sprint Setup) in parallel.

---

**Authored by:** Solutions Architect + Tech Lead + Security Engineer (Claude)
**Date:** 2026-04-11
**Version:** 1.0
**Input documents:** PRD.md v1.2, BA_Research_Report.md, CLIENT.txt

**Research Sources:**
- [Drizzle ORM](https://orm.drizzle.team/) | [KeyCloak v26.5](https://www.keycloak.org/2026/01/keycloak-2650-released)
- [Supabase JS SDK](https://supabase.com/docs/reference/javascript/introduction) | [BullMQ v5.71](https://bullmq.io/)
- [Orval](https://orval.dev/) | [oidc-spa](https://github.com/keycloakify/oidc-spa)
- [Pino vs Winston](https://betterstack.com/community/guides/scaling-nodejs/pino-vs-winston/)
- [Express vs Fastify vs Hono](https://betterstack.com/community/guides/scaling-nodejs/fastify-vs-express-vs-hono/)
- [Vitest vs Jest 2026](https://www.sitepoint.com/vitest-vs-jest-2026-migration-benchmark/)
- [Playwright vs Cypress 2026](https://bugbug.io/blog/test-automation-tools/cypress-vs-playwright/)
- [OWASP Top 10 2025](https://owasp.org/Top10/2025/)
- [Railway](https://railway.app/) | [Fly.io](https://fly.io/)
- [Grafana + OpenTelemetry](https://grafana.com/blog/opentelemetry-and-grafana-labs-whats-new-and-whats-next-in-2026/)
- [Bull Board v6.21](https://github.com/felixmosh/bull-board)
- [TanStack React Query](https://tanstack.com/query/) | [Resend](https://resend.com/)
- [express-rate-limit](https://github.com/express-rate-limit) | [Helmet.js](https://helmetjs.github.io/)
