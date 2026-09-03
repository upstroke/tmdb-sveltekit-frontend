import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import { mappedFixtures } from '$tests/fixtures/tmdb/tmdb.fixtures.js';
import { getI18nLabels } from '$tests/mocks/i18n.mocks.js';
import TvShowDetailsPage from '$routes/tv-shows/[id]/+page.svelte';

// Mock für $app/state damit page.url.origin definiert ist
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

	it('rendert TV-Show-Detailseite mit allen Sektionen', async () => {
		const { container } = render(TvShowDetailsPage, { props: { data: createData() } });

		// Titel im <title>
		await waitFor(() => {
			expect(document.title).toContain(mappedFixtures.tvShowDetails.title);
			expect(document.title).toContain(i18n.detailsSuffix);
		});

		// Basis-Meta
		expect(screen.getByText(mappedFixtures.tvShowDetails.title)).toBeInTheDocument();
		expect(screen.getByText('Mystery')).toBeInTheDocument();
		expect(screen.getByText('FSK 16')).toBeInTheDocument();
		expect(screen.getByText('8.2')).toBeInTheDocument();

		// Overview
		expect(screen.getByText(mappedFixtures.tvShowDetails.overview)).toBeInTheDocument();

		// Homepage-Link
		const homeLink = screen.getByRole('link', { name: /example\.com/i });
		expect(homeLink).toHaveAttribute('href', mappedFixtures.tvShowDetails.homepage);

		// Trailer
		expect(screen.getByText(i18n.watchTrailer.replace('{index}', '1'))).toBeInTheDocument();
		expect(screen.getByText(i18n.watchTrailer.replace('{index}', '2'))).toBeInTheDocument();

		// Release date – Intl gibt z. B. "1.12.2017" aus, nicht "01.12.2017"
		await waitFor(() => {
			expect(screen.getByText(/\d{1,2}\.12\.2017/)).toBeInTheDocument();
		});

		// Streaming-Provider
		await waitFor(async () => {
			expect(await screen.findByText('Netflix')).toBeInTheDocument();
		});

		// Production – gezielter über container, um Duplikate zu vermeiden
		await waitFor(() => {
			const productionSection = container.querySelector('[data-testid="production"]') || container;
			expect(productionSection.textContent).toContain('Wiedemann & Berg Television');
		});

		// Runtime
		expect(screen.getByText('60 min')).toBeInTheDocument();

		// Cast (erster Eintrag)
		expect(screen.getByText(mappedFixtures.cast[0].name)).toBeInTheDocument();

		// Crew (erster Eintrag)
		expect(screen.getByText(mappedFixtures.crew[0].name)).toBeInTheDocument();
	});

	it('zeigt Serverfehler im Dialog an', async () => {
		const data = createData({ error: i18n.contentLoadError });
		render(TvShowDetailsPage, { props: { data } });

		await waitFor(() => {
			expect(screen.getByText(i18n.contentLoadError)).toBeInTheDocument();
		});
	});

	it('zeigt Fallback, wenn keine Show da ist (kein Error)', async () => {
		const data = createData({ tvShow: null });
		render(TvShowDetailsPage, { props: { data } });

		await waitFor(() => {
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
			expect(screen.getByText(i18n.notAvailable)).toBeInTheDocument();
		});
	});
});
