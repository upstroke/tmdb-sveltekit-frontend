# Test Documentation

This file provides the high-level testing overview for the project. Read it before creating or changing tests, then continue with the common rules and the guide for the applicable test level.

## Test Levels

The project uses three automated test levels:

- Unit tests with Vitest for isolated utility, store, helper, route, and TMDB API logic
- Integration tests with Vitest for Svelte components, route behavior, and interactions between controlled parts
- End-to-end acceptance tests with Playwright for complete browser-based user flows

## Test Directory Structure

```text
tests/
  acceptance/
    loadmore/
    navigation/
  integration/
    components/
    routes/
  unit/
    routes/
    tmdb-api/
  fixtures/
  mocks/
  setup/
```

- `tests/unit/` contains isolated Vitest unit tests. Domain subdirectories such as `routes/` and `tmdb-api/` may be used where they improve discoverability.
- `tests/integration/components/` contains Vitest component integration tests.
- `tests/integration/routes/` contains Vitest route integration tests.
- `tests/acceptance/<feature>/` contains Playwright end-to-end acceptance tests organized by user-visible feature.
- `tests/fixtures/` contains stable, reusable domain test data.
- `tests/mocks/` contains reusable mock support for technical dependencies.
- `tests/setup/` contains shared setup and cleanup utilities.

For Playwright end-to-end acceptance tests, each substantial feature directory contains one or more `*.spec.js` files and exactly one related `*-testplan.md` file. The test plan stays next to the executable specifications. Existing examples are `tests/acceptance/navigation/` and `tests/acceptance/loadmore/`.

## Documentation by Test Level

Read the following files in addition to this overview:

- `docs/testing/common-rules.md` for rules shared by all automated tests
- `docs/testing/unit-tests.md` for Vitest unit-test rules
- `docs/testing/integration-tests.md` for Vitest integration-test rules
- `docs/testing/playwright-acceptance-tests.md` for Playwright end-to-end acceptance-test rules

## Test Commands

```bash
npm run test
npm run test:unit
npm run test:components
npm run test:integration
npm run test:acceptance
npm run test:vitest:coverage
```

The `justfile` provides shortcuts for important commands, including `just test-vitest` and `just test-e2e`.

## Path Aliases

Aliases are defined in `jsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "$tests": ["./tests"],
      "$tests/*": ["./tests/*"]
    }
  }
}
```

This allows imports such as:

```js
import { i18nMockDefault } from '$tests/mocks/i18n.mocks.js';
import { movieDetails } from '$tests/fixtures/tmdb/tmdb.fixtures.js';
import { cleanupAll } from '$tests/setup/test-utils.js';
```

## Test Strategy

Test coverage follows practical agile development:

1. A user story or use case describes the desired behavior.
2. Playwright acceptance tests verify complete, user-visible flows.
3. Vitest integration tests verify interactions between the involved components, routes, stores, helpers, and controlled dependencies.
4. Vitest unit tests protect pure utility functions, isolated logic, and relevant edge cases.

Use the narrowest test level that provides sufficient confidence. Add a higher-level test when the behavior depends on browser interaction, routing, responsive layout, or multiple application layers.

## Coverage

Coverage is generated with Vitest and V8. The coverage report is stored in the `coverage/` directory.

Coverage numbers provide orientation and complement functional test selection. They do not replace it.

## Further Information

- `README.md` for project context, commands, and architecture
- `docs/ai-prompts.md` for AI-assisted development rules
- `docs/ai-prompt-examples.md` for example prompts
