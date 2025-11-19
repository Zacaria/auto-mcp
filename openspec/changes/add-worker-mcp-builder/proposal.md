# Proposal: Add Worker-Based MCP Builder

## Summary
Create an `OpenApiMcpBuilder` service that receives normalized spec files, pushes parsing + tool generation work into a Node worker thread, and exposes lifecycle state + progress updates without blocking API handlers.

## Problem
Generating hundreds of MCP tools from a large OpenAPI spec can block the event loop for seconds, starving HTTP requests. Running the builder on the main thread risks timeouts and poor UX. We need an isolated worker that can stream progress and fail gracefully.

## Goals
- Implement a builder orchestrator that owns lifecycle state: `idle`, `building`, `ready`, `error`.
- Use Node worker threads to parse the spec file, translate operations into MCP tool definitions, and emit incremental progress (e.g., tools built / total operations).
- Provide `startFromSpec`, `getStatus`, and `stop` APIs consumed later by HTTP routes.
- Capture failures (validation errors, worker crashes) and surface them via `status.error` without crashing the host.

## Proposed Changes
1. Add `OpenApiMcpBuilder` class plus worker entrypoint (TypeScript file) that can post `progress` and `complete` messages.
2. Support a single active build; new builds cancel existing workers cleanly.
3. Serialize tool metadata (name, summary, method, path, schema) and store it in memory for later endpoints.
4. Unit test using sample specs to confirm worker completion, error propagation, and concurrency limits.

## Impact / Dependencies
- Requires enabling `worker_threads` and bundler config to compile worker files.
- Needs a lightweight message protocol between main and worker.

## Risks & Open Questions
- Need to ensure worker termination to avoid resource leaks.
- Consider memory usage for extremely large operation counts (progress events should keep payloads small).
