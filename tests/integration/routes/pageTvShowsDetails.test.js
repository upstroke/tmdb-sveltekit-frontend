import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import { mappedFixtures } from '$tests/fixtures/tmdb/tmdb.fixtures.js';
import { getI18nLabels } from '$tests/mocks/i18n.mocks.js';
import TvShowDetailsPage from '$routes/tv-shows/[id]/+page.svelte';

// Mock for $app/state so page.url.origin is defined
vi.mock('$app/state', () => ({
	page: {
		url: new URL('https://example.com/')
	}
}));

describe('TvShowDetailsPage (Integration)', () => {
	const i18n = getI18nLabels();

	const createData = (overrides = {}) => ({
		tvShow: mappedFixtures.tvShowDetails,
		providers: Promise.resolve(mappedFixtures.tvProviders),
		error: null,
		...overrides
	});

	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	// Statement coverage: TV show detail page is rendered with all sections
	it('renders TV show detail page with all sections', async () => {
		const { container } = render(TvShowDetailsPage, { props: { data: createData() } });

		// Title in <title>
		await waitFor(() => {
			expect(document.title).toContain(mappedFixtures.tvShowDetails.title);
			expect(document.title).toContain(i18n.detailsSuffix);
		});

		// Basic meta – use fixture data instead of hardcoded text
		expect(screen.getByText(mappedFixtures.tvShowDetails.title)).toBeInTheDocument();
		expect(screen.getByText(mappedFixtures.tvShowDetails.genres[0].name)).toBeInTheDocument(); // 'Mystery'
		expect(screen.getByText(mappedFixtures.tvShowDetails.certification)).toBeInTheDocument(); // 'PG'
		expect(screen.getByText(mappedFixtures.tvShowDetails.rating.toString())).toBeInTheDocument(); // '8.2'

		// Overview
		expect(screen.getByText(mappedFixtures.tvShowDetails.overview)).toBeInTheDocument();

		// Homepage link – find by href instead of link text
		await waitFor(() => {
			const allLinks = container.querySelectorAll('a[href]');
			const homeLink = Array.from(allLinks).find(
				(link) => link.getAttribute('href') === mappedFixtures.tvShowDetails.homepage
			);
			expect(homeLink).toBeInTheDocument();
		});

		// Trailers – use i18n labels
		expect(screen.getByText(i18n.watchTrailer.replace('{index}', '1'))).toBeInTheDocument();
		expect(screen.getByText(i18n.watchTrailer.replace('{index}', '2'))).toBeInTheDocument();

		// Release date – check for year only (locale-independent)
		await waitFor(() => {
			const dateText = container.textContent;
			expect(dateText).toMatch(/2017/);
		});

		// Streaming providers – use provider name from fixture
		await waitFor(async () => {
			expect(
				await screen.findByText(mappedFixtures.tvProviders.providers[0].providerName)
			).toBeInTheDocument();
		});

		// Production – use company name from fixture
		await waitFor(() => {
			const productionSection = container.querySelector('[data-testid="production"]') || container;
			expect(productionSection.textContent).toContain(
				mappedFixtures.tvShowDetails.productionCompanies[0].name
			);
		});

		// Runtime – use i18n format if available, otherwise fixture value
		const runtimeText = i18n.runtimeMin
			? i18n.runtimeMin.replace('{minutes}', mappedFixtures.tvShowDetails.runtime.toString())
			: `${mappedFixtures.tvShowDetails.runtime} min`;
		expect(screen.getByText(runtimeText)).toBeInTheDocument();

		// Cast (first entry) – use fixture data
		expect(screen.getByText(mappedFixtures.cast[0].name)).toBeInTheDocument();

		// Crew (first entry) – use fixture data
		expect(screen.getByText(mappedFixtures.crew[0].name)).toBeInTheDocument();
	});

	// Branch coverage: server error is displayed in dialog (error state)
	it('shows server error in dialog', async () => {
		const data = createData({ error: i18n.contentLoadError });
		render(TvShowDetailsPage, { props: { data } });

		await waitFor(() => {
			expect(screen.getByText(i18n.contentLoadError)).toBeInTheDocument();
		});
	});

	// Statement coverage: TV show detail page renders seasons with TabGroupe
	it('renders TV show detail page with seasons and TabGroupe component', async () => {
		const tvShowWithSeasons = {
			...mappedFixtures.tvShowDetails,
			numberOfSeasons: 3,
			numberOfEpisodes: 26,
			seasons: mappedFixtures.tvShowDetailsWithSeasons.seasons
		};

		const data = createData({ tvShow: tvShowWithSeasons });
		render(TvShowDetailsPage, { props: { data } });

		await waitFor(() => {
			// TabGroupe tablist should be present
			expect(screen.getByRole('tablist')).toBeInTheDocument();

			// All season tabs should be rendered
			const seasonTabs = screen.getAllByRole('tab');
			expect(seasonTabs).toHaveLength(3);
			expect(seasonTabs[0]).toHaveTextContent('Season 1');
			expect(seasonTabs[1]).toHaveTextContent('Season 2');
			expect(seasonTabs[2]).toHaveTextContent('Season 3');
		});
	});

	// Statement coverage: First season episodes are displayed by default
	it('displays episodes for the first season by default', async () => {
		const tvShowWithSeasons = {
			...mappedFixtures.tvShowDetails,
			numberOfSeasons: 3,
			numberOfEpisodes: 26,
			seasons: mappedFixtures.tvShowDetailsWithSeasons.seasons
		};

		const data = createData({ tvShow: tvShowWithSeasons });
		render(TvShowDetailsPage, { props: { data } });

		await waitFor(() => {
			// First season should be active
			const seasonTabs = screen.getAllByRole('tab');
			expect(seasonTabs[0]).toHaveAttribute('aria-selected', 'true');

			// Episodes should be visible
			expect(screen.getByText('1. Pilot')).toBeInTheDocument();
			expect(screen.getByText('2. Follow-Up')).toBeInTheDocument();
		});
	});

	// Branch coverage: Season with no episodes shows content fallback
	it('shows content fallback for season with no episodes', async () => {
		const tvShowWithEmptySeason = {
			...mappedFixtures.tvShowDetails,
			numberOfSeasons: 1,
			numberOfEpisodes: 0,
			seasons: [
				{
					id: 1001,
					season_number: 1,
					name: 'Season 1',
					episode_count: 0,
					air_date: '2017-12-01',
					poster_path: '/dark-s1.jpg',
					overview: 'The first season.',
					episodes: []
				}
			]
		};

		const data = createData({ tvShow: tvShowWithEmptySeason });
		const { container } = render(TvShowDetailsPage, { props: { data } });

		await waitFor(() => {
			// Should show season overview when episodes array is empty
			expect(container.textContent).toContain('The first season.');

			// Check that there's no episodes list
			const episodesList = container.querySelector('ol.episodes-list');
			expect(episodesList).not.toBeInTheDocument();
		});
	});
});
