## ADDED Requirements

### Requirement: Spec Form Validation
The spec submission form MUST block invalid inputs client-side.

#### Scenario: Invalid URL rejection
- **WHEN** the user enters `foo`
- **THEN** the UI disables submission and shows "Enter a valid URL" without calling `/api/spec`.

### Requirement: Error Messaging
The UI MUST surface backend error responses prominently.

#### Scenario: Size cap error banner
- **GIVEN** `/api/spec` returns `413` with `{ code: "size_exceeded", maxBytes }`
- **WHEN** the response arrives
- **THEN** the UI shows a banner explaining the document exceeded `maxBytes` and suggests trimming/filtering.

#### Scenario: Builder failure panel
- **GIVEN** `/server` reports `status: "error"` with `message`
- **WHEN** the status page renders
- **THEN** it shows the error message, timestamp, and a "Retry" button that triggers `/api/server/restart`.

### Requirement: Loading Indicators
The UI MUST display loading states for long operations.

#### Scenario: Server polling skeletons
- **WHEN** `/server` fetch is pending
- **THEN** the tool list area shows skeleton cards instead of a blank screen.
