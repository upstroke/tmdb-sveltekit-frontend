import { test, expect } from '@playwright/test';
import { checkA11y } from '$tests/setup/a11y.js';

test.describe('Detail Pages Accessibility', () => {
	test(
		'Movie detail page initial load has no automatically detected WCAG A/AA violations',
		{
			tag: ['@accessibility', '@a11y', '@desktop', '@movie-details']
		},
		async ({ page }) => {
			await page.goto('/movies/680?locale=en-US', { waitUntil: 'networkidle' });
			await expect(page.getByRole('heading').first()).toBeVisible();
			await checkA11y(page);
		}
	);

	test(
		'TV detail page initial load has no automatically detected WCAG A/AA violations',
		{
			tag: ['@accessibility', '@a11y', '@desktop', '@tv-details']
		},
		async ({ page }) => {
			await page.goto('/tv-shows/108978?locale=en-US', { waitUntil: 'networkidle' });
			await expect(page.getByRole('heading').first()).toBeVisible();
			await checkA11y(page);
		}
	);
});
