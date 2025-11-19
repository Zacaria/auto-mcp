# Design: Streaming Spec Ingestion

## Flow
1. **Input validation** – Ensure URLs use `https` and are not local (block `localhost`, `127.0.0.1`, etc.).
2. **HEAD preflight** – Issue a `HEAD` request via `fetch`. Parse `content-length`, `etag`, and `last-modified`. If `content-length` exceeds the configured max, short-circuit with `413`.
3. **Stream download** – Use `fetch(url)` and pipe `response.body` through a byte-counting transform into a temp file created with `fs.mkdtemp`/`tmp`. Abort if bytes exceed the cap or if the stream closes unexpectedly.
4. **Validation** – After writing the file, load it (JSON.parse or YAML) and run `OpenAPIValidator.validate` to confirm 3.x compliance. Collect structured errors if validation fails.
5. **Result** – Return `{ tempFilePath, size, etag, lastModified, contentType }` so downstream workers can reuse the file.

## Key Modules
- `specUrl.ts` – Normalizes and validates spec URLs.
- `headSpec.ts` – Wraps the HEAD request and error translation.
- `streamSpec.ts` – Streams to disk with AbortController + byte counters.
- `validateSpec.ts` – Parses JSON/YAML and validates schema.

## Error Handling
- Throw typed errors with `{ code, message, details }` consumed by API routes.
- Ensure partial files are cleaned up in `finally` blocks.

## Configuration
Expose env variables:
- `SPEC_MAX_BYTES` (default 10_485_760)
- `SPEC_REQUEST_TIMEOUT_MS` (default 15000)

## Testing
- Mock fetch to simulate HEAD + GET sequences.
- Fixture for valid spec (small) -> success.
- Fixture for invalid spec -> `validation_failed` with details.
- Fixture for huge `content-length` -> immediate 413.
- Fixture for streaming overflow -> bytes count triggers abort.
