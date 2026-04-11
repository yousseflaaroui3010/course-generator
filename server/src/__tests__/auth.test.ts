/**
 * US-11.2 T-11.2.7 — Auth middleware integration tests
 *
 * Arrange-Act-Assert pattern. Tests are isolated.
 * KeyCloak integration tests are skipped when KEYCLOAK_URL is not set.
 *
 * Unit tests (no external service): test middleware logic with mocked fetch.
 * Integration tests: require a running KeyCloak instance (docker compose up keycloak).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import type { AppRole } from '../middleware/auth.js';

const KC_AVAILABLE = Boolean(
  process.env['KEYCLOAK_URL'] && process.env['KEYCLOAK_CLIENT_SECRET'],
);

// ---------------------------------------------------------------------------
// Helpers — build minimal mock Express req/res/next
// ---------------------------------------------------------------------------

function mockReq(headers: Record<string, string> = {}): Request {
  return {
    headers: {
      'x-request-id': 'test-req-id',
      ...headers,
    },
  } as unknown as Request;
}

function mockRes(): { res: Response; json: ReturnType<typeof vi.fn>; status: ReturnType<typeof vi.fn> } {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const res = { status, json } as unknown as Response;
  // Allow status().json() chaining
  (res as any).status = status;
  return { res, json, status };
}

function mockNext(): NextFunction {
  return vi.fn() as unknown as NextFunction;
}

// ---------------------------------------------------------------------------
// Unit tests — mock global fetch
// ---------------------------------------------------------------------------

describe('authenticate middleware — unit (mocked fetch)', () => {
  beforeEach(() => {
    // Ensure env is set so getKcConfig() doesn't throw
    process.env['KEYCLOAK_URL'] = 'http://localhost:8080';
    process.env['KEYCLOAK_REALM'] = 'lumina';
    process.env['KEYCLOAK_CLIENT_ID'] = 'lumina-api';
    process.env['KEYCLOAK_CLIENT_SECRET'] = 'test-secret';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return 401 when Authorization header is missing', async () => {
    const { authenticate } = await import('../middleware/auth.js');
    const req = mockReq();
    const { res, status } = mockRes();
    const next = mockNext();

    await authenticate(req, res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when Authorization header is malformed (not Bearer)', async () => {
    const { authenticate } = await import('../middleware/auth.js');
    const req = mockReq({ authorization: 'Basic dXNlcjpwYXNz' });
    const { res, status } = mockRes();
    const next = mockNext();

    await authenticate(req, res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when introspection returns active: false', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ active: false }),
      }),
    );

    const { authenticate } = await import('../middleware/auth.js');
    const req = mockReq({ authorization: 'Bearer expired-token' });
    const { res, status } = mockRes();
    const next = mockNext();

    await authenticate(req, res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should set req.user and call next() on valid active token', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          active: true,
          sub: 'kc-user-123',
          email: 'student@lumina.test',
          name: 'Test Student',
          realm_access: { roles: ['student'] },
        }),
      }),
    );

    const { authenticate } = await import('../middleware/auth.js');
    const req = mockReq({ authorization: 'Bearer valid-student-token' });
    const { res } = mockRes();
    const next = mockNext();

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.user).toBeDefined();
    expect(req.user?.sub).toBe('kc-user-123');
    expect(req.user?.email).toBe('student@lumina.test');
    expect(req.user?.roles).toContain('student');
  });

  it('should map only valid app roles, dropping unknown KC roles', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          active: true,
          sub: 'kc-teacher-456',
          email: 'teacher@lumina.test',
          realm_access: { roles: ['teacher', 'offline_access', 'uma_authorization'] },
        }),
      }),
    );

    const { authenticate } = await import('../middleware/auth.js');
    const req = mockReq({ authorization: 'Bearer valid-teacher-token' });
    const { res } = mockRes();
    const next = mockNext();

    await authenticate(req, res, next);

    expect(req.user?.roles).toEqual(['teacher']);
    expect(req.user?.roles).not.toContain('offline_access');
  });

  it('should return 401 when fetch throws (KeyCloak unreachable)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('ECONNREFUSED')));

    const { authenticate } = await import('../middleware/auth.js');
    const req = mockReq({ authorization: 'Bearer any-token' });
    const { res, status } = mockRes();
    const next = mockNext();

    await authenticate(req, res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// requireRole middleware — unit tests
// ---------------------------------------------------------------------------

describe('requireRole middleware — unit', () => {
  it('should call next() when user has the required role', async () => {
    const { requireRole } = await import('../middleware/requireRole.js');
    const req = mockReq();
    req.user = {
      sub: 'kc-admin',
      email: 'admin@lumina.test',
      name: 'Admin',
      roles: ['admin'],
      accessToken: 'tok',
    };
    const { res } = mockRes();
    const next = mockNext();

    requireRole('admin')(req, res, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it('should return 403 when user role is insufficient', async () => {
    const { requireRole } = await import('../middleware/requireRole.js');
    const req = mockReq();
    req.user = {
      sub: 'kc-student',
      email: 'student@lumina.test',
      name: 'Student',
      roles: ['student'],
      accessToken: 'tok',
    };
    const { res, status } = mockRes();
    const next = mockNext();

    requireRole('teacher', 'admin')(req, res, next);

    expect(status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('should allow access when user has one of multiple allowed roles', async () => {
    const { requireRole } = await import('../middleware/requireRole.js');
    const req = mockReq();
    req.user = {
      sub: 'kc-teacher',
      email: 'teacher@lumina.test',
      name: 'Teacher',
      roles: ['teacher'],
      accessToken: 'tok',
    };
    const { res } = mockRes();
    const next = mockNext();

    requireRole('student', 'teacher', 'admin')(req, res, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it('should return 500 if called before authenticate (no req.user)', async () => {
    const { requireRole } = await import('../middleware/requireRole.js');
    const req = mockReq(); // no req.user
    const { res, status } = mockRes();
    const next = mockNext();

    requireRole('admin')(req, res, next);

    expect(status).toHaveBeenCalledWith(500);
    expect(next).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Integration tests — require running KeyCloak (skipped without env vars)
// ---------------------------------------------------------------------------

describe('KeyCloak introspection — integration (requires docker compose up keycloak)', () => {
  it('should validate a real token against KeyCloak', async () => {
    if (!KC_AVAILABLE) {
      console.log('  ⏭ Skipping: KEYCLOAK_URL / KEYCLOAK_CLIENT_SECRET not set');
      return;
    }

    // Integration test: obtain a token via direct grant then introspect it.
    // This validates the full token → introspect → role extraction flow.
    const kcUrl = process.env['KEYCLOAK_URL'];
    const realm = process.env['KEYCLOAK_REALM'] ?? 'lumina';
    const clientId = process.env['KEYCLOAK_CLIENT_ID'] ?? 'lumina-api';
    const clientSecret = process.env['KEYCLOAK_CLIENT_SECRET'];
    const testUser = process.env['KC_TEST_USER'] ?? 'admin@lumina.dev';
    const testPass = process.env['KC_TEST_PASSWORD'] ?? 'admin';

    // Obtain token via resource owner password grant (dev only — disabled in prod)
    const tokenRes = await fetch(
      `${kcUrl}/realms/${realm}/protocol/openid-connect/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'password',
          client_id: clientId,
          client_secret: clientSecret!,
          username: testUser,
          password: testPass,
          scope: 'openid',
        }).toString(),
      },
    );

    expect(tokenRes.ok).toBe(true);
    const tokenData = (await tokenRes.json()) as { access_token: string };
    expect(tokenData.access_token).toBeTruthy();

    // Now test the middleware with this real token
    const { authenticate } = await import('../middleware/auth.js');
    const req = mockReq({ authorization: `Bearer ${tokenData.access_token}` });
    const { res } = mockRes();
    const next = mockNext();

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.user?.sub).toBeTruthy();
    expect(req.user?.roles.length).toBeGreaterThan(0);
  });
});
