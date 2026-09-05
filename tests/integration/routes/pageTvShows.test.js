import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import { rawResponses, mappedFixtures } from '$tests/fixtures/tmdb/tmdb.fixtures.js';
import { getI18nLabels } from '$tests/mocks/i18n.mocks.js';
import TvShowsPage from '$routes/tv-shows/+page.svelte';

vi.mock('$lib/utils/pageStateRestore', () => ({
	restorePagedList: vi.fn()
}));

import { restorePagedList } from '$lib/utils/pageStateRestore';

// Mock for $app/state so page.url.origin is defined
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

	// Get the second entry since the fixture data would otherwise have the same movie as featuredCard
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

	// Statement coverage: featured TV show is rendered with correct data
	it('renders featured TV show with correct data', async () => {
		const { container } = render(TvShowsPage, { props: { data: createData() } });

		await waitFor(() => {
			// Identify featured section via overview (unique in DOM)
			const featuredSection = container.querySelector('[data-testid="featured"]') || container;
			expect(featuredSection).toBeInTheDocument();
			expect(featuredSection.textContent).toContain(featured.title);
			expect(featuredSection.textContent).toContain(featured.overview);
		});
	});

	// Statement coverage: TV show cards are rendered with correct data
	it('renders TV show cards with correct data', async () => {
		render(TvShowsPage, { props: { data: createData() } });

		await waitFor(() => {
			cards.forEach((card) => {
				expect(screen.getByText(card.title)).toBeInTheDocument();
			});
		});
	});

	// Statement coverage: headings from ui.json are rendered
	it('renders headings from ui.json', async () => {
		render(TvShowsPage, { props: { data: createData() } });

		await waitFor(() => {
			expect(screen.getByText(labels.tvShows)).toBeInTheDocument();
			expect(screen.getByText(labels.topRatedProductions)).toBeInTheDocument();
		});
	});

	// Branch coverage: LoadMore is shown when more cards are available (hasMore=true)
	it('shows LoadMore when more cards are available', async () => {
		render(TvShowsPage, { props: { data: createData({ hasMore: true }) } });

		// findByRole waits asynchronously for the element automatically
		const button = await screen.findByRole('button', { name: labels.loadMore });
		expect(button).toBeInTheDocument();
	});

	// Branch coverage: LoadMore is not shown when no more cards are available (hasMore=false)
	it('does not show LoadMore when no more cards are available', async () => {
		render(TvShowsPage, { props: { data: createData({ hasMore: false }) } });

		await waitFor(() => {
			expect(screen.queryByRole('button', { name: labels.loadMore })).not.toBeInTheDocument();
		});
	});

	// Branch coverage: server error is displayed in dialog (error state)
	it('shows server error in dialog', async () => {
		render(TvShowsPage, {
			props: { data: createData({ featured: null, cards: [], error: labels.contentLoadError }) }
		});

		await waitFor(() => {
			expect(screen.getByText(labels.contentLoadError)).toBeInTheDocument();
		});
	});

	// TODO: Interaction with LoadMore (click, reload, scrolling) will be covered later as a Playwright test.
});
