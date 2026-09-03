import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import { cleanupAll, resetAll } from '$tests/setup/test-utils.js';
import { getLocaleText } from '$lib/i18n/resolver';
import { DEFAULT_LOCALE } from '$lib/i18n/config';
import { mappedFixtures } from '$tests/fixtures/tmdb/tmdb.fixtures';
import Page from '$routes/+page.svelte';

const localeData = getLocaleText(DEFAULT_LOCALE);
const titles = localeData.titles;
const messages = localeData.messages;

vi.mock('$lib/stores/i18n', async () => ({
	i18n: {
		subscribe(run) {
			run(localeData);
			return () => {};
		}
	}
}));

vi.mock('$app/environment', async () => ({
	browser: false
}));

vi.mock('$app/state', async () => ({
	page: {
		get url() {
			return new URL('http://localhost:3000/?locale=de-DE');
		},
		params: {}
	}
}));

const mockFeaturedData = {
	id: mappedFixtures.details.id,
	mediaType: 'movie',
	title: mappedFixtures.details.title,
	releaseDate: '1994-09-10',
	overview: mappedFixtures.details.overview,
	homepage: mappedFixtures.details.homepage,
	genres: mappedFixtures.details.genres,
	imageUrl: '/images/pulp-fiction.jpg',
	posterUrl: '/posters/pulp-fiction.jpg'
};

const mockCardsData = [
	{ id: 680, mediaType: 'movie', title: 'Pulp Fiction', date: '1994-09-10', rating: 8.9, imageUrl: '/img1.jpg' },
	{ id: 550, mediaType: 'movie', title: 'Fight Club', date: '1999-10-15', rating: 8.8, imageUrl: '/img2.jpg' },
	{ id: 13, mediaType: 'tv', title: 'Breaking Bad', date: '2008-01-20', rating: 9.5, imageUrl: '/img3.jpg' }
];

describe('Homepage Route Integration', () => {
	beforeEach(() => {
		resetAll();
	});

	afterEach(() => {
		cleanupAll();
		vi.clearAllMocks();
	});

	it('rendert Featured-Section wenn data.featured vorhanden', async () => {
		const data = { featured: mockFeaturedData, cards: [], page: 1, hasMore: false, error: null };
		render(Page, { data });
		await waitFor(() => expect(screen.getByText(titles.featuredToday)).toBeInTheDocument(), { timeout: 1000 });
		expect(screen.getByText(mappedFixtures.details.title)).toBeInTheDocument();
	});

	it('rendert Cards-Liste wenn data.cards vorhanden', async () => {
		const data = { featured: null, cards: mockCardsData, page: 1, hasMore: false, error: null };
		render(Page, { data });
		await waitFor(() => expect(screen.getByText(titles.trendingToday)).toBeInTheDocument(), { timeout: 1000 });
		expect(screen.getByText('Pulp Fiction')).toBeInTheDocument();
	});

	it('zeigt Error-Dialog wenn data.error gesetzt', async () => {
		const data = { featured: null, cards: [], page: 1, hasMore: false, error: messages.contentLoadError };
		render(Page, { data });
		await waitFor(() => expect(screen.getByText(messages.contentLoadError)).toBeInTheDocument(), { timeout: 1000 });
	});

	it('zeigt LoadMore-Button wenn hasMore true', async () => {
		const data = { featured: null, cards: mockCardsData, page: 1, hasMore: true, error: null };
		render(Page, { data });
		await waitFor(() => expect(screen.getByRole('button', { name: /load more/i })).toBeInTheDocument(), { timeout: 1000 });
	});

	it('zeigt No-Content-Message wenn keine Cards vorhanden', async () => {
		const data = { featured: null, cards: [], page: 1, hasMore: false, error: null };
		render(Page, { data });
		await waitFor(() => expect(screen.getByText(messages.noContent)).toBeInTheDocument(), { timeout: 1000 });
	});

	it('rendert Featured und Cards zusammen', async () => {
		const data = { featured: mockFeaturedData, cards: mockCardsData, page: 1, hasMore: false, error: null };
		render(Page, { data });
		await waitFor(() => {
			expect(screen.getByText(titles.featuredToday)).toBeInTheDocument();
			expect(screen.getByText(titles.trendingToday)).toBeInTheDocument();
		}, { timeout: 1000 });
	});
});
