import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/svelte';
import CardDefault from '$lib/components/CardDefault.svelte';
import { getLocaleText } from '$lib/i18n/resolver.js';
import { DEFAULT_LOCALE } from '$lib/i18n/config.js';
import { cleanupAll, resetAll } from '$tests/setup/test-utils.js';
import notAvailable from '$lib/assets/not-available.png';

const localeData = getLocaleText(DEFAULT_LOCALE);
const labels = localeData.labels;
const formats = localeData.formats;
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
		url: new URL('http://localhost:3000/?locale=en-US'),
		params: {}
	}
}));

vi.mock('$lib/utils/certificationMeta', async () => {
	const ratingsData = await import('$lib/i18n/ratings.json');
	const { resolveLocale } = await import('$lib/i18n/helpers.js');
	const { DEFAULT_LOCALE: DEFAULT } = await import('$lib/i18n/config.js');

	const getRegionFromLocale = (locale) => locale.split('-')[1] ?? 'US';
	const resolvedLocale = resolveLocale(DEFAULT);
	const region = getRegionFromLocale(resolvedLocale);
	const ratings = ratingsData.default.ratingSystems[region] ?? ratingsData.default.ratingSystems.DE;

	return {
		getCertificationMeta: vi.fn((certification) => {
			if (!certification) {
				return null;
			}

			const rating = ratings.ratings[certification];

			if (rating) {
				return {
					label: rating.label,
					color: rating.color,
					textColor: rating.textColor
				};
			}

			return {
				label: certification,
				color: '#757575',
				textColor: '#ffffff'
			};
		})
	};
});

describe('CardDefault', () => {
	beforeEach(() => {
		resetAll();
	});

	afterEach(() => {
		cleanupAll();
	});

	// 100% statement coverage: title is rendered correctly
	it('renders title correctly', () => {
		const { container } = render(CardDefault, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception'
			}
		});

		const card = container.querySelector('.ui.card.default-card');
		const title = card.querySelector('.header');
		expect(title).toHaveTextContent('Inception');
	});

	// 100% statement coverage: title fallback when empty
	it('shows notAvailable text when title is empty', () => {
		const { container } = render(CardDefault, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: ''
			}
		});

		const card = container.querySelector('.ui.card.default-card');
		const title = card.querySelector('.header');
		expect(title).toHaveTextContent(fallbacks.notAvailable);
	});

	// 100% statement coverage: genres are rendered
	it('renders genres', () => {
		const genres = [{ name: 'Action' }, { name: 'Thriller' }];

		const { container } = render(CardDefault, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				genres
			}
		});

		const card = container.querySelector('.ui.card.default-card');
		const genresMeta = card.querySelector('.meta.genres');
		expect(genresMeta).toHaveTextContent('Action / Thriller');
	});

	// 100% statement coverage: genres fallback when empty
	it('shows notAvailable text when genres are empty', () => {
		const { container } = render(CardDefault, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				genres: []
			}
		});

		const card = container.querySelector('.ui.card.default-card');
		const genresMeta = card.querySelector('.meta.genres');
		expect(genresMeta).toHaveTextContent(fallbacks.notAvailable);
	});

	// 100% statement coverage: releaseDate is rendered
	it('renders releaseDate', () => {
		const date = '2024-01-15';
		const { container } = render(CardDefault, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				date
			}
		});

		const card = container.querySelector('.ui.card.default-card');
		const dateMeta = card.querySelector('.meta.date');
		expect(dateMeta).toHaveTextContent('1/15/2024');
	});

	// 100% statement coverage: releaseDate fallback when empty
	it('shows notAvailable text when date is empty', () => {
		const { container } = render(CardDefault, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				date: ''
			}
		});

		const card = container.querySelector('.ui.card.default-card');
		const dateMeta = card.querySelector('.meta.date');
		expect(dateMeta).toHaveTextContent(fallbacks.notAvailable);
	});

	// 100% statement coverage: rating is rendered
	it('renders rating', () => {
		const { container } = render(CardDefault, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				rating: 8.5
			}
		});

		const card = container.querySelector('.ui.card.default-card');
		const rating = card.querySelector('.rating-value');
		const footer = card.querySelector('.extra.content');
		expect(rating).toHaveTextContent('8.5');
		expect(footer).toHaveTextContent(formats.outOfTen);
	});

	// 100% statement coverage: rating fallback when 0
	it('shows notAvailable text when rating is 0', () => {
		const { container } = render(CardDefault, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				rating: 0
			}
		});

		const card = container.querySelector('.ui.card.default-card');
		const footer = card.querySelector('.extra.content');
		expect(footer).toHaveTextContent(fallbacks.notAvailable);
	});

	// 100% statement coverage: certification is rendered
	it('renders certification', () => {
		const { container } = render(CardDefault, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				certification: 'PG'
			}
		});

		const card = container.querySelector('.ui.card.default-card');
		const certification = card.querySelector('.certification-text');
		expect(certification).toHaveTextContent('PG');
	});

	// 100% statement coverage: certification fallback when empty
	it('shows notAvailable text when certification is empty', () => {
		const { container } = render(CardDefault, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				certification: ''
			}
		});

		const card = container.querySelector('.ui.card.default-card');
		const certification = card.querySelector('.certification-text');
		expect(certification).toHaveTextContent(fallbacks.notAvailable);
	});

	// 100% statement coverage: movie type badge is rendered
	it('renders movie type badge', () => {
		const { container } = render(CardDefault, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception'
			}
		});

		const card = container.querySelector('.ui.card.default-card');
		const typeLabel = card.querySelector('.image .ui.label');
		expect(typeLabel).toHaveTextContent(labels.movie);
	});

	// 100% statement coverage: TV show type badge is rendered
	it('renders TV show type badge', () => {
		const { container } = render(CardDefault, {
			props: {
				id: 456,
				mediaType: 'tv',
				title: 'Breaking Bad'
			}
		});

		const card = container.querySelector('.ui.card.default-card');
		const typeLabel = card.querySelector('.image .ui.label');
		expect(typeLabel).toHaveTextContent(labels.tvShow);
	});

	// 100% statement coverage: more info link is rendered
	it('renders more info link', () => {
		const { container } = render(CardDefault, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception'
			}
		});

		const card = container.querySelector('.ui.card.default-card');
		expect(card).toHaveAttribute('href', '/movies/123?locale=en-US');
	});

	// 100% statement coverage: poster image is rendered correctly
	it('renders poster image correctly', () => {
		const imageUrl = '/poster.jpg';
		const { container } = render(CardDefault, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				imageUrl
			}
		});

		const card = container.querySelector('.ui.card.default-card');
		const img = card.querySelector('.image img');
		expect(img).toHaveAttribute('src', imageUrl);
	});

	// 100% statement coverage: poster fallback when no imageUrl
	it('renders poster fallback when no imageUrl', () => {
		const { container } = render(CardDefault, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				imageUrl: ''
			}
		});

		const card = container.querySelector('.ui.card.default-card');
		const img = card.querySelector('.image img');
		expect(img).toHaveAttribute('src', notAvailable);
	});

	// 100% statement coverage: isLoading class is set
	it('sets isLoading class', () => {
		const { container } = render(CardDefault, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				isLoading: true
			}
		});

		const card = container.querySelector('.ui.card.default-card');
		expect(card).toHaveClass('is-loading');
	});

	// 100% statement coverage: scrollId is set
	it('sets scrollId', () => {
		const { container } = render(CardDefault, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				scrollId: 'home-card-5'
			}
		});

		const card = container.querySelector('.ui.card.default-card');
		expect(card).toHaveAttribute('id', 'home-card-5');
	});
});
