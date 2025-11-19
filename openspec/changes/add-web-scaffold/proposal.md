# Proposal: Add Web Scaffold

## Summary
Set up a dedicated Vite + React + TypeScript workspace (e.g., `/web`) prewired with shadcn/ui, the Vercel AI SDK, the Model Context Protocol SDK, and OpenAPI helper libs so future changes can focus on functionality instead of bootstrapping. Ensure `pnpm dev` starts a placeholder page confirming the toolchain works.

## Problem
The repository currently has no front-end application or dependency graph that matches our desired stack. Without a scaffold, every subsequent change would need to duplicate boilerplate for Vite, React Router, tailwind/shadcn styling, and AI/MCP SDK plumbing. We need a conventional starting point that matches our deployment story.

## Goals
- Create a `web/` workspace built with Vite + React + TypeScript and configured for pnpm.
- Install baseline dependencies: shadcn/ui (CLI + component styles), `ai` (Vercel AI SDK), `@modelcontextprotocol/sdk`, and `openapi-types` so later work can import them immediately.
- Provide working dev/test scripts (`pnpm install`, `pnpm dev`, `pnpm test`) and a placeholder page proving the dev server runs.

## Non-Goals
- Building the actual chat UI or MCP integration (handled by later changes).
- Styling beyond a basic placeholder view.

## Proposed Changes
1. Initialize a Vite React + TS project under `web/` and hook it into the repo's package manager (pnpm workspace or root package).
2. Configure ESLint/Prettier (or reuse Vite defaults) plus TypeScript path aliases.
3. Set up tailwind + shadcn/ui (run the CLI, add config, import base styles) and install required dependencies (`ai`, `@modelcontextprotocol/sdk`, `openapi-types`).
4. Add a starter `App` component with placeholder copy describing the upcoming OpenAPI MCP UI and document dev/test commands in `web/README.md`.

## Impact / Dependencies
- Adds new dependencies and build output (Vite, React, tailwind, shadcn assets).
- Introduces pnpm workspace entries or modifies package.json as needed.

## Risks & Open Questions
- Minimal; ensure scaffolding matches future hosting environment (Vite + SSR?). We'll stick to SPA for now.
