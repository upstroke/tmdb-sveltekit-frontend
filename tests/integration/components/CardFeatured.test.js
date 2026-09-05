import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import CardFeatured from '$lib/components/CardFeatured.svelte';
import { getLocaleText } from '$lib/i18n/resolver.js';
import { DEFAULT_LOCALE } from '$lib/i18n/config.js';
import { cleanupAll, resetAll } from '$tests/setup/test-utils.js';
import notAvailable from '$lib/assets/not-available.png';

const localeData = getLocaleText(DEFAULT_LOCALE);
const labels = localeData.labels;
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

vi.mock('$app/state', async () => ({
	page: {
		url: new URL('http://localhost:3000/?locale=en-US')
	}
}));

describe('CardFeatured', () => {
	beforeEach(() => {
		resetAll();
	});

	afterEach(() => {
		cleanupAll();
	});

	// Statement coverage: title is rendered correctly
	it('renders title correctly', () => {
		const { container } = render(CardFeatured, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				imageUrl: '/image.jpg',
				posterUrl: '/poster.jpg'
			}
		});

		const title = container.querySelector('#featured-card-title');
		expect(title).toHaveTextContent('Inception');
	});

	// Statement coverage: title shows notAvailable when empty
	it('shows notAvailable text when title is empty', () => {
		const { container } = render(CardFeatured, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: '',
				imageUrl: '/image.jpg',
				posterUrl: '/poster.jpg'
			}
		});

		const title = container.querySelector('#featured-card-title');
		expect(title).toHaveTextContent(fallbacks.notAvailable);
	});

	// Statement coverage: overview is rendered correctly
	it('renders overview correctly', () => {
		const overview = 'A thief who steals corporate secrets...';
		render(CardFeatured, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				overview,
				imageUrl: '/image.jpg',
				posterUrl: '/poster.jpg'
			}
		});

		expect(screen.getByText(overview)).toBeInTheDocument();
	});

	// Statement coverage: overview shows notAvailable when empty
	it('shows notAvailable text when overview is empty', () => {
		render(CardFeatured, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				overview: '',
				imageUrl: '/image.jpg',
				posterUrl: '/poster.jpg'
			}
		});

		expect(
			screen.getByText(fallbacks.notAvailable, { selector: 'p.featured-card-description' })
		).toBeInTheDocument();
	});

	// Statement coverage: genres are rendered
	it('renders genres', () => {
		const genres = [
			{ id: 1, name: 'Action' },
			{ id: 2, name: 'Thriller' }
		];

		render(CardFeatured, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				genres,
				imageUrl: '/image.jpg',
				posterUrl: '/poster.jpg'
			}
		});

		expect(screen.getByText('Action')).toBeInTheDocument();
		expect(screen.getByText('Thriller')).toBeInTheDocument();
	});

	// Statement coverage: releaseDate is rendered
	it('renders releaseDate', () => {
		const releaseDate = '2024-01-15';
		render(CardFeatured, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				releaseDate,
				imageUrl: '/image.jpg',
				posterUrl: '/poster.jpg'
			}
		});

		expect(screen.getByText('1/15/2024')).toBeInTheDocument();
	});

	// Statement coverage: movie type badge is rendered
	it('renders movie type badge', () => {
		const { container } = render(CardFeatured, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				imageUrl: '/image.jpg',
				posterUrl: '/poster.jpg'
			}
		});

		const typeBadge = container.querySelector('.featured-card-type--movie');
		expect(typeBadge).toHaveTextContent(labels.movie);
	});

	// Statement coverage: TV show type badge is rendered
	it('renders TV show type badge', () => {
		const { container } = render(CardFeatured, {
			props: {
				id: 456,
				mediaType: 'tv',
				title: 'Breaking Bad',
				imageUrl: '/image.jpg',
				posterUrl: '/poster.jpg'
			}
		});

		const typeBadge = container.querySelector('.featured-card-type--tv');
		expect(typeBadge).toHaveTextContent(labels.tvShow);
	});

	// Statement coverage: more info button is rendered
	it('renders more info button', () => {
		render(CardFeatured, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				imageUrl: '/image.jpg',
				posterUrl: '/poster.jpg'
			}
		});

		expect(screen.getByText(labels.moreInfo)).toHaveAttribute('href', '/movies/123?locale=en-US');
	});

	// Statement coverage: official website button is rendered
	it('renders official website button', () => {
		const homepage = 'https://example.com';
		render(CardFeatured, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				homepage,
				imageUrl: '/image.jpg',
				posterUrl: '/poster.jpg'
			}
		});

		expect(screen.getByText(labels.officialWebsite)).toHaveAttribute('href', homepage);
		expect(screen.getByText(labels.officialWebsite)).toHaveAttribute('target', '_blank');
		expect(screen.getByText(labels.officialWebsite)).toHaveAttribute('rel', 'noopener noreferrer');
	});

	// Statement coverage: poster image is rendered correctly
	it('renders poster image correctly', () => {
		const { container } = render(CardFeatured, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				posterUrl: '/poster.jpg',
				imageUrl: '/image.jpg'
			}
		});

		const posterImg = container.querySelector('.featured-card-poster > img');
		expect(posterImg).toHaveAttribute('src', '/poster.jpg');
	});

	// Statement coverage: poster fallback when no posterUrl
	it('renders poster fallback when no posterUrl', () => {
		const { container } = render(CardFeatured, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				imageUrl: '',
				posterUrl: ''
			}
		});

		const posterImg = container.querySelector('.featured-card-poster > img');
		expect(posterImg).toHaveAttribute('src', notAvailable);
	});

	// Statement coverage: background image is set
	it('sets background image', () => {
		const imageUrl = '/image.jpg';
		const { container } = render(CardFeatured, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				imageUrl,
				posterUrl: '/poster.jpg'
			}
		});

		const article = container.querySelector('.featured-card');
		expect(article).toHaveStyle(`--featured-card-image: url('${imageUrl}')`);
	});

	// Statement coverage: background fallback when no imageUrl
	it('sets background fallback when no imageUrl', () => {
		const { container } = render(CardFeatured, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				imageUrl: '',
				posterUrl: '/poster.jpg'
			}
		});

		const article = container.querySelector('.featured-card');
		expect(article).toHaveStyle(`--featured-card-image: url('${notAvailable}')`);
	});

	// Statement coverage: article has correct aria-labelledby
	it('has correct aria-labelledby', () => {
		const { container } = render(CardFeatured, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				imageUrl: '/image.jpg',
				posterUrl: '/poster.jpg'
			}
		});

		const article = container.querySelector('[aria-labelledby="featured-card-title"]');
		expect(article).toHaveAttribute('aria-labelledby', 'featured-card-title');
	});
});
