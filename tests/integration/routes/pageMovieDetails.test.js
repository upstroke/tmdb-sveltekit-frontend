import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import { mappedFixtures } from '$tests/fixtures/tmdb/tmdb.fixtures.js';
import { getI18nLabels } from '$tests/mocks/i18n.mocks.js';
import MovieDetailsPage from '$routes/movies/[id]/+page.svelte';

// Mock für $app/state damit page.url.origin definiert ist
vi.mock('$app/state', () => ({
	page: {
		url: new URL('https://example.com/')
	}
}));

describe('MovieDetailsPage (Integration)', () => {
	const i18n = getI18nLabels();

	// Movie-spezifische Details aus mappedFixtures.details ableiten
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
		providers: Promise.resolve({ providers: movieDetails.providers }), // werden von der API nachgeladen
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

	it('rendert Movie-Detailseite mit allen Sektionen', async () => {
		const { container } = render(MovieDetailsPage, { props: { data: createData() } });

		// Titel im <title>
		await waitFor(() => {
			expect(document.title).toContain(movieDetails.title);
			expect(document.title).toContain(i18n.detailsSuffix);
		});

		// Basis-Meta
		expect(screen.getByText(movieDetails.title)).toBeInTheDocument();
		expect(screen.getByText('Thriller')).toBeInTheDocument();
		expect(screen.getByText('FSK 16')).toBeInTheDocument();
		expect(screen.getByText('8.5')).toBeInTheDocument();

		// Overview
		expect(screen.getByText(movieDetails.overview)).toBeInTheDocument();

		// Homepage-Link
		const homeLink = screen.getByRole('link', { name: /example\.com/i });
		expect(homeLink).toHaveAttribute('href', movieDetails.homepage);

		// Trailer
		expect(screen.getByText(i18n.watchTrailer.replace('{index}', '1'))).toBeInTheDocument();
		expect(screen.getByText(i18n.watchTrailer.replace('{index}', '2'))).toBeInTheDocument();

		// Release date – Intl gibt z. B. "10.9.1994" aus
		await waitFor(() => {
			expect(screen.getByText(/\d{1,2}\.9\.1994/)).toBeInTheDocument();
		});

		// Streaming-Provider
		await waitFor(async () => {
			expect(await screen.findByText('Netflix')).toBeInTheDocument();
		});

		// Production – gezielter über container, um Duplikate zu vermeiden
		await waitFor(() => {
			const productionSection = container.querySelector('[data-testid="production"]') || container;
			expect(productionSection.textContent).toContain('Miramax');
		});

		// Runtime
		expect(screen.getByText('154 min')).toBeInTheDocument();

		// Cast (erster Eintrag)
		expect(screen.getByText(mappedFixtures.cast[0].name)).toBeInTheDocument();

		// Crew (erster Eintrag)
		expect(screen.getByText(mappedFixtures.crew[0].name)).toBeInTheDocument();
	});

	it('zeigt Serverfehler im Dialog an', async () => {
		const data = createData({ error: i18n.contentLoadError });
		render(MovieDetailsPage, { props: { data } });

		await waitFor(() => {
			expect(screen.getByText(i18n.contentLoadError)).toBeInTheDocument();
		});
	});
});
