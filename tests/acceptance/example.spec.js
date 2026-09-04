// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/TMDB/);
  });

  test('shows movie grid', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.movie-grid')).toBeVisible();
  });
});
