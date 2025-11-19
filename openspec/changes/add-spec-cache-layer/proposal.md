# Proposal: Add Spec Cache Layer

## Summary
Introduce a small on-disk cache for normalized OpenAPI documents keyed by URL and response validators (ETag or Last-Modified). Cache hits should reuse the existing normalized file to avoid re-downloading/validating large specs like Club Med.

## Problem
Developers will iterate on prompts and builder behavior while reusing the same OpenAPI spec. Refetching and revalidating a multi-megabyte document each time wastes bandwidth and time. Caching the normalized output keeps the workflow snappy and reduces unnecessary load.

## Goals
- Persist normalized spec files and metadata (`etag`, `lastModified`, `contentLength`, `cachedAt`) under a cache directory (e.g., `.cache/specs`).
- Provide helpers to read/write cache entries and determine hits based on `etag` or `last-modified` data from ingestion.
- Expose cache metadata in builder status so the UI can show whether a build was served from cache.

## Proposed Changes
1. Define a cache manager module with APIs: `getCachedSpec(url, validators)`, `putCachedSpec(entry)`, `invalidateCache(url)`.
2. Integrate the cache with the ingestion pipeline: after streaming/validation, store the normalized file + metadata; before downloading, check if validators indicate the cached entry is fresh.
3. Surface `cacheHit` + `cacheKey` fields through builder status and `/api/server` responses.
4. Add tests covering cache hit/miss, invalidation when validators change, and cleanup of old cache entries (LRU or TTL).

## Impact / Dependencies
- Requires filesystem write permissions; may use `fs.promises` + `path` modules.
- Introduces potential storage growth; we’ll cap caches to recent entries.

## Risks & Open Questions
- Need to prevent stale caches when upstream servers omit validators; fallback to timestamp-based TTL or skip caching.
