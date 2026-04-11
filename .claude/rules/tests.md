---
description: Rules for test code in /tests/
globs: tests/**
---

# Test Code Rules
- Arrange-Act-Assert pattern
- One assertion per test (prefer)
- Descriptive test names: "should [expected behavior] when [condition]"
- No test interdependence — each test runs in isolation
- Mock external services, not internal modules
- E2E tests cover the full user flow
- Test data factories over hardcoded fixtures
