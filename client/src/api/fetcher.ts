/**
 * Custom fetch mutator for Orval-generated hooks (T-11.3.2)
 *
 * - Injects Authorization: Bearer <token> from oidc-spa (in-memory, never localStorage)
 * - Sets base URL from import.meta.env
 * - Throws structured ApiError on non-2xx responses matching the OpenAPI error schema
 */

const BASE_URL = import.meta.env['VITE_API_URL'] ?? '/api/v1';

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    status: number;
    requestId: string;
    timestamp: string;
  };
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId: string;

  constructor(body: ApiErrorBody) {
    super(body.error.message);
    this.name = 'ApiError';
    this.status = body.error.status;
    this.code = body.error.code;
    this.requestId = body.error.requestId;
  }
}

// Token getter — replaced by oidc-spa integration in US-1.1a
// Returns null when not authenticated (oidc-spa not yet initialised)
let _getToken: (() => string | null) | null = null;

export function setTokenGetter(getter: () => string | null): void {
  _getToken = getter;
}

export async function customFetch<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const token = _getToken?.() ?? null;

  const headers = new Headers(options.headers ?? {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let body: ApiErrorBody;
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      throw new ApiError({
        error: {
          code: 'NETWORK_ERROR',
          message: `HTTP ${response.status} ${response.statusText}`,
          status: response.status,
          requestId: response.headers.get('X-Request-ID') ?? 'unknown',
          timestamp: new Date().toISOString(),
        },
      });
    }
    throw new ApiError(body);
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json() as Promise<T>;
}
