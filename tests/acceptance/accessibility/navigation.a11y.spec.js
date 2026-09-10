import { test } from '@playwright/test';
import { checkA11y } from '../../setup/a11y.js';

test.describe('Accessibility - Homepage', () => {
  test('Homepage initial state has no automatically detected WCAG A/AA violations', async ({ page }) => {
    await page.goto('/');
    await checkA11y(page);
  });

  test('Homepage after opening navigation has no automatically detected WCAG A/AA violations', async ({ page }) => {
    await page.goto('/');

    // Open navigation menu (adjust selector to your implementation)
    const navButton = page.getByRole('button', { name: /menu|navigation|open/i });
    if (await navButton.isVisible()) {
      await navButton.click();
      await page.waitForTimeout(500); // Wait for animation
      await checkA11y(page);
    }
  });

  test('Homepage after search interaction has no automatically detected WCAG A/AA violations', async ({ page }) => {
    await page.goto('/');

    // Perform search (adjust selectors to your implementation)
    const searchInput = page.getByRole('searchbox', { name: /search/i });
    if (await searchInput.isVisible()) {
      await searchInput.fill('breaking');
      await page.waitForTimeout(500); // Wait for debounce/results
      await checkA11y(page);
    }
  });
});
