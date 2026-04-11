# Bug Log
<!-- Phase 5+ — Bugs and root-cause fixes -->

| Date | Bug ID | Description | Root Cause | Fix Applied | Affected Files | Verified By |
|------|--------|-------------|------------|-------------|----------------|-------------|
| 2026-04-11 | BUG-001 | TS error: `'2025-02-24.acacia'` not assignable to `'2026-03-25.dahlia'` in server/src/app.ts | Stripe SDK updated to v22.x which requires new API version string. app.ts still has old version string. | NOT YET FIXED — pre-dates US-11.1. Fix: update `apiVersion: '2026-03-25.dahlia'` in app.ts. Blocked until owner assigns. | server/src/app.ts line 23 | BE-B (discovered during US-11.1 tsc run) |
