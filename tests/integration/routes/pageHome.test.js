import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import { cleanupAll, resetAll } from '$tests/setup/test-utils.js';
import { getLocaleText } from '$lib/i18n/resolver';
import { DEFAULT_LOCALE } from '$lib/i18n/config';
import { rawResponses } from '$tests/fixtures/tmdb/tmdb.fixtures';
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

const featuredMovie = rawResponses.featuredTodayMovieList.results[0];

const mockFeaturedData = {
	id: featuredMovie.id,
	mediaType: featuredMovie.media_type,
	title: featuredMovie.title,
	releaseDate: featuredMovie.release_date,
	overview: 'Test overview',
	homepage: 'https://example.com',
	genres: [{ id: 53, name: 'Thriller' }],
	imageUrl: featuredMovie.backdrop_path,
	posterUrl: featuredMovie.poster_path
};

const movieCard = rawResponses.movieList.results[0];
const tvCard = rawResponses.tvList.results[0];

const mockCardsData = [
	{
		id: movieCard.id,
		mediaType: 'movie',
		title: movieCard.title,
		date: movieCard.release_date,
		rating: movieCard.vote_average,
		imageUrl: movieCard.poster_path
	},
	{
		id: tvCard.id,
		mediaType: 'tv',
		title: tvCard.name,
		date: tvCard.first_air_date,
		rating: tvCard.vote_average,
		imageUrl: tvCard.poster_path
	}
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
		expect(screen.getByText(featuredMovie.title)).toBeInTheDocument();
	});

	it('rendert Cards-Liste wenn data.cards vorhanden', async () => {
		const data = { featured: null, cards: mockCardsData, page: 1, hasMore: false, error: null };
		render(Page, { data });
		await waitFor(() => expect(screen.getByText(titles.trendingToday)).toBeInTheDocument(), { timeout: 1000 });
		expect(screen.getByText(movieCard.title)).toBeInTheDocument();
		expect(screen.getByText(tvCard.name)).toBeInTheDocument();
	});

	it('zeigt Error-Dialog wenn data.error gesetzt', async () => {
		const data = { featured: null, cards: [], page: 1, hasMore: false, error: messages.contentLoadError };
		render(Page, { data });
		await waitFor(() => expect(screen.getByText(messages.contentLoadError)).toBeInTheDocument(), { timeout: 1000 });
	});

	it('zeigt LoadMore-Button wenn hasMore true', async () => {
		const data = { featured: null, cards: mockCardsData, page: 1, hasMore: true, error: null };
		render(Page, { data });
		await waitFor(() => {
			const loadMore = document.querySelector('.load-more button');
			expect(loadMore).toBeInTheDocument();
		}, { timeout: 1000 });
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
