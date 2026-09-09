# Playwright End-to-End Acceptance Tests

## Scope

Playwright end-to-end acceptance tests belong in `tests/acceptance/`.

Organize tests by user-visible feature. Each substantial feature directory contains one or more Playwright `*.spec.js` files and exactly one related `*-testplan.md` file.

```text
tests/acceptance/
  navigation/
    navigation.spec.js
    navigation-testplan.md
  loadmore/
    loadmore.spec.js
    loadmore-home.spec.js
    loadmore-movies.spec.js
    loadmore-tvshows.spec.js
    loadmore-testplan.md
```

The feature directory is the complete documentation and implementation unit for that acceptance-test feature. Do not create a central `docs/test-plans/` directory for these feature-specific plans.

## Test Perspective

- Test complete browser-based user workflows from a black-box perspective.
- Verify behavior observable to users in the browser.
- Use Playwright acceptance tests when confidence requires real browser behavior, routing, responsive layout, browser events, or interaction between multiple application layers.
- Do not assert internal functions, component state, store values, or incidental DOM structure.
- Read `playwright.config.js`, the affected feature's `*-testplan.md`, and all existing feature `*.spec.js` files before proposing changes.
- The feature-local test plan is the source of truth for scope, exclusions, feature IDs, test case IDs, priorities, test design technique, viewports, tags, Gherkin scenarios, traceability, pass/fail criteria, and expected user-visible behavior.

## Browser and Viewport Setup

- Use the browser projects and `webServer` configuration defined in `playwright.config.js`.
- Do not hardcode a localhost port unless it is explicitly part of the project configuration or test contract.
- Chromium is the default browser unless a task or configuration requires additional coverage.
- Cover the default desktop viewport when desktop behavior is relevant.
- Set an explicit mobile viewport before loading the application when responsive behavior is relevant. The existing navigation scenarios use `370x667`.

## Locator Strategy

- Prefer accessible, user-oriented locators such as `getByRole` with an accessible name.
- Prefer visible labels and accessibility contracts over implementation-specific selectors.
- Use stable semantic CSS IDs only when an accessible locator is not sufficiently precise, for example `#home`, `#movies`, or `#tvshows`.
- Avoid brittle selectors based on generated CSS classes, DOM position, `nth-child`, or layout-only structure.

## Assertions

Verify user-observable outcomes such as:

- route or URL changes;
- page titles;
- visible and hidden state;
- active navigation state using `aria-current`;
- expanded or collapsed state using `aria-expanded`;
- keyboard or pointer behavior when it is part of the requirement;
- absence of unexpected browser-console errors when the feature test plan requires it.

## Metadata and Test Plans

- Use stable feature IDs such as `F-NAV`.
- Use stable test case IDs such as `TC-NAV-001`.
- Apply tags consistently, for example `@navigation`, `@desktop`, `@mobile`, `@black-box`, `@regression` and `@accessibility`.
- Keep the test plan, decision table, Gherkin scenarios, traceability matrix, and all executable specifications synchronized.
- When a task changes an acceptance-test specification, review whether the feature-local test plan must also be updated. When a task changes the test plan, review whether one or more specifications must also be updated.
- If an implementation detail conflicts with the feature-local test plan, report the discrepancy before changing code or documentation.

## Commands

```bash
npm run test:acceptance
npx playwright test
npx playwright test tests/acceptance/navigation/
npx playwright test -g "@navigation"
```

Use UI mode or headed mode when investigating a failing browser workflow:

```bash
npx playwright test tests/acceptance/navigation/ --ui
npx playwright test tests/acceptance/navigation/ --headed
```
