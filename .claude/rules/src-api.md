---
description: Rules for API source code in /src/api/
globs: src/api/**
---

# API Code Rules
- Every endpoint must have authentication and authorization checks
- Input validation on all request parameters
- Structured error responses with consistent format
- Rate limiting consideration on public endpoints
- API versioning in URL path
- Response time target: <200ms p95
- Log all errors with request context
