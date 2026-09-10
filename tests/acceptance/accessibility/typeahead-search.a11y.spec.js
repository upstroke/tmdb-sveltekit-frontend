// @ts-check
import { test, expect, devices } from '@playwright/test';
import { checkA11y } from '$tests/setup/a11y.js';

const mobileIOS = devices['iPhone 13'];
const mobileAndroid = devices['Pixel 5'];

const searchInput = (page) => page.getByRole('searchbox');
const resultsContainer = (page) =>
  page.locator('#typeahead-search-results');
const resultLinks = (page) =>
  resultsContainer(page).locator('a.result[data-result-link="true"]');

async function prepareSearch(page) {
  await page.goto('http://localhost:5173/?locale=en-US');
  await expect(page).toHaveTitle(/Home.*TMDB/);

  const input = searchInput(page);
  await input.click();
  await input.clear();
  await input.fill('Hero');

  await resultsContainer(page).waitFor({
    state: 'visible',
    timeout: 5000
  });

  await expect(resultLinks(page).first()).toBeVisible();
}

test.describe('Accessibility - Typeahead Search - Desktop', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  // A11Y-009: Typeahead search results accessibility
  test(
    'Typeahead search results have no automatically detected WCAG A/AA violations',
    {
      tag: ['@accessibility', '@a11y', '@desktop', '@search', '@typeahead']
    },
    async ({ page }) => {
      await prepareSearch(page);
      await checkA11y(page);
    }
  );

  // A11Y-010: Tab moves focus from the first to the second search result
  test(
    'Tab moves focus from the first to the second search result',
    {
      tag: ['@accessibility', '@a11y', '@desktop', '@search', '@typeahead', '@keyboard']
    },
    async ({ page }) => {
      await prepareSearch(page);

      const firstResult = resultLinks(page).first();
      const secondResult = resultLinks(page).nth(1);

      await expect(resultLinks(page)).toHaveCount(2, { timeout: 5000 });

      await page.keyboard.press('Tab');
      await expect(firstResult).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(secondResult).toBeFocused();

      await checkA11y(page);
    }
  );

  // A11Y-011: Escape closes the typeahead search results
  test(
    'Escape closes the typeahead search results',
    {
      tag: ['@accessibility', '@a11y', '@desktop', '@search', '@typeahead', '@keyboard']
    },
    async ({ page }) => {
      await prepareSearch(page);

      await page.keyboard.press('Escape');
      await expect(resultsContainer(page)).toBeHidden({
        timeout: 2000
      });

      await checkA11y(page);
    }
  );
});

// iOS Mobile Tests (iPhone 13)
test.describe('Accessibility - Typeahead Search - iOS', () => {
  test.use({
    viewport: mobileIOS.viewport,
    deviceScaleFactor: mobileIOS.deviceScaleFactor,
    isMobile: mobileIOS.isMobile,
    hasTouch: mobileIOS.hasTouch,
    userAgent: mobileIOS.userAgent,
  });

  // A11Y-012: Typeahead search on iPhone 13 accessibility
  test(
    'Typeahead search on iPhone 13 has no automatically detected WCAG A/AA violations',
    {
      tag: ['@accessibility', '@a11y', '@mobile', '@ios', '@search', '@typeahead']
    },
    async ({ page }) => {
      await prepareSearch(page);
      await checkA11y(page);
    }
  );
});

// Android Mobile Tests (Pixel 5)
test.describe('Accessibility - Typeahead Search - Android', () => {
  test.use({
    viewport: mobileAndroid.viewport,
    deviceScaleFactor: mobileAndroid.deviceScaleFactor,
    isMobile: mobileAndroid.isMobile,
    hasTouch: mobileAndroid.hasTouch,
    userAgent: mobileAndroid.userAgent,
  });

  // A11Y-013: Typeahead search on Pixel 5 accessibility
  test(
    'Typeahead search on Pixel 5 has no automatically detected WCAG A/AA violations',
    {
      tag: ['@accessibility', '@a11y', '@mobile', '@android', '@search', '@typeahead']
    },
    async ({ page }) => {
      await prepareSearch(page);
      await checkA11y(page);
    }
  );
});
