# Proposal: Add Streaming Spec Ingestion

## Summary
Implement backend utilities that accept an OpenAPI spec URL, run a `HEAD` preflight to inspect content length, stream the document into a temp file with an explicit byte cap + abort controller, and validate it as OpenAPI 3.x before passing it to downstream builders.

## Problem
The Club Med spec (and others) exceed typical in-memory limits. Without streaming + caps, a single request can consume hundreds of MB and freeze the dev server. We need a robust ingestion layer that guards resources and surfaces precise errors (e.g., 413) before the MCP builder executes.

## Goals
- Provide `fetchSpecStream(url, options)`-style helper that performs HEAD preflight, enforces allowed protocols, and aborts downloads above a configurable byte limit.
- Persist the streamed body to a temp file (so workers can read it later) and return metadata such as `contentLength`, `etag`, and `lastModified` when available.
- Validate the resulting JSON/YAML against OpenAPI 3.x (using `openapi-schema-validator` or `@apidevtools/swagger-parser`) and expose detailed error payloads.

## Non-Goals
- Running the MCP builder or caching results (handled by other changes).
- UI wiring or server endpoints.

## Proposed Changes
1. Add a `spec-ingestion` module that exports `headSpec`, `streamSpecToFile`, and `validateOpenApiDocument` helpers.
2. Support configurable byte caps (default 10 MB) and measurement (e.g., accumulate bytes and abort if exceeded).
3. Wrap errors with machine-readable codes: `invalid_url`, `head_failed`, `size_exceeded`, `validation_failed`.
4. Cover behavior with Vitest, including fixtures for truncated downloads and invalid specs.

## Impact / Dependencies
- Introduces deps like `undici` (or relies on global fetch), `tmp`, and `openapi-schema-validator`.
- Requires Node 18+ for fetch/stream support.

## Risks & Open Questions
- Need to ensure temp files are cleaned up on error/abort.
- HEAD responses may omit `content-length`; we should fall back to streaming measurement.
