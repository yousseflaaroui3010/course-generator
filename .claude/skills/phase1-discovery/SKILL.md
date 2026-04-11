---
name: phase1-discovery
description: >
  Phase 1: Discovery, Research & Requirements. Business analysis, market research,
  competitor analysis, UX research, PRD creation, requirements gathering.
triggers:
  - "phase 1"
  - "discovery"
  - "PRD"
  - "business analysis"
  - "competitor analysis"
  - "UX research"
  - "requirements"
  - "feasibility"
---

# PHASE 1 — DISCOVERY, RESEARCH & REQUIREMENTS

## SPRINT DISCIPLINE
Work in MICRO-SPRINTS (1 deliverable per cycle) to manage context:
1. PM Intake → BA Research → UX Research → PO PRD → Validation Gate
2. `/compact` after each deliverable. `/clear` after phase completion.
3. Update contextlog.md + gapslog.md before every compact/clear — logs ARE your memory.

## SEQUENCE
```
CLIENT.txt (immutable, PM-only edits)
  → PM: verify completeness, identify gaps, ask client targeted questions (max 5/round)
  → BA: research, feasibility, competitor analysis → BA_Research_Report.md
  → UX Researcher: personas, journeys, competitor UX audit → UX_Research_Report.md
  → PO: synthesize all inputs → PRD.md
  → Validation Gate: Architect + Tech Lead + Designer confirm PRD is buildable
```
Each handoff: sender verifies vs CLIENT.txt → receiver verifies input before accepting.
Rejections are specific (line refs), never wholesale. Traces to client? → PM resolves.

## INPUT VERIFICATION (every role, before any work)
1. Read CLIENT.txt in full
2. Read gapslog.md for existing gaps
3. For each requirement: clear? enough context? implicit assumptions?
4. New gaps → gapslog.md with CLIENT.txt line ref + GAP-ID
5. Blocked items → contextlog.md as BLOCKED → continue non-blocked work → PM resolves

## BA — RESEARCH & FEASIBILITY
**Delivers:** BA_Research_Report.md — market research, competitor analysis (min 3), feasibility.

Per competitor: brand identity, color palette (hex), fonts, feature inventory/EPICs, UX patterns, pricing, strengths/weaknesses. All sourced with URLs.

Per requirement: technical + business feasibility, risk level.

Recommendations labeled RECOMMENDATION (never as requirements). Include confidence level + probability of being wrong. Every claim sourced — zero hallucinated data.

**Search online for:** market data, competitor info, industry trends, feasibility validation. Multiple sources for critical claims. Latest data only.

## UX RESEARCHER
**Delivers:** UX_Research_Report.md — personas, journeys, competitor UX audit, accessibility.

Personas traced to CLIENT.txt. Journey maps for critical flows. Competitor UX audit (min 3): onboarding, navigation, task completion, accessibility, error/empty/loading states.

Edge cases: empty states, error recovery, slow connection, accessibility (WCAG 2.1 AA). Information architecture proposal. All recommendations sourced and evidence-based.

## PO — PRD ASSEMBLY
**Delivers:** PRD.md — the definitive product spec. ALL gaps must be CLOSED before starting.

**PRD must contain:**
- Project overview, scope (IN/OUT explicit), KPIs
- User types + access matrix (user × feature × permission)
- Brand identity, color palette (with hex + usage), typography
- Feature inventory as EPICs → User Stories (INVEST criteria) → Tasks → Sub-tasks
- Acceptance criteria in Given/When/Then format, min 2 edge cases per story
- MoSCoW backlog (MUST/SHOULD/COULD/WON'T — zero unclassified)
- Business rules with source references
- Edge cases & failure planning (invalid input, wrong file type, unauthorized access, etc.)
- Non-functional requirements (performance, availability, security, accessibility targets)
- Preliminary sprint plan with dependencies
- Traceability matrix: CLIENT.txt line → requirement → EPIC → story → BA/UX report section
- Recommendations register: source, rationale, PM approved yes/no

Every requirement traces to CLIENT.txt or PM-approved recommendation. No orphans. No hallucinated requirements.

## VALIDATION GATE
Architect + Tech Lead + Designer each independently review PRD.md vs CLIENT.txt:
- Architect: technically feasible? missing integrations/scalability concerns?
- Tech Lead: stories estimable? tasks decomposed enough?
- Designer: UX requirements clear enough to design from? brand direction sufficient?

Verdict: APPROVED or REJECTED with specific issues + suggested fixes. All three must approve. Rejections loop back for resolution then re-review.

## ALL ROLES — RULES
- Search online first. Include source URLs, confidence level, probability of being wrong.
- Never hallucinate data, requirements, or market info. Don't know → say so → log gap.
- No hacks — proper solutions only. Need more time → flag to PM.
- Differentiate CLIENT REQUIREMENTS from TEAM RECOMMENDATIONS. Always.
- Conflicts: both sides document evidence + reasoning → PM decides → logged → no re-litigation.
- Documentation: versioned, authored, dated, self-contained (bus factor = ∞).

## PHASE 1 COMPLETE WHEN
□ CLIENT.txt verified + all gaps CLOSED □ BA Report accepted by PM
□ UX Report accepted by PM □ PRD complete (all sections)
□ Traceability: 100% CLIENT.txt coverage □ Validation Gate: 3/3 APPROVED
□ contextlog.md clean □ Phase 2 team confirms readiness → `/compact` → `/clear`