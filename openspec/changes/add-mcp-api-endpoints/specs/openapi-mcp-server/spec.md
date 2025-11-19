## ADDED Requirements

### Requirement: Spec Endpoint
The backend MUST expose `POST /api/spec` to kick off spec ingestion + MCP builder work.

#### Scenario: Start build
- **GIVEN** a JSON body `{ "url": "https://example.com/openapi.json" }`
- **WHEN** streaming ingestion succeeds
- **THEN** the endpoint responds `202 Accepted` with `{ status: "building", specUrl, requestedAt, progress: { processed: 0, total: inferredTotal } }`.

#### Scenario: Error translation
- **GIVEN** ingestion throws `size_exceeded`
- **WHEN** `/api/spec` handles the request
- **THEN** it responds `413` with `{ code: "size_exceeded", maxBytes }`.

### Requirement: Status Endpoint
The backend MUST expose `GET /api/server` returning builder status, progress, and tool metadata.

#### Scenario: Status ready
- **GIVEN** the builder finished generating tools
- **WHEN** `/api/server` is called
- **THEN** it responds `200` with `{ status: "ready", tools: [...], progress, cacheHit }`.

### Requirement: Lifecycle Controls
The backend MUST expose restart/stop controls.

#### Scenario: Restart
- **GIVEN** a spec has been loaded previously
- **WHEN** `POST /api/server/restart` is called
- **THEN** the builder restarts using the last spec metadata and returns `202`.

#### Scenario: Stop
- **WHEN** `POST /api/server/stop` is called
- **THEN** the builder terminates the worker + MCP server and responds `200` with `status: "idle"`.
