import { test } from '@playwright/test';
import { checkA11y } from '../../setup/a11y.js';

test.describe('Accessibility', () => {
  test('Homepage has no automatically detected WCAG A/AA violations', async ({ page }) => {
    await page.goto('/');
    await checkA11y(page);
  });
});
