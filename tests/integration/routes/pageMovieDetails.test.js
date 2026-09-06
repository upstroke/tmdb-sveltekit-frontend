import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import { mappedFixtures } from '$tests/fixtures/tmdb/tmdb.fixtures.js';
import { getI18nLabels } from '$tests/mocks/i18n.mocks.js';
import MovieDetailsPage from '$routes/movies/[id]/+page.svelte';

// Mock for $app/state so page.url.origin is defined
vi.mock('$app/state', () => ({
	page: {
		url: new URL('https://example.com/')
	}
}));

describe('MovieDetailsPage (Integration)', () => {
	const i18n = getI18nLabels();

	// Derive movie-specific details from mappedFixtures.details
	const movieDetails = {
		id: mappedFixtures.details.id,
		title: mappedFixtures.details.title,
		mediaType: 'movie',
		rating: mappedFixtures.details.vote_average,
		certification: mappedFixtures.details.certification,
		genres: mappedFixtures.details.genres,
		overview: mappedFixtures.details.overview,
		homepage: mappedFixtures.details.homepage,
		trailerUrls: mappedFixtures.details.videos.results,
		releaseDate: mappedFixtures.details.release_date,
		runtime: mappedFixtures.details.runtime,
		productionCompanies: mappedFixtures.details.production_companies,
		cast: mappedFixtures.cast.slice(0, 5),
		crew: mappedFixtures.crew.slice(0, 5),
		imageUrl: mappedFixtures.details.backdrop_path,
		posterUrl: mappedFixtures.details.poster_path,
		providers: mappedFixtures.details.providers
	};

	const createData = (overrides = {}) => ({
		movie: movieDetails,
		providers: Promise.resolve({ providers: movieDetails.providers }),
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

	// Statement coverage: movie detail page is rendered with all sections
	it('renders movie detail page with all sections', async () => {
		const { container } = render(MovieDetailsPage, { props: { data: createData() } });

		// Title in <title>
		await waitFor(() => {
			expect(document.title).toContain(movieDetails.title);
			expect(document.title).toContain(i18n.detailsSuffix);
		});

		// Basic meta – use i18n labels and fixture data
		expect(screen.getByText(movieDetails.title)).toBeInTheDocument();
		expect(screen.getByText(movieDetails.genres[0].name)).toBeInTheDocument(); // 'Thriller' from fixture
		expect(screen.getByText(movieDetails.certification)).toBeInTheDocument(); // 'PG' from fixture
		expect(screen.getByText(movieDetails.rating.toString())).toBeInTheDocument(); // '8.5' from fixture

		// Overview
		expect(screen.getByText(movieDetails.overview)).toBeInTheDocument();

		// Homepage link – find by href instead of link text
		await waitFor(() => {
			const allLinks = container.querySelectorAll('a[href]');
			const homeLink = Array.from(allLinks).find(
				(link) => link.getAttribute('href') === movieDetails.homepage
			);
			expect(homeLink).toBeInTheDocument();
		});

		// Trailers – use i18n labels
		expect(screen.getByText(i18n.watchTrailer.replace('{index}', '1'))).toBeInTheDocument();
		expect(screen.getByText(i18n.watchTrailer.replace('{index}', '2'))).toBeInTheDocument();

		// Release date – check for year only (locale-independent)
		await waitFor(() => {
			const dateText = container.textContent;
			expect(dateText).toMatch(/1994/);
		});

		// Streaming providers – use provider name from fixture
		await waitFor(async () => {
			expect(await screen.findByText(movieDetails.providers[0].providerName)).toBeInTheDocument();
		});

		// Production – use company name from fixture
		await waitFor(() => {
			const productionSection = container.querySelector('[data-testid="production"]') || container;
			expect(productionSection.textContent).toContain(movieDetails.productionCompanies[0].name);
		});

		// Runtime – use i18n format if available, otherwise fixture value
		const runtimeText = i18n.runtimeMin
			? i18n.runtimeMin.replace('{minutes}', movieDetails.runtime.toString())
			: `${movieDetails.runtime} min`;
		expect(screen.getByText(runtimeText)).toBeInTheDocument();

		// Cast (first entry) – use fixture data
		expect(screen.getByText(mappedFixtures.cast[0].name)).toBeInTheDocument();

		// Crew (first entry) – use fixture data
		expect(screen.getByText(mappedFixtures.crew[0].name)).toBeInTheDocument();
	});

	// Branch coverage: server error is displayed in dialog (error state)
	it('shows server error in dialog', async () => {
		const data = createData({ error: i18n.contentLoadError });
		render(MovieDetailsPage, { props: { data } });

		await waitFor(() => {
			expect(screen.getByText(i18n.contentLoadError)).toBeInTheDocument();
		});
	});
});
