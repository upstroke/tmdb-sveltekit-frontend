import { test, expect } from '@playwright/test';

test.describe('Typeahead Search', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	function getSearchInput(page) {
		return page.getByRole('combobox', { name: /search/i });
	}

	function getResults(page) {
		return page.locator('#typeahead-search-results');
	}

	async function fulfillSearch(route, data) {
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(data)
		});
	}

	async function mockSearch(page, handler) {
		let requestCount = 0;

		await page.route(
			(url) => url.pathname === '/search',
			async (route) => {
				requestCount += 1;
				await handler(route);
			}
		);

		return async () => {
			await expect.poll(() => requestCount).toBeGreaterThan(0);
		};
	}

	const movieResult = {
		id: 1,
		media_type: 'movie',
		title: 'Hero Movie',
		poster_path: '/poster1.jpg',
		release_date: '2020-01-01'
	};

	const tvShowResult = {
		id: 2,
		media_type: 'tv',
		name: 'Breaking TV Show',
		poster_path: '/poster2.jpg',
		first_air_date: '2019-01-01'
	};

	const movieResult1 = {
		id: 1,
		media_type: 'movie',
		title: 'Multi Movie 1',
		poster_path: '/poster1.jpg',
		release_date: '2020-01-01'
	};

	const movieResult2 = {
		id: 2,
		media_type: 'movie',
		title: 'Multi Movie 2',
		poster_path: '/poster2.jpg',
		release_date: '2021-01-01'
	};

	test('TC-TS-001: should display movie results when searching for a movie', async ({ page }) => {
		const waitForSearchRequest = await mockSearch(page, (route) =>
			fulfillSearch(route, {
				movies: [movieResult],
				tvShows: []
			})
		);

		const searchInput = getSearchInput(page);
		await searchInput.fill('Hero');

		await waitForSearchRequest();

		await expect(getResults(page)).toBeVisible();

		const resultItems = getResults(page).getByRole('option');
		await expect(resultItems.first()).toBeVisible();

		const firstResultText = await resultItems.first().textContent();
		expect(firstResultText).toContain('Hero Movie');
		expect(firstResultText).toContain('2020');
	});

	test('TC-TS-002: should display tv show results when searching for a tv show', async ({
		page
	}) => {
		const waitForSearchRequest = await mockSearch(page, (route) =>
			fulfillSearch(route, {
				movies: [],
				tvShows: [tvShowResult]
			})
		);

		const searchInput = getSearchInput(page);
		await searchInput.fill('Breaking');

		await waitForSearchRequest();

		await expect(getResults(page)).toBeVisible();

		const resultItems = getResults(page).getByRole('option');
		await expect(resultItems.first()).toBeVisible();

		const firstResultText = await resultItems.first().textContent();
		expect(firstResultText).toContain('Breaking TV Show');
		expect(firstResultText).toContain('2019');
	});

	test('TC-TS-003: should display no results message when no results are found', async ({
		page
	}) => {
		const waitForSearchRequest = await mockSearch(page, (route) =>
			fulfillSearch(route, {
				movies: [],
				tvShows: []
			})
		);

		const searchInput = getSearchInput(page);
		await searchInput.fill('NonExistentQuery123');

		await waitForSearchRequest();

		await expect(getResults(page)).not.toBeVisible();
		await expect(page.getByRole('status')).toContainText('No results found.');
	});

	test('TC-TS-004: should display loading state while searching', async ({ page }) => {
		let releaseRequest;
		let requestIntercepted = false;

		const requestHeld = new Promise((resolve) => {
			releaseRequest = resolve;
		});

		await page.route(
			(url) => url.pathname === '/search',
			async (route) => {
				requestIntercepted = true;

				await requestHeld;

				await fulfillSearch(route, {
					movies: [movieResult],
					tvShows: []
				});
			}
		);

		const searchInput = getSearchInput(page);
		await searchInput.fill('Hero');

		await expect.poll(() => requestIntercepted).toBe(true);

		await expect(page.getByRole('status')).toContainText('Searching …');

		releaseRequest();

		await expect(getResults(page)).toBeVisible();
	});

	test('TC-TS-005: should display error message when search fails', async ({ page }) => {
		await page.route(
			(url) => url.pathname === '/search',
			async (route) => {
				await route.fulfill({
					status: 503,
					contentType: 'application/json',
					body: JSON.stringify({
						message: 'Search service unavailable'
					})
				});
			}
		);

		const searchInput = getSearchInput(page);
		await searchInput.fill('ErrorQuery');

		await expect(page.getByRole('alert')).toBeVisible();
		await expect(page.getByRole('alert')).toContainText(/.+/);
	});

	test('TC-TS-006: should display multiple results when multiple items are returned', async ({
		page
	}) => {
		const waitForSearchRequest = await mockSearch(page, (route) =>
			fulfillSearch(route, {
				movies: [movieResult1, movieResult2],
				tvShows: []
			})
		);

		const searchInput = getSearchInput(page);
		await searchInput.fill('Multi');

		await waitForSearchRequest();

		await expect(getResults(page)).toBeVisible();

		const resultItems = getResults(page).getByRole('option');
		await expect(resultItems).toHaveCount(2);

		const firstResultText = await resultItems.first().textContent();
		expect(firstResultText).toContain('Multi Movie 1');

		const secondResultText = await resultItems.last().textContent();
		expect(secondResultText).toContain('Multi Movie 2');
	});
});
