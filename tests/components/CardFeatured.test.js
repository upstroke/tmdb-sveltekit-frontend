import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import CardFeatured from '$lib/components/CardFeatured.svelte';
import { getLocaleText } from '$lib/i18n/resolver.js';
import { DEFAULT_LOCALE } from '$lib/i18n/config';
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
		url: new URL('http://localhost:3000/?locale=de-DE')
	}
}));

describe('CardFeatured', () => {
	beforeEach(() => {
		resetAll();
	});

	afterEach(() => {
		cleanupAll();
	});

	// Anweisungsueberdeckung: Title wird korrekt gerendert
	it('rendert Title korrekt', () => {
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

	// Anweisungsueberdeckung: Title wird zu notAvailable wenn leer
	it('zeigt notAvailable-Text wenn title leer ist', () => {
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

	// Anweisungsueberdeckung: Overview wird korrekt gerendert
	it('rendert Overview korrekt', () => {
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

	// Anweisungsueberdeckung: Overview wird zu notAvailable wenn leer
	it('zeigt notAvailable-Text wenn overview leer ist', () => {
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

		expect(screen.getByText(fallbacks.notAvailable, { selector: 'p.featured-card-description' })).toBeInTheDocument();
	});

	// Anweisungsueberdeckung: Genres werden gerendert
	it('rendert Genres', () => {
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

	// Anweisungsueberdeckung: ReleaseDate wird gerendert
	it('rendert ReleaseDate', () => {
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

		expect(screen.getByText('15.1.2024')).toBeInTheDocument();
	});

	// Anweisungsueberdeckung: Movie Type Badge wird gerendert
	it('rendert Movie Type Badge', () => {
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

	// Anweisungsueberdeckung: TV Show Type Badge wird gerendert
	it('rendert TV Show Type Badge', () => {
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

	// Anweisungsueberdeckung: More Info Button wird gerendert
	it('rendert More Info Button', () => {
		render(CardFeatured, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				imageUrl: '/image.jpg',
				posterUrl: '/poster.jpg'
			}
		});

		expect(screen.getByText(labels.moreInfo)).toHaveAttribute('href', '/movies/123?locale=de-DE');
	});

	// Anweisungsueberdeckung: Official Website Button wird gerendert
	it('rendert Official Website Button', () => {
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

	// Anweisungsueberdeckung: Poster Bild wird korrekt gerendert
	it('rendert Poster Bild korrekt', () => {
		const posterUrl = '/poster.jpg';
		render(CardFeatured, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				posterUrl,
				imageUrl: '/image.jpg'
			}
		});

		const posterImg = screen.getByAltText('Inception Poster');
		expect(posterImg).toHaveAttribute('src', posterUrl);
	});

	// Anweisungsueberdeckung: Poster Fallback wenn kein posterUrl
	it('rendert Poster Fallback wenn kein posterUrl', () => {
		render(CardFeatured, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				imageUrl: '/image.jpg'
			}
		});

		const posterImg = screen.getByAltText('Inception Poster');
		expect(posterImg).toHaveAttribute('src', notAvailable);
	});

	// Anweisungsueberdeckung: Background Image wird gesetzt
	it('setzt Background Image', () => {
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

	// Anweisungsueberdeckung: Background Fallback wenn kein imageUrl
	it('setzt Background Fallback wenn kein imageUrl', () => {
		const { container } = render(CardFeatured, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				posterUrl: '/poster.jpg'
			}
		});

		const article = container.querySelector('.featured-card');
		expect(article).toHaveStyle(`--featured-card-image: url('${notAvailable}')`);
	});

	// Anweisungsueberdeckung: Article hat korrekte aria-labelledby
	it('hat korrekte aria-labelledby', () => {
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
