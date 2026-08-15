// @ts-check
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('/');
  await page.locator('a[href="/movies"]').click();
  await expect(page).toHaveURL(/\/movies$/);
});