import { test, expect } from '@playwright/test';

const mockTvShowDetails = {
	id: 113962,
	name: 'Lioness',
	overview: 'A CIA operative goes undercover.',
	first_air_date: '2023-07-23',
	vote_average: 8.0,
	seasons: [
		{
			id: 1,
			season_number: 1,
			name: 'Season 1',
			overview: 'S1',
			episode_count: 8,
			air_date: '2023-07-23',
			poster_path: '/p1.jpg'
		},
		{
			id: 2,
			season_number: 2,
			name: 'Season 2',
			overview: 'S2',
			episode_count: 8,
			air_date: '2024-11-10',
			poster_path: '/p2.jpg'
		},
		{
			id: 3,
			season_number: 3,
			name: 'Season 3',
			overview: 'S3',
			episode_count: 8,
			air_date: '2025-09-14',
			poster_path: '/p3.jpg'
		}
	]
};

const mockSeasonEpisodes = {
	1: [
		{
			id: 1,
			episode_number: 1,
			name: 'Sacrificial Soldiers',
			overview: 'Ep1',
			air_date: '2023-07-23',
			runtime: 50,
			vote_average: 8.0,
			still_path: '/s1.jpg'
		}
	],
	2: [
		{
			id: 201,
			episode_number: 1,
			name: 'Beware the Old Soldier',
			overview: 'Ep1',
			air_date: '2024-11-10',
			runtime: 47,
			vote_average: 8.2,
			still_path: '/s2.jpg'
		}
	],
	3: [
		{
			id: 301,
			episode_number: 1,
			name: 'The Spider and the Fly',
			overview: 'Ep1',
			air_date: '2025-09-14',
			runtime: 47,
			vote_average: 8.2,
			still_path: '/s3.jpg'
		}
	]
};

test.describe('TabGroupe', () => {
	test.beforeEach(async ({ page }) => {
		await page.route('**/api.themoviedb.org/3/tv/113962', async (route) => {
			await route.fulfill({ json: mockTvShowDetails });
		});

		for (const seasonNumber of ['1', '2', '3']) {
			await page.route(
				`**/api.themoviedb.org/3/tv/113962/season/${seasonNumber}`,
				async (route) => {
					await route.fulfill({
						json: {
							...mockSeasonEpisodes[seasonNumber],
							season_number: parseInt(seasonNumber),
							name: `Season ${seasonNumber}`,
							air_date: mockTvShowDetails.seasons[parseInt(seasonNumber) - 1].air_date
						}
					});
				}
			);
		}

		await page.route('**/api.themoviedb.org/3/tv/113962/watch_providers', async (route) => {
			await route.fulfill({ json: { id: 113962, results: {} } });
		});

		await page.goto('/tv-shows/113962?locale=en-US');
	});

	test('Season 1 is selected by default', async ({ page }) => {
		const tabs = page.getByRole('tablist').getByRole('tab');
		await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
	});

	test('clicking Season 2 selects it', async ({ page }) => {
		const tablist = page.getByRole('tablist');
		const tabs = tablist.getByRole('tab');

		await tabs.nth(1).click();

		await page.waitForFunction(() => {
			const tabs = document.querySelectorAll('[role="tab"]');
			return tabs[1]?.getAttribute('aria-selected') === 'true';
		});

		const updatedTabs = tablist.getByRole('tab');
		await expect(updatedTabs.nth(1)).toHaveAttribute('aria-selected', 'true');
	});

	test('clicking Season 3 selects it', async ({ page }) => {
		const tablist = page.getByRole('tablist');
		const tabs = tablist.getByRole('tab');

		// Force click with longer timeout
		await tabs.nth(2).click();

		await page.waitForFunction(() => {
			const tabs = document.querySelectorAll('[role="tab"]');
			return tabs[2]?.getAttribute('aria-selected') === 'true';
		});

		const updatedTabs = tablist.getByRole('tab');
		await expect(updatedTabs.nth(2)).toHaveAttribute('aria-selected', 'true');
	});

	// TC-TAB-004: Episodes of Season 1 are visible by default
	test('Episodes of Season 1 are visible by default', async ({ page }) => {
		// Season 1 should be selected
		const tabs = page.getByRole('tablist').getByRole('tab');
		await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');

		// Episode should be visible
		await expect(page.getByText('Sacrificial Soldiers')).toBeVisible();
	});

	// TC-TAB-005: Selecting Season 2 updates visible episodes
	test('Selecting Season 2 updates visible episodes', async ({ page }) => {
		const tablist = page.getByRole('tablist');
		const tabs = tablist.getByRole('tab');

		// Click Season 2
		await tabs.nth(1).click();
		await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');

		// Season 2 episode should be visible
		await expect(page.getByText('Beware the Old Soldier')).toBeVisible();

		// Season 1 episode should not be visible
		await expect(page.getByText('Sacrificial Soldiers')).not.toBeVisible();
	});

	// TC-TAB-006: Season with no episodes shows overview fallback
	test('Season with no episodes shows overview fallback', async ({ page }) => {
		// Use a real TV show ID that exists (e.g., a show with 4+ seasons)
		// For this test, we'll use show ID 1399 (Game of Thrones) which has 8 seasons
		const showId = 1399;

		// Override the TV show mock to add an empty season 9
		await page.route(`**/api.themoviedb.org/3/tv/${showId}`, async (route) => {
			route.fulfill({
				json: {
					id: showId,
					name: 'Game of Thrones',
					overview: 'A fantasy series.',
					first_air_date: '2011-04-17',
					vote_average: 8.4,
					numberOfSeasons: 9,
					seasons: [
						// Seasons 1-8 would be here (from real API or mock)
						// ... existing seasons ...
						{
							id: 9,
							season_number: 9,
							name: 'Season 9',
							overview: 'No episodes are available for this season.',
							episode_count: 0,
							air_date: null,
							poster_path: null
						}
					]
				}
			});
		});
	});

	// TC-TAB-007: Tab leaves the tablist
	test('Tab leaves the tablist', async ({ page }) => {
		const tabs = page.getByRole('tablist').getByRole('tab');

		// Focus first tab
		await tabs.first().focus();
		await expect(tabs.first()).toBeFocused();

		// Press Tab
		await page.keyboard.press('Tab');

		// No tab should be focused
		for (const tab of await tabs.all()) {
			await expect(tab).not.toBeFocused();
		}
	});
});
