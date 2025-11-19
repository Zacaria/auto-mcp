## ADDED Requirements

### Requirement: Setup Documentation
The repository MUST include clear setup instructions covering dependencies and environment variables.

#### Scenario: README lists env vars
- **WHEN** a developer reads `README.md`
- **THEN** they see sections describing `OPENAI_API_KEY`, `SPEC_MAX_BYTES`, and cache directory expectations.

### Requirement: Manual Validation Guide
Docs MUST describe a manual verification script covering spec ingestion, status polling, and chat usage.

#### Scenario: Validation steps present
- **WHEN** a developer follows the "Manual Validation" section
- **THEN** they can ingest the Club Med spec, observe `/server` reach `ready`, and run a sample chat prompt hitting a generated tool.
