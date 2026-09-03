import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';

import { rawResponses, mappedFixtures } from '$tests/fixtures/tmdb/tmdb.fixtures.js';
import { getI18nLabels } from '$tests/mocks/i18n.mocks.js';
import TvShowsPage from '$routes/tv-shows/+page.svelte';

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

describe('TvShowsPage', () => {
	const labels = getI18nLabels();

	const featured = {
		id: mappedFixtures.featuredItem.id,
		mediaType: 'tv',
		title: mappedFixtures.featuredItem.name,
		releaseDate: mappedFixtures.featuredItem.first_air_date,
		overview: mappedFixtures.featuredItem.overview,
		homepage: mappedFixtures.featuredItem.homepage,
		genres: mappedFixtures.featuredItem.genres,
		imageUrl: mappedFixtures.featuredItem.backdrop_path,
		posterUrl: mappedFixtures.featuredItem.poster_path
	};

	const cards = rawResponses.tvList.results.map((show) => ({
		id: show.id,
		mediaType: 'tv',
		title: show.name,
		date: show.first_air_date,
		rating: show.vote_average,
		genres: show.genre_ids,
		imageUrl: show.poster_path
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

	it('rendert Featured-TV-Show mit korrekten Daten', async () => {
		render(TvShowsPage, { props: { data: createData() } });

		await waitFor(() => {
			expect(screen.getByText(featured.title)).toBeInTheDocument();
			expect(screen.getByText(featured.overview)).toBeInTheDocument();
		});
	});

	it('rendert TV-Show-Cards mit korrekten Daten', async () => {
		render(TvShowsPage, { props: { data: createData() } });

		await waitFor(() => {
			cards.forEach((card) => {
				expect(screen.getByText(card.title)).toBeInTheDocument();
			});
		});
	});

	it('rendert die Überschriften aus ui.json', async () => {
		render(TvShowsPage, { props: { data: createData() } });

		await waitFor(() => {
			expect(screen.getByText(labels.tvShows)).toBeInTheDocument();
			expect(screen.getByText(labels.topRatedProductions)).toBeInTheDocument();
		});
	});

	it('zeigt LoadMore bei weiteren verfügbaren Karten', async () => {
		render(TvShowsPage, { props: { data: createData({ hasMore: true }) } });

		await waitFor(() => {
			expect(screen.getByRole('button', { name: labels.loadMore })).toBeInTheDocument();
		});
	});

	it('zeigt LoadMore nicht ohne weitere verfügbare Karten', async () => {
		render(TvShowsPage, { props: { data: createData({ hasMore: false }) } });

		await waitFor(() => {
			expect(screen.queryByRole('button', { name: labels.loadMore })).not.toBeInTheDocument();
		});
	});

	it('zeigt Serverfehler im Dialog an', async () => {
		render(TvShowsPage, {
			props: { data: createData({ featured: null, cards: [], error: labels.contentLoadError }) }
		});

		await waitFor(() => {
			expect(screen.getByText(labels.contentLoadError)).toBeInTheDocument();
		});
	});

	// TODO: Die Interaktion mit LoadMore (Klick, Nachladen, Scrollen) wird später als Playwright-Test abgedeckt.
});
