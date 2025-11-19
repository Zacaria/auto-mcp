## ADDED Requirements

### Requirement: Chat Endpoint
The backend MUST expose `POST /api/chat` that streams OpenAI responses compatible with the Vercel AI SDK `useChat` hook.

#### Scenario: Happy path stream
- **GIVEN** the MCP builder status is `ready`
- **WHEN** the client posts `{ messages: [...] }`
- **THEN** the route responds with a streaming body where tokens arrive incrementally and include tool-call annotations as expected by the Vercel AI SDK.

### Requirement: MCP Tool Wiring
OpenAI chat completions MUST be able to call generated MCP tools.

#### Scenario: Tool invocation
- **GIVEN** an assistant response triggers a tool call
- **WHEN** the tool executes via the builder
- **THEN** the streaming response includes the tool output (per MCP spec), and errors are surfaced in the stream if execution fails.

### Requirement: Error Handling
The endpoint MUST reject invalid states clearly.

#### Scenario: Builder not ready
- **GIVEN** no spec has been loaded
- **WHEN** `/api/chat` is called
- **THEN** the response is `409` with `{ code: "builder_not_ready" }` and no OpenAI API call is attempted.
