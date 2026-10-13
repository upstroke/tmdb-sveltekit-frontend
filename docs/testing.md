# Test Documentation

This file provides the high-level testing overview for the project. Read it before creating or changing tests, then continue with the common rules and the guide for the applicable test level.

## Test Levels

The project uses three automated test levels:

- Unit tests with Vitest for isolated utility, store, helper, route, and TMDB API logic
- Integration tests with Vitest for Svelte components, route behavior, and interactions between controlled parts
- End-to-end acceptance tests with Playwright for complete browser-based user flows

## Accessibility Testing

The project includes automated accessibility testing to support WCAG 2.2 AA compliance.

- Accessibility checks use Playwright together with axe-core (`@axe-core/playwright`) for automated WCAG A/AA violation detection.
- Accessibility test files are located under `tests/acceptance/accessibility/`.
- Accessibility test plans remain next to the executable specifications as `*-testplan.md` files.
- Common tags for these tests are `@accessibility` and `@a11y`.

### Accessibility Commands

```bash
# All accessibility tests
npx playwright test tests/acceptance/accessibility/

# Accessibility tests by tag
npx playwright test -g @accessibility
npx playwright test -g @a11y

# Combined with other tags
npx playwright test -g "(?=.*@accessibility)(?=.*@homepage)"
```

## Security Testing

The project includes two complementary layers of security testing.

### HTTP Security Header Tests (Playwright)

Acceptance tests in `tests/acceptance/security/security-headers.spec.js` verify that `src/hooks.server.js` sets the required HTTP security headers on every response. These tests run against the dev server or production preview.

Test cases covered: Content-Security-Policy presence, CSP `script-src 'self'`, TMDB image and API origins in CSP, `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and absence of the API key in rendered HTML.

Tag: `@security`

```bash
# All security header tests
npx playwright test tests/acceptance/security/

# Security tests by tag
npx playwright test -g @security

# Combined with other tags
npx playwright test -g "(?=.*@security)(?=.*@homepage)"

# Security tests in headed mode (visible browser)
npx playwright test tests/acceptance/security/ --headed
```

The test plan is documented in `tests/acceptance/security/security-testplan.md`.

### Dependency Audit (npm audit)

`npm run test:security` runs `npm audit --audit-level=moderate` to check all installed dependencies for known vulnerabilities. It is included in both `test:all` and `test:precommit`.

```bash
npm run test:security
```

## Running Tests by Tag

Playwright tests can be filtered by tag using the `-g` flag. Tags are embedded directly in the test or `describe` title (e.g., `@security`, `@accessibility`).

### Available Tags

| Tag | Scope | Location |
|-----|-------|----------|
| `@security` | HTTP security header tests | `tests/acceptance/security/` |
| `@accessibility` | Accessibility (axe-core) tests | `tests/acceptance/accessibility/` |
| `@a11y` | Alias for `@accessibility` | `tests/acceptance/accessibility/` |

### Commands

```bash
# Run all tests with a specific tag
npx playwright test -g @security
npx playwright test -g @accessibility

# Combine multiple tags (AND — both must match)
npx playwright test -g "(?=.*@security)(?=.*@homepage)"

# Run a specific test file directly (no tag required)
npx playwright test tests/acceptance/security/security-headers.spec.js
```

### Adding New Tags

When adding a new Playwright test, place the tag directly in the `test()` or `test.describe()` title:

```js
test.describe('My Feature @mytag', () => { … });
test('TC-XYZ-001: some behavior @mytag', async ({ page }) => { … });
```

Add the new tag to the table above so it remains discoverable.

## Test Directory Structure

```text
tests/
  acceptance/
    accessibility/
    loadmore/
    navigation/
    security/
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
- `tests/acceptance/accessibility/` contains accessibility tests with Playwright and axe-core.
- `tests/acceptance/security/` contains HTTP security header tests with Playwright.
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
npm run test:security
npm run test:all
npm run test:precommit
npm run test:vitest:coverage
```

The `justfile` provides shortcuts for important commands, including `just test-vitest` and `just test-e2e`.

## Vitest Setup Note

For Svelte 5 component tests with Vitest, the official `svelteTesting()` Vite plugin from `@testing-library/svelte/vite` is used. It automatically adds cleanup and the browser resolver condition to the DOM-based test environment, allowing UI tests under `jsdom` to load the browser version of the Svelte modules correctly.

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
5. Accessibility tests verify WCAG 2.2 AA compliance for pages and interactions.
6. Security tests verify HTTP security headers and dependency vulnerability status.

Use the narrowest test level that provides sufficient confidence. Add a higher-level test when the behavior depends on browser interaction, routing, responsive layout, or multiple application layers.

## Coverage

Coverage is generated with Vitest and V8. The coverage report is stored in the `coverage/` directory.

Coverage numbers provide orientation and complement functional test selection. They do not replace it.

Unit tests must maintain a minimum statement coverage of 80%.

Before every commit, Husky runs the pre-commit checks automatically:

- unit tests with coverage
- formatting and ESLint checks
- integration tests
- dependency security audit (`npm audit`)

Run the same checks manually with:

```bash
npm run test:precommit
```

## Further Information

- `README.md` for project context, installation, and architecture overview
- `docs/ai-prompts.md` for AI-assisted development rules
- `docs/ai-prompt-examples.md` for example prompts
