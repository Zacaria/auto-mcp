# Design: Worker-Based MCP Builder

## Components
- **Orchestrator (`OpenApiMcpBuilder`)**
  - Keeps mutable state: `currentSpec`, `status`, `tools`, `lastUpdated`, `progress` (count/total).
  - Provides methods: `startFromSpec({ url, documentPath, cacheKey, etag? })`, `stop()`, `getStatus()`, `getTools()`.
  - Spawns a worker thread via `new Worker(new URL('./builder.worker.ts', import.meta.url), { workerData })`.

- **Worker (`builder.worker.ts`)**
  - Reads the temp spec file, parses JSON/YAML, iterates each path + method, maps to MCP tool definition using the Model Context Protocol SDK helpers.
  - Posts messages back: `{ type: 'progress', processed, total }`, `{ type: 'complete', tools }`, `{ type: 'error', error }`.

## Flow
1. `startFromSpec` stops any running worker, sets status `building`, resets progress.
2. Spawn worker with file path + spec metadata.
3. Worker emits `progress` events; orchestrator updates `status.progress` and `updatedAt`.
4. On completion, orchestrator builds MCP server instance (via `@modelcontextprotocol/sdk/server`) with generated tools and flips status to `ready`.
5. Errors set status `error` and capture stack/message.
6. `stop()` terminates worker + tears down MCP server.

## Thread Safety
- Single worker at a time; orchestrator guarded by `this.currentJobId`.
- Use `AbortController` or worker termination for cancellation.

## Testing
- Mock worker via dependency injection to simulate success/failure.
- Integration test running the actual worker with a trimmed Club Med spec fragment to assert progress updates (>=1) before completion.
