/**
 * US-11.2 T-11.2.6 — RBAC middleware
 *
 * Usage:
 *   router.get('/admin/stats', authenticate, requireRole('admin'), handler)
 *   router.post('/courses',    authenticate, requireRole('student', 'teacher', 'admin'), handler)
 *
 * Role hierarchy: admin > teacher > student
 * The `authenticate` middleware MUST run before `requireRole`.
 */

import type { Request, Response, NextFunction } from 'express';
import type { AppRole } from './auth.js';

/**
 * Returns Express middleware that enforces role membership.
 * At least one of the user's roles must appear in `allowedRoles`.
 */
export function requireRole(...allowedRoles: AppRole[]) {
  return function roleGuard(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    const user = req.user;

    // authenticate() runs first — if we reach here without req.user it's a
    // middleware ordering bug, not a client error. Fail loudly.
    if (!user) {
      res.status(500).json({
        error: {
          code: 'MIDDLEWARE_ORDER_ERROR',
          message: 'requireRole called before authenticate',
          status: 500,
          requestId: (req.headers['x-request-id'] as string | undefined) ?? 'unknown',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const allowed = new Set<AppRole>(allowedRoles);
    const hasRole = user.roles.some((r) => allowed.has(r));

    if (!hasRole) {
      res.status(403).json({
        error: {
          code: 'AUTH_INSUFFICIENT_ROLE',
          message: `This endpoint requires one of: [${allowedRoles.join(', ')}]`,
          status: 403,
          requestId: (req.headers['x-request-id'] as string | undefined) ?? 'unknown',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    next();
  };
}
