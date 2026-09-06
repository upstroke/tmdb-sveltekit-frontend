import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import CardFeatured from '$lib/components/CardFeatured.svelte';
import { getLocaleText } from '$lib/i18n/resolver.js';
import { DEFAULT_LOCALE } from '$lib/i18n/config.js';
import { cleanupAll, resetAll } from '$tests/setup/test-utils.js';
import notAvailable from '$lib/assets/not-available.png';

const { labels, fallbacks } = getLocaleText(DEFAULT_LOCALE);

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
		url: new URL('http://localhost:3000/')
	}
}));

describe('CardFeatured', () => {
	beforeEach(() => {
		if (typeof sessionStorage !== 'undefined') {
			sessionStorage.clear();
		}

		resetAll();
	});

	afterEach(() => {
		cleanupAll();
	});

	// Statement coverage: The card renders its title.
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

	// Statement coverage: The card renders the fallback title for an empty value.
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

	// Statement coverage: The card renders the overview.
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

	// Statement coverage: The card renders the fallback overview for an empty value.
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

	// Statement coverage: The card renders the genres.
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

	// Statement coverage: The card renders the release date.
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

		const dateElement = screen.getByText((content) => /\b2024\b/.test(content));
		expect(dateElement).toBeInTheDocument();
	});

	// Statement coverage: The card renders the movie type badge.
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

	// Statement coverage: The card renders the TV-show type badge.
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

	// Statement coverage: The card renders the more-info link.
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

		const moreInfoLink = screen.getByText(labels.moreInfo);
		expect(moreInfoLink).toHaveAttribute('href', expect.stringContaining('/movies/123'));
		expect(moreInfoLink).toHaveAttribute('href', expect.stringContaining('locale='));
	});

	// Statement coverage: The card renders the official website link.
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

	// Statement coverage: The card renders the poster image.
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

	// Statement coverage: The card uses the placeholder image without a poster URL.
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

	// Statement coverage: The card sets the background image.
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

	// Statement coverage: The card uses the placeholder background without an image URL.
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

	// Statement coverage: The card sets the correct aria-labelledby.
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
