import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/svelte';
import { rawResponses, mappedFixtures } from '$tests/fixtures/tmdb/tmdb.fixtures.js';
import MoviesPage from './+page.svelte';
import { createI18n } from '$lib/i18n/i18n.js';
import ui from '$lib/i18n/ui.json';

describe('MoviesPage', () => {
	const i18n = createI18n('de-DE', ui);

	const mockFeaturedData = {
		id: rawResponses.featuredTodayMovieList.results[0].id,
		mediaType: rawResponses.featuredTodayMovieList.results[0].media_type,
		title: rawResponses.featuredTodayMovieList.results[0].title,
		releaseDate: rawResponses.featuredTodayMovieList.results[0].release_date,
		overview: mappedFixtures.featuredItem.overview,
		homepage: mappedFixtures.featuredItem.homepage,
		genres: mappedFixtures.featuredItem.genres,
		imageUrl: rawResponses.featuredTodayMovieList.results[0].backdrop_path,
		posterUrl: rawResponses.featuredTodayMovieList.results[0].poster_path
	};

	const mockCardsData = rawResponses.topRatedMovieList.results.map((movie) => ({
		id: movie.id,
		mediaType: movie.media_type,
		title: movie.title,
		releaseDate: movie.release_date,
		imageUrl: movie.poster_path,
		posterUrl: movie.poster_path
	}));

	const mockLoadData = {
		featured: mockFeaturedData,
		cards: mockCardsData
	};

	let loadMoreMock;

	beforeEach(() => {
		loadMoreMock = vitest.fn();
	});

	it('zeigt Featured-Film mit korrekten Daten an', async () => {
		render(MoviesPage, {
			context: new Map([['i18n', i18n]]),
			props: { data: mockLoadData }
		});

		await waitFor(() => {
			expect(screen.getByText(mockFeaturedData.title)).toBeInTheDocument();
			expect(screen.getByText(mockFeaturedData.overview)).toBeInTheDocument();
		});
	});

	it('zeigt Film-Cards mit korrekten Daten an', async () => {
		render(MoviesPage, {
			context: new Map([['i18n', i18n]]),
			props: { data: mockLoadData }
		});

		await waitFor(() => {
			mockCardsData.forEach((card) => {
				expect(screen.getByText(card.title)).toBeInTheDocument();
			});
		});
	});

	it('zeigt UI-Texte korrekt an', async () => {
		render(MoviesPage, {
			context: new Map([['i18n', i18n]]),
			props: { data: mockLoadData }
		});

		await waitFor(() => {
			expect(screen.getByText(i18n.t('titles.movies'))).toBeInTheDocument();
			expect(screen.getByText(i18n.t('titles.topRatedProductions'))).toBeInTheDocument();
		});
	});

	it('zeigt LoadMore-Button wenn hasMore=true', async () => {
		const propsWithMore = {
			...mockLoadData,
			hasMore: true,
			loadMore: loadMoreMock,
			loadMoreLoading: false,
			loadMoreError: null
		};

		render(MoviesPage, {
			context: new Map([['i18n', i18n]]),
			props: { data: propsWithMore }
		});

		await waitFor(() => {
			expect(screen.getByText(i18n.t('loadMore'))).toBeInTheDocument();
		});
	});

	it('zeigt keinen LoadMore-Button wenn hasMore=false', async () => {
		const propsWithoutMore = {
			...mockLoadData,
			hasMore: false,
			loadMore: loadMoreMock,
			loadMoreLoading: false,
			loadMoreError: null
		};

		render(MoviesPage, {
			context: new Map([['i18n', i18n]]),
			props: { data: propsWithoutMore }
		});

		await waitFor(() => {
			expect(screen.queryByText(i18n.t('loadMore'))).not.toBeInTheDocument();
		});
	});

	it('zeigt Error-Dialog bei contentError', async () => {
		const propsWithError = {
			...mockLoadData,
			contentError: true,
			contentErrorMessage: i18n.t('messages.contentLoadError')
		};

		render(MoviesPage, {
			context: new Map([['i18n', i18n]]),
			props: { data: propsWithError }
		});

		await waitFor(() => {
			expect(screen.getByText(i18n.t('messages.contentLoadError'))).toBeInTheDocument();
		});
	});
});
