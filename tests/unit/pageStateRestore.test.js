import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/environment', () => ({ browser: true }));

import { getStoredPage, restorePagedList } from '$lib/utils/pageStateRestore';
import {
	fetchPageDataErrorMock,
	incompletePagedMovieDataMock,
	initialPagedMovieDataMock,
	pagedMovieResponsePage2Mock,
	pagedMovieResponsePage3Mock,
	pagedMovieResponseWithoutCardsMock
} from '../mocks/paged-media-data.mocks';

/**
 * Test strategy: statement and branch coverage.
 * The tests cover default values, valid and invalid storage values,
 * storage errors, non-browser case, page loading, incomplete data,
 * empty responses, and propagated fetch errors.
 */
describe('pageStateRestore', () => {
	beforeEach(() => {
		sessionStorage.clear();
		vi.restoreAllMocks();
	});

	describe('getStoredPage', () => {
		// Statement coverage: page 1 is used when no value is stored.
		it('returns 1 when no value exists in session storage', () => {
			expect(getStoredPage('movies-page')).toBe(1);
		});

		// Statement and branch coverage: a stored page value is returned.
		it('returns the stored page value', () => {
			sessionStorage.setItem('movies-page', '3');

			expect(getStoredPage('movies-page')).toBe(3);
		});

		// Branch coverage: invalid values are normalized to at least 1.
		it('falls back to at least 1 for invalid values', () => {
			sessionStorage.setItem('movies-page', '0');
			expect(getStoredPage('movies-page')).toBe(1);

			sessionStorage.setItem('movies-page', '-5');
			expect(getStoredPage('movies-page')).toBe(1);

			sessionStorage.setItem('movies-page', 'abc');
			expect(getStoredPage('movies-page')).toBe(1);
		});

		// Statement coverage: session storage read errors fall back to page 1.
		it('falls back to 1 on session storage read errors', () => {
			vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
				throw new Error('storage blocked');
			});

			expect(getStoredPage('movies-page')).toBe(1);
		});

		// Branch coverage: a local storage read error also falls back to page 1.
		it('falls back to 1 on a local storage read error', () => {
			vi.spyOn(Storage.prototype, 'getItem').mockImplementation(function (key) {
				if (key === 'movies-page') {
					throw new Error('local storage blocked');
				}
				return Reflect.apply(Storage.prototype.getItem, sessionStorage, [key]);
			});

			expect(getStoredPage('movies-page')).toBe(1);
		});

		// Branch coverage: outside the browser, page 1 is returned directly.
		it('returns 1 directly outside the browser', async () => {
			vi.resetModules();
			vi.doMock('$app/environment', () => ({ browser: false }));
			const { getStoredPage: getStoredPageWithoutBrowser } =
				await import('$lib/utils/pageStateRestore');

			expect(getStoredPageWithoutBrowser('movies-page')).toBe(1);
		});
	});

	describe('restorePagedList', () => {
		// Statement coverage: in the browser with a stored page less than or equal to the current page, no further pages are loaded.
		it('returns the current data when the stored page is not greater than the current page', async () => {
			sessionStorage.setItem('movies-page', '1');
			const fetchPageData = vi.fn();

			const result = await restorePagedList({
				storageKey: 'movies-page',
				initialData: initialPagedMovieDataMock,
				fetchPageData
			});

			expect(result).toEqual({
				featured: { id: 99, mediaType: 'movie', title: 'Featured Movie' },
				cards: [{ id: 1, mediaType: 'movie', title: 'Movie 1' }],
				page: 1,
				hasMore: true
			});
			expect(fetchPageData).not.toHaveBeenCalled();
		});

		// Branch coverage: outside the browser, initial data is returned without loading.
		it('returns initial data without loading outside the browser', async () => {
			vi.resetModules();
			vi.doMock('$app/environment', () => ({ browser: false }));
			const { restorePagedList: restorePagedListWithoutBrowser } =
				await import('$lib/utils/pageStateRestore');
			const fetchPageData = vi.fn();

			const result = await restorePagedListWithoutBrowser({
				storageKey: 'movies-page',
				initialData: initialPagedMovieDataMock,
				fetchPageData
			});

			expect(result).toEqual({
				featured: { id: 99, mediaType: 'movie', title: 'Featured Movie' },
				cards: [{ id: 1, mediaType: 'movie', title: 'Movie 1' }],
				page: 1,
				hasMore: true
			});
			expect(fetchPageData).not.toHaveBeenCalled();
		});

		// Statement coverage: initial data is returned when no later page is stored.
		it('returns initial data when no later page is stored', async () => {
			const fetchPageData = vi.fn();

			const result = await restorePagedList({
				storageKey: 'movies-page',
				initialData: initialPagedMovieDataMock,
				fetchPageData
			});

			expect(result).toEqual({
				featured: { id: 99, mediaType: 'movie', title: 'Featured Movie' },
				cards: [{ id: 1, mediaType: 'movie', title: 'Movie 1' }],
				page: 1,
				hasMore: true
			});
			expect(fetchPageData).not.toHaveBeenCalled();
		});

		// Statement coverage: missing pages are loaded via fetchPageData and duplicates are removed.
		it('loads missing pages via fetchPageData and removes duplicates', async () => {
			sessionStorage.setItem('movies-page', '3');
			const fetchPageData = vi
				.fn()
				.mockResolvedValueOnce(pagedMovieResponsePage2Mock)
				.mockResolvedValueOnce(pagedMovieResponsePage3Mock);

			const result = await restorePagedList({
				storageKey: 'movies-page',
				initialData: initialPagedMovieDataMock,
				fetchPageData
			});

			expect(fetchPageData).toHaveBeenCalledTimes(2);
			expect(fetchPageData).toHaveBeenNthCalledWith(1, 2);
			expect(fetchPageData).toHaveBeenNthCalledWith(2, 3);
			expect(result).toEqual({
				featured: { id: 99, mediaType: 'movie', title: 'Featured Movie' },
				cards: [
					{ id: 1, mediaType: 'movie', title: 'Movie 1' },
					{ id: 2, mediaType: 'movie', title: 'Movie 2' },
					{ id: 3, mediaType: 'tv', title: 'TV Show 3' }
				],
				page: 3,
				hasMore: false
			});
		});

		// Branch coverage: incomplete cards are skipped.
		it('ignores incomplete cards in the initial data', async () => {
			const fetchPageData = vi.fn();

			const result = await restorePagedList({
				storageKey: 'movies-page',
				initialData: incompletePagedMovieDataMock,
				fetchPageData
			});

			expect(result).toEqual({
				featured: null,
				cards: [],
				page: 1,
				hasMore: false
			});
			expect(fetchPageData).not.toHaveBeenCalled();
		});

		// Branch coverage: responses without cards are processed as an empty page.
		it('processes loaded responses without cards as an empty page', async () => {
			sessionStorage.setItem('movies-page', '2');
			const fetchPageData = vi.fn().mockResolvedValueOnce(pagedMovieResponseWithoutCardsMock);

			const result = await restorePagedList({
				storageKey: 'movies-page',
				initialData: initialPagedMovieDataMock,
				fetchPageData
			});

			expect(fetchPageData).toHaveBeenCalledTimes(1);
			expect(fetchPageData).toHaveBeenCalledWith(2);
			expect(result).toEqual({
				featured: { id: 99, mediaType: 'movie', title: 'Featured Movie' },
				cards: [{ id: 1, mediaType: 'movie', title: 'Movie 1' }],
				page: 2,
				hasMore: false
			});
		});

		// Branch coverage: propagated fetch errors are not swallowed.
		it('rethrows the fetch error when loading fails', async () => {
			sessionStorage.setItem('movies-page', '2');
			const fetchPageData = vi.fn().mockRejectedValue(fetchPageDataErrorMock);

			await expect(
				restorePagedList({
					storageKey: 'movies-page',
					initialData: initialPagedMovieDataMock,
					fetchPageData
				})
			).rejects.toThrow('fetch page data failed');
		});
	});
});
