# Detail Pages Accessibility Test Plan

## Feature: Movie and TV Detail Page Accessibility

This test plan covers automated accessibility checks for the initial states of valid movie and TV detail pages. The tests use Playwright and `checkA11y` to detect automatically identifiable WCAG A/AA violations after the pages have finished loading.

---

## Scope

### Pages Under Test

- Movie detail page: `/movies/680?locale=en-US`
- TV show detail page: `/tv-shows/108978?locale=en-US`

### Covered Areas

- Initial rendering of a valid movie detail page
- Initial rendering of a valid TV show detail page
- Page loading until the `networkidle` state
- Presence of a visible page heading
- Automated accessibility analysis of the complete rendered page with `checkA11y`

### Exclusions

- Invalid media IDs and 404 responses
- Detail-page interactions after initial load
- TV season-tab interaction, covered by `tabgroupe.a11y.spec.js`
- Typeahead search, covered by `typeahead-search.a11y.spec.js`
- Header and mobile navigation, covered by `navigation.a11y.spec.js`
- Manual screen-reader, keyboard, zoom/reflow, and visual contrast checks

---

## Conformance Target

- **Standard:** WCAG 2.2 Level AA
- **Automated tool:** axe-core through Playwright
- **Accessibility helper:** `tests/setup/a11y.js`
- **Test file:** `tests/acceptance/accessibility/detail-pages.a11y.spec.js`
- **Viewport:** Desktop Playwright context
- **Locale:** `en-US`

Automated checks support the audit but do not replace manual keyboard, screen-reader, reflow, focus, and content-understanding checks.

---

## Test Setup

Each test:

1. Opens a valid detail-page route with the `en-US` locale.
2. Waits until the page reaches the `networkidle` state.
3. Verifies that the first heading exposed through the accessibility tree is visible.
4. Runs `checkA11y(page)` against the complete rendered page.

The IDs should remain synchronized with the test data or known TMDB fixtures used by the project.

---

## Test Cases

### DPA11Y-001: Movie detail page initial load

**Tags:** `@accessibility`, `@a11y`, `@desktop`, `@movie-details`

**Given** the valid movie detail route `/movies/680?locale=en-US` is opened  
**When** the page reaches the `networkidle` state  
**Then** the first page heading should be visible  
**And** `checkA11y(page)` should report no automatically detected WCAG A/AA violations

```js
await page.goto('/movies/680?locale=en-US', { waitUntil: 'networkidle' });
await expect(page.getByRole('heading').first()).toBeVisible();
await checkA11y(page);
```

### DPA11Y-002: TV detail page initial load

**Tags:** `@accessibility`, `@a11y`, `@desktop`, `@tv-details`

**Given** the valid TV show detail route `/tv-shows/108978?locale=en-US` is opened  
**When** the page reaches the `networkidle` state  
**Then** the first page heading should be visible  
**And** `checkA11y(page)` should report no automatically detected WCAG A/AA violations

```js
await page.goto('/tv-shows/108978?locale=en-US', { waitUntil: 'networkidle' });
await expect(page.getByRole('heading').first()).toBeVisible();
await checkA11y(page);
```

---

## Acceptance Criteria

1. The movie detail route loads successfully with the `en-US` locale.
2. The TV show detail route loads successfully with the `en-US` locale.
3. Both pages expose a visible heading through the accessibility tree.
4. Both initial page states pass the automated `checkA11y` check.
5. The tests use valid detail-page routes and do not intentionally navigate to invalid media IDs.
6. Failures identify the affected detail-page test through its dedicated tag.

---

## Execution

```bash
npx playwright test tests/acceptance/accessibility/detail-pages.a11y.spec.js
npx playwright test -g '@movie-details'
npx playwright test -g '@tv-details'
npx playwright test tests/acceptance/accessibility/
```

---

## Maintenance

Update this plan together with the spec if a route, locale, valid test ID, loading condition, selector, or accessibility helper changes. Keep this plan next to `detail-pages.a11y.spec.js`.
