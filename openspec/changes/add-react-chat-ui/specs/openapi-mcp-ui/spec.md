## ADDED Requirements

### Requirement: Spec Submission Form
The root route (`/`) MUST render a shadcn-styled form that posts to `/api/spec`.

#### Scenario: Successful submission
- **GIVEN** a user enters `https://api.clubmed.com/doc/swagger.json`
- **WHEN** they click "Generate tools"
- **THEN** the UI disables the button, calls `/api/spec`, and shows a toast "Building tools…" on 202 responses.

### Requirement: Chat Feed
The root route MUST display a chat feed using the Vercel AI SDK hooked up to `/api/chat`.

#### Scenario: Stream rendering
- **WHEN** the assistant streams tokens
- **THEN** the UI updates incrementally and surfaces tool call states using the reference components.

### Requirement: Server Status Page
A `/server` route MUST show builder lifecycle state, tool list, and cache metadata.

#### Scenario: Tool cards
- **WHEN** `/api/server` returns tools
- **THEN** the page renders cards with method/path badges, descriptions, and JSON schema summaries.

#### Scenario: Lifecycle buttons
- **WHEN** the user clicks "Restart" or "Stop"
- **THEN** the UI calls the respective endpoints, shows loading indicators, and refreshes the status after completion.
