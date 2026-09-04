// @ts-check
const { test, expect } = require('@playwright/test');

test('home page has correct title', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveTitle(/Home TMDB/);
});
