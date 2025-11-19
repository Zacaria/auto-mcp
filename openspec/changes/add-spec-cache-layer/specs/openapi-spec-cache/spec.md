## ADDED Requirements

### Requirement: Cache Hits Reuse Specs
The ingestion pipeline MUST reuse previously normalized specs when validators match.

#### Scenario: Cache hit bypasses download
- **GIVEN** `https://example.com/openapi.json` was cached with `etag: "123"`
- **WHEN** the next `POST /api/spec` request sees `etag: "123"`
- **THEN** ingestion skips downloading, reuses the cached normalized file, and marks `cacheHit: true` in the response/status.

### Requirement: Cache Invalidates on Change
Cached specs MUST be invalidated when validators differ.

#### Scenario: ETag mismatch triggers refresh
- **GIVEN** cached `etag` is `"123"`
- **WHEN** HEAD returns `etag: "456"`
- **THEN** ingestion downloads a new copy, overwrites the cache, and marks `cacheHit: false`.

### Requirement: Cache Cleanup
The system MUST prevent unbounded cache growth.

#### Scenario: Old entries pruned
- **GIVEN** more than 5 entries exist or entries are older than 24 hours
- **WHEN** a new spec is cached
- **THEN** the oldest entries beyond the limit and expired ones are deleted.
