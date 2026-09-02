import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import CardDefault from '$lib/components/CardDefault.svelte';
import { getLocaleText } from '$lib/i18n/resolver.js';
import { DEFAULT_LOCALE } from '$lib/i18n/config';
import { cleanupAll, resetAll } from '$tests/setup/test-utils.js';
import notAvailable from '$lib/assets/not-available.png';
import ratingsData from '$lib/i18n/ratings.json';
import { resolveLocale } from '$lib/i18n/helpers.js';

const localeData = getLocaleText(DEFAULT_LOCALE);
const labels = localeData.labels;
const formats = localeData.formats;
const fallbacks = localeData.fallbacks;

/**
 * Extrahiert die Region aus einer Locale (z.B. "de-DE" -> "DE").
 */
function getRegionFromLocale(locale) {
	return locale.split('-')[1] ?? 'DE';
}

/**
 * Liefert das Rating-System für eine gegebene Locale.
 */
function getRatingsForLocale(locale = DEFAULT_LOCALE) {
	const resolvedLocale = resolveLocale(locale);
	const region = getRegionFromLocale(resolvedLocale);
	return ratingsData.ratingSystems[region] ?? ratingsData.ratingSystems.DE;
}

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
		url: new URL('http://localhost:3000/?locale=de-DE'),
		params: {}
	}
}));

vi.mock('$lib/utils/certificationMeta', async () => {
	const ratings = getRatingsForLocale(DEFAULT_LOCALE);

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

	// 100% Anweisungsueberdeckung: Title wird korrekt gerendert
	it('rendert Title korrekt', () => {
		const { container } = render(CardDefault, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception'
			}
		});

		const title = container.querySelector('.header');
		expect(title).toHaveTextContent('Inception');
	});

	// 100% Anweisungsueberdeckung: Title Fallback wenn leer
	it('zeigt notAvailable-Text wenn title leer ist', () => {
		const { container } = render(CardDefault, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: ''
			}
		});

		const title = container.querySelector('.header');
		expect(title).toHaveTextContent(fallbacks.notAvailable);
	});

	// 100% Anweisungsueberdeckung: Genres werden gerendert
	it('rendert Genres', () => {
		const genres = [
			{ name: 'Action' },
			{ name: 'Thriller' }
		];

		const { container } = render(CardDefault, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				genres
			}
		});

		const genresMeta = container.querySelector('.meta.genres');
		expect(genresMeta).toHaveTextContent('Action / Thriller');
	});

	// 100% Anweisungsueberdeckung: Genres Fallback wenn leer
	it('zeigt notAvailable-Text wenn genres leer sind', () => {
		const { container } = render(CardDefault, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				genres: []
			}
		});

		const genresMeta = container.querySelector('.meta.genres');
		expect(genresMeta).toHaveTextContent(fallbacks.notAvailable);
	});

	// 100% Anweisungsueberdeckung: ReleaseDate wird gerendert
	it('rendert ReleaseDate', () => {
		const date = '2024-01-15';
		const { container } = render(CardDefault, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				date
			}
		});

		const dateMeta = container.querySelector('.meta.date');
		expect(dateMeta).toHaveTextContent('15.1.2024');
	});

	// 100% Anweisungsueberdeckung: ReleaseDate Fallback wenn leer
	it('zeigt notAvailable-Text wenn date leer ist', () => {
		const { container } = render(CardDefault, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				date: ''
			}
		});

		const dateMeta = container.querySelector('.meta.date');
		expect(dateMeta).toHaveTextContent(fallbacks.notAvailable);
	});

	// 100% Anweisungsueberdeckung: Rating wird gerendert
	it('rendert Rating', () => {
		const { container } = render(CardDefault, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				rating: 8.5
			}
		});

		const rating = container.querySelector('.rating-value');
		expect(rating).toHaveTextContent('8.5');
		expect(container.querySelector('.extra.content')).toHaveTextContent(formats.outOfTen);
	});

	// 100% Anweisungsueberdeckung: Rating Fallback wenn 0
	it('zeigt notAvailable-Text wenn rating 0 ist', () => {
		const { container } = render(CardDefault, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				rating: 0
			}
		});

		const footer = container.querySelector('.extra.content');
		expect(footer).toHaveTextContent(fallbacks.notAvailable);
	});

	// 100% Anweisungsueberdeckung: Certification wird gerendert
	it('rendert Certification', () => {
		const { container } = render(CardDefault, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				certification: 'FSK 12'
			}
		});

		const certification = container.querySelector('.certification-text');
		expect(certification).toHaveTextContent('FSK 12');
	});

	// 100% Anweisungsueberdeckung: Certification Fallback wenn leer
	it('zeigt notAvailable-Text wenn certification leer ist', () => {
		const { container } = render(CardDefault, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				certification: ''
			}
		});

		const certification = container.querySelector('.certification-text');
		expect(certification).toHaveTextContent(fallbacks.notAvailable);
	});

	// 100% Anweisungsueberdeckung: Movie Type Badge wird gerendert
	it('rendert Movie Type Badge', () => {
		const { container } = render(CardDefault, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception'
			}
		});

		const typeLabel = container.querySelector('.ui.label.movie');
		expect(typeLabel).toHaveTextContent(labels.movie);
	});

	// 100% Anweisungsueberdeckung: TV Show Type Badge wird gerendert
	it('rendert TV Show Type Badge', () => {
		const { container } = render(CardDefault, {
			props: {
				id: 456,
				mediaType: 'tv',
				title: 'Breaking Bad'
			}
		});

		const typeLabel = container.querySelector('.ui.label.tv');
		expect(typeLabel).toHaveTextContent(labels.tvShow);
	});

	// 100% Anweisungsueberdeckung: More Info Link wird gerendert
	it('rendert More Info Link', () => {
		const { container } = render(CardDefault, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception'
			}
		});

		const link = container.querySelector('a.default-card');
		expect(link).toHaveAttribute('href', '/movies/123?locale=de-DE');
	});

	// 100% Anweisungsueberdeckung: Poster Bild wird korrekt gerendert
	it('rendert Poster Bild korrekt', () => {
		const imageUrl = '/poster.jpg';
		const { container } = render(CardDefault, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				imageUrl
			}
		});

		const img = container.querySelector('.image img');
		expect(img).toHaveAttribute('src', imageUrl);
	});

	// 100% Anweisungsueberdeckung: Poster Fallback wenn kein imageUrl
	it('rendert Poster Fallback wenn kein imageUrl', () => {
		const { container } = render(CardDefault, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				imageUrl: ''
			}
		});

		const img = container.querySelector('.image img');
		expect(img).toHaveAttribute('src', notAvailable);
	});

	// 100% Anweisungsueberdeckung: isLoading Klasse wird gesetzt
	it('setzt isLoading Klasse', () => {
		const { container } = render(CardDefault, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				isLoading: true
			}
		});

		const card = container.querySelector('a.default-card');
		expect(card).toHaveClass('is-loading');
	});

	// 100% Anweisungsueberdeckung: scrollId wird gesetzt
	it('setzt scrollId', () => {
		const { container } = render(CardDefault, {
			props: {
				id: 123,
				mediaType: 'movie',
				title: 'Inception',
				scrollId: 'home-card-5'
			}
		});

		const card = container.querySelector('a#home-card-5');
		expect(card).toBeInTheDocument();
	});
});
