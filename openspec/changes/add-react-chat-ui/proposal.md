# Proposal: Add React Chat UI

## Summary
Implement the main user interface: the root page with the OpenAPI spec URL form + chat panel, and a `/server` route that lists current MCP status and tools. Use shadcn components and Vercel AI reference chat components.

## Problem
Even with backend capabilities, developers cannot interact without a UI. We need a polished front-end aligning with the request: chat, spec input, and server status pages built on shadcn + Vercel AI SDK components.

## Goals
- Create `SpecInput` component (URL field + CTA) and integrate it with `/api/spec`.
- Render chat conversation via Vercel AI components using `useChat` (wired to `/api/chat`).
- Add a `/server` page displaying builder status, tool list, cache metadata, and lifecycle controls.
- Share layout/theme across pages using shadcn primitives.

## Non-Goals
- Advanced features like history, multi-spec storage (future work).

## Proposed Changes
1. Introduce React Router routes `/` and `/server`.
2. Build shared layout (header, nav, theme) using shadcn components.
3. Implement forms + hooks for spec submission, chat feed, and server polling.
4. Style pages per shadcn guidelines and ensure responsiveness.
5. Add basic tests (React Testing Library) verifying rendering and API interactions (mocked fetch).
