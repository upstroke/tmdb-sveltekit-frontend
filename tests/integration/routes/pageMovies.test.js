import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';

import { rawResponses, mappedFixtures } from '$tests/fixtures/tmdb/tmdb.fixtures.js';
import { getI18nLabels } from '$tests/mocks/i18n.mocks.js';
import MoviesPage from '$routes/movies/+page.svelte';

vi.mock('$lib/utils/pageStateRestore', () => ({
	restorePagedList: vi.fn()
}));

import { restorePagedList } from '$lib/utils/pageStateRestore';

// Mock für $app/state damit page.url.origin definiert ist
vi.mock('$app/state', () => ({
	page: {
		url: new URL('https://example.com/')
	}
}));

describe('MoviesPage', () => {
	const labels = getI18nLabels();

	const featured = {
		id: rawResponses.featuredTodayMovieList.results[0].id,
		mediaType: rawResponses.featuredTodayMovieList.results[0].media_type,
		title: rawResponses.featuredTodayMovieList.results[0].title,
		releaseDate: rawResponses.featuredTodayMovieList.results[0].release_date,
		overview: mappedFixtures.details.overview,
		homepage: mappedFixtures.details.homepage,
		genres: mappedFixtures.details.genres,
		imageUrl: rawResponses.featuredTodayMovieList.results[0].backdrop_path,
		posterUrl: rawResponses.featuredTodayMovieList.results[0].poster_path
	};

	// FIX: rawResponses.movieList statt rawResponses.topRatedMovieList
	const cards = rawResponses.movieList.results.map((movie) => ({
		id: movie.id,
		mediaType: 'movie',
		title: movie.title,
		date: movie.release_date,
		rating: movie.vote_average,
		genres: movie.genre_ids,
		imageUrl: movie.poster_path
	}));

	const createData = (overrides = {}) => ({
		featured,
		cards,
		page: 1,
		hasMore: false,
		error: null,
		...overrides
	});

	beforeEach(() => {
		vi.clearAllMocks();
		restorePagedList.mockImplementation(async ({ initialData }) => initialData);
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('rendert Featured-Film mit korrekten Daten', async () => {
		render(MoviesPage, { props: { data: createData() } });

		await waitFor(() => {
			expect(screen.getByText(featured.title)).toBeInTheDocument();
			expect(screen.getByText(featured.overview)).toBeInTheDocument();
		});
	});

	it('rendert Film-Cards mit korrekten Daten', async () => {
		render(MoviesPage, { props: { data: createData() } });

		await waitFor(() => {
			cards.forEach((card) => {
				expect(screen.getByText(card.title)).toBeInTheDocument();
			});
		});
	});

	it('rendert die Überschriften aus ui.json', async () => {
		render(MoviesPage, { props: { data: createData() } });

		await waitFor(() => {
			expect(screen.getByText(labels.movies)).toBeInTheDocument();
			expect(screen.getByText(labels.topRatedProductions)).toBeInTheDocument();
		});
	});

	it('zeigt LoadMore bei weiteren verfügbaren Karten', async () => {
		render(MoviesPage, { props: { data: createData({ hasMore: true }) } });

		await waitFor(() => {
			expect(screen.getByRole('button', { name: labels.loadMore })).toBeInTheDocument();
		});
	});

	it('zeigt LoadMore nicht ohne weitere verfügbare Karten', async () => {
		render(MoviesPage, { props: { data: createData({ hasMore: false }) } });

		await waitFor(() => {
			expect(screen.queryByRole('button', { name: labels.loadMore })).not.toBeInTheDocument();
		});
	});

	it('zeigt Serverfehler im Dialog an', async () => {
		render(MoviesPage, {
			props: { data: createData({ featured: null, cards: [], error: labels.contentLoadError }) }
		});

		await waitFor(() => {
			expect(screen.getByText(labels.contentLoadError)).toBeInTheDocument();
		});
	});

	// TODO: Die Interaktion mit LoadMore (Klick, Nachladen, Scrollen) wird später als Playwright-Test abgedeckt.
});
