1. [ ] Add OpenAI client configuration (env validation, helper for instantiating the client with retries/timeouts).
2. [ ] Implement `POST /api/chat` route that accepts `{ messages }`, ensures the MCP builder is `ready`, and streams responses via `StreamingTextResponse`.
3. [ ] Wire generated MCP tools into the chat completion call (e.g., `tools` array + execution callback) so tool calls run against the server.
4. [ ] Handle error cases (missing API key, builder idle, OpenAI failure) with structured error responses and HTTP 4xx/5xx codes.
5. [ ] Add integration test (mock OpenAI) verifying streaming format and MCP tool invocation path.
