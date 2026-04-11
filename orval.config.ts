import { defineConfig } from 'orval';

/**
 * Orval code-generation config (T-11.3.2)
 *
 * Input:  openapi/lumina-api.yaml
 * Output: client/src/api/generated/
 *   - *.ts  — TanStack React Query v5 hooks (one file per tag)
 *   - model/ — TypeScript interfaces for every schema
 *
 * Run:  pnpm gen:api
 * CI:   re-run whenever openapi/lumina-api.yaml changes
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
      httpClient: 'fetch',
      mode: 'tags-split',     // one file per OpenAPI tag
      clean: true,            // wipe output dir before each run
      prettier: true,
      override: {
        mutator: {
          path: './client/src/api/fetcher.ts',
          name: 'customFetch',
        },
        query: {
          useQuery: true,
          useMutation: true,
          useInfiniteQuery: false,
          signal: true,
        },
      },
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write ./client/src/api/generated',
    },
  },
});
