import { defineConfig } from 'orval';

/**
 * Orval 6.31.0 code-generation config (T-11.3.2)
 *
 * Input:  openapi/lumina-api.yaml
 * Output: client/src/api/generated/
 *   - One file per OpenAPI tag (mode: tags-split)
 *   - TanStack React Query v5 hooks (auto-detected from @tanstack/react-query v5)
 *   - TypeScript model interfaces in model/ subdirectory
 *
 * Custom fetcher: client/src/api/fetcher.ts
 *   - Injects Authorization: Bearer <token> from oidc-spa (in-memory)
 *   - Throws structured ApiError on non-2xx matching OpenAPI error schema
 *
 * Run:  pnpm gen:api
 * CI:   run after any change to openapi/lumina-api.yaml
 */
export default defineConfig({
  luminaApi: {
    input: {
      target: './openapi/lumina-api.yaml',
    },
    output: {
      target: './client/src/api/generated/index.ts',
      schemas: './client/src/api/generated/model',
      client: 'react-query',
      mode: 'tags-split',
      clean: true,
      override: {
        mutator: {
          path: './client/src/api/fetcher.ts',
          name: 'customFetch',
        },
        query: {
          useQuery: true,
          useMutation: true,
          signal: true,
        },
      },
    },
  },
});
