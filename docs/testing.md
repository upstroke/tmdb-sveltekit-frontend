# Test Documentation

This file describes the pragmatic testing approach for this project.

## Test Types

The project uses four test types:

- Acceptance tests in `tests/acceptance/` with Playwright
- Component tests in `../tests/integration/components/` with Vitest
- Integration tests in `tests/integration/` with Vitest
- Unit tests in `tests/unit/` with Vitest

## Test Commands

```bash
npm run test
npm run test:unit
npm run test:components
npm run test:integration
npm run test:acceptance
npm run test:vitest:coverage
```

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

## Fixtures

Fixtures contain reusable, realistic test data. They prevent duplication in test files and make tests easier to read.

**Directory:** `tests/fixtures/`

### Existing Fixtures

- `tests/fixtures/tmdb/tmdb.fixtures.js` — TMDB API response data
- `tests/fixtures/i18n.fixture.js` — i18n data from ui.json (labels and locales)
- `tests/fixtures/navItems.fixture.js` — navigation items for header tests

### Usage

```js
import {
  movieDetails,
  tvShowDetails
} from '$tests/fixtures/tmdb/tmdb.fixtures.js';

it('processes movie details', () => {
  const result = mapMovieDetails(movieDetails);

  expect(result.title).toBe(movieDetails.title);
});
```

### Rules

- Reusable sample data belongs in `tests/fixtures/`.
- Fixtures should contain realistic but static test data.
- Tests must not modify fixture objects directly. Create a copy when making adjustments:

```js
const movieWithoutPoster = {
  ...movieDetails,
  poster_path: null
};
```

- Do not use fixtures for mock behavior; mocks belong in `tests/mocks/`.
- **Fixtures contain stable test data:** Use fixtures for domain examples that recur across multiple tests and contain no logic.

## Mocks

Mocks encapsulate technical dependencies such as stores, APIs, or browser functions.

**Directory:** `tests/mocks/`

### Existing Mocks

- `tests/mocks/i18n.mocks.js` — i18n store mock
- `tests/mocks/pages-media-data.mocks.js` — paginated media data mocks

### Usage

```js
import { i18nMockDefault, getI18nLabels } from '$tests/mocks/i18n.mocks.js';

const labels = getI18nLabels();

vi.mock('$lib/stores/i18n', async () => ({
  i18n: {
    subscribe(run) {
      run({ labels });
      return () => {};
    }
  }
}));
```

### Benefits

- Labels come from `ui.json`, so tests fail when labels change.
- The mock is defined centrally once.
- Labels remain consistent across all tests.

### Important Note About `vi.mock`

`vi.mock` must be placed **at the very top** of the test file and cannot use imports.

**Correct:**

```js
import { i18nData } from '$tests/fixtures/i18n.fixture.js';

vi.mock('$lib/stores/i18n', async () => ({
  i18n: {
    subscribe: (run) => {
      run({ labels: i18nData.labels });
      return () => {};
    }
  }
}));
```

**Incorrect:**

```js
import { createI18nMock } from '$tests/mocks/i18n.mocks.js';

vi.mock('$lib/stores/i18n', () => createI18nMock()); // ❌ Error!
```

### Rules

- **Mocks and stubs encapsulate technology:** Use mocks or stubs for technical dependencies such as `fetch`, API clients, browser APIs, or other external interfaces.
- Keep mock logic in the test file because of the `vi.mock` limitation.
- Fixture data may be imported.

## Setup Utilities

Setup utilities contain helper functions for `beforeEach` and `afterEach` blocks.

**Directory:** `tests/setup/`

### Existing Utilities

- `tests/setup/test-utils.js` — `cleanupAll()`, `resetAll()`
- `tests/setup/missing-api-key.helper.js` — helper for API key tests

### Usage

```js
import { cleanupAll, resetAll } from '$tests/setup/test-utils.js';

describe('Component', () => {
  beforeEach(() => {
    resetAll();
  });

  afterEach(() => {
    cleanupAll();
  });

  it('test', () => {
    // Test code
  });
});
```

## Unit Testing Approach

Unit tests are written as regular Vitest tests in `tests/unit/*.test.js`.

The following rules apply:

- A test describes its behavior directly in the test file.
- Domain variants are represented through meaningful `describe` and `it` blocks.
- Additional metadata files or a test generator are not used.
- Comments are allowed when they briefly explain the functional goal of a case.
- Test documentation in the test file should name the test technique and briefly distinguish between the happy path and negative or fallback cases.

## Test Design Techniques

Depending on the function, the following techniques may be used:

- Equivalence partitioning
- Boundary value analysis
- Statement coverage
- Branch coverage
- State-based testing

Not every function requires all techniques. When needed, briefly justify the selected technique directly in the test or functional documentation.

### Use ISTQB Terms for Coverage

Use the ISTQB terms `statement coverage` and `branch coverage` in prompts and test comments. Mixed or improvised terminology is not allowed.

### 100% Statement Coverage as the Minimum Goal

When creating new tests, every executable statement in the affected code should be executed at least once. Close missing execution paths with additional test cases before making further refinements.

### Add Branch Coverage Deliberately

Add additional branch-coverage cases where alternative, error, fallback, boundary, or rejection branches are functionally or technically relevant. Do not blindly duplicate tests without a clearly new decision branch.

### Keep Comments per Test Case Unambiguous

Each `it` block receives exactly one short comment line directly above it. For classification, analyze all tests for a source file in a fixed order while collecting the statement IDs already covered. A test is classified as `statement coverage` as soon as it contributes at least one new statement ID toward 100% statement coverage of the source file. Only when it contributes no new statement ID but tests an additional functionally or technically relevant path is it classified as `branch coverage`. An additional branch check does not change the classification when the test also covers new statements. Do not use mixed labels.

## Coverage

Coverage is generated with Vitest and V8. The coverage report is stored in the `coverage/` directory.

Coverage numbers provide orientation and complement the functional test selection. They do not replace it.

## Tester’s Role

Deriving test cases from the domain remains the tester’s responsibility.

The tester:

- selects a suitable test subject from the existing code,
- decides which test design technique is functionally appropriate,
- identifies relevant test conditions, risks, and input classes,
- defines concrete test cases and expected results,
- reviews the results and improves the tests as needed.

## Best Practices

- **Reuse fixtures and mocks deliberately:** Before creating new helper data or test doubles, first search the existing `tests/fixtures` and `tests/mocks` directories. If a suitable example already exists, prefer using or extending it instead of creating a duplicate.
- **Uniqueness before organization:** Create a new fixture or mock only when no existing example fits and reuse would be impractical.

## Further Information

- `docs/ai-prompts.md` for general prompt guidelines
- `../README.md` for project context and tech stack
- `docs/ai-prompt-examples.md` for concrete prompt examples by role
