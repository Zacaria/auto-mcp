# Proposal: Add MCP API Endpoints

## Summary
Expose HTTP endpoints that orchestrate spec ingestion + MCP builder lifecycle: `POST /api/spec` to kick off builds, `GET /api/server` to report status/tool metadata, and `POST /api/server/{restart|stop}` to control the builder. These endpoints will rely on the previously built streaming ingestion and worker builder modules.

## Problem
Even with ingestion and builder utilities, there is no HTTP surface for the UI (or CLI) to interact with. We need a minimal API contract to trigger builds, observe progress, and control the MCP server. Without it, front-end work and manual testing remain blocked.

## Goals
- Implement API handlers (Vite dev server middleware or custom server) for `/api/spec`, `/api/server`, `/api/server/restart`, `/api/server/stop`.
- Ensure responses are JSON with machine-readable fields, HTTP status codes (202, 200, 422, 413, 500), and include builder progress and tool metadata.
- Integrate with ingestion + builder modules while maintaining non-blocking behavior.

## Non-Goals
- Chat completion endpoint (handled by another change).
- Authentication/authorization (local dev only for now).

## Proposed Changes
1. Add an API router (e.g., Express-like or custom Vite handler) that wires ingestion + builder modules.
2. `POST /api/spec` accepts `{ url }`, validates input, calls ingestion, starts builder, and returns 202 with status metadata.
3. `GET /api/server` returns the builder status (including progress, timestamps, tool list once ready, cache metadata placeholder).
4. `POST /api/server/restart` reuses the last successful spec metadata and restarts the builder; `POST /api/server/stop` terminates it.
5. Provide integration tests hitting the endpoints using mocked ingestion/builder or supertest.

## Impact / Dependencies
- Requires bundling or runtime support for server middleware.
- Introduces new route files and tests.

## Risks & Open Questions
- Need to ensure concurrency control so overlapping `POST /api/spec` calls don't race; scope to single builder instance for now.
