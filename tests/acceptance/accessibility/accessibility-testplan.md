# Accessibility Test Plan

This document describes the accessibility test plan for the TMDB SvelteKit Frontend project.

## Overview

Accessibility tests are implemented using Playwright with axe-core (`@axe-core/playwright`) to automatically detect WCAG 2.2 A/AA violations.

## Test Files

- `tests/acceptance/accessibility/navigation.a11y.spec.js` - Navigation and homepage accessibility tests
- `tests/acceptance/accessibility/typeahead-search.a11y.spec.js` - Typeahead search accessibility tests

## Test Cases

### Navigation Tests (navigation.a11y.spec.js)

| Test ID | Description | Platform | Device | Tags |
|---------|-------------|----------|--------|------|
| A11Y-001 | Desktop homepage initial load has no automatically detected WCAG A/AA violations | Desktop | Chromium | @accessibility, @a11y, @desktop, @homepage |
| A11Y-002 | Desktop homepage after load more has no automatically detected WCAG A/AA violations | Desktop | Chromium | @accessibility, @a11y, @desktop, @homepage, @loadmore |
| A11Y-003 | Mobile iOS homepage with closed burger menu has no automatically detected WCAG A/AA violations | Mobile | iPhone 13 | @accessibility, @a11y, @mobile, @ios, @burger-menu |
| A11Y-004 | Mobile iOS homepage with open burger menu has no automatically detected WCAG A/AA violations | Mobile | iPhone 13 | @accessibility, @a11y, @mobile, @ios, @burger-menu |
| A11Y-005 | Mobile iOS navigation to movies page has no automatically detected WCAG A/AA violations | Mobile | iPhone 13 | @accessibility, @a11y, @mobile, @ios, @navigation |
| A11Y-006 | Mobile Android homepage with closed burger menu has no automatically detected WCAG A/AA violations | Mobile | Pixel 5 | @accessibility, @a11y, @mobile, @android, @burger-menu |
| A11Y-007 | Mobile Android homepage with open burger menu has no automatically detected WCAG A/AA violations | Mobile | Pixel 5 | @accessibility, @a11y, @mobile, @android, @burger-menu |
| A11Y-008 | Mobile Android navigation to movies page has no automatically detected WCAG A/AA violations | Mobile | Pixel 5 | @accessibility, @a11y, @mobile, @android, @navigation |

### Typeahead Search Tests (typeahead-search.a11y.spec.js)

| Test ID | Description | Platform | Device | Tags |
|---------|-------------|----------|--------|------|
| A11Y-009 | Typeahead search results have no automatically detected WCAG A/AA violations | Desktop | Chromium | @accessibility, @a11y, @desktop, @search, @typeahead |
| A11Y-010 | Tab moves focus from the first to the second search result | Desktop | Chromium | @accessibility, @a11y, @desktop, @search, @typeahead, @keyboard |
| A11Y-011 | Escape closes the typeahead search results | Desktop | Chromium | @accessibility, @a11y, @desktop, @search, @typeahead, @keyboard |
| A11Y-012 | Typeahead search on iPhone 13 has no automatically detected WCAG A/AA violations | Mobile | iPhone 13 | @accessibility, @a11y, @mobile, @ios, @search, @typeahead |
| A11Y-013 | Typeahead search on Pixel 5 has no automatically detected WCAG A/AA violations | Mobile | Pixel 5 | @accessibility, @a11y, @mobile, @android, @search, @typeahead |

## Running Accessibility Tests

```bash
# All accessibility tests
npx playwright test tests/acceptance/accessibility/

# Navigation tests only
npx playwright test tests/acceptance/accessibility/navigation.a11y.spec.js

# Typeahead search tests only
npx playwright test tests/acceptance/accessibility/typeahead-search.a11y.spec.js

# By tag
npx playwright test -g @accessibility
npx playwright test -g @a11y
npx playwright test -g "@mobile and @ios"
npx playwright test -g "@mobile and @android"
```

## Test Devices

- **Desktop**: Chromium (default Playwright browser)
- **Mobile iOS**: iPhone 13 (Safari Mobile)
- **Mobile Android**: Pixel 5 (Chrome Mobile)

## Future Tests (Planned)

- `details.a11y.spec.js` - Movie and TV show detail pages accessibility
- `loadmore.a11y.spec.js` - Load more functionality accessibility (if separated from navigation)
