import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTmdbApi } from '$lib/services/tmdb-api';
import { rawResponses } from '$tests/fixtures/tmdb/tmdb.fixtures';

/**
 * Creates a mock JSON response object for fetch operations.
 *
 * @param {any} data - The data to be returned by the mocked json() method.
 * @returns {{ ok: boolean, json: import('vitest').Mock<() => Promise<any>> }}
 */
function createJsonResponse(data) {
	return {
		ok: true,
		json: vi.fn().mockResolvedValue(data)
	};
}

describe('tmdb api seasons', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	describe('getTVShowDetails', () => {
		// Statement coverage: TV show details include season metadata alongside standard fields.
		it('loads TV show details including numberOfSeasons, numberOfEpisodes, and seasons array', async () => {
			const fetchFn = vi
				.fn()
				.mockResolvedValueOnce(createJsonResponse(rawResponses.tvDetailsWithSeasons))
				.mockResolvedValueOnce(createJsonResponse({ results: [] })) // certification
				.mockResolvedValueOnce(createJsonResponse({ results: {} })); // watch providers
			const api = createTmdbApi(fetchFn, 'test-api-key', 'en-US');

			const result = await api.getTVShowDetails(420);

			expect(result).toMatchObject({
				id: 420,
				mediaType: 'tv',
				title: 'Dark',
				numberOfSeasons: 3,
				numberOfEpisodes: 26
			});
			expect(result.seasons).toHaveLength(3);
			expect(result.seasons[0]).toMatchObject({
				season_number: 1,
				name: 'Season 1',
				episode_count: 10
			});
		});

		// Branch coverage: missing season data falls back to empty array and null counts.
		it('returns null for numberOfSeasons and numberOfEpisodes when season data is absent', async () => {
			const fetchFn = vi
				.fn()
				.mockResolvedValueOnce(
					createJsonResponse({
						...rawResponses.tvDetailsWithSeasons,
						number_of_seasons: undefined,
						number_of_episodes: undefined,
						seasons: undefined
					})
				)
				.mockResolvedValueOnce(createJsonResponse({ results: [] }))
				.mockResolvedValueOnce(createJsonResponse({ results: {} }));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'en-US');

			const result = await api.getTVShowDetails(420);

			expect(result.numberOfSeasons).toBeNull();
			expect(result.numberOfEpisodes).toBeNull();
			expect(result.seasons).toEqual([]);
		});
	});

	describe('getTVSeasonDetails', () => {
		// Statement coverage: season details are loaded via the season endpoint and episodes are normalized.
		it('loads season details including mapped episodes with all fields', async () => {
			const fetchFn = vi.fn().mockResolvedValueOnce(createJsonResponse(rawResponses.seasonDetails));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'en-US');

			const result = await api.getTVSeasonDetails(420, 1);

			expect(result).toMatchObject({
				id: 1001,
				seasonNumber: 1,
				name: 'Season 1',
				overview: 'The first season of Dark.',
				airDate: '2017-12-01'
			});
			expect(result.posterUrl).toBeTruthy();
			expect(fetchFn.mock.calls[0][0]).toContain('/tv/420/season/1');
		});

		// Statement coverage: episodes are correctly mapped to the normalized structure.
		it('maps each episode to the normalized structure including stillUrl', async () => {
			const fetchFn = vi.fn().mockResolvedValueOnce(createJsonResponse(rawResponses.seasonDetails));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'en-US');

			const result = await api.getTVSeasonDetails(420, 1);

			expect(result.episodes).toHaveLength(3);
			expect(result.episodes[0]).toMatchObject({
				id: 5001,
				episodeNumber: 1,
				name: 'Secrets',
				overview: 'Children go missing in Winden.',
				airDate: '2017-12-01',
				runtime: 51,
				rating: 8.5
			});
			expect(result.episodes[0].stillUrl).toBeTruthy();
		});

		// Branch coverage: a null still_path falls back to null for stillUrl.
		it('returns null for stillUrl when still_path is absent', async () => {
			const fetchFn = vi.fn().mockResolvedValueOnce(createJsonResponse(rawResponses.seasonDetails));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'en-US');

			const result = await api.getTVSeasonDetails(420, 1);

			expect(result.episodes[1].stillUrl).toBeNull();
		});

		// Branch coverage: an empty episodes array returns a season object with an empty list.
		it('returns an empty episodes array when the season has no episodes', async () => {
			const fetchFn = vi
				.fn()
				.mockResolvedValueOnce(createJsonResponse(rawResponses.seasonDetailsEmpty));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'en-US');

			const result = await api.getTVSeasonDetails(420, 4);

			expect(result.episodes).toEqual([]);
			expect(fetchFn).toHaveBeenCalledTimes(1);
		});

		// Statement coverage: season number 0 (specials) is handled like any regular season.
		it('loads season 0 (specials) via the correct endpoint', async () => {
			const fetchFn = vi
				.fn()
				.mockResolvedValueOnce(createJsonResponse(rawResponses.seasonDetailsSpecials));
			const api = createTmdbApi(fetchFn, 'test-api-key', 'en-US');

			const result = await api.getTVSeasonDetails(420, 0);

			expect(result.seasonNumber).toBe(0);
			expect(fetchFn.mock.calls[0][0]).toContain('/tv/420/season/0');
		});
	});
});
