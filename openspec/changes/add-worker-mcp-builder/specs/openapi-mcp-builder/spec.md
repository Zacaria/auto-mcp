## ADDED Requirements

### Requirement: Worker-Based Tool Generation
The MCP tool generation process MUST execute inside a worker thread so HTTP handlers remain responsive.

#### Scenario: Worker handles large spec
- **GIVEN** a normalized OpenAPI file with hundreds of operations
- **WHEN** `startFromSpec` is called
- **THEN** the method returns immediately with `status: "building"` while a worker thread parses the file, posts progress updates, and eventually reports completion without blocking the event loop.

### Requirement: Progress Reporting
The builder MUST expose progress counts that clients can poll.

#### Scenario: Progress updates reachable
- **GIVEN** the worker emits `{ type: "progress", processed: 200, total: 500 }`
- **WHEN** `getStatus()` is invoked
- **THEN** it returns `{ status: "building", progress: { processed: 200, total: 500 } }` so the UI can display build progress.

### Requirement: Error Propagation
If the worker throws, the orchestrator MUST surface the error in status.

#### Scenario: Worker failure bubble up
- **GIVEN** the worker encounters malformed JSON
- **WHEN** it posts an `error` message (or crashes)
- **THEN** `status` transitions to `error` with a human-readable `message`, and no stale MCP server remains running.
