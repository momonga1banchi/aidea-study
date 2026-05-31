# AGENTS.md

## Project

This is an Express + Jest API demo project for an internal AI coding workshop.

The workshop demonstrates harness engineering: using specifications, constraints, tests, lint, and diff review to make AI coding safer and more reproducible.

## Architecture

- `src/routes/` maps URLs.
- `src/controllers/` handles HTTP request/response.
- `src/services/` contains business logic.
- Controllers must not contain business rules.
- Services must not depend on Express `req` or `res`.
- Do not add DB access unless explicitly requested.

## Commands

- Install: `npm install`
- Test: `npm test`
- Lint: `npm run lint`

## Working rules

- First inspect relevant files.
- For non-trivial changes, propose a plan before editing.
- Do not edit files when the task says “do not implement yet” or “do not edit files”.
- Add or update tests for behavior changes.
- Do not add dependencies without explicit approval.
- Do not change public API response format unless requested.
- Do not modify unrelated files.
- Do not touch `.env`, secrets, credentials, or production configuration.

## Done means

- Relevant tests pass.
- Lint passes.
- Diff is reviewed.
- Risks and follow-up items are listed.
