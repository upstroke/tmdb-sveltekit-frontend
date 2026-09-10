// @ts-check
import { test, expect } from '@playwright/test';
import { checkA11y } from '../../setup/a11y.js';

const RESULT_LINK_SELECTOR = 'a.result[data-result-link="true"]';

async function openResults(page, term = 'Hero') {
  const searchInput = page.getByRole('searchbox');

  await searchInput.fill(term);

  const resultsContainer = page.locator('#typeahead-search-results');
  await expect(resultsContainer).toBeVisible();

  return {
    searchInput,
    resultsContainer,
    resultLinks: resultsContainer.locator(RESULT_LINK_SELECTOR)
  };
}

/**
 * Feature: F-TS — Typeahead Search (Accessibility)
 * Test plan: tests/acceptance/accessibility/typeaheadsearch-testplan.md
 *
 * Test cases:
 * - A11Y-TS-001: Desktop typeahead search results accessibility
 * - A11Y-TS-002: Desktop typeahead search with keyboard navigation accessibility
 * - A11Y-TS-003: Mobile iOS typeahead search accessibility
 * - A11Y-TS-004: Mobile Android typeahead search accessibility
 * - A11Y-TS-005: Selected typeahead search result accessibility
 */

test.describe('Accessibility - Typeahead Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('?locale=en-US');
    await page.waitForLoadState('networkidle');
  });

  // A11Y-TS-001
  test(
    '[A11Y-TS-001] Desktop typeahead search results has no automatically detected WCAG A/AA violations',
    async ({ page }) => {
      const { searchInput } = await openResults(page);

      await expect(searchInput).toBeFocused();
      await checkA11y(page);
    }
  );

  // A11Y-TS-002
  test(
    '[A11Y-TS-002] Desktop typeahead search keyboard interaction has no automatically detected WCAG A/AA violations',
    async ({ page }) => {
      const { searchInput, resultsContainer, resultLinks } = await openResults(page);

      const resultCount = await resultLinks.count();
      expect(resultCount).toBeGreaterThanOrEqual(2);

      await searchInput.press('Tab');
      await expect(resultLinks.first()).toBeFocused();

      await page.keyboard.press('Escape');

      await expect(resultsContainer).toBeHidden();
      await expect(searchInput).toBeFocused();

      await checkA11y(page);
    }
  );

  // A11Y-TS-005
  test(
    '[A11Y-TS-005] Selected typeahead search result exposes aria-selected',
    async ({ page }) => {
      const { resultLinks } = await openResults(page);
      const resultLink = resultLinks.first();

      await resultLink.evaluate((element) => {
        element.addEventListener(
          'click',
          (event) => event.preventDefault(),
          { once: true }
        );
      });

      await resultLink.click();

      await expect(resultLink).toHaveAttribute('aria-selected', 'true');
      await checkA11y(page);
    }
  );
});

test.describe('Accessibility - Typeahead Search Mobile', () => {
  const mobile = {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
  };

  test.use({
    viewport: mobile.viewport,
    deviceScaleFactor: mobile.deviceScaleFactor,
    isMobile: mobile.isMobile,
    hasTouch: mobile.hasTouch,
    userAgent: mobile.userAgent
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('?locale=en-US');
    await page.waitForLoadState('networkidle');
  });

  // A11Y-TS-003
  test(
    '[A11Y-TS-003] Mobile iOS typeahead search results has no automatically detected WCAG A/AA violations',
    async ({ page }) => {
      await openResults(page, 'Hero');
      await checkA11y(page);
    }
  );

  // A11Y-TS-004
  test(
    '[A11Y-TS-004] Mobile Android typeahead search results has no automatically detected WCAG A/AA violations',
    async ({ page }) => {
      await openResults(page, 'Breaking');
      await checkA11y(page);
    }
  );
});
