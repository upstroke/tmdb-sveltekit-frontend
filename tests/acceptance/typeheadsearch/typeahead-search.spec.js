import { test, expect } from '@playwright/test';

/**
 * Feature: F-TS — Typeahead Search
 * Test cases:
 * - TC-TS-001: Search, select a result, and verify the details title
 * - TC-TS-002: Search for a TV show and open its details page
 * - TC-TS-003: No-results feedback is displayed for an unknown term
 * - TC-TS-004: Results are displayed only after four characters
 * - TC-TS-005: Tab moves focus from the first to the second search result
 * - TC-TS-006: Escape closes the search results
 * - TC-TS-007: Loading state is shown during search
 * - TC-TS-008: Error state is shown when search fails
 */

const SEARCH_INPUT_NAME = 'Search movies & TV';

const movieResult = {
	id: 755812,
	title: 'Miraculous World: New York, United HeroeZ',
	date: '2020-09-25',
	rating: 8.1,
	posterUrl: '/poster.jpg'
};

const tvResult = {
	id: 217328,
	title: '50/50 Heroes',
	date: '2022-10-24',
	rating: 7.5,
	posterUrl: '/poster.jpg'
};

function getSearchInput(page) {
	return page.getByRole('combobox', {
		name: SEARCH_INPUT_NAME
	});
}

function getResults(page) {
	return page.getByRole('listbox', {
		name: 'Search results'
	});
}

async function mockSearch(page, handler) {
	await page.route('**/search?*', handler);
}

async function fulfillSearch(route, { movies = [], tvShows = [] } = {}) {
	await route.fulfill({
		status: 200,
		contentType: 'application/json',
		body: JSON.stringify({ movies, tvShows })
	});
}

test.describe('Typeahead Search', () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.goto('/?locale=en-US', {
			waitUntil: 'domcontentloaded'
		});
		await expect(page).toHaveTitle(/Home.*TMDB/);
	});

	// TC-TS-001
	test('[TC-TS-001] Search result link opens its details page with the matching title', async ({
		page
	}) => {
		await mockSearch(page, (route) =>
			fulfillSearch(route, {
				movies: [movieResult],
				tvShows: []
			})
		);

		const searchInput = getSearchInput(page);
		await searchInput.fill('Hero');

		const results = getResults(page);
		const movie = results.getByRole('option', {
			name: /miraculous world: new york/i
		});

		await expect(movie).toBeVisible();

		const expectedHref = await movie.getAttribute('href');
		expect(expectedHref).toBeTruthy();

		const expectedUrl = new URL(expectedHref, page.url()).toString();

		await Promise.all([page.waitForURL(expectedUrl, { waitUntil: 'commit' }), movie.click()]);

		await expect(page.locator('#details-hero-title')).toHaveText(movieResult.title);
	});

	// TC-TS-002
	test('[TC-TS-002] TV show search result opens a TV show details page', async ({ page }) => {
		await mockSearch(page, (route) =>
			fulfillSearch(route, {
				movies: [],
				tvShows: [tvResult]
			})
		);

		const searchInput = getSearchInput(page);
		await searchInput.fill('Breaking Bad');

		const results = getResults(page);
		const tvShow = results.getByRole('option', {
			name: /50\/50 heroes/i
		});

		await expect(tvShow).toBeVisible();

		const expectedHref = await tvShow.getAttribute('href');
		expect(expectedHref).toBeTruthy();

		const expectedUrl = new URL(expectedHref, page.url()).toString();

		await Promise.all([page.waitForURL(expectedUrl, { waitUntil: 'commit' }), tvShow.click()]);

		await expect(page).toHaveURL(expectedUrl);
		await expect(page.locator('#details-hero-title')).toHaveText(tvResult.title);
	});

	// TC-TS-003
	test('[TC-TS-003] No-results feedback is displayed for an unknown search term', async ({
		page
	}) => {
		await mockSearch(page, (route) =>
			fulfillSearch(route, {
				movies: [],
				tvShows: []
			})
		);

		const searchInput = getSearchInput(page);
		await searchInput.fill('XYZNOTFOUND123');

		const statusLayer = page.locator('#status-messages-layer');

		await expect(statusLayer).toContainText('No results found.');
		await expect(getResults(page)).toHaveCount(0);
		await expect(searchInput).toHaveAttribute('aria-expanded', 'false');
	});

	// TC-TS-004
	test('[TC-TS-004] Search results are displayed only after four characters', async ({ page }) => {
		await mockSearch(page, (route) =>
			fulfillSearch(route, {
				movies: [movieResult],
				tvShows: []
			})
		);

		const searchInput = getSearchInput(page);
		const results = getResults(page);

		await searchInput.fill('Her');

		await expect(results).toHaveCount(0);
		await expect(searchInput).toHaveAttribute('aria-expanded', 'false');

		await searchInput.fill('Hero');

		await expect(results).toBeVisible();
		await expect(searchInput).toHaveAttribute('aria-expanded', 'true');
	});

	// TC-TS-005
	test('[TC-TS-005] Arrow keys update the active search result while focus remains in the combobox', async ({
		page
	}) => {
		await mockSearch(page, (route) =>
			fulfillSearch(route, {
				movies: [movieResult, { ...movieResult, id: 56321, title: 'Toto the Hero' }],
				tvShows: []
			})
		);

		const searchInput = getSearchInput(page);
		await searchInput.fill('Hero');

		const results = getResults(page);
		const options = results.getByRole('option');

		await expect(options).toHaveCount(2);

		const firstOption = options.first();
		const secondOption = options.nth(1);

		await expect(searchInput).toBeFocused();
		await expect(firstOption).toHaveAttribute('aria-selected', 'true');

		await searchInput.press('ArrowDown');

		await expect(searchInput).toBeFocused();
		await expect(secondOption).toHaveAttribute('aria-selected', 'true');
		await expect(firstOption).toHaveAttribute('aria-selected', 'false');

		await expect(searchInput).toHaveAttribute(
			'aria-activedescendant',
			await secondOption.getAttribute('id')
		);
	});

	// TC-TS-006
	test('[TC-TS-006] Escape closes the search results', async ({ page }) => {
		await mockSearch(page, (route) =>
			fulfillSearch(route, {
				movies: [movieResult],
				tvShows: []
			})
		);

		const searchInput = getSearchInput(page);
		await searchInput.fill('Hero');

		const results = getResults(page);

		await expect(results).toBeVisible();

		await searchInput.press('Escape');

		await expect(results).toBeHidden();
		await expect(searchInput).toHaveAttribute('aria-expanded', 'false');
		await expect(searchInput).toBeFocused();
	});

	// TC-TS-007
	test('[TC-TS-007] Searching message is displayed while a search is pending', async ({ page }) => {
		let releaseRequest;

		const requestHeld = new Promise((resolve) => {
			releaseRequest = resolve;
		});

		await page.route('**/search?*', async (route) => {
			await requestHeld;

			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					movies: [movieResult],
					tvShows: []
				})
			});
		});

		const searchInput = getSearchInput(page);
		await searchInput.fill('Hero');

		const statusLayer = page.locator('#status-messages-layer');

		await expect(statusLayer).toContainText('Searching …');
		await expect(searchInput).toHaveAttribute('aria-expanded', 'false');
		await expect(getResults(page)).toHaveCount(0);

		releaseRequest();

		await expect(getResults(page)).toBeVisible();
		await expect(searchInput).toHaveAttribute('aria-expanded', 'true');
	});

	// TC-TS-008
	test('[TC-TS-008] Failed-to-fetch message is displayed when the search request fails', async ({
		page
	}) => {
		await page.route('**/search?*', (route) => route.abort('failed'));

		const searchInput = getSearchInput(page);
		await searchInput.fill('Hero');

		const statusLayer = page.locator('#status-messages-layer');

		await expect(statusLayer.locator('.result-error')).toBeVisible();
		await expect(statusLayer.locator('.result-error')).toHaveText(/.+/);

		await expect(searchInput).toHaveAttribute('aria-expanded', 'false');
		await expect(getResults(page)).toHaveCount(0);
	});
});
