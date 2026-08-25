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
 * Teststrategie: Anweisungsüberdeckung (Statement Coverage).
 * Die Tests decken Standardwerte, gültige und ungültige Storage-Werte,
 * Fehler beim Storage, Seitennachladen, unvollständige Daten,
 * leere Antworten und weitergereichte Fetch-Fehler ab.
 */
describe('pageStateRestore', () => {
	beforeEach(() => {
		sessionStorage.clear();
		vi.restoreAllMocks();
	});

	describe('getStoredPage', () => {
		it('liefert 1, wenn kein Wert im Session Storage vorhanden ist', () => {
			expect(getStoredPage('movies-page')).toBe(1);
		});

		it('liefert den gespeicherten Seitenwert zurück', () => {
			sessionStorage.setItem('movies-page', '3');

			expect(getStoredPage('movies-page')).toBe(3);
		});

		it('fällt bei ungültigen Werten auf mindestens 1 zurück', () => {
			sessionStorage.setItem('movies-page', '0');
			expect(getStoredPage('movies-page')).toBe(1);

			sessionStorage.setItem('movies-page', '-5');
			expect(getStoredPage('movies-page')).toBe(1);

			sessionStorage.setItem('movies-page', 'abc');
			expect(getStoredPage('movies-page')).toBe(1);
		});

		it('fällt bei Session-Storage-Fehlern auf 1 zurück', () => {
			vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
				throw new Error('storage blocked');
			});

			expect(getStoredPage('movies-page')).toBe(1);
		});
	});

	describe('restorePagedList', () => {
		it('gibt die initialen Daten zurück, wenn keine spätere Seite gespeichert ist', async () => {
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

		it('lädt fehlende Seiten über fetchPageData nach und entfernt Duplikate', async () => {
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

		it('ignoriert unvollständige Karten in den initialen Daten', async () => {
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

		it('verarbeitet nachgeladene Antworten ohne cards als leere Seite', async () => {
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

		it('gibt einen Fehler aus fetchPageData an den Aufrufer weiter', async () => {
			sessionStorage.setItem('movies-page', '2');
			const fetchPageData = vi.fn().mockRejectedValueOnce(fetchPageDataErrorMock);

			await expect(
				restorePagedList({
					storageKey: 'movies-page',
					initialData: initialPagedMovieDataMock,
					fetchPageData
				})
			).rejects.toThrow('fetch page data failed');
			expect(fetchPageData).toHaveBeenCalledTimes(1);
			expect(fetchPageData).toHaveBeenCalledWith(2);
		});
	});
});
