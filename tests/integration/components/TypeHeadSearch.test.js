import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import TypeHeadSearch from '$lib/components/TypeHeadSearch.svelte';
import { DEFAULT_LOCALE } from '$lib/i18n/config.js';
import { cleanupAll, resetAll, getTestLocaleText } from '$tests/setup/test-utils.js';

const { labels, messages, fallbacks } = getTestLocaleText(DEFAULT_LOCALE);

vi.mock('$app/paths', () => ({
	resolve: vi.fn((path, params) => {
		if (path === '/movies/[id]' && params?.id) {
			return `/movies/${params.id}`;
		}

		if (path === '/tv-shows/[id]' && params?.id) {
			return `/tv-shows/${params.id}`;
		}

		return path;
	})
}));

vi.mock('$app/state', () => ({
	page: {
		url: new URL('http://localhost:3000/?locale=en-US'),
		params: {}
	}
}));

const mockFetchData = {
	movies: [
		{
			id: 1,
			title: 'Inception',
			date: '2010-07-16',
			rating: 8.8,
			mediaType: 'movie',
			posterUrl: '/poster1.jpg',
			imageUrl: '/image1.jpg'
		},
		{
			id: 2,
			title: 'Interstellar',
			date: '2014-11-07',
			rating: 8.6,
			mediaType: 'movie',
			posterUrl: '/poster2.jpg',
			imageUrl: '/image2.jpg'
		}
	],
	tvShows: [
		{
			id: 3,
			title: 'Breaking Bad',
			date: '2008-01-20',
			rating: 9.5,
			mediaType: 'tv',
			posterUrl: '/poster3.jpg',
			imageUrl: '/image3.jpg'
		}
	]
};

describe('TypeHeadSearch', () => {
	beforeEach(() => {
		Element.prototype.scrollIntoView = vi.fn();

		if (typeof sessionStorage !== 'undefined') {
			sessionStorage.clear();
		}

		resetAll();

		vi.spyOn(global, 'fetch').mockImplementation(() =>
			Promise.resolve({
				ok: true,
				json: () => Promise.resolve(mockFetchData)
			})
		);
	});

	afterEach(() => {
		vi.useRealTimers();
		cleanupAll();
		vi.clearAllMocks();
	});

	it('renders search field correctly', () => {
		render(TypeHeadSearch);

		const input = screen.getByRole('combobox');
		expect(input).toBeInTheDocument();
		expect(input).toHaveAttribute('placeholder', labels.searchInput);
	});

	it('renders search icon', () => {
		render(TypeHeadSearch);

		const icon = document.querySelector('.search.icon');
		expect(icon).toBeInTheDocument();
	});

	it('renders search hint', () => {
		render(TypeHeadSearch);

		const hint = document.querySelector('#typeahead-search-hint');
		expect(hint).toHaveTextContent(messages.searchHint);
	});

	it('shows no results for less than 4 characters', async () => {
		render(TypeHeadSearch);

		const input = screen.getByRole('combobox');
		await fireEvent.input(input, { target: { value: 'abc' } });

		const results = screen.queryByRole('listbox');
		expect(results).not.toBeInTheDocument();
	});

	it('shows loading state', async () => {
		vi.useFakeTimers();

		let resolveFetch;
		const fetchPromise = new Promise((resolve) => {
			resolveFetch = resolve;
		});

		vi.spyOn(global, 'fetch').mockReturnValueOnce(fetchPromise);

		render(TypeHeadSearch);

		const input = screen.getByRole('combobox');
		await fireEvent.input(input, { target: { value: 'test' } });

		await vi.advanceTimersByTimeAsync(300);

		const loading = screen.getByText(messages.searchLoading);
		expect(loading).toBeInTheDocument();

		resolveFetch({
			ok: true,
			json: () => Promise.resolve(mockFetchData)
		});

		await vi.runAllTimersAsync();
	});

	it('shows error state on failed fetch', async () => {
		vi.useFakeTimers();

		vi.spyOn(global, 'fetch').mockResolvedValueOnce({
			ok: false,
			status: 500
		});

		render(TypeHeadSearch);

		const input = screen.getByRole('combobox');
		await fireEvent.input(input, { target: { value: 'test' } });

		await vi.advanceTimersByTimeAsync(300);

		const errorText = await screen.findByText(messages.searchError);
		expect(errorText).toBeInTheDocument();
	});

	it('shows search results on successful fetch', async () => {
		render(TypeHeadSearch);

		const input = screen.getByRole('combobox');
		await fireEvent.input(input, { target: { value: 'Inception' } });

		await vi.waitFor(
			() => {
				const moviesHeading = document.getElementById('typeahead-movies-heading');
				expect(moviesHeading).toBeInTheDocument();
			},
			{ timeout: 1000 }
		);

		const resultsContainer = document.getElementById('typeahead-search-results');
		const headers = resultsContainer.querySelectorAll('.result-header');
		const hasHero = Array.from(headers).some((h) => /inception/i.test(h.textContent));

		expect(hasHero).toBe(true);
	});

	it('renders TV shows section', async () => {
		render(TypeHeadSearch);

		const input = screen.getByRole('combobox');
		await fireEvent.input(input, { target: { value: 'breaking' } });

		await vi.waitFor(
			() => {
				const tvHeading = document.getElementById('typeahead-tv-heading');
				expect(tvHeading).toBeInTheDocument();
			},
			{ timeout: 1000 }
		);

		const tvTitle = screen.getByText('Breaking Bad');
		expect(tvTitle).toBeInTheDocument();
	});

	it('result links have correct href', async () => {
		render(TypeHeadSearch);

		const input = screen.getByRole('combobox');
		await fireEvent.input(input, { target: { value: 'inception' } });

		await vi.waitFor(
			() => {
				const links = screen.queryAllByRole('option');
				expect(links.length).toBeGreaterThan(0);
			},
			{ timeout: 1000 }
		);

		const movieLink = document.getElementById('movie-1');
		expect(movieLink).toHaveAttribute('href', expect.stringContaining('/movies/1'));
		expect(movieLink).toHaveAttribute('href', expect.stringContaining('locale='));
	});

	it('rating is formatted', async () => {
		render(TypeHeadSearch);

		const input = screen.getByRole('combobox');
		await fireEvent.input(input, { target: { value: 'inception' } });

		await vi.waitFor(
			() => {
				const rating = screen.queryByText('8.8');
				expect(rating).toBeInTheDocument();
			},
			{ timeout: 1000 }
		);
	});

	it('year is formatted', async () => {
		render(TypeHeadSearch);

		const input = screen.getByRole('combobox');
		await fireEvent.input(input, { target: { value: 'inception' } });

		await vi.waitFor(
			() => {
				const year = screen.queryByText('2010');
				expect(year).toBeInTheDocument();
			},
			{ timeout: 1000 }
		);
	});

	it('Escape closes results', async () => {
		render(TypeHeadSearch);

		const input = screen.getByRole('combobox');
		await fireEvent.input(input, { target: { value: 'inception' } });

		await screen.findByRole('listbox', {
			name: messages.searchResults
		});

		await fireEvent.keyDown(input, { key: 'Escape' });

		await vi.waitFor(
			() => {
				expect(input).toHaveFocus();
			},
			{ timeout: 1000 }
		);
	});

	it('click outside closes results', async () => {
		render(TypeHeadSearch);

		const input = screen.getByRole('combobox');
		await fireEvent.input(input, { target: { value: 'inception' } });

		await screen.findByRole('listbox', {
			name: messages.searchResults
		});

		await fireEvent.click(document.body);

		await vi.waitFor(
			() => {
				const resultsElement = document.getElementById('typeahead-search-results');
				expect(resultsElement?.classList.contains('results-closed')).toBe(true);
			},
			{ timeout: 2000 }
		);
	});

	it('focus shows results again', async () => {
		render(TypeHeadSearch);

		const input = screen.getByRole('combobox');
		await fireEvent.input(input, { target: { value: 'inception' } });

		await screen.findByRole('listbox', {
			name: messages.searchResults
		});

		await fireEvent.click(document.body);

		await vi.waitFor(
			() => {
				expect(input).toHaveAttribute('aria-expanded', 'false');
			},
			{ timeout: 1000 }
		);

		await fireEvent.focus(input);

		await vi.waitFor(
			() => {
				expect(input).toHaveAttribute('aria-expanded', 'true');
			},
			{ timeout: 1000 }
		);
	});

	it('shows no results state', async () => {
		vi.spyOn(global, 'fetch').mockImplementationOnce(() =>
			Promise.resolve({
				ok: true,
				json: () => Promise.resolve({ movies: [], tvShows: [] })
			})
		);

		render(TypeHeadSearch);

		const input = screen.getByRole('combobox');
		await fireEvent.input(input, { target: { value: 'nothingfound' } });

		await vi.waitFor(
			() => {
				const noResults = screen.getByText(messages.searchNoResults);
				expect(noResults).toBeInTheDocument();
			},
			{ timeout: 1000 }
		);
	});

	it('uses imageUrl as fallback when no posterUrl', async () => {
		const dataWithoutPoster = {
			movies: [
				{
					id: 99,
					title: 'No Poster',
					date: '2020-01-01',
					rating: 7.0,
					mediaType: 'movie',
					imageUrl: '/fallback.jpg'
				}
			],
			tvShows: []
		};

		vi.spyOn(global, 'fetch').mockImplementationOnce(() =>
			Promise.resolve({
				ok: true,
				json: () => Promise.resolve(dataWithoutPoster)
			})
		);

		const { container } = render(TypeHeadSearch);

		const input = screen.getByRole('combobox');
		await fireEvent.input(input, { target: { value: 'noposter' } });

		await vi.waitFor(
			() => {
				const img = container.querySelector('.image img');
				expect(img).toHaveAttribute('src', '/fallback.jpg');
			},
			{ timeout: 1000 }
		);
	});

	it('uses notAvailable as last fallback', async () => {
		const dataNoImages = {
			movies: [{ id: 88, title: 'No Images', date: '2020-01-01', rating: 7.0, mediaType: 'movie' }],
			tvShows: []
		};

		vi.spyOn(global, 'fetch').mockImplementationOnce(() =>
			Promise.resolve({
				ok: true,
				json: () => Promise.resolve(dataNoImages)
			})
		);

		const { container } = render(TypeHeadSearch);

		const input = screen.getByRole('combobox');
		await fireEvent.input(input, { target: { value: 'noimages' } });

		await vi.waitFor(
			() => {
				const img = container.querySelector('.image img');
				expect(img).toHaveAttribute('src', expect.stringContaining('not-available'));
			},
			{ timeout: 1000 }
		);
	});

	it('uses dateFallback for invalid date', async () => {
		const dataInvalidDate = {
			movies: [
				{
					id: 77,
					title: 'Invalid Date',
					date: 'invalid-date',
					rating: 7.0,
					mediaType: 'movie',
					posterUrl: '/poster.jpg'
				}
			],
			tvShows: []
		};

		vi.spyOn(global, 'fetch').mockImplementationOnce(() =>
			Promise.resolve({
				ok: true,
				json: () => Promise.resolve(dataInvalidDate)
			})
		);

		render(TypeHeadSearch);

		const input = screen.getByRole('combobox');
		await fireEvent.input(input, { target: { value: 'invaliddate' } });

		await vi.waitFor(
			() => {
				const date = screen.getByText(fallbacks.dateFallback);
				expect(date).toBeInTheDocument();
			},
			{ timeout: 1000 }
		);
	});

	it('uses notAvailable fallback for null rating', async () => {
		const dataNullRating = {
			movies: [
				{
					id: 66,
					title: 'Null Rating',
					date: '2020-01-01',
					rating: null,
					mediaType: 'movie',
					posterUrl: '/poster.jpg'
				}
			],
			tvShows: []
		};

		vi.spyOn(global, 'fetch').mockImplementationOnce(() =>
			Promise.resolve({
				ok: true,
				json: () => Promise.resolve(dataNullRating)
			})
		);

		render(TypeHeadSearch);

		const input = screen.getByRole('combobox');
		await fireEvent.input(input, { target: { value: 'nullrating' } });

		await vi.waitFor(
			() => {
				const rating = screen.getByText(fallbacks.notAvailable);
				expect(rating).toBeInTheDocument();
			},
			{ timeout: 1000 }
		);
	});


	it('input has correct placeholder text', () => {
		render(TypeHeadSearch);

		const input = screen.getByRole('combobox');
		expect(input).toHaveAttribute('placeholder', labels.searchInput);
	});

	it('removes duplicates in search results', async () => {
		const dataWithDuplicates = {
			movies: [
				{
					id: 1,
					title: 'Inception',
					date: '2010-07-16',
					rating: 8.8,
					mediaType: 'movie',
					posterUrl: '/poster1.jpg'
				},
				{
					id: 1,
					title: 'Inception Duplicate',
					date: '2010-07-16',
					rating: 8.8,
					mediaType: 'movie',
					posterUrl: '/poster1.jpg'
				},
				{
					id: 1,
					title: 'Inception Triple',
					date: '2010-07-16',
					rating: 8.8,
					mediaType: 'movie',
					posterUrl: '/poster1.jpg'
				}
			],
			tvShows: []
		};

		vi.spyOn(global, 'fetch').mockImplementationOnce(() =>
			Promise.resolve({
				ok: true,
				json: () => Promise.resolve(dataWithDuplicates)
			})
		);

		render(TypeHeadSearch);

		const input = screen.getByRole('combobox');
		await fireEvent.input(input, { target: { value: 'duplicate' } });

		await vi.waitFor(
			() => {
				const movieItems = screen.queryAllByRole('option');
				expect(movieItems).toHaveLength(1);
			},
			{ timeout: 1000 }
		);

		const movieTitle = screen.getByText('Inception');
		expect(movieTitle).toBeInTheDocument();
	});
});
