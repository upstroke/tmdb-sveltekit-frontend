# Contributing

Thank you for contributing to this project. Please follow the guidelines below before submitting changes.

## Prerequisites

- Node.js and npm are installed.
- Dependencies are installed via `npm install`.
- The project runs locally with `npm run dev`.

## Making Changes

Keep changes small and focused. New or modified functionality should be accompanied by appropriate unit, integration, or acceptance tests.

## Tests

Unit tests use Vitest. Acceptance tests use Playwright.

Available test commands:

```bash
npm run test:unit
npm run test:components
npm run test:integration
npm run test:acceptance
npm run test:all
```

Unit tests should maintain a minimum statement coverage of 80%. New tests should especially cover changed and newly added logic.

Generate a coverage report with:

```bash
npm run test:vitest:coverage
```

## Pre-Commit Checks

The project uses Husky to run automatic checks before every commit. The `.husky/pre-commit` hook executes `npm run test:precommit`.

This runs:

- Unit tests with coverage
- Format check and ESLint
- Integration tests

Run the same checks manually with:

```bash
npm run test:precommit
```

Do not create a commit until all checks pass.

## Formatting and Linting

```bash
npm run format
npm run format:check
npm run lint:eslint
npm run lint
```

Please fix all formatting and linting errors before committing.

## Pull Requests

A pull request should:

- include a short description of the change,
- name the affected areas,
- explain new or updated tests,
- pass all relevant checks.

For UI changes, include screenshots or a brief description of the visible result.

## Commit Messages

Use short, meaningful commit messages. Write in the imperative mood and avoid unnecessary detail.
