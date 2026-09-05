import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import TypeHeadSearch from '$lib/components/TypeHeadSearch.svelte';
import { getLocaleText } from '$lib/i18n/resolver.js';
import { DEFAULT_LOCALE } from '$lib/i18n/config.js';
import { cleanupAll, resetAll } from '$tests/setup/test-utils.js';

const localeData = getLocaleText(DEFAULT_LOCALE);
const texts = localeData.labels;
const messages = localeData.messages;
const titles = localeData.titles;
const fallbacks = localeData.fallbacks;

vi.mock('$lib/stores/i18n', async () => ({
	i18n: {
		subscribe(run) {
			run(localeData);
			return () => {};
		}
	}
}));

vi.mock('$app/paths', async () => ({
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

vi.mock('$app/state', async () => {
	const mockUrl = new URL('http://localhost:3000/?locale=en-US');
	return {
		page: {
			get url() {
				return mockUrl;
			},
			params: {}
		}
	};
});

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
		resetAll();
		vi.spyOn(global, 'fetch').mockImplementation(() =>
			Promise.resolve({
				ok: true,
				json: () => Promise.resolve(mockFetchData)
			})
		);
	});

	afterEach(() => {
		cleanupAll();
		vi.clearAllMocks();
		vi.useRealTimers();
	});

	// Statement coverage: component renders with search field
	it('renders search field correctly', () => {
		render(TypeHeadSearch);

		const input = screen.getByRole('searchbox');
		expect(input).toBeInTheDocument();
		expect(input).toHaveAttribute('placeholder', texts.searchInput);
	});

	// Statement coverage: search icon is rendered
	it('renders search icon', () => {
		render(TypeHeadSearch);

		const icon = document.querySelector('.search.icon');
		expect(icon).toBeInTheDocument();
	});

	// Statement coverage: search hint is rendered
	it('renders search hint', () => {
		render(TypeHeadSearch);

		const hint = document.querySelector('#typeahead-search-hint');
		expect(hint).toHaveTextContent(messages.searchHint);
	});

	// Statement coverage: input with < 4 characters shows no results
	it('shows no results for less than 4 characters', async () => {
		render(TypeHeadSearch);

		const input = screen.getByRole('searchbox');
		await fireEvent.input(input, { target: { value: 'abc' } });

		const results = screen.queryByRole('list');
		expect(results).not.toBeInTheDocument();
	});

	// Statement coverage: loading state is displayed
	it('shows loading state', async () => {
		render(TypeHeadSearch);

		const input = screen.getByRole('searchbox');
		await fireEvent.input(input, { target: { value: 'test' } });

		// Wait for loading message
		await vi.waitFor(
			() => {
				const loading = screen.getByRole('status');
				expect(loading).toBeInTheDocument();
			},
			{ timeout: 500 }
		);
	});

	// Statement coverage: error state on failed fetch
	it('shows error state on failed fetch', async () => {
		vi.useFakeTimers();

		vi.spyOn(global, 'fetch').mockResolvedValueOnce({
			ok: false,
			status: 500
		});

		render(TypeHeadSearch);

		const input = screen.getByRole('searchbox');
		await fireEvent.input(input, { target: { value: 'test' } });

		await vi.advanceTimersByTimeAsync(300);

		expect(await screen.findByRole('alert')).toHaveTextContent(messages.searchError);
	});

	// Statement coverage: results are displayed
	it('shows search results on successful fetch', async () => {
		render(TypeHeadSearch);

		const input = screen.getByRole('searchbox');
		await fireEvent.input(input, { target: { value: 'inception' } });

		await vi.waitFor(
			() => {
				const moviesHeading = screen.queryByText(titles.movies);
				expect(moviesHeading).toBeInTheDocument();
			},
			{ timeout: 1000 }
		);

		const movieTitle = screen.getByText('Inception');
		expect(movieTitle).toBeInTheDocument();
	});

	// Statement coverage: TV shows section is rendered
	it('renders TV shows section', async () => {
		render(TypeHeadSearch);

		const input = screen.getByRole('searchbox');
		await fireEvent.input(input, { target: { value: 'breaking' } });

		await vi.waitFor(
			() => {
				const tvHeading = screen.queryByText(titles.tvShows);
				expect(tvHeading).toBeInTheDocument();
			},
			{ timeout: 1000 }
		);

		const tvTitle = screen.getByText('Breaking Bad');
		expect(tvTitle).toBeInTheDocument();
	});

	// Statement coverage: result links have correct href
	it('result links have correct href', async () => {
		render(TypeHeadSearch);

		const input = screen.getByRole('searchbox');
		await fireEvent.input(input, { target: { value: 'inception' } });

		await vi.waitFor(
			() => {
				const links = screen.queryAllByRole('link');
				expect(links.length).toBeGreaterThan(0);
			},
			{ timeout: 1000 }
		);

		const movieLink = screen.getByText('Inception').closest('a');
		expect(movieLink).toHaveAttribute('href', '/movies/1?locale=en-US');
	});

	// Statement coverage: rating is formatted
	it('rating is formatted', async () => {
		render(TypeHeadSearch);

		const input = screen.getByRole('searchbox');
		await fireEvent.input(input, { target: { value: 'inception' } });

		await vi.waitFor(
			() => {
				const rating = screen.queryByText('8.8');
				expect(rating).toBeInTheDocument();
			},
			{ timeout: 1000 }
		);
	});

	// Statement coverage: year is formatted
	it('year is formatted', async () => {
		render(TypeHeadSearch);

		const input = screen.getByRole('searchbox');
		await fireEvent.input(input, { target: { value: 'inception' } });

		await vi.waitFor(
			() => {
				const year = screen.queryByText('2010');
				expect(year).toBeInTheDocument();
			},
			{ timeout: 1000 }
		);
	});

	// Statement coverage: Escape closes results
	it('Escape closes results', async () => {
		render(TypeHeadSearch);

		const input = screen.getByRole('searchbox');
		await fireEvent.input(input, { target: { value: 'inception' } });

		await vi.waitFor(
			() => {
				const results = screen.getByLabelText(messages.searchResults);
				expect(results).toBeInTheDocument();
			},
			{ timeout: 1000 }
		);

		await fireEvent.keyDown(input, { key: 'Escape' });

		const results = screen.queryByLabelText(messages.searchResults);
		expect(results).not.toBeInTheDocument();
	});

	// Statement coverage: click outside closes results
	it('click outside closes results', async () => {
		render(TypeHeadSearch);

		const input = screen.getByRole('searchbox');
		await fireEvent.input(input, { target: { value: 'inception' } });

		await vi.waitFor(
			() => {
				const results = screen.getByLabelText(messages.searchResults);
				expect(results).toBeInTheDocument();
			},
			{ timeout: 1000 }
		);

		// Click outside the component
		await fireEvent.click(document.body);

		const results = screen.queryByLabelText(messages.searchResults);
		expect(results).not.toBeInTheDocument();
	});

	// Statement coverage: focus shows results again
	it('focus shows results again', async () => {
		render(TypeHeadSearch);

		const input = screen.getByRole('searchbox');
		await fireEvent.input(input, { target: { value: 'inception' } });

		await vi.waitFor(
			() => {
				const results = screen.getByLabelText(messages.searchResults);
				expect(results).toBeInTheDocument();
			},
			{ timeout: 1000 }
		);

		// Close with Escape
		await fireEvent.keyDown(input, { key: 'Escape' });

		// Focus again
		await fireEvent.focus(input);

		const results = screen.queryByLabelText(messages.searchResults);
		expect(results).toBeInTheDocument();
	});

	// Statement coverage: no results state
	it('shows no results state', async () => {
		vi.spyOn(global, 'fetch').mockImplementationOnce(() =>
			Promise.resolve({
				ok: true,
				json: () => Promise.resolve({ movies: [], tvShows: [] })
			})
		);

		render(TypeHeadSearch);

		const input = screen.getByRole('searchbox');
		await fireEvent.input(input, { target: { value: 'nothingfound' } });

		await vi.waitFor(
			() => {
				const noResults = screen.getByText(messages.searchNoResults);
				expect(noResults).toBeInTheDocument();
			},
			{ timeout: 1000 }
		);
	});

	// Statement coverage: poster fallback to imageUrl
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

		const input = screen.getByRole('searchbox');
		await fireEvent.input(input, { target: { value: 'noposter' } });

		await vi.waitFor(
			() => {
				const img = container.querySelector('.category img');
				expect(img).toHaveAttribute('src', '/fallback.jpg');
			},
			{ timeout: 1000 }
		);
	});

	// Statement coverage: notAvailable fallback
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

		const input = screen.getByRole('searchbox');
		await fireEvent.input(input, { target: { value: 'noimages' } });

		await vi.waitFor(
			() => {
				const img = container.querySelector('.category img');
				expect(img).toHaveAttribute('src', expect.stringContaining('not-available'));
			},
			{ timeout: 1000 }
		);
	});

	// Statement coverage: date fallback for invalid date
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

		const input = screen.getByRole('searchbox');
		await fireEvent.input(input, { target: { value: 'invaliddate' } });

		await vi.waitFor(
			() => {
				const date = screen.getByText(fallbacks.dateFallback);
				expect(date).toBeInTheDocument();
			},
			{ timeout: 1000 }
		);
	});

	// Statement coverage: rating fallback for null
	it('uses 0.0 as fallback for null rating', async () => {
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

		const input = screen.getByRole('searchbox');
		await fireEvent.input(input, { target: { value: 'nullrating' } });

		await vi.waitFor(
			() => {
				const rating = screen.getByText('0.0');
				expect(rating).toBeInTheDocument();
			},
			{ timeout: 1000 }
		);
	});

	// Statement coverage: placeholder text is set
	it('input has correct placeholder text', () => {
		render(TypeHeadSearch);

		const input = screen.getByRole('searchbox');
		expect(input).toHaveAttribute('placeholder', texts.searchInput);
	});

	// Statement coverage: deduplicateById removes duplicates
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

		const input = screen.getByRole('searchbox');
		await fireEvent.input(input, { target: { value: 'duplicate' } });

		await vi.waitFor(
			() => {
				const movieItems = screen.queryAllByRole('listitem');
				// Should be only 1 item (deduplicated), not 3
				expect(movieItems).toHaveLength(1);
			},
			{ timeout: 1000 }
		);

		// Original title should be displayed, not Duplicate
		const movieTitle = screen.getByText('Inception');
		expect(movieTitle).toBeInTheDocument();
	});
});
