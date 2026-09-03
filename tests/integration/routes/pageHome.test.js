import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import { rawResponses, mappedFixtures } from '$tests/fixtures/tmdb/tmdb.fixtures.js';
import { i18nMockDefault, getI18nLabels } from '$tests/mocks/i18n.mocks.js';
import PageHome from '$routes/+page.svelte';

describe('PageHome', () => {
	const labels = getI18nLabels();
	let loadMoreMock;

	beforeEach(() => {
		loadMoreMock = vi.fn();
	});

	const createMockData = (overrides = {}) => ({
		featured: {
			id: rawResponses.featuredTodayMovieList.results[0].id,
			mediaType: rawResponses.featuredTodayMovieList.results[0].media_type,
			title: rawResponses.featuredTodayMovieList.results[0].title,
			releaseDate: rawResponses.featuredTodayMovieList.results[0].release_date,
			overview: mappedFixtures.featuredItem.overview,
			homepage: mappedFixtures.featuredItem.homepage,
			genres: mappedFixtures.featuredItem.genres,
			imageUrl: rawResponses.featuredTodayMovieList.results[0].backdrop_path,
			posterUrl: rawResponses.featuredTodayMovieList.results[0].poster_path
		},
		trending: rawResponses.trendingTodayList.results.map((item) => ({
			id: item.id,
			mediaType: item.media_type,
			title: item.title,
			releaseDate: item.release_date,
			imageUrl: item.poster_path,
			posterUrl: item.poster_path
		})),
		hasMore: false,
		loadMore: loadMoreMock,
		loadMoreLoading: false,
		loadMoreError: null,
		contentError: false,
		contentErrorMessage: null,
		...overrides
	});

	it('zeigt Featured-Content', async () => {
		render(PageHome, {
			context: new Map([['i18n', i18nMockDefault.i18n]]),
			props: { data: createMockData() }
		});

		await waitFor(() => {
			expect(
				screen.getByText(rawResponses.featuredTodayMovieList.results[0].title)
			).toBeInTheDocument();
		});
	});

	it('zeigt Trending-Content', async () => {
		render(PageHome, {
			context: new Map([['i18n', i18nMockDefault.i18n]]),
			props: { data: createMockData() }
		});

		await waitFor(() => {
			expect(screen.getByText(rawResponses.trendingTodayList.results[0].title)).toBeInTheDocument();
		});
	});

	it('zeigt UI-Texte', async () => {
		render(PageHome, {
			context: new Map([['i18n', i18nMockDefault.i18n]]),
			props: { data: createMockData() }
		});

		await waitFor(() => {
			expect(screen.getByText(labels.titles.home)).toBeInTheDocument();
			expect(screen.getByText(labels.titles.featuredToday)).toBeInTheDocument();
		});
	});

	it('zeigt LoadMore wenn hasMore=true', async () => {
		render(PageHome, {
			context: new Map([['i18n', i18nMockDefault.i18n]]),
			props: { data: createMockData({ hasMore: true }) }
		});

		await waitFor(() => {
			expect(screen.getByText(labels.loadMore)).toBeInTheDocument();
		});
	});

	it('zeigt keinen LoadMore wenn hasMore=false', async () => {
		render(PageHome, {
			context: new Map([['i18n', i18nMockDefault.i18n]]),
			props: { data: createMockData({ hasMore: false }) }
		});

		await waitFor(() => {
			expect(screen.queryByText(labels.loadMore)).not.toBeInTheDocument();
		});
	});

	it('zeigt Error-Dialog bei contentError', async () => {
		render(PageHome, {
			context: new Map([['i18n', i18nMockDefault.i18n]]),
			props: {
				data: createMockData({
					contentError: true,
					contentErrorMessage: labels.messages.contentLoadError
				})
			}
		});

		await waitFor(() => {
			expect(screen.getByText(labels.messages.contentLoadError)).toBeInTheDocument();
		});
	});
});
