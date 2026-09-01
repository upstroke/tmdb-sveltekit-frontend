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
 * Teststrategie: Anweisungs- und Zweigüberdeckung (Statement & Branch Coverage).
 * Die Tests decken Standardwerte, gültige und ungültige Storage-Werte,
 * Fehler beim Storage, Nicht-Browser-Fall, Seitennachladen, unvollständige Daten,
 * leere Antworten und weitergereichte Fetch-Fehler ab.
 */
describe('pageStateRestore', () => {
	beforeEach(() => {
		sessionStorage.clear();
		vi.restoreAllMocks();
	});

	describe('getStoredPage', () => {
		// Anweisungsüberdeckung: Ohne gespeicherten Wert wird Seite 1 verwendet.
		it('liefert 1, wenn kein Wert im Session Storage vorhanden ist', () => {
			expect(getStoredPage('movies-page')).toBe(1);
		});

		// Anweisungs- und Zweigüberdeckung: Ein gespeicherter Seitenwert wird zurückgegeben.
		it('liefert den gespeicherten Seitenwert zurück', () => {
			sessionStorage.setItem('movies-page', '3');

			expect(getStoredPage('movies-page')).toBe(3);
		});

		// Zweigüberdeckung: Ungültige Werte werden auf mindestens 1 normalisiert.
		it('fällt bei ungültigen Werten auf mindestens 1 zurück', () => {
			sessionStorage.setItem('movies-page', '0');
			expect(getStoredPage('movies-page')).toBe(1);

			sessionStorage.setItem('movies-page', '-5');
			expect(getStoredPage('movies-page')).toBe(1);

			sessionStorage.setItem('movies-page', 'abc');
			expect(getStoredPage('movies-page')).toBe(1);
		});

		// Anweisungsüberdeckung: Fehler beim Lesen des Session Storage führen zu Seite 1.
		it('fällt bei Session-Storage-Fehlern beim Lesen auf 1 zurück', () => {
			vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
				throw new Error('storage blocked');
			});

			expect(getStoredPage('movies-page')).toBe(1);
		});

		// Zweigüberdeckung: Ein Local-Storage-Fehler beim Lesen führt ebenfalls zu Seite 1.
		it('fällt bei einem Local-Storage-Fehler beim Lesen auf 1 zurück', () => {
			vi.spyOn(Storage.prototype, 'getItem').mockImplementation(function (key) {
				if (key === 'movies-page') {
					throw new Error('local storage blocked');
				}
				return Reflect.apply(Storage.prototype.getItem, sessionStorage, [key]);
			});

			expect(getStoredPage('movies-page')).toBe(1);
		});

		// Zweigüberdeckung: Außerhalb des Browsers wird direkt Seite 1 verwendet.
		it('liefert außerhalb des Browsers direkt 1 zurück', async () => {
			vi.resetModules();
			vi.doMock('$app/environment', () => ({ browser: false }));
			const { getStoredPage: getStoredPageWithoutBrowser } = await import(
				'$lib/utils/pageStateRestore'
			);

			expect(getStoredPageWithoutBrowser('movies-page')).toBe(1);
		});
	});

	describe('restorePagedList', () => {
		// Anweisungsüberdeckung: Im Browser mit gespeicherter Seite kleiner oder gleich der aktuellen Seite werden keine weiteren Seiten geladen.
		it('gibt die aktuellen Daten zurück, wenn die gespeicherte Seite nicht größer als die aktuelle ist', async () => {
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

		// Zweigüberdeckung: Außerhalb des Browsers werden die initialen Daten ohne Nachladen zurückgegeben.
		it('gibt außerhalb des Browsers die initialen Daten ohne Nachladen zurück', async () => {
			vi.resetModules();
			vi.doMock('$app/environment', () => ({ browser: false }));
			const { restorePagedList: restorePagedListWithoutBrowser } = await import(
				'$lib/utils/pageStateRestore'
			);
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

		// Anweisungsüberdeckung: Ohne spätere Seite werden die initialen Daten zurückgegeben.
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

		// Anweisungsüberdeckung: Fehlende Seiten werden nachgeladen und Duplikate entfernt.
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

		// Zweigüberdeckung: Unvollständige Karten werden übersprungen.
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

		// Zweigüberdeckung: Antworten ohne Karten werden als leere Seite verarbeitet.
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

		// Zweigüberdeckung: Weitergereichte Fetch-Fehler werden nicht geschluckt.
		it('wirft den Fetch-Fehler weiter, wenn das Nachladen fehlschlägt', async () => {
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
