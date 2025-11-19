# Proposal: Add Project Docs

## Summary
Document environment setup (OpenAI API key, spec cache directory), dev commands, and a manual validation script exercising the full flow (spec ingestion → chat → status page). Add this to the repo README (root or `web/README.md`).

## Problem
Without documentation, onboarding requires piecing together dependencies from change specs. We need a concise guide covering environment variables, dev/test commands, and steps to verify the system using a large OpenAPI spec (Club Med).

## Goals
- Document prerequisites (Node version, pnpm), environment variables (`OPENAI_API_KEY`, `SPEC_MAX_BYTES`, cache dir).
- Provide instructions for running the dev server, backend tests, and UI tests.
- Add a "Manual Validation" section describing how to ingest the Club Med spec, monitor `/server`, and run a sample chat.

## Proposed Changes
1. Extend the root README (or create `web/README.md`) with Setup, Development, Testing, Environment variables, Manual Validation sections.
2. Include troubleshooting tips (size-cap errors, cache clearing).
3. Ensure docs stay updated with latest commands.

## Risks & Open Questions
- Decide whether docs live in root vs `web/`. We'll document both and cross-link if necessary.
