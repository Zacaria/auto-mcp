# Proposal: Add OpenAI Chat API

## Summary
Expose `POST /api/chat` that uses the Vercel AI SDK + OpenAI client to stream assistant responses while enabling MCP tool calls backed by the generated tools from the builder.

## Problem
The UI relies on the Vercel AI SDK's `useChat` hook, which expects a backend route compatible with `StreamingTextResponse`. Without it, the chat interface can't function or leverage the MCP server.

## Goals
- Implement `POST /api/chat` (Edge-friendly or Node) using `ai` package helpers.
- Forward user messages to OpenAI (e.g., `gpt-4.1`), wiring the MCP server as a tool provider via `@modelcontextprotocol/sdk`.
- Stream responses incrementally, handling tool-calls/responses, and propagate errors cleanly.

## Proposed Changes
1. Configure OpenAI client via `process.env.OPENAI_API_KEY`.
2. Implement the route using `StreamingTextResponse` / `Message` types, including tool call serialization.
3. Integrate with `OpenApiMcpBuilder.getMcpServer()` to supply tool definitions + execution handlers.
4. Add tests/mocks verifying streaming behavior and error handling (key missing, builder not ready, etc.).

## Risks & Open Questions
- Need to ensure MCP tool execution timeouts don't stall streams.
- For local dev, we may need to mock OpenAI; provide fallback instructions.
