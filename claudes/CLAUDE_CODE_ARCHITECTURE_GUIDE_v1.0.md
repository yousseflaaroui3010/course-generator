# CLAUDE CODE — PROJECT ARCHITECTURE & MASTERY GUIDE

> **Version:** v1.0.0
> **Purpose:** Set up Claude Code to orchestrate a multi-phase tech project lifecycle
> with maximum token efficiency, senior-level output, and zero ambiguity.

---

## PART 1: HOW CLAUDE CODE ACTUALLY WORKS (Plain Language)

---

### 1.1 The Mental Model — Think of It Like a Company

Imagine Claude Code is a new hire joining your company. Here's how its "brain" works:

```
ALWAYS IN CLAUDE'S HEAD (loaded every single message):
├── CLAUDE.md          ← The employee handbook. Short. Core rules only.
│                        Claude reads this EVERY time you talk to it.
│                        BIGGER FILE = MORE TOKENS BURNED EVERY MESSAGE.
│
└── CLAUDE.local.md    ← Your personal sticky notes (git-ignored).
                         Machine-specific paths, API keys location, etc.

LOADED ONLY WHEN RELEVANT (on-demand):
├── .claude/skills/    ← Specialist training manuals.
│                        Claude reads these ONLY when a specific task matches
│                        OR when you explicitly call /skill-name.
│                        THIS IS YOUR BIGGEST TOKEN SAVER.
│
└── .claude/rules/     ← Department policies by folder.
                         Rules that apply ONLY to files in specific paths.
                         Example: rules for /src/api/ vs /src/ui/

CLAUDE'S OWN NOTEBOOK (auto-managed):
└── ~/.claude/projects/<repo>/memory/
    └── MEMORY.md      ← Claude's personal notes from past sessions.
                         Things it learned, preferences it noticed, build commands
                         that worked. First 200 lines auto-loaded.
```

**The golden rule:** CLAUDE.md is your electricity bill — every line costs tokens on EVERY message. Skills are like turning on a lamp only when you need light.

---

### 1.2 Every Command Explained Like You're 10

#### `/init` — "Set up your desk"
**What:** Auto-generates a starter CLAUDE.md by scanning your project.
**When:** First time opening a project in Claude Code. Once.
**Think of it as:** Giving Claude a tour of the office on day one.

#### `/compact` — "Summarize everything we've said so far"
**What:** Takes the entire conversation and squishes it into a short summary. Old messages are replaced with the summary.
**When to use:**
- Your conversation is getting long (you've been going back and forth 20+ times)
- Claude starts forgetting things you told it earlier
- Before starting a new sub-task within the same session
**Pro tip:** You can guide it: `/compact Focus on the auth system changes only`
**Think of it as:** Writing meeting minutes and throwing away the recording.

#### `/clear` — "Forget everything we just talked about"
**What:** Wipes the conversation completely. CLAUDE.md and skills stay (they're files, not conversation).
**When to use:**
- You're done with one task and starting something completely unrelated
- You went down a wrong path and want a fresh start
- After completing a phase and moving to the next
**Think of it as:** Ending a meeting and starting a new one. The employee handbook is still on the desk.

#### `/memory` — "Show me your notebook"
**What:** Shows all loaded memory files, lets you toggle auto-memory on/off, lets you edit.
**When to use:**
- Start of a new session: "What do you remember?"
- After a big task: check if Claude saved useful learnings
- Periodically: prune outdated notes
**Think of it as:** Checking the intern's notes to make sure they're accurate.

#### `/skill-name` — "Pull out the specialist manual"
**What:** Loads a specific skill file on demand.
**When to use:** When you need Claude to perform a specific, repeatable task (like "run Phase 1 BA research" or "do a security audit").
**Think of it as:** Handing a doctor a specific procedure manual before surgery.

#### `/sandbox` — "Work in a safe room"
**What:** Runs code in an isolated environment so nothing can break your real system.
**When to use:** ALWAYS for untested code, new dependencies, or anything security-sensitive.
**Think of it as:** A chemistry lab with safety glass.

---

### 1.3 Files & Folders — What Goes Where

```
your-project/
│
├── CLAUDE.md                    ← ORCHESTRATOR (always loaded, <200 lines)
├── CLAUDE.local.md              ← Your local-only overrides (git-ignored)
│
├── .claude/
│   ├── rules/                   ← Path-scoped rules (auto-loaded per directory)
│   │   ├── src-api.md           ← Rules only for /src/api/ files
│   │   ├── src-ui.md            ← Rules only for /src/ui/ files
│   │   └── tests.md             ← Rules only for /tests/ files
│   │
│   └── skills/                  ← On-demand phase prompts (TOKEN EFFICIENT)
│       ├── phase1-discovery/
│       │   └── SKILL.md         ← Full Phase 1 prompt (BA, PO, UX roles)
│       ├── phase2-architecture/
│       │   └── SKILL.md         ← Full Phase 2 prompt (Architect, TL, Security)
│       ├── phase3-design/
│       │   └── SKILL.md         ← Full Phase 3 prompt (UI/UX Designer)
│       ├── phase4-sprint-setup/
│       │   └── SKILL.md         ← Full Phase 4 prompt (Scrum Init)
│       ├── phase5-development/
│       │   └── SKILL.md         ← Full Phase 5 prompt (Dev Sprints)
│       ├── phase6-qa/
│       │   └── SKILL.md         ← Full Phase 6 prompt (QA & Testing)
│       ├── phase7-deployment/
│       │   └── SKILL.md         ← Full Phase 7 prompt (Release)
│       ├── phase8-monitoring/
│       │   └── SKILL.md         ← Full Phase 8 prompt (Ops & Iteration)
│       └── common/
│           ├── verify-client-intent/
│           │   └── SKILL.md     ← Reusable: verify any deliverable against CLIENT.txt
│           ├── search-first/
│           │   └── SKILL.md     ← Reusable: online research protocol
│           └── log-update/
│               └── SKILL.md     ← Reusable: update contextlog/gapslog/buglog
│
├── docs/                        ← Project documentation
│   ├── CLIENT.txt               ← Client's verbatim words (PM-only edits)
│   ├── contextlog.md            ← What's ongoing/done/left/blocked
│   ├── gapslog.md               ← Missing/ambiguous requirements
│   ├── buglog.md                ← Bugs & fixes (Phase 5+)
│   ├── PRD.md                   ← Product Requirements Document (Phase 1 output)
│   ├── BA_Research_Report.md    ← BA deliverable
│   ├── UX_Research_Report.md    ← UX deliverable
│   └── Tech_Blueprint.md        ← Phase 2 output
│
├── src/                         ← Source code (Phase 5+)
└── tests/                       ← Test code (Phase 5+)
```

---

### 1.4 WHY This Structure Saves Tokens

| Approach | Tokens per message | Problem |
|----------|--------------------|---------|
| Everything in CLAUDE.md | ~8,000–15,000+ | Every message burns the full rulebook |
| Our approach: CLAUDE.md orchestrator + skills | ~800–1,500 (base) + skill only when called | 80–90% reduction on routine messages |

**How it works:**
1. CLAUDE.md (always loaded) = ~150 lines. Contains: project identity, active phase, orchestration rules, core standards.
2. When you say "Start Phase 1 BA research" → Claude loads `.claude/skills/phase1-discovery/SKILL.md` → reads the full BA prompt → executes → skill unloads after the task.
3. Next message about something else? Only CLAUDE.md is loaded again. The Phase 1 skill isn't burning tokens.

---

## PART 2: THE ORCHESTRATOR — CLAUDE.md

This is the actual file you put in your project root.

---

```markdown
# PROJECT ORCHESTRATOR
<!-- Version: v1.0.0 | Keep this file UNDER 200 lines -->

## Project Identity
- **Project:** [PROJECT NAME]
- **Client Brief:** See `docs/CLIENT.txt` (NEVER modify except PM)
- **Active Phase:** [PHASE 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8]
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

### Code Standards (Phase 5+)
- DRY code — no duplication
- Type checking enabled (strict mode)
- Linting enforced (config in project root)
- Error/exception handling on every external call
- Plan for failure: invalid inputs, edge cases, unauthorized access
- Unit tests for every function, e2e tests for every flow
- Every PR must pass: lint + type check + unit tests + security scan

### Logging Protocol
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

## Session Discipline
- One focused task per session.
- `/compact` when context feels heavy or before switching sub-tasks.
- `/clear` when switching phases or starting unrelated work.
- `/memory` audit at session start — prune stale notes.
- `/sandbox` for all untested code.
```

---

## PART 3: SKILL FILE ANATOMY — How to Build a Phase Skill

Every skill lives in `.claude/skills/[skill-name]/SKILL.md` and follows this structure:

```markdown
---
# YAML Frontmatter — Claude uses this to decide when to auto-trigger the skill
name: phase1-discovery
description: >
  Phase 1: Discovery, Research & Requirements.
  Activate when working on business analysis, market research, UX research,
  PRD creation, competitor analysis, or requirements gathering.
triggers:
  - "phase 1"
  - "discovery"
  - "PRD"
  - "business analysis"
  - "competitor analysis"
  - "UX research"
  - "requirements"
---

# Phase 1 — Discovery, Research & Requirements

[... FULL PHASE PROMPT GOES HERE ...]
[... This is where the role definitions, DOs/DON'Ts, deliverable templates,
     sequence diagrams, validation gates, etc. live ...]
[... This content is ONLY loaded when the skill is triggered ...]
```

### Key Rules for Skills

1. **YAML `description`** must be specific — Claude uses it to decide if the skill is relevant. Vague = won't trigger.
2. **`triggers`** are keyword hints. If the user's message contains these words, Claude considers loading the skill.
3. **The body** (after the `---`) is the full prompt. Can be as long as needed — it's only loaded on demand.
4. **One skill per phase.** Don't split Phase 1 into three skills (BA skill, UX skill, PO skill) — that forces you to manage loading order. One file, one phase, all roles inside.
5. **Cross-cutting skills** (verify-client-intent, search-first, log-update) are small, reusable, and can be called from any phase.

---

## PART 4: COMMON SKILLS (Reusable Across All Phases)

### 4.1 verify-client-intent Skill

```markdown
---
name: verify-client-intent
description: >
  Verify any deliverable or decision against CLIENT.txt to ensure alignment
  with the client's original intent. Use before handoffs or when unsure.
triggers:
  - "verify against client"
  - "check client intent"
  - "does this match CLIENT.txt"
---

# Verify Client Intent Protocol

## Steps
1. Read `docs/CLIENT.txt` in full.
2. Read the deliverable or decision being verified.
3. For each claim/requirement in the deliverable:
   a. Find the corresponding line(s) in CLIENT.txt.
   b. If found → mark as TRACED.
   c. If not found but labeled as RECOMMENDATION → acceptable (must be labeled).
   d. If not found and NOT labeled as recommendation → FLAG as UNTRACED.
4. For each CLIENT.txt requirement:
   a. Check if it appears in the deliverable.
   b. If missing → FLAG as MISSING REQUIREMENT.
5. Output:
   - Traceability score: X/Y requirements traced
   - List of UNTRACED items
   - List of MISSING REQUIREMENTS
   - Verdict: PASS / FAIL (PASS = 100% traced, 0 missing)
```

### 4.2 search-first Skill

```markdown
---
name: search-first
description: >
  Online research protocol. Search for current best practices, tools, libraries,
  or market data before making any claim. Verify versions and dates.
triggers:
  - "research"
  - "search for"
  - "find the latest"
  - "what's the best"
  - "current version"
---

# Search-First Protocol

## Steps
1. Identify the claim or decision that needs verification.
2. Search online for current, authoritative sources.
3. For each source:
   - URL
   - Date accessed
   - Date of content (is it current?)
   - Relevance to our specific case
4. Cross-reference minimum 2 sources for critical claims.
5. Output:
   - Finding (what you learned)
   - Sources (with URLs)
   - Confidence: HIGH / MEDIUM / LOW
   - Probability of being wrong: X%
   - Version check: is this the latest stable version? (if applicable)
   - Alternative approaches found (if any)
6. If you find a NEWER or BETTER approach than your initial instinct → USE IT.
7. Never present outdated information as current.
```

### 4.3 log-update Skill

```markdown
---
name: log-update
description: >
  Update project logs (contextlog.md, gapslog.md, buglog.md).
  Use after completing tasks, finding gaps, or encountering bugs.
triggers:
  - "update log"
  - "log this"
  - "mark as done"
  - "mark as blocked"
  - "found a bug"
  - "found a gap"
---

# Log Update Protocol

## Which log?
- **contextlog.md** → Task status changes (ONGOING/DONE/LEFT/BLOCKED)
- **gapslog.md** → Missing/ambiguous requirements in CLIENT.txt
- **buglog.md** → Bugs found and fixes applied (Phase 5+)

## Format
Follow the exact table format defined in each log file's header.
Never overwrite existing entries — append new rows only.
Status changes get new rows (shows history).

## Rules
- BLOCKED items: describe what's blocked, why, and assign to PM.
- DONE items: include what was completed and who verified it.
- Gaps: include CLIENT.txt line reference and exact ambiguity.
- Bugs: include root cause, fix applied, and all affected files.
```

---

## PART 5: SESSION WORKFLOW — Your Daily Process

### Starting a New Session

```
Step 1: Open project in Claude Code
Step 2: Run /memory → check what Claude remembers, prune if stale
Step 3: Check CLAUDE.md → verify Active Phase is correct
Step 4: State your task clearly:
        "We're in Phase 1. Run the BA research workflow
         against docs/CLIENT.txt"
Step 5: Claude auto-loads phase1-discovery skill → executes
```

### During a Session

```
Working on task...
├── Context getting long? → /compact (with focus note)
├── Hit a blocker? → /log-update → continue non-blocked work
├── Need to verify against client? → /verify-client-intent
├── Need to research something? → /search-first
├── Sub-task done? → /compact before starting next sub-task
└── Phase complete? → Update Active Phase in CLAUDE.md → /clear
```

### Ending a Session

```
Step 1: /log-update — mark tasks as DONE or ONGOING
Step 2: /compact — save a summary of what happened
Step 3: Verify MEMORY.md — did Claude save anything useful/wrong?
Step 4: Close or /clear for next session
```

### Switching Phases

```
Step 1: Verify current phase completion checklist (in the phase skill)
Step 2: Update CLAUDE.md: change Active Phase to next phase number
Step 3: /clear — fresh context for new phase
Step 4: Start new session → Claude loads new phase skill on demand
```

---

## PART 6: WHAT "SENIOR-LEVEL" MEANS IN THIS SYSTEM

Every piece of code or documentation produced must meet these standards:

| Dimension | What It Means | How We Enforce It |
|-----------|---------------|-------------------|
| **Secure** | OWASP Top 10 compliant. No secrets in code. Auth/authz on every endpoint. | Phase 2 threat model + Phase 6 security scan |
| **Sustainable** | Readable by a stranger 6 months from now. Documented. | Bus-factor docs + code comments on WHY, not WHAT |
| **Maintainable** | Modular. Single responsibility. Low coupling. | DRY checks + code review skill |
| **Scalable** | Handles 10x current load without architecture changes. | Phase 2 architecture decisions + load testing |
| **Performant** | <2s LCP, <200ms API p95, no memory leaks. | Phase 6 performance testing + Phase 8 monitoring |
| **Testable** | Every function unit-testable. Every flow e2e-testable. | Mandatory test coverage in Phase 5 |
| **Type-safe** | Strict type checking. No `any`. No implicit coercion. | Linter + type checker in CI |
| **Error-resilient** | Every external call has error handling. Graceful degradation. | Edge case planning in PRD + code review |
| **DRY** | Zero code duplication. Shared utilities extracted. | Linter rules + code review |
| **Accessible** | WCAG 2.1 AA. Keyboard navigable. Screen reader tested. | Phase 3 design specs + Phase 6 accessibility audit |

---

## PART 7: QUICK REFERENCE CARD

```
┌─────────────────────────────────────────────────────┐
│  CLAUDE CODE — QUICK REFERENCE                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  /init        → First-time project setup            │
│  /compact     → Shrink conversation (save tokens)   │
│  /clear       → Fresh start (keeps files)           │
│  /memory      → See/edit Claude's notebook          │
│  /sandbox     → Safe execution environment          │
│                                                     │
│  CLAUDE.md    → Always loaded. Keep <200 lines.     │
│  .claude/skills/ → On-demand. Token efficient.      │
│  .claude/rules/  → Path-scoped. Auto-loaded by dir. │
│  MEMORY.md    → Claude's auto-notes. Review often.  │
│                                                     │
│  WORKFLOW:                                          │
│  1. /memory → check state                           │
│  2. State task + phase clearly                      │
│  3. Claude loads right skill automatically           │
│  4. /compact when heavy                             │
│  5. /log-update when done or blocked                │
│  6. /clear when switching phases                    │
│                                                     │
│  RULES:                                             │
│  • Search online before claiming anything           │
│  • Never hallucinate requirements                   │
│  • Fix root causes, not symptoms                    │
│  • CLIENT.txt is immutable (PM only)                │
│  • Every deliverable versioned + traceable          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

*End of Claude Code Architecture Guide — v1.0.0*
