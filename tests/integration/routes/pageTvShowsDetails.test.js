import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import { rawResponses, mappedFixtures } from '$tests/fixtures/tmdb/tmdb.fixtures.js';
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
		const data = createData();
		render(TvShowDetailsPage, { props: { data } });

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
		expect(
			screen.getByText(i18n.watchTrailer.replace('{index}', '1'))
		).toBeInTheDocument();
		expect(
			screen.getByText(i18n.watchTrailer.replace('{index}', '2'))
