# Design: Spec Cache Layer

## Storage Layout
```
.cache/specs/
  <hash>.json   # metadata { url, etag, lastModified, contentLength, cachedAt, normalizedPath }
  <hash>.yaml   # normalized OpenAPI file (if needed)
```
- `hash` derived from URL + validators (e.g., SHA-256).

## APIs
- `getCachedSpec({ url, etag?, lastModified? })`
  - Reads metadata by hash, confirms validators match, ensures file exists, returns `{ normalizedPath, metadata }`.
- `putCachedSpec({ url, etag?, lastModified?, normalizedPath, contentLength })`
  - Copies normalized file into cache directory, writes metadata JSON, returns `cacheKey`.
- `invalidateCache({ url })`
  - Removes all entries for a URL.

## Integration Points
1. After ingestion downloads + validates a spec, call `putCachedSpec`.
2. Before downloading, if HEAD returns validators and `getCachedSpec` matches, skip download + validation and reuse normalized file.
3. Builder status includes `{ cacheHit: boolean, cacheKey, cachedAt }`.

## Cleanup Strategy
- Keep last N entries (configurable, default 5). On new insert, prune oldest by `cachedAt`.
- Alternatively TTL (e.g., 24h). We'll combine: prune >24h old and ensure <=N entries.

## Error Handling
- Cache failures should not block ingestion; log and proceed without cache.

## Testing
- Unit tests verifying hits, misses, invalidations, TTL cleanup, and metadata propagation.
