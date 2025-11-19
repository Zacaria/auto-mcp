# Proposal: Improve UI Error States

## Summary
Layer user-facing validation and error feedback across the spec form, chat panel, and server status page. Include handling for invalid URLs, fetch failures, streaming size-cap errors, and builder failures.

## Problem
The base UI only covers happy paths. When ingestion fails (e.g., 413, validation errors) or the builder crashes, users need clear guidance to recover. Without dedicated states, the UI may appear frozen.

## Goals
- Client-side URL validation with inline error messaging.
- Toasts or banners for backend errors (422, 413, 5xx) including details from the response.
- Visual indicators (spinners, skeletons) while awaiting `/api/spec`, `/api/server`, and `/api/chat`.
- Dedicated "builder failure" panel on `/server` with error details + retry buttons.

## Proposed Changes
1. Extend `SpecInput` to validate URLs (using `URL` constructor) and show inline errors.
2. Add error boundary/toast utilities for fetch hooks to display backend error codes (e.g., `size_exceeded`).
3. Show pending states: disable buttons, show spinner, and display skeleton tool cards while polling server status.
4. Render builder error panel on `/server` with stack summary + "Retry" action that replays the last spec request.
5. Add tests verifying each error path toggles the correct UI.
