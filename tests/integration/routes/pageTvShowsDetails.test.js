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

		// Basic meta
		expect(screen.getByText(mappedFixtures.tvShowDetails.title)).toBeInTheDocument();
		expect(screen.getByText('Mystery')).toBeInTheDocument();
		expect(screen.getByText('PG')).toBeInTheDocument();
		expect(screen.getByText('8.2')).toBeInTheDocument();

		// Overview
		expect(screen.getByText(mappedFixtures.tvShowDetails.overview)).toBeInTheDocument();

		// Homepage link
		const homeLink = screen.getByRole('link', { name: /example\.com/i });
		expect(homeLink).toHaveAttribute('href', mappedFixtures.tvShowDetails.homepage);

		// Trailers
		expect(screen.getByText(i18n.watchTrailer.replace('{index}', '1'))).toBeInTheDocument();
		expect(screen.getByText(i18n.watchTrailer.replace('{index}', '2'))).toBeInTheDocument();

		// Release date – Intl outputs e.g. "1.12.2017", not "01.12.2017"
		await waitFor(() => {
			expect(screen.getByText(/\d{1,2}\.12\.2017/)).toBeInTheDocument();
		});

		// Streaming providers
		await waitFor(async () => {
			expect(await screen.findByText('Netflix')).toBeInTheDocument();
		});

		// Production – more specific via container to avoid duplicates
		await waitFor(() => {
			const productionSection = container.querySelector('[data-testid="production"]') || container;
			expect(productionSection.textContent).toContain('Wiedemann & Berg Television');
		});

		// Runtime
		expect(screen.getByText('60 min')).toBeInTheDocument();

		// Cast (first entry)
		expect(screen.getByText(mappedFixtures.cast[0].name)).toBeInTheDocument();

		// Crew (first entry)
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
});
