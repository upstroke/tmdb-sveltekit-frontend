# Accessibility Audit Checklist for SvelteKit (JavaScript)

**Goal:** This checklist supports a repeatable frontend audit according to WCAG 2.2 AA. It combines automated checks with manual testing for critical user journeys.

> An automated scan is not a complete accessibility audit. Additionally check keyboard, screen reader, zoom/reflow, and the actual understandability of content.

---

## 1. Prepare the Audit

- [ ] Define audit goal: WCAG 2.2 AA (or the binding requirement for the product)
- [ ] Define relevant browsers and devices: at least Chromium, Firefox, WebKit/Safari
- [ ] Select critical user journeys, e.g. sign in, search, submit form, purchase/checkout, edit account
- [ ] Capture representative states: empty, loading, success, error, unauthorized
- [ ] Provide test data containing realistic long texts, special characters, and validation errors
- [ ] Document findings with URL/route, component, reproduction steps, WCAG criterion, impact, priority, and fix suggestion

## 2. Automated Baseline Checks

### Locally in the Browser

- [ ] Run Lighthouse Accessibility in Chrome DevTools
- [ ] Use axe DevTools or WAVE for quick checks
- [ ] Do not blindly accept findings: reproduce and evaluate each finding

### E2E with Playwright and axe-core

Installation:

```bash
npm i -D @axe-core/playwright
```

`tests/e2e/a11y.js`:

```js
import { AxeBuilder } from '@axe-core/playwright';

export async function checkA11y(page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();

  if (results.violations.length > 0) {
    const details = results.violations
      .map((violation) => {
        const nodes = violation.nodes
          .map((node) => `  - ${node.html}\n    ${node.failureSummary ?? ''}`)
          .join('\n');
        return `${violation.id}: ${violation.help}\n${nodes}`;
      })
      .join('\n\n');

    throw new Error(`Accessibility violations found:\n\n${details}`);
  }
}
```

`tests/e2e/example.a11y.spec.js`:

```js
import { test } from '@playwright/test';
import { checkA11y } from './a11y';

test('Homepage has no automatically detected WCAG A/AA violations', async ({ page }) => {
  await page.goto('/');
  await checkA11y(page);
});

test('Login error state is automatically testable', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: /sign in/i }).click();
  await checkA11y(page);
});
```

- [ ] Run axe checks at least for each central route
- [ ] Also check states after interactions: modal open, menu open, forms with errors, toasts, loading states
- [ ] If exceptions are intentionally necessary, document them specifically; do not disable rules globally
- [ ] Run a11y E2E tests in pull requests and before releases

### Component and Unit Tests

- [ ] Test components via roles and accessible names (`getByRole`, `getByLabelText`)
- [ ] For icon buttons, ensure a visible or programmatic name is present
- [ ] Cover error texts, status messages, and dialog titles as test cases
- [ ] Test reusable components like modal, dropdown, tabs, combobox, and date picker especially intensively

## 3. Semantics and Structure

- [x] Set `lang` on the root `html` and adapt it on language change
- [ ] Provide exactly one meaningful main content area per page with `<main>`
- [ ] Use landmarks meaningfully: `<header>`, `<nav>`, `<main>`, `<footer>`, and optionally `<aside>`
- [ ] Heading hierarchy is logical; headings are not chosen only for their visual style
- [ ] One `<h1>` describes the main purpose of the page
- [ ] Use native HTML elements: `<button>` for actions, `<a>` for navigation, `<input>`/`<select>`/`<textarea>` for forms
- [ ] Do not use clickable `<div>` or `<span>` when a native element is possible
- [ ] Lists are marked up as `<ul>`, `<ol>`, or `<dl>`
- [ ] Use tables only for tabular data; mark up table headers and relationships correctly
- [ ] Iframes have a meaningful `title`

## 4. Keyboard and Focus

- [ ] All interactive elements are reachable exclusively via keyboard
- [ ] Tab order follows the visual and content order
- [ ] Focus is always clearly visible and not obscured by layout/overlays
- [ ] Buttons work with `Enter` and, where appropriate, `Space`
- [ ] Links can be activated with `Enter`
- [ ] There is no keyboard trap; focus can leave every component again
- [ ] A skip link allows skipping repeated navigation to the main content
- [ ] When openin