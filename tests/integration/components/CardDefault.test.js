import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/svelte';
import CardDefault from '$lib/components/CardDefault.svelte';
import { getLocaleText } from '$lib/i18n/resolver.js';
import { DEFAULT_LOCALE } from '$lib/i18n/config.js';
import { cleanupAll, resetAll } from '$tests/setup/test-utils.js';
import notAvailable from '$lib/assets/not-available.png';

const { labels, formats, fallbacks } = getLocaleText(DEFAULT_LOCALE);

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
		url: new URL('http://localhost:3000/'),
		params: {}
	}
}));

vi.mock('$lib/utils/certificationMeta', () => ({
	getCertificationMeta: vi.fn((certification) => {
		if (!certification) {
			return null;
		}

		return {
			label: certification,
			color: '#757575',
			textColor: '#ffffff'
		};
	})
}));

describe('CardDefault', () => {
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
		const { container } = render(CardDefault, {
			props: { id: 123, mediaType: 'movie', title: 'Inception' }
		});

		expect(container.querySelector('.header')).toHaveTextContent('Inception');
	});

	// Branch coverage: The card renders the fallback title for an empty value.
	it('shows notAvailable text when title is empty', () => {
		const { container } = render(CardDefault, {
			props: { id: 123, mediaType: 'movie', title: '' }
		});

		expect(container.querySelector('.header')).toHaveTextContent(fallbacks.notAvailable);
	});

	// Statement coverage: The card joins genre names.
	it('renders genres', () => {
		const { container } = render(CardDefault, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				genres: [{ name: 'Action' }, { name: 'Thriller' }]
			}
		});

		expect(container.querySelector('.meta.genres')).toHaveTextContent('Action / Thriller');
	});

	// Branch coverage: The card renders the genre fallback for an empty list.
	it('shows notAvailable text when genres are empty', () => {
		const { container } = render(CardDefault, {
			props: { id: 123, mediaType: 'movie', title: 'Inception', genres: [] }
		});

		expect(container.querySelector('.meta.genres')).toHaveTextContent(fallbacks.notAvailable);
	});

	// Statement coverage: The card renders the release year for a valid date.
	it('renders releaseDate', () => {
		const { container } = render(CardDefault, {
			props: { id: 123, mediaType: 'movie', title: 'Inception', date: '2024-01-15' }
		});

		expect(container.querySelector('.meta.date')).toHaveTextContent(/2024/);
	});

	// Branch coverage: The card renders the date fallback for an empty value.
	it('shows notAvailable text when date is empty', () => {
		const { container } = render(CardDefault, {
			props: { id: 123, mediaType: 'movie', title: 'Inception', date: '' }
		});

		expect(container.querySelector('.meta.date')).toHaveTextContent(fallbacks.notAvailable);
	});

	// Statement coverage: The card renders a positive rating with one decimal place.
	it('renders rating', () => {
		const { container } = render(CardDefault, {
			props: { id: 123, mediaType: 'movie', title: 'Inception', rating: 8.5 }
		});

		expect(container.querySelector('.rating-value')).toHaveTextContent('8.5');
		expect(container.querySelector('.extra.content')).toHaveTextContent(formats.outOfTen);
	});

	// Branch coverage: The card renders the rating fallback for zero.
	it('shows notAvailable text when rating is 0', () => {
		const { container } = render(CardDefault, {
			props: { id: 123, mediaType: 'movie', title: 'Inception', rating: 0 }
		});

		expect(container.querySelector('.extra.content')).toHaveTextContent(fallbacks.notAvailable);
	});

	// Statement coverage: The card renders a supplied certification.
	it('renders certification', () => {
		const { container } = render(CardDefault, {
			props: { id: 123, mediaType: 'movie', title: 'Inception', certification: 'PG' }
		});

		expect(container.querySelector('.certification-text')).toHaveTextContent('PG');
	});

	// Branch coverage: The card renders the certification fallback for an empty value.
	it('shows notAvailable text when certification is empty', () => {
		const { container } = render(CardDefault, {
			props: { id: 123, mediaType: 'movie', title: 'Inception', certification: '' }
		});

		expect(container.querySelector('.certification-text')).toHaveTextContent(fallbacks.notAvailable);
	});

	// Statement coverage: The card renders the movie type label.
	it('renders movie type badge', () => {
		const { container } = render(CardDefault, {
			props: { id: 123, mediaType: 'movie', title: 'Inception' }
		});

		expect(container.querySelector('.image .ui.label')).toHaveTextContent(labels.movie);
	});

	// Branch coverage: The card renders the TV-show type label.
	it('renders TV show type badge', () => {
		const { container } = render(CardDefault, {
			props: { id: 456, mediaType: 'tv', title: 'Breaking Bad' }
		});

		expect(container.querySelector('.image .ui.label')).toHaveTextContent(labels.tvShow);
	});

	// Statement coverage: The card creates a movie detail link with a locale parameter.
	it('renders more info link', () => {
		const { container } = render(CardDefault, {
			props: { id: 123, mediaType: 'movie', title: 'Inception' }
		});

		const href = container.querySelector('.default-card').getAttribute('href');
		expect(href).toMatch(/^\/movies\/123\?locale=/);
	});

	// Statement coverage: The card renders the supplied poster image.
	it('renders poster image correctly', () => {
		const imageUrl = '/poster.jpg';
		const { container } = render(CardDefault, {
			props: { id: 123, mediaType: 'movie', title: 'Inception', imageUrl }
		});

		expect(container.querySelector('.image img')).toHaveAttribute('src', imageUrl);
	});

	// Branch coverage: The card uses the placeholder image without a poster URL.
	it('renders poster fallback when no imageUrl', () => {
		const { container } = render(CardDefault, {
			props: { id: 123, mediaType: 'movie', title: 'Inception', imageUrl: '' }
		});

		expect(container.querySelector('.image img')).toHaveAttribute('src', notAvailable);
	});

	// Statement coverage: The card applies its loading class.
	it('sets isLoading class', () => {
		const { container } = render(CardDefault, {
			props: { id: 123, mediaType: 'movie', title: 'Inception', isLoading: true }
		});

		expect(container.querySelector('.default-card')).toHaveClass('is-loading');
	});

	// Statement coverage: The card applies a supplied scroll ID.
	it('sets scrollId', () => {
		const { container } = render(CardDefault, {
			props: { id: 123, mediaType: 'movie', title: 'Inception', scrollId: 'home-card-5' }
		});

		expect(container.querySelector('.default-card')).toHaveAttribute('id', 'home-card-5');
	});
});
