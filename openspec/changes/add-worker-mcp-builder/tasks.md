1. [ ] Define the message protocol (`progress`, `complete`, `error`) shared between orchestrator and worker.
2. [ ] Implement `OpenApiMcpBuilder` with `startFromSpec`, `stop`, `getStatus`, and worker lifecycle management.
3. [ ] Implement `builder.worker.ts` that reads the normalized spec file, derives MCP tool definitions, and posts progress updates.
4. [ ] Ensure the orchestrator instantiates an MCP server with the generated tools once the worker completes successfully.
5. [ ] Add Vitest coverage (or integration test) verifying happy path, cancellation, and failure propagation.
