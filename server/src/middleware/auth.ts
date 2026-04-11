/**
 * US-11.2 T-11.2.5 — KeyCloak token introspection middleware
 *
 * Flow:
 *   1. Extract Bearer token from Authorization header
 *   2. POST to KeyCloak introspection endpoint (RFC 7662)
 *   3. Validate `active: true`
 *   4. Extract realm roles → req.user
 *   5. Return 401 on any failure
 *
 * Design notes:
 * - Uses token introspection (not local JWT verification) so KeyCloak's
 *   revocation list is always respected. Trade-off: one HTTP call per request.
 *   Mitigate with Redis cache keyed by token hash (US-11.4 rate-limiting sprint).
 * - No JWT library dependency — avoids key-rotation coupling.
 */

import type { Request, Response, NextFunction } from 'express';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AppRole = 'student' | 'teacher' | 'admin';

export interface AuthenticatedUser {
  /** KeyCloak subject ID — same as keycloak_id in users table */
  sub: string;
  email: string;
  name: string | undefined;
  roles: AppRole[];
  /** Raw KeyCloak token — passed through for downstream use */
  accessToken: string;
}

// Extend Express Request with typed user
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

// ---------------------------------------------------------------------------
// KeyCloak introspection response shape (RFC 7662 + KeyCloak additions)
// ---------------------------------------------------------------------------

interface IntrospectionResponse {
  active: boolean;
  sub?: string;
  email?: string;
  name?: string;
  realm_access?: {
    roles?: string[];
  };
  exp?: number;
  iat?: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getKcConfig(): { url: string; clientId: string; clientSecret: string } {
  const url = process.env['KEYCLOAK_URL'];
  const realm = process.env['KEYCLOAK_REALM'] ?? 'lumina';
  const clientId = process.env['KEYCLOAK_CLIENT_ID'] ?? 'lumina-api';
  const clientSecret = process.env['KEYCLOAK_CLIENT_SECRET'];

  if (!url) throw new Error('KEYCLOAK_URL env var not set');
  if (!clientSecret) throw new Error('KEYCLOAK_CLIENT_SECRET env var not set');

  return {
    url: `${url}/realms/${realm}/protocol/openid-connect/token/introspect`,
    clientId,
    clientSecret,
  };
}

/** Map KeyCloak realm roles to typed AppRole — unknown roles are dropped */
function mapRoles(realmRoles: string[]): AppRole[] {
  const valid = new Set<AppRole>(['student', 'teacher', 'admin']);
  return realmRoles.filter((r): r is AppRole => valid.has(r as AppRole));
}

async function introspectToken(token: string): Promise<IntrospectionResponse> {
  const { url, clientId, clientSecret } = getKcConfig();

  const body = new URLSearchParams({
    token,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    signal: AbortSignal.timeout(5000), // 5-second timeout
  });

  if (!response.ok) {
    throw new Error(`KeyCloak introspection HTTP ${response.status}`);
  }

  return response.json() as Promise<IntrospectionResponse>;
}

// ---------------------------------------------------------------------------
// authenticate middleware — applies to all /api/v1/* routes
// ---------------------------------------------------------------------------

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      error: {
        code: 'AUTH_TOKEN_MISSING',
        message: 'Authorization: Bearer <token> header required',
        status: 401,
        requestId: (req.headers['x-request-id'] as string | undefined) ?? 'unknown',
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    const introspection = await introspectToken(token);

    if (!introspection.active) {
      res.status(401).json({
        error: {
          code: 'AUTH_TOKEN_EXPIRED',
          message: 'Token is not active or has been revoked',
          status: 401,
          requestId: (req.headers['x-request-id'] as string | undefined) ?? 'unknown',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    if (!introspection.sub) {
      res.status(401).json({
        error: {
          code: 'AUTH_TOKEN_INVALID',
          message: 'Token missing subject claim',
          status: 401,
          requestId: (req.headers['x-request-id'] as string | undefined) ?? 'unknown',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const roles = mapRoles(introspection.realm_access?.roles ?? []);

    req.user = {
      sub: introspection.sub,
      email: introspection.email ?? '',
      name: introspection.name,
      roles,
      accessToken: token,
    };

    next();
  } catch (err) {
    console.error('[auth] introspection error:', err);
    res.status(401).json({
      error: {
        code: 'AUTH_INTROSPECTION_FAILED',
        message: 'Unable to validate token with identity provider',
        status: 401,
        requestId: (req.headers['x-request-id'] as string | undefined) ?? 'unknown',
        timestamp: new Date().toISOString(),
      },
    });
  }
}
