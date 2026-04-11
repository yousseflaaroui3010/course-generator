# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Project Lumina — Comprehensive Learning Platform

**Version:** 1.2  
**Date:** 2026-04-11  
**Author:** PO Team (Claude), synthesized from PM, BA, UX inputs  
**Status:** APPROVED — All Validation Gate conditions RESOLVED. Ready for Phase 2 (Architecture)  
**Source of Truth:** docs/CLIENT.txt

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Scope](#2-scope)
3. [KPIs & Success Metrics](#3-kpis--success-metrics)
4. [User Types & Access Matrix](#4-user-types--access-matrix)
5. [Brand Identity](#5-brand-identity)
6. [Feature Inventory (EPICs → Stories → Tasks)](#6-feature-inventory)
7. [MoSCoW Backlog](#7-moscow-backlog)
8. [Business Rules](#8-business-rules)
9. [Edge Cases & Failure Planning](#9-edge-cases--failure-planning)
10. [Non-Functional Requirements](#10-non-functional-requirements)
11. [Preliminary Sprint Plan](#11-preliminary-sprint-plan)
12. [Traceability Matrix](#12-traceability-matrix)
13. [Recommendations Register](#13-recommendations-register)

---

## 1. PROJECT OVERVIEW

### 1.1 Vision

Lumina is a comprehensive learning platform on par with Coursera, Udemy, and Saylor. It provides professional course delivery with rich media (visuals, quizzes, narration, videos) and a unique **Student Course Builder** that lets learners generate interactive courses from uploaded PDFs, Markdown files, text files, or YouTube URLs.

**Source:** CLIENT.txt lines 6-8

### 1.2 Strategic Positioning

| Dimension | Coursera | Udemy | Saylor | **Lumina** |
|---|---|---|---|---|
| Content Origin | University-created | Creator-submitted | Expert-vetted nonprofit | **Platform-curated + Student-created** |
| Creator Barrier | HIGH (institutional) | LOW (self-serve) | N/A | **VERY LOW** (PDF/YouTube → course) |
| Time to Publish | 6-12 weeks | 24-48 hours | N/A | **~1-2 hours** (AI-assisted) |
| Language Support | Per-course | Limited | Limited | **First-class multi-language** |

**Source:** BA_Research_Report.md Section 2; CLIENT.txt line 8; PM_Verification_Responses.md Q4

### 1.3 MVP Priority: Production-Grade Refactoring

The immediate release is **NOT** feature expansion. It is a **codebase quality pass**:
- Keep ALL existing features, EPICs, user stories
- Migrate: Firebase → **PostgreSQL + Drizzle ORM** (database), Firebase Auth → **KeyCloak** (auth), Firebase Storage → **Supabase Storage** (object storage)
- Introduce: **Orval** (API contracts), **OpenAPI** (spec), **BullMQ + Redis** (background jobs), secure API key management
- Harden: security, scalability, maintainability, architecture

**Source:** PM_Verification_Responses.md Q5; CLIENT.txt lines 26-29

---

## 2. SCOPE

### 2.1 IN SCOPE (MVP — Production Refactoring)

| ID | Item | Source |
|---|---|---|
| S-01 | PostgreSQL database migration via **Drizzle ORM** (from Firebase/in-memory) | PM Q5 + VG A-01 |
| S-02 | KeyCloak authentication (replace Firebase Auth) | PM Q5 |
| S-03 | OpenAPI spec + Orval client generation | PM Q5 |
| S-04 | API key security hardening (vault, rotation) | PM Q5 |
| S-05 | Preserve ALL existing features (13 EPICs identified) | PM Q5 |
| S-06 | Code quality: strict TypeScript, linting, error handling | PM Q5 |
| S-07 | Security audit + OWASP compliance | PM Q5 |
| S-08 | RBAC enforcement across all routes | CLIENT.txt line 27 |
| S-09 | Performance optimization (LCP <2s, API p95 <200ms) | CLAUDE.md rules |
| S-10a | **Supabase Storage** for object storage (avatars, media, uploads) | VG A-02 |
| S-10b | **BullMQ + Redis** for background job processing (AI gen, media, email) | VG A-05 |

### 2.2 IN SCOPE (Post-MVP — Feature Enhancement)

| ID | Item | Source |
|---|---|---|
| S-10 | YouTube URL transcript extraction for course builder | CLIENT.txt line 21 |
| S-11 | Excalidraw integration for Mermaid diagrams | CLIENT.txt line 23 |
| S-12 | Context-driven visual generation (analogies, charts, flowcharts) | PM Q2 |
| S-13 | Chapter-by-chapter generation flow (student-initiated) | PM Q1 |
| S-14 | Multi-language support (i18n) | PM Q4 |
| S-15 | Remotion video generation | CLIENT.txt lines 28-29 |
| S-16 | Enhanced marketplace with access control (outline-only for unpaid) | PM Q3 |

### 2.3 OUT OF SCOPE

| ID | Item | Reason |
|---|---|---|
| X-01 | Mobile native apps (iOS/Android) | Not requested; web-first |
| X-02 | LTI integration with external LMS | Future enhancement |
| X-03 | White-label / multi-tenant | Enterprise tier only, post-launch |
| X-04 | Real-time collaboration (co-editing courses) | Not requested |
| X-05 | Blockchain certificates / NFTs | Not requested |
| X-06 | Live streaming / webinars | Not requested |

---

## 3. KPIs & SUCCESS METRICS

### 3.1 Technical KPIs (MVP)

| Metric | Target | Measurement |
|---|---|---|
| API response time (p95) | < 200ms | APM monitoring |
| Largest Contentful Paint (LCP) | < 2s | Lighthouse |
| TypeScript strict mode | 100% coverage | `tsc --noEmit` zero errors |
| Test coverage (unit) | > 80% | Jest/Vitest |
| Security vulnerabilities | 0 critical, 0 high | Dependency scanning + OWASP |
| API contract compliance | 100% | Orval validation |
| Database migration | 0 data loss | Validation scripts |

### 3.2 Product KPIs (Post-MVP)

| Metric | Target | Measurement |
|---|---|---|
| Course generation time | < 2 minutes (PDF → course) | Instrumentation |
| Course builder completion rate | > 60% (started → published) | Analytics |
| Student retention (30-day) | > 40% | Cohort analysis |
| Course completion rate | > 25% | Progress tracking |
| Marketplace conversion (browse → purchase) | > 5% | Funnel analytics |

---

## 4. USER TYPES & ACCESS MATRIX

### 4.1 User Roles

| Role | Description | Source |
|---|---|---|
| **Anonymous** | Unauthenticated visitor | Implied |
| **Student** | Registered learner; can build personal courses | CLIENT.txt lines 17-21 |
| **Teacher/Instructor** | Creates & publishes courses; analytics access | Codebase: TutorDashboard, InstructorAnalytics |
| **Admin** | Platform management; all permissions | Codebase: AdminPanel |
| **Enterprise** (future) | Organization-level access | PM Q3; Pricing page |

**Source:** AuthContext.tsx line 11 (`role: 'student' | 'teacher' | 'admin'`); PM_Verification_Responses.md Q3

### 4.2 Access Matrix

| Feature | Anonymous | Student (Free) | Student (Pro) | Teacher | Admin |
|---|---|---|---|---|---|
| View landing page | ✅ | ✅ | ✅ | ✅ | ✅ |
| Browse marketplace | ❌ | ✅ | ✅ | ✅ | ✅ |
| View course **outline** | ❌ | ✅ | ✅ | ✅ | ✅ |
| View free course **content** | ❌ | ✅ | ✅ | ✅ | ✅ |
| View paid course **content** | ❌ | ❌ | ✅ (purchased) | ✅ (own) | ✅ |
| Course builder (from files) | ❌ | ✅ (limited) | ✅ | ✅ | ✅ |
| AI features (rewrite, audio, visual) | ❌ | ✅ (limited/month) | ✅ | ✅ | ✅ |
| AI Tutor chatbot | ❌ | ✅ | ✅ | ✅ | ✅ |
| Take quizzes | ❌ | ✅ | ✅ | ✅ | ✅ |
| Submit assignments | ❌ | ✅ | ✅ | ❌ | ✅ |
| Create assignments | ❌ | ❌ | ❌ | ✅ | ✅ |
| Peer review | ❌ | ✅ | ✅ | ✅ | ✅ |
| Video studio | ❌ | ❌ | ❌ | ✅ | ✅ |
| Instructor analytics | ❌ | ❌ | ❌ | ✅ | ✅ |
| Coupon management | ❌ | ❌ | ❌ | ✅ | ✅ |
| Admin panel | ❌ | ❌ | ❌ | ❌ | ✅ |
| Platform stats | ❌ | ❌ | ❌ | ❌ | ✅ |
| Clear all data | ❌ | ❌ | ❌ | ❌ | ✅ |
| Settings (own profile) | ❌ | ✅ | ✅ | ✅ | ✅ |
| Billing & receipts | ❌ | ✅ | ✅ | ✅ | ✅ |
| Learning paths | ❌ | ✅ | ✅ | ✅ | ✅ |
| Offline download | ❌ | ❌ | ✅ | ✅ | ✅ |
| Notes per chapter | ❌ | ✅ | ✅ | ✅ | ✅ |
| Certificate generation | ❌ | ✅ | ✅ | ✅ | ✅ |
| Shopping cart & purchase | ❌ | ✅ | ✅ | ✅ | ✅ |

**Payment Flow (PM Q3):** Paid courses show outline/overview only. Content is gated until payment is completed. Free courses are immediately accessible.

**Source:** PM_Verification_Responses.md Q3; App.tsx lines 31-44 (route guards); CourseView.tsx lines 230-261 (premium gating)

---

## 5. BRAND IDENTITY

### 5.1 Name & Positioning

- **Platform Name:** Lumina
- **Tagline:** "Illuminate Your Learning" (RECOMMENDATION — PM approval pending)
- **Personality:** Professional yet approachable; quality-first; accessibility-focused

### 5.2 Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#4f46e5` (Indigo 600) | Buttons, links, active states, brand accent |
| `--color-primary-hover` | `#4338ca` (Indigo 700) | Hover states |
| `--color-primary-light` | `#eef2ff` (Indigo 50) | Backgrounds, highlights |
| `--color-success` | `#22c55e` (Green 500) | Success states, completion |
| `--color-warning` | `#f59e0b` (Amber 500) | Warnings, premium badges |
| `--color-error` | `#ef4444` (Red 500) | Errors, destructive actions |
| `--color-surface` | `#ffffff` / `#111827` | Light/dark card backgrounds |
| `--color-text` | `#111827` / `#f9fafb` | Primary text light/dark |
| `--color-text-muted` | `#6b7280` / `#9ca3af` | Secondary text light/dark |

**Source:** Derived from codebase (Billing.tsx lines 49-51: `#4f46e5`, `#1e293b`, `#64748b`; CourseBuilder.tsx Indigo-600 classes)

### 5.3 Typography (continued in next section)

| Element | Font | Weight | Size |
|---|---|---|---|
| Headings | System sans-serif (Inter recommended) | Bold (700) | 1.5-2rem |
| Body | System sans-serif | Regular (400) | 1rem |
| Captions/Labels | System sans-serif | Medium (500) | 0.875rem |
| Code | System monospace | Regular (400) | 0.875rem |
| Dyslexic mode | OpenDyslexic (toggle) | Regular (400) | 1.1rem |

**Source:** Codebase uses Tailwind defaults; AuthContext.tsx line 22 (`dyslexicFont` preference)

### 5.4 Design Principles

1. **Accessibility First** — WCAG 2.1 AA; dyslexic-friendly content; keyboard navigable
2. **Mobile-First** — Responsive design; touch-optimized interactions
3. **Dark Mode** — Full theme support (ThemeProvider.tsx)
4. **Clarity Over Density** — Short paragraphs, bullet points, visual hierarchy
5. **Progressive Disclosure** — Don't overwhelm; reveal complexity as needed
# PRD — SECTION 6: FEATURE INVENTORY (EPICs & User Stories)

> **Convention:** Each EPIC has User Stories (US-XX) in INVEST format with Given/When/Then acceptance criteria and min 2 edge cases. Tasks listed under each story.

---

## EPIC 1: Authentication & User Management
**Source:** CLIENT.txt L27; AuthContext.tsx; LoginPage.tsx | **MoSCoW:** MUST | **MVP:** Migrate Firebase Auth → KeyCloak

### US-1.1: User Registration & Login
**As a** visitor, **I want to** sign in via OAuth, **so that** I access the platform securely.

**AC:**
- Given login page, When I click "Join as Student/Instructor," Then OAuth initiates → dashboard redirect on success
- Given first-time user, When sign-in completes, Then profile created (language: English, role per selection, XP: 0, streak: 0)
- Given returning user, When sign-in completes, Then existing profile + subscription status loaded

**Edge Cases:** EC-1.1a: Popup blocked → inline error + instructions | EC-1.1b: Network failure → retry button, no partial profile | EC-1.1c: Admin email match → auto-assign admin role

**Tasks:** T-1.1.1: KeyCloak realm + Google IdP setup | T-1.1.2: OIDC login flow (replace signInWithPopup) | T-1.1.3: PostgreSQL `users` table + profile creation | T-1.1.4: Migrate Firebase users | T-1.1.5: Session management (secure cookies, CSRF) | T-1.1.6: Unit + E2E tests

### US-1.2: Role-Based Access Control
**As a** platform operator, **I want** routes gated by role, **so that** unauthorized users cannot access restricted areas.

**AC:**
- Given student, When navigating /admin, Then redirect to dashboard + access denied message
- Given teacher, When navigating /analytics, Then instructor analytics shown
- Given admin, When navigating /admin, Then admin panel shown

**Edge Cases:** EC-1.2a: JWT role manipulation → server-side rejection | EC-1.2b: Mid-session role change → next request picks up new role

**Tasks:** T-1.2.1: RBAC middleware (KeyCloak token introspection) | T-1.2.2: Update ProtectedRoute component | T-1.2.3: Role-permission config (not hardcoded) | T-1.2.4: PostgreSQL role enum | T-1.2.5: Tests per role × route

### US-1.3: User Profile Management
**As a** user, **I want to** manage my profile, **so that** my experience is personalized.

**AC:**
- Given settings page, When updating name + save, Then profile updated immediately
- Given avatar upload, When complete, Then stored + displayed across views

**Edge Cases:** EC-1.3a: Avatar >5MB → error + resize suggestion | EC-1.3b: Account deletion → full data purge (GDPR)

**Tasks:** T-1.3.1: PostgreSQL user_profiles table (Drizzle schema) | T-1.3.2: Profile CRUD API (OpenAPI) | T-1.3.3: Migrate Settings.tsx | T-1.3.4: Avatar upload to Supabase Storage | T-1.3.5: Account deletion flow | T-1.3.6: Orval client generation

### US-1.4: Gamification (XP & Streaks)
**As a** student, **I want** XP/streaks, **so that** I stay motivated.

**AC:**
- Given chapter completion, When progress saved, Then XP awarded + streak updated if active yesterday
- Given missed day, When returning, Then streak resets to 1

**Edge Cases:** EC-1.4a: Timezone handling → user-configured TZ | EC-1.4b: Multiple completions same day → XP accumulates, streak no double-increment

**Tasks:** T-1.4.1: Add xp/streak/last_active columns | T-1.4.2: Server-side awardXP endpoint | T-1.4.3: Migrate from client-side to server-side calculation

---

## EPIC 2: Course Builder (Student-Driven)
**Source:** CLIENT.txt L17-23; PM Q1,Q2; CourseBuilder.tsx; gemini.ts | **MoSCoW:** MUST | **MVP:** Preserve upload→generate; refactor to PostgreSQL+OpenAPI

### US-2.1: File Upload & Processing
**As a** student, **I want to** upload PDF/MD/TXT/image, **so that** I can generate a course.

**AC:**
- Given builder page, When uploading PDF ≤10MB, Then text extracted + advance to Configure
- Given MD/TXT upload, When processed, Then raw text stored
- Given image upload, When processed, Then base64-encoded for multimodal AI

**Edge Cases:** EC-2.1a: >10MB → size error | EC-2.1b: Corrupt PDF → "Could not extract" + retry | EC-2.1c: Unsupported type → format list | EC-2.1d: Network failure → retry, preserve selection

**Tasks:** T-2.1.1: PostgreSQL uploaded_files table | T-2.1.2: Refactor /api/upload (replace in-memory) | T-2.1.3: File type validation | T-2.1.4: OpenAPI spec | T-2.1.5: Tests per file type

### US-2.2: Course Configuration
**As a** student, **I want to** configure level/tone/category/price/options, **so that** the course matches my needs.

**AC:**
- Given file uploaded, When Configure step shows, Then I select level, tone, category, price, toggle quizzes/visuals
- Given price > $0 + "Publish to Marketplace," Then course listed as premium

**Edge Cases:** EC-2.2a: Negative price → validate min 0 | EC-2.2b: Navigate away → draft preserved (RECOMMENDATION)

**Tasks:** T-2.2.1: PostgreSQL courses table with config columns | T-2.2.2: Draft/published status | T-2.2.3: Client + server validation | T-2.2.4: OpenAPI spec

### US-2.3: AI Course Generation
**As a** student, **I want** AI to generate 3-5 structured chapters, **so that** I get interactive learning.

**AC:**
- Given "Generate Course" click, When AI completes, Then 3-5 chapters with markdown, quizzes (if enabled), visual metadata
- Given success, When saved, Then redirect to course view

**Edge Cases:** EC-2.3a: Truncated JSON → repair attempt → fallback error | EC-2.3b: Empty response → retry prompt | EC-2.3c: Rate limit → wait message | EC-2.3d: Short source → AI expands

**Tasks:** T-2.3.1: Server-side generation (not frontend proxy) | T-2.3.2: PostgreSQL JSONB chapters (Drizzle schema) | T-2.3.3: Generation queue via BullMQ + Redis + rate limiting | T-2.3.4: Progress via WebSocket/SSE | T-2.3.5: Tests for JSON repair

### US-2.4: Course Extension (Generate Next Chapter)
**As a** student, **I want to** generate additional chapters, **so that** I expand at my own pace (PM Q1: student-initiated, not auto).

**AC:**
- Given completed course, When clicking "Generate More," Then 3-5 new non-duplicate chapters generated
- Given new chapters, When appended, Then new batch index assigned

**Edge Cases:** EC-2.4a: Source file deleted → error | EC-2.4b: Duplicate titles → re-prompt

**Tasks:** T-2.4.1: Server-side extendCourse | T-2.4.2: Batch tracking in PostgreSQL | T-2.4.3: Title dedup check | T-2.4.4: Student-initiated trigger only

### US-2.5: YouTube URL Course Generation (Post-MVP)
**As a** student, **I want to** paste a YouTube URL, **so that** a course is generated from the transcript.

**AC:**
- Given YouTube URL, When submitted, Then transcript extracted + course generated from it

**Edge Cases:** EC-2.5a: Private/deleted video → error | EC-2.5b: No captions → AI fallback or error | EC-2.5c: Very long video (>2hrs) → truncate transcript

**Tasks:** T-2.5.1: Integrate transcript API (Supadata or youtube-transcript-api) | T-2.5.2: URL validation | T-2.5.3: Transcript preprocessing | T-2.5.4: Feed into existing course generation pipeline

---

## EPIC 3: Course Viewing & Learning Experience
**Source:** CLIENT.txt L13-14; CourseView.tsx (65KB) | **MoSCoW:** MUST | **MVP:** Preserve all; refactor data layer

### US-3.1: Course Overview Page
**AC:** Given /course/:id, When loaded, Then title + description + chapter sidebar + progress shown | Given paid+unpurchased, When accessing content, Then paywall shown
**Edge Cases:** Course not found → error + dashboard link | No chapters → "Invalid Course" message
**Tasks:** Refactor Firestore→PostgreSQL API | Access control server-side | OpenAPI spec

### US-3.2: Chapter Navigation & Content
**AC:** Given chapter view, When Next/Prev clicked, Then navigate + reset quiz/audio/visual states | Given chapter read, When navigating away, Then progress saved
**Edge Cases:** First chapter → Prev disabled | Last chapter → completion state
**Tasks:** PostgreSQL user_progress table | Server-side skip detection | Keyboard nav (arrows)

### US-3.3: Quiz System
**AC:** Given quiz questions, When submitted, Then correct=green/incorrect=red feedback | Given submission, Then score recorded
**Edge Cases:** No quiz → tab hidden | Partial submission → allowed, highlight unanswered
**Tasks:** PostgreSQL quiz_attempts table | Server-side validation | Quiz analytics

### US-3.4: AI Content Rewriting
**AC:** Given chapter, When "Rewrite" clicked, Then content regenerated at different level/tone + saved
**Edge Cases:** AI error → preserve original | Already optimized → no-op message
**Tasks:** Server-side endpoint | Rewrite history (undo) | Level/tone selection UI

### US-3.5: AI Audio Narration (TTS)
**AC:** Given chapter, When narration button clicked, Then audio generated + auto-plays | Given chapter change, Then audio stops
**Edge Cases:** Auto-play blocked → manual play button | Long content → truncated to 2000 chars
**Tasks:** Server-side TTS + caching | Audio file storage | Player controls | Voice selection

### US-3.6: AI Visual Generation
**AC:** Given visualMetadata, When chapter opened, Then illustration generated automatically
**Edge Cases:** Generation fails → placeholder | No metadata → skip silently
**Tasks:** Server-side + caching | Image storage | Loading skeleton | (Post-MVP) Excalidraw for diagrams

### US-3.7: AI Tutor Chatbot
**AC:** Given chapter, When question asked, Then AI responds Socratically with chapter context | Given conversation, Then history preserved
**Edge Cases:** No content → "unavailable" response | Long conversation → truncate oldest
**Tasks:** Server-side chat endpoint | PostgreSQL chat history | Rate limiting | Streaming (SSE)

### US-3.8: Notes System
**AC:** Given chapter, When note saved, Then persisted + displayed | Given return visit, Then notes loaded
**Edge Cases:** Empty note → prevent save | Very long note → warn/truncate
**Tasks:** PostgreSQL notes table | CRUD API | Edit/delete | Export (RECOMMENDATION)

### US-3.9: Video Upload & Playback
**AC:** Given teacher on own course, When video uploaded, Then stored + playable in chapter
**Edge Cases:** Non-video file → error | Large file → progress bar + timeout handling
**Tasks:** Migrate to Supabase Storage | Transcoding (RECOMMENDATION) | Chunked upload

### US-3.10: Offline Download
**AC:** Given "Download Offline" click, When complete, Then IndexedDB + Cache API stores course
**Edge Cases:** Insufficient storage → error | Partial download → resume
**Tasks:** Refactor for new API | Service worker | Online sync

### US-3.11: Certificates
**AC:** Given all chapters complete, When completion state reached, Then certificate modal + download
**Edge Cases:** Skipped chapters → noted on cert | Course extended → recalculate completion
**Tasks:** PostgreSQL certificates table | Server-side PDF gen | Verification URL

---

## EPIC 4: Marketplace & Discovery
**Source:** CLIENT.txt L8; Marketplace.tsx; CartDrawer.tsx | **MoSCoW:** MUST

### US-4.1: Course Browsing
**AC:** Given Discover page, When searching, Then courses filtered by title/description real-time | Given filters, Then matching courses shown
**Edge Cases:** No matches → "No courses found" | Many courses → pagination
**Tasks:** PostgreSQL full-text search index | Server-side pagination API | OpenAPI spec

### US-4.2: Course Preview (Outline-Only for Paid)
**AC:** Given paid course clicked, When overview loads, Then title + chapter titles visible but NOT content | Given paid chapter clicked, Then paywall
**Edge Cases:** Free course → full access | Creator views own → full access
**Tasks:** Outline-only API response | Server-side content gating

### US-4.3: Shopping Cart
**AC:** Given "Add to Cart," When cart updates, Then drawer opens | Given checkout, Then Stripe redirect
**Edge Cases:** Already in cart → toast | Price changed → validate at checkout
**Tasks:** Server-side cart persistence | Batch checkout | Cart badge

---

## EPIC 5: Payments & Billing
**Source:** CLIENT.txt L28; Pricing.tsx; Billing.tsx; server.ts L262-332 | **MoSCoW:** MUST

### US-5.1: Course Purchase
**AC:** Given "Buy" click, When payment succeeds, Then immediate access granted
**Edge Cases:** Card declined → error, keep in cart | Webhook fails → retry + "Processing" state
**Tasks:** PostgreSQL purchases table | Idempotent webhook | Server-side access grant

### US-5.2: Subscription Plans
**AC:** Given Pricing page "Upgrade to Pro," When clicked, Then Stripe Checkout redirect | Given success, Then Pro access
**Edge Cases:** Subscription lapses → revoke + renewal prompt | Already subscribed → "Current Plan"
**Tasks:** PostgreSQL subscriptions table | Lifecycle management | Stripe webhook events | Real Price IDs

### US-5.3: Billing History & Receipts
**AC:** Given Billing page, When loaded, Then purchase list with date/course/amount/status | Given "Download Receipt," Then PDF downloaded
**Edge Cases:** No history → empty state | PDF fails → plain-text fallback
**Tasks:** Billing history API | Server-side PDF | Invoice email (RECOMMENDATION)

---

## EPIC 6: Learning Paths & Progress
**Source:** LearningPaths.tsx | **MoSCoW:** MUST

### US-6.1: My Learning Dashboard
**AC:** Given Learning Paths, When loaded, Then In-Progress/Completed tabs with progress bars | Given course click, Then resume from last chapter
**Edge Cases:** Deleted course → "No longer available" | No courses → empty state + marketplace link
**Tasks:** PostgreSQL user_progress table | Progress API | Server-side calculation | Resume button

### US-6.2: Progress Persistence
**AC:** Given chapter opened, When viewed, Then marked completed + last index updated | Given skipped chapters, Then tracked separately
**Edge Cases:** Concurrent sessions → last write wins | Offline → queue + sync
**Tasks:** Debounced progress API | Optimistic UI | Offline queue

---

## EPIC 7: Instructor Tools
**Source:** InstructorAnalytics.tsx; AssignmentsTab.tsx | **MoSCoW:** SHOULD

### US-7.1: Instructor Analytics
**AC:** Given Analytics page, When loaded, Then enrollment/completion/revenue charts | Given multiple courses, Then aggregate + per-course
**Edge Cases:** No courses → "Create first course" CTA | Query fails → graceful fallback
**Tasks:** PostgreSQL analytics queries | Analytics API | Date range filtering

### US-7.2: Assignments & Peer Review
**AC:** Given teacher creates assignment, When saved, Then visible to students | Given student submission reviewed, Then feedback visible
**Edge Cases:** No submissions → "None available" | Self-review → prevent
**Tasks:** PostgreSQL assignments/submissions/reviews tables | CRUD APIs | Notification (RECOMMENDATION)

### US-7.3: Coupon Management
**AC:** Given Analytics, When coupon created (code/course/discount/max), Then students can apply at checkout
**Edge Cases:** Duplicate code → error | Max uses exceeded → "Expired" at checkout
**Tasks:** PostgreSQL coupons table | Checkout validation | Usage tracking

---

## EPIC 8: Video Studio
**Source:** VideoStudio.tsx; gemini.ts | **MoSCoW:** COULD

### US-8.1: AI Video Script Generation
**AC:** Given prompt/style/voice/audience/objectives, When "Generate" clicked, Then 3-5 scene script with narration + visual descriptions
**Edge Cases:** Empty prompt → validation error | Truncated JSON → repair attempt
**Tasks:** Server-side generation | PostgreSQL videos table | OpenAPI spec

### US-8.2: Scene Media Generation
**AC:** Given video script, When media buttons clicked, Then images + audio generated per scene
**Edge Cases:** Generation fails → "Unavailable" per scene | All scenes fail → error toast
**Tasks:** Server-side media gen + caching | Per-scene storage

---

## EPIC 9: Admin Panel
**Source:** AdminPanel.tsx | **MoSCoW:** MUST

### US-9.1: Platform Statistics
**AC:** Given admin panel, When loaded, Then user/course/video/generation counts displayed
**Edge Cases:** DB query fails → show "Error loading stats" with retry
**Tasks:** PostgreSQL aggregate queries | Admin stats API | Auto-refresh

### US-9.2: Data Management
**AC:** Given admin, When "Clear All" clicked + confirmed, Then all courses/videos deleted
**Edge Cases:** Confirmation required (modal) | Partial failure → rollback
**Tasks:** Batch delete API with transaction | Audit logging (RECOMMENDATION)

---

## EPIC 10: Platform Settings & Preferences
**Source:** Settings.tsx (32KB) | **MoSCoW:** MUST

### US-10.1: Theme Selection
**AC:** Given settings, When theme changed (light/dark/system), Then applied immediately + persisted
**Tasks:** Preserve ThemeProvider.tsx logic | Persist preference server-side

### US-10.2: Notification Preferences
**AC:** Given settings, When toggling email notifications/weekly reminders, Then preference saved
**Tasks:** PostgreSQL preferences JSONB | API endpoint

### US-10.3: Subscription Management
**AC:** Given settings, When viewing subscription tab, Then current plan/status/renewal date shown
**Edge Cases:** No subscription → show upgrade CTA | Expired → show renewal
**Tasks:** Display subscription from PostgreSQL | Link to Stripe portal

### US-10.4: Password Reset & Account Deletion
**AC:** Given settings, When "Reset Password" clicked, Then email sent | Given "Delete Account" confirmed, Then all data purged
**Edge Cases:** Email delivery fails → retry | Deletion with active subscription → warn first
**Tasks:** KeyCloak password reset flow | GDPR-compliant data deletion | Cascade deletes

---

## EPIC 11: Platform Infrastructure (MVP-Critical)
**Source:** server.ts; package.json; CLAUDE.md | **MoSCoW:** MUST

### US-11.1: PostgreSQL Database Setup (Drizzle ORM)
**AC:** Given deployment, When server starts, Then PostgreSQL connection established via Drizzle ORM with migrations applied
**Tasks:** T-11.1.1: Drizzle ORM setup + config (drizzle.config.ts) | T-11.1.2: Schema design (all tables as Drizzle schemas) | T-11.1.3: Drizzle Kit migration scripts | T-11.1.4: Connection pooling (pg pool) | T-11.1.5: Seed data scripts

### US-11.2: KeyCloak Integration
**AC:** Given any API request, When auth header present, Then KeyCloak validates token + extracts role
**Tasks:** KeyCloak deployment | OIDC middleware | Token refresh | Session management

### US-11.3: OpenAPI + Orval
**AC:** Given OpenAPI spec, When Orval runs, Then type-safe TypeScript client generated for all endpoints
**Tasks:** Write OpenAPI 3.0 spec | Configure Orval | CI/CD integration | Mock server

### US-11.4: API Security Hardening
**AC:** Given any endpoint, When request received, Then validated (auth, input, rate limit, CORS)
**Tasks:** Rate limiting middleware | Input validation (Zod) | CORS config | Helmet.js | API key vault

### US-11.5: Error Handling & Logging
**AC:** Given any error, When it occurs, Then structured log with request context + user-friendly response
**Tasks:** Structured logging (Winston/Pino) | Error response format | Request ID tracing

### US-11.6: Background Job Processing (BullMQ + Redis)
**Source:** Validation Gate A-05 | **MoSCoW:** MUST | **MVP:** AI generation queues, email jobs, media processing
**AC:**
- Given AI course generation request, When queued, Then BullMQ worker processes in background + client receives job ID for polling
- Given job failure, When max retries exhausted, Then job marked failed + user notified with retry option
- Given Redis connection, When server starts, Then BullMQ dashboard (Bull Board) available at /admin/queues (admin-only)

**Edge Cases:** EC-11.6a: Redis down → graceful degradation, return "service busy" | EC-11.6b: Job stalled → auto-cleanup + re-queue | EC-11.6c: Duplicate job → idempotency check by content hash

**Tasks:** T-11.6.1: Redis deployment (dev, staging, prod) | T-11.6.2: BullMQ config + queue definitions (ai-generation, media-processing, email) | T-11.6.3: Worker processes for each queue | T-11.6.4: Job progress tracking (WebSocket/SSE to client) | T-11.6.5: Bull Board admin UI | T-11.6.6: Dead letter queue + alerting | T-11.6.7: Tests (queue, worker, retry, failure)

---

## EPIC 12: UI/UX Shell
**Source:** Layout.tsx; ThemeProvider.tsx; Toast.tsx | **MoSCoW:** MUST

### US-12.1: Navigation Layout
**AC:** Given authenticated user, When on any page, Then sidebar/header nav shows role-appropriate links
**Tasks:** Preserve Layout.tsx | Update nav items per RBAC | Mobile responsive nav

### US-12.2: Toast Notifications
**AC:** Given any action result, When toast triggered, Then notification appears + auto-dismisses
**Tasks:** Preserve Toast component | Standardize toast usage across app

### US-12.3: Confirmation Modals
**AC:** Given destructive action, When triggered, Then modal requires explicit confirmation
**Tasks:** Preserve ConfirmationModal | Add to all destructive operations

---

## EPIC 13: Landing Page & Onboarding
**Source:** LandingPage.tsx; LoginPage.tsx | **MoSCoW:** SHOULD

### US-13.1: Landing Page
**AC:** Given anonymous visitor, When arriving at site, Then landing page shows value proposition + CTA
**Tasks:** Preserve LandingPage.tsx | Update with Lumina branding | SEO optimization

### US-13.2: Login/Registration Flow
**AC:** Given login page, When choosing role + signing in, Then OAuth flow completes + redirect
**Tasks:** Migrate to KeyCloak-powered login | Preserve role selection UI
# PRD — SECTIONS 7-13: MoSCoW, Rules, NFRs, Sprint Plan, Traceability

---

## 7. MoSCoW BACKLOG

### MUST (MVP — Required for Production Release)

| ID | Story | EPIC | Rationale |
|---|---|---|---|
| US-1.1 | User Registration & Login (KeyCloak) | E1 | Auth is foundational |
| US-1.2 | Role-Based Access Control | E1 | Security requirement |
| US-1.3 | User Profile Management | E1 | Core user experience |
| US-1.4 | Gamification (XP/Streaks) | E1 | Existing feature — preserve |
| US-2.1 | File Upload & Processing | E2 | Core differentiator |
| US-2.2 | Course Configuration | E2 | Core differentiator |
| US-2.3 | AI Course Generation | E2 | Core differentiator |
| US-2.4 | Course Extension | E2 | PM Q1 — student-initiated |
| US-3.1 | Course Overview Page | E3 | Core learning experience |
| US-3.2 | Chapter Navigation | E3 | Core learning experience |
| US-3.3 | Quiz System | E3 | Existing feature — preserve |
| US-3.4 | AI Content Rewriting | E3 | Existing feature — preserve |
| US-3.5 | AI Audio Narration | E3 | Existing feature — preserve |
| US-3.6 | AI Visual Generation | E3 | Existing feature — preserve |
| US-3.7 | AI Tutor Chatbot | E3 | Existing feature — preserve |
| US-3.8 | Notes System | E3 | Existing feature — preserve |
| US-3.9 | Video Upload/Playback | E3 | Existing feature — preserve |
| US-3.11 | Certificates | E3 | Existing feature — preserve |
| US-4.1 | Course Browsing | E4 | Core marketplace |
| US-4.2 | Course Preview (Outline-only) | E4 | PM Q3 — paywall |
| US-4.3 | Shopping Cart | E4 | Existing feature — preserve |
| US-5.1 | Course Purchase | E5 | Revenue model |
| US-5.2 | Subscription Plans | E5 | Revenue model |
| US-5.3 | Billing History | E5 | Existing feature — preserve |
| US-6.1 | My Learning Dashboard | E6 | Existing feature — preserve |
| US-6.2 | Progress Persistence | E6 | Core learning experience |
| US-9.1 | Platform Statistics (Admin) | E9 | Existing feature — preserve |
| US-9.2 | Data Management (Admin) | E9 | Existing feature — preserve |
| US-10.1-4 | Settings & Preferences | E10 | Existing features — preserve |
| US-11.1 | PostgreSQL Setup | E11 | MVP infrastructure |
| US-11.2 | KeyCloak Integration | E11 | MVP infrastructure |
| US-11.3 | OpenAPI + Orval | E11 | MVP infrastructure |
| US-11.4 | API Security Hardening | E11 | MVP infrastructure |
| US-11.5 | Error Handling & Logging | E11 | MVP infrastructure |
| US-11.6 | Background Job Processing (BullMQ + Redis) | E11 | MVP infrastructure — AI queues, media |
| US-12.1-3 | UI Shell (Nav, Toast, Modals) | E12 | Existing features — preserve |

### SHOULD (High Priority — Next Release)

| ID | Story | EPIC | Rationale |
|---|---|---|---|
| US-2.5 | YouTube URL Course Generation | E2 | CLIENT.txt L21 — key differentiator |
| US-3.10 | Offline Download | E3 | Existing feature — preserve but lower priority |
| US-7.1 | Instructor Analytics | E7 | Existing feature — valuable for teachers |
| US-7.2 | Assignments & Peer Review | E7 | Existing feature — engagement driver |
| US-7.3 | Coupon Management | E7 | Existing feature — revenue tool |
| US-13.1-2 | Landing Page & Onboarding | E13 | Existing — needs branding update |

### COULD (Desirable — Future Enhancement)

| ID | Story | EPIC | Rationale |
|---|---|---|---|
| US-8.1 | AI Video Script Generation | E8 | Existing feature — lower priority for MVP |
| US-8.2 | Scene Media Generation | E8 | Depends on US-8.1 |
| S-11 | Excalidraw Integration | E2 | CLIENT.txt L23 — post-MVP |
| S-12 | Context-Driven Visuals (PM Q2) | E3 | Post-MVP enhancement |
| S-14 | Multi-language (i18n) | E12 | PM Q4 — competitive advantage |

### WON'T (Not in This Release)

| ID | Item | Rationale |
|---|---|---|
| S-15 | Remotion Video Generation | CLIENT.txt L28-29 — "later" |
| X-01 | Mobile Native Apps | Web-first, not requested |
| X-02 | LTI Integration | Future enterprise feature |
| X-03 | White-label / Multi-tenant | Post-launch enterprise |
| X-04 | Real-time Co-editing | Not requested |
| X-05 | Blockchain Certificates | Not requested |
| X-06 | Live Streaming | Not requested |

---

## 8. BUSINESS RULES

| Rule ID | Rule | Source | Enforcement |
|---|---|---|---|
| BR-01 | Paid courses show outline only until purchased. Content is NOT visible to non-paying users. | PM Q3 | Server-side: API does not return chapter content for unpurchased courses |
| BR-02 | Course generation is student-initiated, 1 chapter batch at a time. System asks student to generate next batch — never auto-generates. | PM Q1 | Frontend: "Generate More" CTA after batch completion. No auto-trigger. |
| BR-03 | Visual generation is context-driven. Not every element gets a visual. AI determines when visuals add value. | PM Q2 | AI prompt engineering + heuristics (conceptual→illustration, stats→chart, process→flowchart) |
| BR-04 | Platform creates initial courses (quality baseline). Students build on top. | PM Q4 | Admin/platform can create courses. Marketplace shows platform-curated content first. |
| BR-05 | Free courses are immediately accessible. No paywall for $0 courses. | PM Q3 | Server-side: price=0 → full access regardless of subscription |
| BR-06 | Course creators see their own paid courses without payment. | Codebase: CourseView.tsx L231 | Access check: `course.creatorId === user.uid` bypasses paywall |
| BR-07 | Admin users have full access to all features and content. | Codebase: AuthContext.tsx L82 | Role='admin' bypasses all access checks |
| BR-08 | Pro subscribers have access to all paid courses. | Codebase: CourseView.tsx L231 | `profile.subscription.status === 'active'` bypasses per-course payment |
| BR-09 | AI content must follow accessibility guidelines: short sentences, bullet points, bold key terms, max 3-sentence paragraphs. | Codebase: gemini.ts system prompts | AI system instruction enforces; post-generation validation recommended |
| BR-10 | File uploads limited to 10MB. | server.ts L81 | Multer config + client-side validation |
| BR-11 | Course generation limited to 3-5 chapters per batch. | gemini.ts system prompt | AI instruction + response validation |
| BR-12 | Users can be students, teachers, or admins. Role is set at registration (or by admin). | AuthContext.tsx L11, L82 | PostgreSQL enum constraint; role change requires admin action |
| BR-13 | Stripe is the sole payment processor. All transactions go through Stripe. | CLIENT.txt L28; server.ts | Server-side Stripe SDK; no alternative payment paths |
| BR-14 | Dyslexic-friendly content is a first-class accessibility feature. | gemini.ts system prompts; AuthContext preferences | AI prompts enforce; OpenDyslexic font toggle available |

---

## 9. EDGE CASES & FAILURE PLANNING

### 9.1 Input Validation Failures

| Scenario | Expected Behavior |
|---|---|
| Upload non-supported file type (.docx, .xlsx, .zip) | Show "Supported formats: PDF, MD, TXT, JPG, PNG" error |
| Upload file > 10MB | Show "File too large. Maximum 10MB." with suggestion |
| Empty course title from AI | Default to "Untitled Course" |
| Malformed AI JSON response | Attempt JSON repair → if fails, show "Try smaller source" error |
| Negative price input | Client-side validation: min=0. Server rejects if bypassed |
| XSS in note content | Sanitize all user input server-side. React auto-escapes in JSX |
| SQL injection in search | Parameterized queries only. Never string interpolation |

### 9.2 Authorization Failures

| Scenario | Expected Behavior |
|---|---|
| Student accesses /admin | Redirect to dashboard + "Access denied" toast |
| Student accesses /analytics | Redirect to dashboard + "Access denied" toast |
| Unauthenticated user accesses protected route | Redirect to /login |
| JWT token expired | Refresh token flow → if fails, redirect to /login |
| JWT role tampered | Server-side KeyCloak validation rejects; 403 response |
| User accesses deleted course | 404 "Course not found" + dashboard link |
| User accesses paid course without purchase | Outline-only view + paywall CTA |

### 9.3 External Service Failures

| Scenario | Expected Behavior |
|---|---|
| Gemini API down/rate limited | Show "AI service unavailable. Try again later." Retry with exponential backoff (max 3 attempts) |
| Stripe API down | Show "Payment processing unavailable." Queue payment intent for retry |
| KeyCloak down | Show "Authentication service unavailable." Cached session continues |
| PostgreSQL connection lost | 503 response. Connection pool retries. Alert ops team |
| Supabase Storage unavailable | Show placeholder for images/videos. Queue uploads for retry |
| Redis down | BullMQ queues paused. Show "Service temporarily busy" for AI generation. Auto-reconnect |
| YouTube transcript API unavailable | Show "Could not extract transcript. Try again later." |

### 9.4 Data Integrity Failures

| Scenario | Expected Behavior |
|---|---|
| Concurrent progress updates (two tabs) | Last-write-wins with timestamp. No data corruption |
| Course deleted while student viewing | Real-time check: show "Course removed" + redirect |
| Payment webhook out of order | Idempotency keys. Process events in order by timestamp |
| Database migration failure | Rollback to pre-migration backup (tested in AC-MIG-07). Migration scripts are idempotent (AC-MIG-09) |
| Partial course generation (AI timeout) | Save whatever was generated. Show "Partial result" with retry option |

### 9.5 Empty States

| View | Empty State Message | CTA |
|---|---|---|
| Dashboard (no courses) | "You haven't created any courses yet" | "Create Your First Course" → /build |
| Marketplace (no results) | "No courses match your search" | "Clear filters" or "Browse all" |
| Learning Paths (no progress) | "You haven't started any courses" | "Explore Marketplace" → /discover |
| Billing (no purchases) | "No purchases yet" | "Browse Courses" → /discover |
| Notes (no notes for chapter) | "No notes for this chapter" | "Start taking notes" (focus textarea) |
| Assignments (no assignments) | "No assignments for this course" | Teacher: "Create Assignment" / Student: (informational) |
| Instructor Analytics (no courses) | "Create your first course to see analytics" | "Go to Course Builder" → /build |

---

## 10. NON-FUNCTIONAL REQUIREMENTS

### 10.1 Performance

| Metric | Target | Measurement |
|---|---|---|
| API p95 response time | < 200ms | APM (Datadog/New Relic) |
| Largest Contentful Paint (LCP) | < 2.0s | Lighthouse CI |
| First Input Delay (FID) | < 100ms | Lighthouse CI |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse CI |
| Course generation time | < 120s (AI dependent) | Server-side instrumentation |
| Database query time (p95) | < 50ms | PostgreSQL query logging |
| File upload throughput | ≥ 1MB/s | Load testing |

### 10.2 Availability & Reliability

| Metric | Target |
|---|---|
| Uptime SLA | 99.5% (allows ~3.6 hrs downtime/month) |
| Planned maintenance window | Sunday 02:00-06:00 UTC |
| Recovery Time Objective (RTO) | < 1 hour |
| Recovery Point Objective (RPO) | < 15 minutes (database backups) |
| Error rate (5xx) | < 0.1% of requests |

### 10.3 Security

| Requirement | Implementation |
|---|---|
| Authentication | KeyCloak OIDC (OAuth2 + OpenID Connect) |
| Authorization | RBAC with server-side enforcement |
| Data encryption (transit) | TLS 1.3 on all connections |
| Data encryption (rest) | PostgreSQL TDE or disk encryption |
| Session management | Secure HttpOnly cookies; CSRF tokens |
| Input validation | Zod schemas on all endpoints |
| Dependency scanning | Automated CVE scanning in CI/CD |
| Rate limiting | Per-user, per-endpoint throttling |
| API key management | Vault-based with rotation schedule |
| OWASP Top 10 | Addressed: SQLi, XSS, CSRF, IDOR, auth bypass |
| GDPR compliance | Data export, deletion, consent management |
| FERPA awareness | Student data protection (if US education market) |

### 10.4 Accessibility (WCAG 2.1 AA)

| Requirement | Implementation |
|---|---|
| Keyboard navigation | All interactive elements focusable + operable |
| Screen reader support | Semantic HTML, ARIA labels, live regions |
| Color contrast | 4.5:1 minimum for text; 3:1 for large text |
| Focus indicators | Visible focus ring on all interactive elements |
| Alt text | All images have descriptive alt text |
| Dyslexic mode | OpenDyslexic font toggle in preferences |
| Motion reduction | Respect `prefers-reduced-motion` |
| Touch targets | Minimum 44x44px |

### 10.5 Scalability

| Dimension | Target | Approach |
|---|---|---|
| Concurrent users | 1,000 (MVP); 10,000 (post-MVP) | Connection pooling, caching |
| Course count | 10,000+ | PostgreSQL indexing, pagination |
| File storage | 1TB+ | Supabase Storage (S3-compatible) |
| Database size | 100GB+ | Read replicas, archiving |

---

## 11. PRELIMINARY SPRINT PLAN

### Sprint 0: Foundation (2 weeks)
**Goal:** Infrastructure setup, no feature work

| Task | Owner | Dependency |
|---|---|---|
| PostgreSQL setup (dev, staging) | Backend | None |
| Drizzle ORM setup + drizzle.config.ts | Backend | PostgreSQL |
| Database schema design (all tables as Drizzle schemas) | Backend | Drizzle setup |
| Drizzle Kit migration pipeline | Backend | Schema design |
| KeyCloak deployment + realm config | Backend | None |
| Redis deployment (dev, staging) | Backend | None |
| BullMQ config + queue definitions (ai-generation, media-processing, email) | Backend | Redis |
| Supabase Storage project + bucket config (avatars, media, uploads) | Backend | None |
| OpenAPI spec v1 (all endpoints) | Backend | Schema design |
| Orval config + initial client gen | Frontend | OpenAPI spec |
| CI/CD pipeline (lint, type-check, test) | DevOps | None |
| Security audit kickoff (third-party) | PM | None |

### Sprint 1: Auth & Core API (2 weeks)
**Goal:** Auth migration + core CRUD APIs

| Task | Owner | Dependency |
|---|---|---|
| KeyCloak OIDC login flow | Backend | Sprint 0 |
| RBAC middleware | Backend | KeyCloak |
| User profile CRUD API | Backend | Schema |
| Course CRUD API | Backend | Schema |
| Frontend auth migration (replace Firebase) | Frontend | KeyCloak + Orval |
| Data migration scripts (Firebase → PostgreSQL) | Backend | Schema |

### Sprint 2: Course Builder & Viewing (2 weeks)
**Goal:** Course builder + viewer refactored to new APIs; CourseView decomposed

| Task | Owner | Dependency |
|---|---|---|
| File upload API (PostgreSQL + Supabase Storage) | Backend | Sprint 1 |
| AI generation API (server-side, BullMQ queued) | Backend | Sprint 1 + Redis |
| Course viewing API (with access control) | Backend | Sprint 1 |
| Progress tracking API | Backend | Sprint 1 |
| CourseBuilder.tsx → new APIs | Frontend | Orval client |
| **T-3.0.1: Decompose CourseView.tsx (65KB) into sub-components** | Frontend | None |
| ↳ ChapterNavigation, QuizPanel, AudioPlayer, VisualGenerator, TutorChat, NotesPanel, VideoPlayer, OfflineManager, CertificateModal, ProgressTracker | Frontend | T-3.0.1 |
| CourseView.tsx (decomposed) → new APIs | Frontend | T-3.0.1 + Orval client |

### Sprint 3: Marketplace, Payments, Learning Paths (2 weeks)
**Goal:** Marketplace, cart, payments, progress

| Task | Owner | Dependency |
|---|---|---|
| Marketplace search/filter API | Backend | Sprint 2 |
| Cart persistence API | Backend | Sprint 2 |
| Stripe integration (new endpoints) | Backend | Sprint 1 |
| Billing history API | Backend | Sprint 2 |
| Learning paths API | Backend | Sprint 2 |
| Marketplace.tsx → new APIs | Frontend | Orval client |
| Billing.tsx → new APIs | Frontend | Orval client |

### Sprint 4: Instructor, Admin, Settings (2 weeks)
**Goal:** Instructor tools, admin panel, settings

| Task | Owner | Dependency |
|---|---|---|
| Instructor analytics API | Backend | Sprint 2 |
| Assignment/review APIs | Backend | Sprint 2 |
| Coupon API | Backend | Sprint 2 |
| Admin stats + data management API | Backend | Sprint 1 |
| Settings/preferences API | Backend | Sprint 1 |
| All instructor/admin/settings pages → new APIs | Frontend | Orval client |

### Sprint 5: Security, Testing, Polish (2 weeks)
**Goal:** Hardening, testing, bug fixing, migration dry-run

| Task | Owner | Dependency |
|---|---|---|
| Security audit findings → fixes | Backend | Audit results |
| API key vault integration | Backend | Sprint 1 |
| Rate limiting implementation | Backend | Sprint 1 |
| Unit tests (>80% coverage) | All | All sprints |
| E2E tests (critical flows) | QA | Sprint 4 |
| Performance optimization (LCP, API p95) | All | Sprint 4 |
| Bug triage + fixes | All | Sprint 4 |
| **Migration dry-run on staging** (Firebase → PostgreSQL) | Backend + QA | Sprint 1 scripts |
| Migration validation scripts (see AC-MIG below) | QA | Dry-run |

### Sprint 6: Data Migration & Launch Prep (2 weeks) — EXTENDED per Validation Gate T-04
**Goal:** Production readiness with validated migration

**Rationale for 2-week extension (over dual-write):** Dual-write across Sprints 2-4 was rejected because it adds debug complexity to every feature sprint, doubles write-path testing, and risks data divergence bugs that distract from the core refactoring goal. Instead: migration scripts are developed incrementally from Sprint 1, dry-run validated in Sprint 5, and production migration happens in a dedicated 2-week Sprint 6 with full rollback capability. This concentrates migration risk into a controlled window rather than spreading it across the entire development timeline.

**Week 1: Migration Execution**

| Task | Owner | Dependency |
|---|---|---|
| Production PostgreSQL + Drizzle migrations deploy | DevOps | Sprint 5 |
| Production KeyCloak deploy + realm config | DevOps | Sprint 5 |
| Production Redis + BullMQ deploy | DevOps | Sprint 5 |
| Production Supabase Storage bucket config | DevOps | Sprint 5 |
| Data migration execution (Firebase → PostgreSQL) | Backend | All infra deployed |
| File migration (Firebase Storage → Supabase Storage) | Backend | Supabase deployed |
| Run migration validation suite (AC-MIG criteria below) | QA | Migration complete |

**Week 2: Validation & Launch**

| Task | Owner | Dependency |
|---|---|---|
| Fix migration validation failures (if any) | Backend | Validation results |
| Smoke tests on staging (all 13 EPICs) | QA | Migration validated |
| E2E regression suite on staging | QA | Smoke pass |
| Performance benchmarks (API p95, LCP) | QA | Staging stable |
| Security scan on production config | DevOps | Deployment |
| Documentation update | All | Sprint 5 |
| Launch checklist sign-off | PM | All |
| Rollback drill (restore from backup, verify) | Backend + DevOps | Backup verified |

### AC-MIG: Data Migration Acceptance Criteria

> These criteria MUST ALL PASS before migration is considered complete. Failure of any single criterion blocks launch.

| ID | Criterion | Validation Method | Pass Condition |
|---|---|---|---|
| AC-MIG-01 | **Row Parity** | Count comparison script: Firebase collection count vs PostgreSQL table count for every entity (users, courses, chapters, quizzes, progress, purchases, subscriptions, notes, assignments, videos, coupons) | Δ = 0 for every entity. Any mismatch fails |
| AC-MIG-02 | **Referential Integrity** | PostgreSQL foreign key constraint validation + orphan detection query (records referencing non-existent parents) | 0 FK violations. 0 orphaned records |
| AC-MIG-03 | **Data Fidelity** | Sample-based comparison: random 10% of records per entity, field-by-field diff (Firebase source vs PostgreSQL target) | 100% field match on sampled records. Allowed transforms documented (e.g., timestamp format) |
| AC-MIG-04 | **Zero Orphan Files** | Cross-reference: every file path in PostgreSQL has a corresponding object in Supabase Storage. Every Supabase object has a PostgreSQL reference | 0 dangling references in either direction |
| AC-MIG-05 | **Round-Trip Test** | For each entity type: create via new API → read → update → delete → verify PostgreSQL state | All CRUD operations succeed. No Firebase fallback triggered |
| AC-MIG-06 | **Auth Continuity** | Migrate 100% of Firebase Auth users to KeyCloak. Verify: existing users can log in without re-registration | 0 users unable to authenticate post-migration |
| AC-MIG-07 | **Rollback Tested** | Execute full rollback procedure: restore PostgreSQL from pre-migration backup, revert KeyCloak config, verify Firebase data intact | Rollback completes in < 1 hour. All data verified post-rollback |
| AC-MIG-08 | **Performance Parity** | Run identical query set against both Firebase (pre-migration baseline) and PostgreSQL (post-migration). Compare p50/p95 response times | PostgreSQL p95 ≤ Firebase p95 (or within 10% tolerance) |
| AC-MIG-09 | **Idempotency** | Run migration script twice on same dataset | Second run produces 0 duplicates, 0 errors. Script is re-runnable |

**Total: ~13 weeks** (Sprints 0-5: 12 weeks × 2 weeks each + Sprint 6: 2 weeks)

---

## 12. TRACEABILITY MATRIX

| CLIENT.txt Ref | Requirement | EPIC | User Story | BA Report Section | Status |
|---|---|---|---|---|---|
| L6-8 (Vision) | Coursera/Udemy-tier learning platform | E3, E4, E5 | US-3.*, US-4.*, US-5.* | Section 1 (Market) | ✅ Covered |
| L13 (Rich media) | Visuals, quizzes, narration, videos | E3 | US-3.3, US-3.5, US-3.6, US-3.9 | Section 3.2 (Visual Feasibility) | ✅ Covered |
| L14 (Videos later) | Remotion for animation | E8 | WON'T (this release) | Section 3.2 | ⏳ Deferred |
| L17 (Student builder) | Students create courses from sources | E2 | US-2.1, US-2.2, US-2.3, US-2.4 | Section 3.1 (Builder Feasibility) | ✅ Covered |
| L18 (PDF files) | PDF source for course builder | E2 | US-2.1 | Section 3.1 | ✅ Covered |
| L19 (MD files) | Markdown source | E2 | US-2.1 | Section 3.1 | ✅ Covered |
| L20 (TXT files) | Text file source | E2 | US-2.1 | Section 3.1 | ✅ Covered |
| L21 (YouTube URL) | YouTube transcript extraction | E2 | US-2.5 (SHOULD) | Section 3.1 | ⏳ Post-MVP |
| L22 (Auto visuals) | Generate visuals per chapter/lesson | E3 | US-3.6 | Section 3.2 | ✅ Covered |
| L23 (Excalidraw) | Excalidraw for Mermaid diagrams | E3 | US-3.6 (Post-MVP subtask) | Section 3.2 | ⏳ Post-MVP |
| L27 (Multi-role) | Student, Instructor, Admin roles | E1 | US-1.1, US-1.2 | Section 3.4B (KeyCloak) | ✅ Covered |
| L27 (Auth) | Authentication & authorization | E1, E11 | US-1.1, US-1.2, US-11.2 | Section 3.4B | ✅ Covered |
| L28 (Payments) | Stripe payment processing | E5 | US-5.1, US-5.2, US-5.3 | Section 3.4 | ✅ Covered |
| L29 (AI) | AI-powered features (OpenAI/Gemini) | E2, E3, E8 | US-2.3, US-3.4-3.7, US-8.1 | Section 3.1, 3.2 | ✅ Covered |
| L30 (Marketplace) | Course discovery marketplace | E4 | US-4.1, US-4.2, US-4.3 | Section 2 (Competitive) | ✅ Covered |
| PM Q1 | 1 chapter at a time, student-initiated | E2 | US-2.4 | N/A (PM directive) | ✅ Covered |
| PM Q2 | Context-driven visuals | E3 | US-3.6, BR-03 | Section 3.2 | ✅ Covered |
| PM Q3 | Mix audience, outline-only for paid | E1, E4 | US-1.2, US-4.2, BR-01 | N/A (PM directive) | ✅ Covered |
| PM Q4 | Platform creates first, students build | E2, E4 | US-2.*, BR-04 | Section 2 (Competitive) | ✅ Covered |
| PM Q5 | Production refactoring (PostgreSQL, KeyCloak, Orval, security) | E11 | US-11.1-11.5 | Section 3.4 | ✅ Covered |

**Coverage: 100% of CLIENT.txt requirements traced. 0 orphan requirements.**

---

## 13. RECOMMENDATIONS REGISTER

| ID | Recommendation | Source | Rationale | PM Approved? |
|---|---|---|---|---|
| REC-01 | Third-party security audit before launch | BA Report Section 3.4D | Ed-tech sector requires GDPR/FERPA compliance; breach risk is critical | PENDING |
| REC-02 | Start with vertical focus (professional development or tech) | BA Report Section 5 | Easier to build community, achieve quality baseline | PENDING |
| REC-03 | Add virus/malware scanning on file uploads | US-2.1 T-2.1.4 | Security best practice for user-uploaded content | PENDING |
| REC-04 | Store rewrite history for undo capability | US-3.4 | Prevent accidental content loss from AI rewrite | PENDING |
| REC-05 | Video transcoding pipeline | US-3.9 | Ensure cross-browser/device video playback | PENDING |
| REC-06 | Send purchase confirmation + invoice emails | US-5.1, US-5.3 | Standard e-commerce expectation | PENDING |
| REC-07 | Notification system for peer reviews | US-7.2 | Student engagement driver | PENDING |
| REC-08 | Audit logging for admin actions | US-9.2 | Compliance + debugging requirement | PENDING |
| REC-09 | Note export to PDF | US-3.8 | Student study workflow enhancement | PENDING |
| REC-10 | Draft state preservation in course builder | US-2.2 | Prevent lost work if user navigates away | PENDING |
| REC-11 | Platform tagline: "Illuminate Your Learning" | Brand Identity | Clear positioning + name alignment | PENDING |
| REC-12 | i18next for multi-language support | BA Report Section 3.3 | First-class i18n per PM Q4 (competitive advantage) | PENDING |
| REC-13 | ~~Use Supabase or managed PostgreSQL for initial deployment~~ | BA Report Section 3.4A | **SUPERSEDED:** Supabase Storage confirmed (VG A-02). PostgreSQL hosting TBD in Phase 2 | N/A |

---

## SIGN-OFF

### Validation Gate Checklist

- [x] **Architect:** APPROVED — all 3 conditions RESOLVED (Drizzle ORM, Supabase Storage, BullMQ + Redis)
- [x] **Tech Lead:** APPROVED — all 3 conditions RESOLVED (CourseView decomp added, migration ACs defined, Sprint 6 extended)
- [x] **Designer:** APPROVED (0 blocking; 5 Phase 3 recommendations)

**Result: 3/3 APPROVED — ALL CONDITIONS RESOLVED — PRD cleared for Phase 2 (Architecture)**

### Conditions Resolution Log

| ID | Condition | Resolution | Resolved by | Date |
|---|---|---|---|---|
| A-01 | Select ORM | **Drizzle ORM** selected. Updated: Section 1.3, US-11.1, US-1.3, US-2.3, Sprint 0 | PM (client decision) | 2026-04-11 |
| A-02 | Select object storage | **Supabase Storage** selected (NOT MinIO). Updated: US-1.3, US-3.9, Section 9.3, Section 10.5, Sprint 0, Sprint 6 | PM (client decision) | 2026-04-11 |
| A-05 | Define background job architecture | **BullMQ + Redis** confirmed. Added: US-11.6 (full story + ACs + tasks), Sprint 0 infra, Sprint 2 queue integration, Section 9.3 failure handling | PM (client decision) | 2026-04-11 |
| T-02 | Add CourseView.tsx decomposition | **T-3.0.1 added to Sprint 2.** 10 sub-components listed: ChapterNavigation, QuizPanel, AudioPlayer, VisualGenerator, TutorChat, NotesPanel, VideoPlayer, OfflineManager, CertificateModal, ProgressTracker | Tech Lead | 2026-04-11 |
| T-03 | Define migration acceptance criteria | **AC-MIG-01 through AC-MIG-09 defined** in Sprint Plan. Covers: row parity, referential integrity, data fidelity, zero orphan files, round-trip, auth continuity, rollback tested, performance parity, idempotency | Tech Lead | 2026-04-11 |
| T-04 | Sprint 6 timeline | **Extended Sprint 6 to 2 weeks** (over dual-write). Rationale documented in Sprint 6. Total timeline: ~13 weeks. Migration dry-run added to Sprint 5 | PM + Tech Lead | 2026-04-11 |

---

**Authored by:** PO Team (Claude)  
**Date:** 2026-04-11  
**Version:** 1.2 (all Validation Gate conditions resolved)  
**Status:** APPROVED — Ready for Phase 2 (Architecture)

**Referenced Documents:**
- [CLIENT.txt](CLIENT.txt) — Client verbatim requirements (immutable)
- [PM_Verification_Responses.md](PM_Verification_Responses.md) — PM gap closure
- [BA_Research_Report.md](BA_Research_Report.md) — Market research & feasibility
- [gapslog.md](gapslog.md) — Gaps tracking (all CLOSED)
- [contextlog.md](contextlog.md) — Task status tracking
