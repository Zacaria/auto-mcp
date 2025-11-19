1. [ ] Add URL validation helpers that accept only https URLs and block loopback/private IP ranges.
2. [ ] Implement `headSpec(url)` returning `contentLength`, `etag`, `lastModified`, and translate failures into typed errors.
3. [ ] Implement `streamSpecToFile({ url, maxBytes })` that downloads with an AbortController, enforces byte caps, and stores files under a temp directory.
4. [ ] Add `validateOpenApiDocument(filePath)` using `openapi-schema-validator` (or swagger-parser) and return structured errors/warnings.
5. [ ] Write Vitest coverage for success paths, missing `content-length`, exceeded size, invalid schema, and cleanup behavior.
