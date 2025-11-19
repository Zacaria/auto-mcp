1. [ ] Add an API router (e.g., Vite middleware or express app) that mounts `/api/spec`, `/api/server`, `/api/server/restart`, `/api/server/stop`.
2. [ ] Implement request validation and error translation so ingestion/builder errors map to HTTP 4xx/5xx responses with `{ code, message, details }`.
3. [ ] Wire `/api/spec` to call `headSpec`, `streamSpecToFile`, `validateOpenApiDocument`, and `OpenApiMcpBuilder.startFromSpec`, returning `202` with lifecycle metadata.
4. [ ] Wire `/api/server` to `OpenApiMcpBuilder.getStatus()` and include tool metadata once available.
5. [ ] Add `/api/server/restart` + `/api/server/stop` endpoints and verify via integration tests (e.g., Vitest + supertest) that state transitions occur as expected.
