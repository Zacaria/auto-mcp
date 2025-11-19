## ADDED Requirements

### Requirement: HEAD Preflight
The ingestion pipeline MUST issue a `HEAD` request before downloading an OpenAPI document to determine metadata and enforce limits.

#### Scenario: Reject oversized content-length
- **GIVEN** `SPEC_MAX_BYTES` is 10 MB
- **WHEN** `HEAD` responds with `content-length: 20000000`
- **THEN** the request short-circuits with an error code `size_exceeded` and no download occurs.

### Requirement: Streamed Download with Cap
The system MUST stream OpenAPI downloads to disk and abort when the configured byte cap is exceeded, even if `content-length` was missing.

#### Scenario: Abort during streaming overflow
- **GIVEN** `content-length` was absent
- **WHEN** the byte counter exceeds `SPEC_MAX_BYTES` while piping the response
- **THEN** the download aborts, the temp file is deleted, and the caller receives a `size_exceeded` error with `maxBytes`.

### Requirement: OpenAPI Validation
The ingestion module MUST validate that downloaded specs conform to OpenAPI 3.x and surface detailed errors.

#### Scenario: Invalid spec returns structured errors
- **GIVEN** the streamed file is missing the `openapi` version field
- **WHEN** `validateOpenApiDocument` runs
- **THEN** it rejects with `validation_failed` and includes validator error details so the API layer can relay them.
