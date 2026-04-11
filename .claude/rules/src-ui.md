---
description: Rules for UI source code in /src/ui/
globs: src/ui/**
---

# UI Code Rules
- Components must be accessible (WCAG 2.1 AA)
- Keyboard navigable, screen reader compatible
- Responsive design: mobile-first approach
- No inline styles — use design system tokens
- Loading and error states on every async component
- LCP target: <2s
- Lazy load below-the-fold content
