1. [ ] Create `.cache/specs` directory management helpers (ensure existence, prune old entries).
2. [ ] Implement `getCachedSpec` + `putCachedSpec` + `invalidateCache` with URL + validator hashing.
3. [ ] Integrate cache checks before streaming downloads; skip fetch when validators match.
4. [ ] Integrate cache writes after successful validation; copy normalized file + metadata.
5. [ ] Expose `cacheHit` metadata via builder status and `/api/server` responses; add tests verifying hit/miss, invalidation, and TTL pruning.
