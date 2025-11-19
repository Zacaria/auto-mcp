1. [ ] Implement client-side URL validation (regex or URL constructor) with inline error display on `SpecInput`.
2. [ ] Add a toast/banner system (shadcn `useToast`) and wire it to fetch hooks so backend errors show actionable messages (handle 422, 413, 5xx).
3. [ ] Display loading indicators: disable submit buttons, show spinner icons, and add skeleton UI for `/server` tool cards while data loads.
4. [ ] Add builder error panel on `/server` that surfaces `status.error` plus "Retry"/"Dismiss" controls.
5. [ ] Extend tests to cover invalid URL validation, 413 error banner, builder error panel, and loading skeletons.
