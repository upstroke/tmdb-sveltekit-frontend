import { test, expect } from '@playwright/test';

/**
 * Feature: F-LM — Load More Trending Cards
 * Test Case: TC-LM-003 — Load More button loads additional cards (Movies)
 * Test Case: TC-LM-004 — Load More handles error response (Movies)
 */

test.describe('Load More - Movies (F-LM)', () => {
	// TC-LM-003
	test('loads more cards on movies page', {
		tag: ['@loadmore', '@movies', '@black-box', '@regression']
	}, async ({ page }) => {
		await page.goto('http://localhost:5173/movies?locale=en-US');
		await expect(page).toHaveTitle(/Movies.*TMDB/);

		const cardItems = page.locator('ul.media-card-list > li');
		await expect(cardItems.first()).toBeVisible({ timeout: 10000 });

		const initialCount = await cardItems.count();
		const loadMoreButton = page.getByRole('button', { name: 'More results' });

		// Wait for the next movies request before clicking the button
		await Promise.all([
			page.waitForResponse(
				(resp) =>
					resp.url().includes('/movies') &&
					resp.url().includes('page=') &&
					resp.status() === 200
			),
			loadMoreButton.click()
		]);

		// Wait for card count to increase
		await expect.poll(() => cardItems.count(), { timeout: 10000 }).toBeGreaterThan(initialCount);

		// Verify final count
		const finalCount = await cardItems.count();
		expect(finalCount).toBeGreaterThan(initialCount);
	});

	// TC-LM-004
	test('handles error response', {
		tag: ['@loadmore', '@movies', '@black-box', '@regression']
	}, async ({ page }) => {
		await page.goto('http://localhost:5173/movies?locale=en-US');
		await expect(page).toHaveTitle(/Movies.*TMDB/);

		const cardItems = page.locator('ul.media-card-list > li');
		await expect(cardItems.first()).toBeVisible({ timeout: 10000 });

		const initialCount = await cardItems.count();

		// Mock the movies API to return 500 error
		await page.route('**/movies?page=*', (route) => {
			route.fulfill({
				status: 500,
				body: JSON.stringify({ error: 'Internal Server Error' })
			});
		});

		const loadMoreButton = page.getByRole('button', { name: 'More results' });

		// Click the Load More button
		await loadMoreButton.click();

		// Verify button is enabled again after error
		await expect(loadMoreButton).toBeEnabled({ timeout: 10000 });
		await expect(loadMoreButton).toHaveAttribute('aria-busy', 'false');

		// Verify card count unchanged (no new cards loaded)
		const finalCount = await cardItems.count();
		expect(finalCount).toBe(initialCount);
	});
});