import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import DetailsHero from '$lib/components/DetailsHero.svelte';
import { getLocaleText } from '$lib/i18n/resolver.js';
import { DEFAULT_LOCALE } from '$lib/i18n/config.js';
import { cleanupAll, resetAll } from '$tests/setup/test-utils.js';
import notAvailable from '$lib/assets/not-available.png';

const localeData = getLocaleText(DEFAULT_LOCALE);
const labels = localeData.fallbacks;

vi.mock('$lib/stores/i18n', async () => ({
	i18n: {
		subscribe(run) {
			run(localeData);
			return () => {};
		}
	}
}));

describe('DetailsHero', () => {
	beforeEach(() => {
		resetAll();
	});

	afterEach(() => {
		cleanupAll();
	});

	// Statement coverage: title is rendered correctly
	it('renders title correctly', () => {
		const title = 'Inception';
		const backdrop = '/backdrop.jpg';
		const posterUrl = '/poster.jpg';

		render(DetailsHero, { props: { title, backdrop, posterUrl } });

		expect(screen.getByText(title, { selector: 'h1#details-hero-title' })).toBeInTheDocument();
	});

	// Statement coverage: title shows notAvailable when empty
	it('shows notAvailable text when title is empty', () => {
		render(DetailsHero, {
			props: { title: '', backdrop: '/backdrop.jpg', posterUrl: '/poster.jpg' }
		});

		expect(
			screen.getByText(labels.notAvailable, { selector: 'h1#details-hero-title' })
		).toBeInTheDocument();
	});

	// Statement coverage: title shows notAvailable when only whitespace
	it('shows notAvailable text when title is only whitespace', () => {
		render(DetailsHero, {
			props: { title: '   ', backdrop: '/backdrop.jpg', posterUrl: '/poster.jpg' }
		});

		expect(
			screen.getByText(labels.notAvailable, { selector: 'h1#details-hero-title' })
		).toBeInTheDocument();
	});

	// Statement coverage: production companies are rendered
	it('renders production companies', () => {
		const productionCompanies = [
			{ id: 1, name: 'Warner Bros.' },
			{ id: 2, name: 'Legendary Pictures' }
		];

		render(DetailsHero, {
			props: {
				title: 'Inception',
				backdrop: '/backdrop.jpg',
				posterUrl: '/poster.jpg',
				productionCompanies
			}
		});

		expect(screen.getByText('Warner Bros.')).toBeInTheDocument();
		expect(screen.getByText('Legendary Pictures')).toBeInTheDocument();
	});

	// Statement coverage: emptyLabel is rendered when no production companies
	it('shows emptyLabel when no production companies', () => {
		const emptyLabel = 'Keine Informationen';

		render(DetailsHero, {
			props: {
				title: 'Inception',
				backdrop: '/backdrop.jpg',
				posterUrl: '/poster.jpg',
				productionCompanies: [],
				emptyLabel
			}
		});

		expect(
			screen.getByText(emptyLabel, { selector: 'li.details-hero-company' })
		).toBeInTheDocument();
	});

	// Statement coverage: notAvailable text is rendered when emptyLabel is empty and no production companies
	it('shows notAvailable text when emptyLabel is empty and no production companies', () => {
		render(DetailsHero, {
			props: {
				title: 'Inception',
				backdrop: '/backdrop.jpg',
				posterUrl: '/poster.jpg',
				productionCompanies: [],
				emptyLabel: ''
			}
		});

		expect(
			screen.getByText(labels.notAvailable, { selector: 'li.details-hero-company' })
		).toBeInTheDocument();
	});

	// Statement coverage: backdrop is used as background
	it('sets backdrop as background', () => {
		const backdrop = '/backdrop.jpg';

		const { container } = render(DetailsHero, {
			props: { title: 'Inception', backdrop, posterUrl: '/poster.jpg' }
		});
		const section = container.querySelector('.details-hero');
		expect(section).toHaveStyle(`--details-hero-backdrop: url('${backdrop}')`);
	});

	// Statement coverage: posterUrl is used as fallback when no backdrop
	it('uses posterUrl as fallback when no backdrop', () => {
		const posterUrl = '/poster.jpg';

		const { container } = render(DetailsHero, {
			props: { title: 'Inception', backdrop: '', posterUrl }
		});
		const section = container.querySelector('.details-hero');
		expect(section).toHaveStyle(`--details-hero-backdrop: url('${posterUrl}')`);
	});

	// Statement coverage: notAvailable.png is used as fallback when no backdrop and no posterUrl
	it('uses notAvailable.png as fallback when no backdrop and no posterUrl', () => {
		const { container } = render(DetailsHero, {
			props: { title: 'Inception', backdrop: '', posterUrl: '' }
		});
		const section = container.querySelector('.details-hero');
		expect(section).toHaveStyle(`--details-hero-backdrop: url('${notAvailable}')`);
	});

	// Statement coverage: poster image is rendered correctly
	it('renders poster image correctly', () => {
		const posterUrl = '/poster.jpg';

		render(DetailsHero, { props: { title: 'Inception', backdrop: '/backdrop.jpg', posterUrl } });

		const posterImg = screen.getByAltText('');
		expect(posterImg).toHaveAttribute('src', posterUrl);
	});

	// Statement coverage: notAvailable.png is used as poster fallback
	it('uses notAvailable.png as poster fallback', () => {
		render(DetailsHero, {
			props: { title: 'Inception', backdrop: '/backdrop.jpg', posterUrl: '' }
		});

		const posterImg = screen.getByAltText('');
		expect(posterImg).toHaveAttribute('src', notAvailable);
	});

	// Statement coverage: section has correct aria-labelledby
	it('has correct aria-labelledby', () => {
		const { container } = render(DetailsHero, {
			props: { title: 'Inception', backdrop: '/backdrop.jpg', posterUrl: '/poster.jpg' }
		});
		const section = container.querySelector('[aria-labelledby="details-hero-title"]');
		expect(section).toHaveAttribute('aria-labelledby', 'details-hero-title');
	});

	// Statement coverage: companies section has correct aria-labelledby
	it('has correct aria-labelledby for companies section', () => {
		const { container } = render(DetailsHero, {
			props: { title: 'Inception', backdrop: '/backdrop.jpg', posterUrl: '/poster.jpg' }
		});
		const companiesSection = container.querySelector(
			'[aria-labelledby="details-hero-companies-heading"]'
		);
		expect(companiesSection).toBeInTheDocument();
	});
});
