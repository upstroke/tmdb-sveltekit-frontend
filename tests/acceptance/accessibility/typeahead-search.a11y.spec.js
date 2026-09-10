// @ts-check
import { test, expect } from '@playwright/test';
import { checkA11y } from '../../setup/a11y.js';

/**
 * Feature: F-TS — Typeahead Search (Accessibility)
 * Test plan: tests/acceptance/accessibility/typeaheadsearch-testplan.md
 * 
 * Test cases:
 * - A11Y-TS-001: Desktop typeahead search results accessibility
 * - A11Y-TS-002: Desktop typeahead search with keyboard navigation accessibility
 * - A11Y-TS-003: Mobile iOS typeahead search accessibility
 * - A11Y-TS-004: Mobile Android typeahead search accessibility
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
      const searchInput = page.getByRole('searchbox');
      await searchInput.click();
      await searchInput.clear();
      await searchInput.fill('Hero');

      const resultsContainer = page.locator('#typeahead-search-results');
      await resultsContainer.waitFor({ state: 'visible', timeout: 5000 });

      await checkA11y(page);
    }
  );

  // A11Y-TS-002
  test(
    '[A11Y-TS-002] Desktop typeahead search with keyboard navigation has no automatically detected WCAG A/AA violations',
    async ({ page }) => {
      const searchInput = page.getByRole('searchbox');
      await searchInput.click();
      await searchInput.clear();
      await searchInput.fill('Hero');

      const resultsContainer = page.locator('#typeahead-search-results');
      await resultsContainer.waitFor({ state: 'visible', timeout: 5000 });

      // Tab through first two results
      const resultLinks = resultsContainer.locator('a.result[data-result-link="true"]');
      await expect(resultLinks.count()).resolves.toBeGreaterThanOrEqual(2);

      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

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
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
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
      const searchInput = page.getByRole('searchbox');
      await searchInput.click();
      await searchInput.clear();
      await searchInput.fill('Hero');

      const resultsContainer = page.locator('#typeahead-search-results');
      await resultsContainer.waitFor({ state: 'visible', timeout: 5000 });

      await checkA11y(page);
    }
  );

  // A11Y-TS-004
  test(
    '[A11Y-TS-004] Mobile Android typeahead search results has no automatically detected WCAG A/AA violations',
    async ({ page }) => {
      const searchInput = page.getByRole('searchbox');
      await searchInput.click();
      await searchInput.clear();
      await searchInput.fill('Breaking');

      const resultsContainer = page.locator('#typeahead-search-results');
      await resultsContainer.waitFor({ state: 'visible', timeout: 5000 });

      await checkA11y(page);
    }
  );
});