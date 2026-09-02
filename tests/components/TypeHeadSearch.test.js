import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import TypeHeadSearch from '$lib/components/TypeHeadSearch.svelte';
import { getLocaleText } from '$lib/i18n/resolver.js';
import { DEFAULT_LOCALE } from '$lib/i18n/config';
import { cleanupAll, resetAll } from '$tests/setup/test-utils.js';

const localeData = getLocaleText(DEFAULT_LOCALE);
const texts = localeData.labels;
const messages = localeData.messages;
const titles = localeData.titles;
const formats = localeData.formats;
const fallbacks = localeData.fallbacks;

vi.mock('$lib/stores/i18n', async () => ({
	i18n: {
		subscribe(run) {
			run(localeData);
			return () => {};
		}
	}
}));

vi.mock('$app/paths', async () => ({
	resolve: vi.fn((path, params) => {
		if (path === '/movies/[id]' && params?.id) {
			return `/movies/${params.id}`;
		}
		if (path === '/tv-shows/[id]' && params?.id) {
			return `/tv-shows/${params.id}`;
		}
		return path;
	})
}));

const mockPageState = {
	url: new URL('http://localhost:3000/?locale=de-DE'),
	params: {}
};

vi.mock('$app/state', async () => ({
	page: {
		get url() {
			return mockPageState.url;
		},
		params: mockPageState.params
	}
}));

const mockFetchData = {
	movies: [
		{ id: 1, title: 'Inception', date: '2010-07-16', rating: 8.8, mediaType: 'movie', posterUrl: '/poster1.jpg', imageUrl: '/image1.jpg' },
		{ id: 2, title: 'Interstellar', date: '2014-11-07', rating: 8.6, mediaType: 'movie', posterUrl: '/poster2.jpg', imageUrl: '/image2.jpg' }
	],
	tvShows: [
		{ id: 3, title: 'Breaking Bad', date: '2008-01-20', rating: 9.5, mediaType: 'tv', posterUrl: '/poster3.jpg', imageUrl: '/image3.jpg' }
	]
};

describe('TypeHeadSearch', () => {
	beforeEach(() => {
		resetAll();
		mockPageState.url = new URL('http://localhost:3000/?locale=de-DE');
		vi.spyOn(global, 'fetch').mockImplementation(() =>
			Promise.resolve({
				ok: true,
				json: () => Promise.resolve(mockFetchData)
			})
		);
	});

	afterEach(() => {
		cleanupAll();
		vi.clearAllMocks();
	});

	// 100% Anweisungsueberdeckung: Component rendert mit Suchfeld
	it('rendert Suchfeld korrekt', () => {
		render(TypeHeadSearch);

		const input = screen.getByRole('searchbox');
		expect(input).toBeInTheDocument();
		expect(input).toHaveAttribute('placeholder', texts.searchInput);
	});

	// 100% Anweisungsueberdeckung: Search Icon wird gerendert
	it('rendert Search Icon', () => {
		const { container } = render(TypeHeadSearch);

		const icon = container.querySelector('.search.icon');
		expect(icon).toBeInTheDocument();
	});

	// 100% Anweisungsueberdeckung: Search Hint wird gerendert
	it('rendert Search Hint', () => {
		const { container } = render(TypeHeadSearch);

		const hint = container.querySelector('#typeahead-search-hint');
		expect(hint).toHaveTextContent(messages.searchHint);
	});

	// 100% Anweisungsueberdeckung: Input mit < 4 Zeichen zeigt keine Ergebnisse
	it('zeigt keine Ergebnisse bei weniger als 4 Zeichen', async () => {
		render(TypeHeadSearch);

		const input = screen.getByRole('searchbox');
		await fireEvent.input(input, { target: { value: 'abc' } });

		const results = screen.queryByRole('list');
		expect(results).not.toBeInTheDocument();
	});

	// 100% Anweisungsueberdeckung: Loading State wird angezeigt
	it('zeigt Loading State', async () => {
		render(TypeHeadSearch);

		const input = screen.getByRole('searchbox');
		await fireEvent.input(input, { target: { value: 'test' } });

		// Warte auf Loading-Message
		await vi.waitFor(() => {
			const loading = screen.queryByRole('status');
			expect(loading).toBeInTheDocument();
		}, { timeout: 500 });
	});

	// 100% Anweisungsueberdeckung: Error State bei failed fetch
	it('zeigt Error State bei fehlgeschlagenem Fetch', async () => {
		vi.spyOn(global, 'fetch').mockImplementationOnce(() =>
			Promise.resolve({
				ok: false,
				status: 500
			})
		);

		render(TypeHeadSearch);

		const input = screen.getByRole('searchbox');
		await fireEvent.input(input, { target: { value: 'test' } });

		await vi.waitFor(() => {
			const error = screen.queryByRole('alert');
			expect(error).toBeInTheDocument();
		}, { timeout: 1000 });
	});

	// 100% Anweisungsueberdeckung: Ergebnisse werden angezeigt
	it('zeigt Suchergebnisse bei erfolgreichem Fetch', async () => {
		render(TypeHeadSearch);

		const input = screen.getByRole('searchbox');
		await fireEvent.input(input, { target: { value: 'inception' } });

		await vi.waitFor(() => {
			const moviesHeading = screen.queryByText(titles.movies);
			expect(moviesHeading).toBeInTheDocument();
		}, { timeout: 1000 });

		const movieTitle = screen.getByText('Inception');
		expect(movieTitle).toBeInTheDocument();
	});

	// 100% Anweisungsueberdeckung: TV Shows Section wird gerendert
	it('rendert TV Shows Section', async () => {
		render(TypeHeadSearch);

		const input = screen.getByRole('searchbox');
		await fireEvent.input(input, { target: { value: 'breaking' } });

		await vi.waitFor(() => {
			const tvHeading = screen.queryByText(titles.tvShows);
			expect(tvHeading).toBeInTheDocument();
		}, { timeout: 1000 });

		const tvTitle = screen.getByText('Breaking Bad');
		expect(tvTitle).toBeInTheDocument();
	});

	// 100% Anweisungsueberdeckung: Result Links haben korrekte href
	it('Result Links haben korrekte href', async () => {
		render(TypeHeadSearch);

		const input = screen.getByRole('searchbox');
		await fireEvent.input(input, { target: { value: 'inception' } });

		await vi.waitFor(() => {
			const links = screen.queryAllByRole('link');
			expect(links.length).toBeGreaterThan(0);
		}, { timeout: 1000 });

		const movieLink = screen.getByText('Inception').closest('a');
		expect(movieLink).toHaveAttribute('href', '/movies/1?locale=de-DE');
	});

	// 100% Anweisungsueberdeckung: Rating wird formatiert
	it('Rating wird formatiert', async () => {
		render(TypeHeadSearch);

		const input = screen.getByRole('searchbox');
		await fireEvent.input(input, { target: { value: 'inception' } });

		await vi.waitFor(() => {
			const rating = screen.queryByText('8.8');
			expect(rating).toBeInTheDocument();
		}, { timeout: 1000 });
	});

	// 100% Anweisungsueberdeckung: Year wird formatiert
	it('Year wird formatiert', async () => {
		render(TypeHeadSearch);

		const input = screen.getByRole('searchbox');
		await fireEvent.input(input, { target: { value: 'inception' } });

		await vi.waitFor(() => {
			const year = screen.queryByText('2010');
			expect(year).toBeInTheDocument();
		}, { timeout: 1000 });
	});

	// 100% Anweisungsueberdeckung: Escape schliesst Ergebnisse
	it('Escape schliesst Ergebnisse', async () => {
		render(TypeHeadSearch);

		const input = screen.getByRole('searchbox');
		await fireEvent.input(input, { target: { value: 'inception' } });

		await vi.waitFor(() => {
			const results = screen.queryByLabelText(messages.searchResults);
			expect(results).toBeInTheDocument();
		}, { timeout: 1000 });

		await fireEvent.keyDown(input, { key: 'Escape' });

		const results = screen.queryByLabelText(messages.searchResults);
		expect(results).not.toBeInTheDocument();
	});

	// 100% Anweisungsueberdeckung: Click outside schliesst Ergebnisse
	it('Click outside schliesst Ergebnisse', async () => {
		const { container } = render(TypeHeadSearch);

		const input = screen.getByRole('searchbox');
		await fireEvent.input(input, { target: { value: 'inception' } });

		await vi.waitFor(() => {
			const results = screen.queryByLabelText(messages.searchResults);
			expect(results).toBeInTheDocument();
		}, { timeout: 1000 });

		// Klick außerhalb der Komponente
		await fireEvent.click(document.body);

		const results = screen.queryByLabelText(messages.searchResults);
		expect(results).not.toBeInTheDocument();
	});

	// 100% Anweisungsueberdeckung: Focus zeigt Ergebnisse wieder
	it('Focus zeigt Ergebnisse wieder', async () => {
		render(TypeHeadSearch);

		const input = screen.getByRole('searchbox');
		await fireEvent.input(input, { target: { value: 'inception' } });

		await vi.waitFor(() => {
			const results = screen.queryByLabelText(messages.searchResults);
			expect(results).toBeInTheDocument();
		}, { timeout: 1000 });

		// Schliessen mit Escape
		await fireEvent.keyDown(input, { key: 'Escape' });

		// Wieder focusieren
		await fireEvent.focus(input);

		const results = screen.queryByLabelText(messages.searchResults);
		expect(results).toBeInTheDocument();
	});

	// 100% Anweisungsueberdeckung: No Results State
	it('zeigt No Results State', async () => {
		vi.spyOn(global, 'fetch').mockImplementationOnce(() =>
			Promise.resolve({
				ok: true,
				json: () => Promise.resolve({ movies: [], tvShows: [] })
			})
		);

		render(TypeHeadSearch);

		const input = screen.getByRole('searchbox');
		await fireEvent.input(input, { target: { value: 'nothingfound' } });

		await vi.waitFor(() => {
			const noResults = screen.queryByText(messages.searchNoResults);
			expect(noResults).toBeInTheDocument();
		}, { timeout: 1000 });
	});

	// 100% Anweisungsueberdeckung: Poster Fallback zu imageUrl
	it('verwendet imageUrl als Fallback wenn kein posterUrl', async () => {
		const dataWithoutPoster = {
			movies: [
				{ id: 99, title: 'No Poster', date: '2020-01-01', rating: 7.0, mediaType: 'movie', imageUrl: '/fallback.jpg' }
			],
			tvShows: []
		};

		vi.spyOn(global, 'fetch').mockImplementationOnce(() =>
			Promise.resolve({
				ok: true,
				json: () => Promise.resolve(dataWithoutPoster)
			})
		);

		render(TypeHeadSearch);

		const input = screen.getByRole('searchbox');
		await fireEvent.input(input, { target: { value: 'noposter' } });

		await vi.waitFor(() => {
			const img = screen.queryByRole('img', { hidden: true });
			expect(img).toHaveAttribute('src', '/fallback.jpg');
		}, { timeout: 1000 });
	});

	// 100% Anweisungsueberdeckung: NotAvailable Fallback
	it('verwendet notAvailable als letzten Fallback', async () => {
		const dataNoImages = {
			movies: [
				{ id: 88, title: 'No Images', date: '2020-01-01', rating: 7.0, mediaType: 'movie' }
			],
			tvShows: []
		};

		vi.spyOn(global, 'fetch').mockImplementationOnce(() =>
			Promise.resolve({
				ok: true,
				json: () => Promise.resolve(dataNoImages)
			})
		);

		const { container } = render(TypeHeadSearch);

		const input = screen.getByRole('searchbox');
		await fireEvent.input(input, { target: { value: 'noimages' } });

		await vi.waitFor(() => {
			const img = container.querySelector('.category img');
			expect(img).toHaveAttribute('src', expect.stringContaining('not-available'));
		}, { timeout: 1000 });
	});

	// 100% Anweisungsueberdeckung: Date Fallback bei invalidem Datum
	it('verwendet dateFallback bei invalidem Datum', async () => {
		const dataInvalidDate = {
			movies: [
				{ id: 77, title: 'Invalid Date', date: 'invalid-date', rating: 7.0, mediaType: 'movie', posterUrl: '/poster.jpg' }
			],
			tvShows: []
		};

		vi.spyOn(global, 'fetch').mockImplementationOnce(() =>
			Promise.resolve({
				ok: true,
				json: () => Promise.resolve(dataInvalidDate)
			})
		);

		render(TypeHeadSearch);

		const input = screen.getByRole('searchbox');
		await fireEvent.input(input, { target: { value: 'invaliddate' } });

		await vi.waitFor(() => {
			const date = screen.queryByText(fallbacks.dateFallback);
			expect(date).toBeInTheDocument();
		}, { timeout: 1000 });
	});

	// 100% Anweisungsueberdeckung: Rating Fallback bei null
	it('verwendet 0.0 als Fallback bei null Rating', async () => {
		const dataNullRating = {
			movies: [
				{ id: 66, title: 'Null Rating', date: '2020-01-01', rating: null, mediaType: 'movie', posterUrl: '/poster.jpg' }
			],
			tvShows: []
		};

		vi.spyOn(global, 'fetch').mockImplementationOnce(() =>
			Promise.resolve({
				ok: true,
				json: () => Promise.resolve(dataNullRating)
			})
		);

		render(TypeHeadSearch);

		const input = screen.getByRole('searchbox');
		await fireEvent.input(input, { target: { value: 'nullrating' } });

		await vi.waitFor(() => {
			const rating = screen.queryByText('0.0');
			expect(rating).toBeInTheDocument();
		}, { timeout: 1000 });
	});
});
