## ADDED Requirements

### Requirement: Vite Workspace
The project MUST include a `web/` (or equivalent) Vite + React + TypeScript workspace that developers can run locally.

#### Scenario: Dev server runs
- **GIVEN** dependencies are installed via `pnpm install`
- **WHEN** a developer runs `pnpm --filter web dev`
- **THEN** the Vite dev server starts without errors and renders a placeholder "OpenAPI MCP Builder" page at `http://localhost:5173`.

### Requirement: Baseline Dependencies
The scaffold MUST ship with shadcn/ui setup, the Vercel AI SDK, the Model Context Protocol SDK, and OpenAPI helper libraries to unblock later work.

#### Scenario: Dependencies available
- **GIVEN** the repository root
- **WHEN** a developer inspects `web/package.json`
- **THEN** it lists `shadcn-ui` (or the generated components), `ai`, `@modelcontextprotocol/sdk`, `openapi-types`, `react-router-dom`, and testing dependencies so these imports succeed without further setup.
