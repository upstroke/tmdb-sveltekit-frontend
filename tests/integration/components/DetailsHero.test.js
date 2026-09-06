import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import DetailsHero from '$lib/components/DetailsHero.svelte';
import { getLocaleText } from '$lib/i18n/resolver.js';
import { DEFAULT_LOCALE } from '$lib/i18n/config.js';
import { cleanupAll, resetAll } from '$tests/setup/test-utils.js';
import notAvailable from '$lib/assets/not-available.png';

const { fallbacks } = getLocaleText(DEFAULT_LOCALE);

describe('DetailsHero', () => {
	beforeEach(() => {
		if (typeof sessionStorage !== 'undefined') {
			sessionStorage.clear();
		}

		resetAll();
	});

	afterEach(() => {
		cleanupAll();
	});

	// Statement coverage: The hero renders its title.
	it('renders title correctly', () => {
		const title = 'Inception';
		const backdrop = '/backdrop.jpg';
		const posterUrl = '/poster.jpg';

		render(DetailsHero, { props: { title, backdrop, posterUrl } });

		expect(screen.getByText(title, { selector: 'h1#details-hero-title' })).toBeInTheDocument();
	});

	// Branch coverage: The hero renders the fallback title for an empty value.
	it('shows notAvailable text when title is empty', () => {
		render(DetailsHero, {
			props: { title: '', backdrop: '/backdrop.jpg', posterUrl: '/poster.jpg' }
		});

		expect(
			screen.getByText(fallbacks.notAvailable, { selector: 'h1#details-hero-title' })
		).toBeInTheDocument();
	});

	// Branch coverage: The hero renders the fallback title for whitespace only.
	it('shows notAvailable text when title is only whitespace', () => {
		render(DetailsHero, {
			props: { title: '   ', backdrop: '/backdrop.jpg', posterUrl: '/poster.jpg' }
		});

		expect(
			screen.getByText(fallbacks.notAvailable, { selector: 'h1#details-hero-title' })
		).toBeInTheDocument();
	});

	// Statement coverage: The hero renders the production companies.
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

	// Branch coverage: The hero renders the fallback for an empty production companies list.
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

	// Branch coverage: The hero renders the fallback when emptyLabel is empty and no production companies exist.
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
			screen.getByText(fallbacks.notAvailable, { selector: 'li.details-hero-company' })
		).toBeInTheDocument();
	});

	// Statement coverage: The hero sets the backdrop as background.
	it('sets backdrop as background', () => {
		const backdrop = '/backdrop.jpg';

		const { container } = render(DetailsHero, {
			props: { title: 'Inception', backdrop, posterUrl: '/poster.jpg' }
		});

		const section = container.querySelector('.details-hero');
		expect(section).toHaveStyle(`--details-hero-backdrop: url('${backdrop}')`);
	});

	// Branch coverage: The hero uses the poster URL as fallback when no backdrop exists.
	it('uses posterUrl as fallback when no backdrop', () => {
		const posterUrl = '/poster.jpg';

		const { container } = render(DetailsHero, {
			props: { title: 'Inception', backdrop: '', posterUrl }
		});

		const section = container.querySelector('.details-hero');
		expect(section).toHaveStyle(`--details-hero-backdrop: url('${posterUrl}')`);
	});

	// Branch coverage: The hero uses the placeholder image when no backdrop and no poster URL exist.
	it('uses notAvailable.png as fallback when no backdrop and no posterUrl', () => {
		const { container } = render(DetailsHero, {
			props: { title: 'Inception', backdrop: '', posterUrl: '' }
		});

		const section = container.querySelector('.details-hero');
		expect(section).toHaveStyle(`--details-hero-backdrop: url('${notAvailable}')`);
	});

	// Statement coverage: The hero renders the poster image.
	it('renders poster image correctly', () => {
		const posterUrl = '/poster.jpg';

		render(DetailsHero, { props: { title: 'Inception', backdrop: '/backdrop.jpg', posterUrl } });

		const posterImg = screen.getByAltText('');
		expect(posterImg).toHaveAttribute('src', posterUrl);
	});

	// Branch coverage: The hero uses the placeholder poster when no poster URL exists.
	it('uses notAvailable.png as poster fallback', () => {
		render(DetailsHero, {
			props: { title: 'Inception', backdrop: '/backdrop.jpg', posterUrl: '' }
		});

		const posterImg = screen.getByAltText('');
		expect(posterImg).toHaveAttribute('src', notAvailable);
	});

	// Statement coverage: The hero sets the correct aria-labelledby.
	it('has correct aria-labelledby', () => {
		const { container } = render(DetailsHero, {
			props: { title: 'Inception', backdrop: '/backdrop.jpg', posterUrl: '/poster.jpg' }
		});

		const section = container.querySelector('[aria-labelledby="details-hero-title"]');
		expect(section).toHaveAttribute('aria-labelledby', 'details-hero-title');
	});

	// Statement coverage: The companies section sets the correct aria-labelledby.
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
