import { test, expect } from '@playwright/test';

const mockTvShowDetails = {
  id: 113962,
  name: 'Lioness',
  overview: 'A CIA operative goes undercover.',
  first_air_date: '2023-07-23',
  vote_average: 8.0,
  seasons: [
    { id: 1, season_number: 1, name: 'Season 1', overview: 'S1', episode_count: 8, air_date: '2023-07-23', poster_path: '/p1.jpg' },
    { id: 2, season_number: 2, name: 'Season 2', overview: 'S2', episode_count: 8, air_date: '2024-11-10', poster_path: '/p2.jpg' },
    { id: 3, season_number: 3, name: 'Season 3', overview: 'S3', episode_count: 8, air_date: '2025-09-14', poster_path: '/p3.jpg' }
  ]
};

const mockSeasonEpisodes = {
  '1': [{ id: 1, episode_number: 1, name: 'Sacrificial Soldiers', overview: 'Ep1', air_date: '2023-07-23', runtime: 50, vote_average: 8.0, still_path: '/s1.jpg' }],
  '2': [{ id: 201, episode_number: 1, name: 'Beware the Old Soldier', overview: 'Ep1', air_date: '2024-11-10', runtime: 47, vote_average: 8.2, still_path: '/s2.jpg' }],
  '3': [{ id: 301, episode_number: 1, name: 'The Spider and the Fly', overview: 'Ep1', air_date: '2025-09-14', runtime: 47, vote_average: 8.2, still_path: '/s3.jpg' }]
};

test.describe('TabGroupe', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api.themoviedb.org/3/tv/113962', async (route) => {
      await route.fulfill({ json: mockTvShowDetails });
    });

    for (const seasonNumber of ['1', '2', '3']) {
      await page.route(`**/api.themoviedb.org/3/tv/113962/season/${seasonNumber}`, async (route) => {
        await route.fulfill({
          json: {
            ...mockSeasonEpisodes[seasonNumber],
            season_number: parseInt(seasonNumber),
            name: `Season ${seasonNumber}`,
            air_date: mockTvShowDetails.seasons[parseInt(seasonNumber) - 1].air_date
          }
        });
      });
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

		await page.waitForFunction(
			() => {
				const tabs = document.querySelectorAll('[role="tab"]');
				return tabs[2]?.getAttribute('aria-selected') === 'true';
			}
		);

		const updatedTabs = tablist.getByRole('tab');
		await expect(updatedTabs.nth(2)).toHaveAttribute('aria-selected', 'true');
	});
});
