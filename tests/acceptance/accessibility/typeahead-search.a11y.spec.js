// @ts-check
import { test, expect } from '@playwright/test';
import { checkA11y } from '../../setup/a11y.js';

const RESULT_LINK_SELECTOR = 'a.result[data-result-link="true"]';
const RESULTS_CONTAINER_SELECTOR = '#typeahead-search-results';
const SEARCH_INPUT_NAME = 'Search movies & TV';

async function openTypeahead(page) {
  const searchInput = page.getByRole('combobox', {
    name: SEARCH_INPUT_NAME
  });
  const resultsContainer = page.locator(RESULTS_CONTAINER_SELECTOR);

  await expect(searchInput).toBeVisible();
  await expect(searchInput).toHaveAttribute('type', 'search');
  await expect(searchInput).toHaveValue('');
  await expect(searchInput).toHaveAttribute('aria-expanded', 'false');

  return {
    searchInput,
    resultsContainer
  };
}

async function openStableResults(page, term = 'Hero') {
  const { searchInput, resultsContainer } = await openTypeahead(page);
  const resultLinks = resultsContainer.locator(RESULT_LINK_SELECTOR);

  await searchInput.fill(term);

  await expect(searchInput).toBeFocused();
  await expect(searchInput).toHaveAttribute('aria-expanded', 'true');
  await expect(resultsContainer).toBeVisible();
  await expect(resultLinks.first()).toBeVisible();

  return {
    searchInput,
    resultsContainer,
    resultLinks
  };
}

async function getFocusedResult(searchInput, resultsContainer) {
  await expect(searchInput).toHaveAttribute('aria-activedescendant', /.+/);

  const focusedId = await searchInput.getAttribute('aria-activedescendant');
  expect(focusedId).toBeTruthy();

  const focusedResult = resultsContainer.locator(
    `a.result[data-result-link="true"][id="${focusedId}"]`
  );

  await expect(focusedResult).toBeVisible();
  await expect(focusedResult).toHaveAttribute('aria-selected', 'true');

  return {
    focusedId,
    focusedResult
  };
}

async function getChangedFocusedResult(searchInput, resultsContainer, previousId) {
  await expect
    .poll(async () => searchInput.getAttribute('aria-activedescendant'))
    .not.toBe(previousId);

  return getFocusedResult(searchInput, resultsContainer);
}

async function gotoTypeaheadPage(page) {
  await page.goto('/?locale=en-US', {
    waitUntil: 'domcontentloaded'
  });

  await expect(
    page.getByRole('combobox', {
      name: SEARCH_INPUT_NAME
    })
  ).toBeVisible();
}

test.describe('Accessibility - Typeahead Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await gotoTypeaheadPage(page);
  });

  test(
    '[A11Y-TS-001] Desktop typeahead search results has no automatically detected WCAG A/AA violations',
    {
      tag: ['@accessibility', '@a11y', '@desktop', '@typeahead-search']
    },
    async ({ page }) => {
      const { searchInput, resultLinks } = await openStableResults(page);

      await expect(searchInput).toBeFocused();
      await expect(resultLinks.first()).toBeVisible();
      await checkA11y(page);
    }
  );

  test(
    '[A11Y-TS-002] Desktop typeahead search keyboard navigation has no automatically detected WCAG A/AA violations',
    {
      tag: ['@accessibility', '@a11y', '@desktop', '@typeahead-search', '@keyboard']
    },
    async ({ page }) => {
      const { searchInput, resultsContainer, resultLinks } = await openStableResults(page);

      await expect.poll(async () => resultLinks.count()).toBeGreaterThanOrEqual(2);

      const firstResultId = await resultLinks.first().getAttribute('id');
      const lastResultId = await resultLinks.last().getAttribute('id');
      const initialFocusedId = await searchInput.getAttribute('aria-activedescendant');

      await searchInput.press('ArrowDown');

      const { focusedId: firstFocusedId } = initialFocusedId
        ? await getChangedFocusedResult(searchInput, resultsContainer, initialFocusedId)
        : await getFocusedResult(searchInput, resultsContainer);

      expect(firstFocusedId).toBeTruthy();

      await searchInput.press('ArrowDown');

      const { focusedId: secondFocusedId } = await getChangedFocusedResult(
        searchInput,
        resultsContainer,
        firstFocusedId
      );

      expect(secondFocusedId).not.toBe(firstFocusedId);

      await searchInput.press('ArrowUp');

      const { focusedId: previousFocusedId } = await getChangedFocusedResult(
        searchInput,
        resultsContainer,
        secondFocusedId
      );

      expect(previousFocusedId).toBe(firstFocusedId);

      await searchInput.press('Home');

      await expect(searchInput).toHaveAttribute('aria-activedescendant', firstResultId);

      const { focusedId: homeFocusedId } = await getFocusedResult(searchInput, resultsContainer);
      expect(homeFocusedId).toBe(firstResultId);

      await searchInput.press('End');

      await expect(searchInput).toHaveAttribute('aria-activedescendant', lastResultId);

      const { focusedId: endFocusedId } = await getFocusedResult(searchInput, resultsContainer);
      expect(endFocusedId).toBe(lastResultId);

      await searchInput.press('Escape');

      await expect(searchInput).toHaveAttribute('aria-expanded', 'false');
      await expect(resultsContainer).toBeHidden();
      await expect(searchInput).toBeFocused();

      await checkA11y(page);
    }
  );

  test(
    '[A11Y-TS-005] Keyboard navigation sets aria-selected on typeahead search result',
    {
      tag: ['@accessibility', '@a11y', '@desktop', '@typeahead-search', '@keyboard']
    },
    async ({ page }) => {
      const { searchInput, resultsContainer, resultLinks } = await openStableResults(page);

      await searchInput.press('ArrowDown');
      const { focusedId, focusedResult } = await getFocusedResult(searchInput, resultsContainer);

      await expect(focusedResult).toHaveAttribute('aria-selected', 'true');

      const resultCount = await resultLinks.count();
      for (let index = 0; index < resultCount; index += 1) {
        const result = resultLinks.nth(index);
        const id = await result.getAttribute('id');

        if (id !== focusedId) {
          await expect(result).toHaveAttribute('aria-selected', 'false');
        }
      }

      await checkA11y(page);
    }
  );

  test(
    '[A11Y-TS-006] Desktop typeahead search Enter key activates focused result',
    {
      tag: ['@accessibility', '@a11y', '@desktop', '@typeahead-search', '@keyboard']
    },
    async ({ page }) => {
      const { searchInput, resultsContainer } = await openStableResults(page);

      await searchInput.press('ArrowDown');

      const { focusedResult } = await getFocusedResult(searchInput, resultsContainer);
      const expectedHref = await focusedResult.getAttribute('href');

      expect(expectedHref).toBeTruthy();

      const expectedUrl = new URL(expectedHref, page.url()).toString();

      await Promise.all([
        page.waitForURL(expectedUrl, {
          waitUntil: 'commit'
        }),
        searchInput.press('Enter')
      ]);

      await expect(page).toHaveURL(expectedUrl);
    }
  );
});

test.describe('Accessibility - Typeahead Search iOS', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
  });

  test.beforeEach(async ({ page }) => {
    await gotoTypeaheadPage(page);
  });

  test(
    '[A11Y-TS-003] Mobile iOS typeahead search results has no automatically detected WCAG A/AA violations',
    {
      tag: ['@accessibility', '@a11y', '@mobile', '@ios', '@typeahead-search']
    },
    async ({ page }) => {
      await openStableResults(page, 'Hero');
      await checkA11y(page);
    }
  );
});

test.describe('Accessibility - Typeahead Search Android', () => {
  test.use({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
  });

  test.beforeEach(async ({ page }) => {
    await gotoTypeaheadPage(page);
  });

  test(
    '[A11Y-TS-004] Mobile Android typeahead search results has no automatically detected WCAG A/AA violations',
    {
      tag: ['@accessibility', '@a11y', '@mobile', '@android', '@typeahead-search']
    },
    async ({ page }) => {
      await openStableResults(page, 'Breaking');
      await checkA11y(page);
    }
  );
});
