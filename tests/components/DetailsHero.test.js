import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import DetailsHero from '$lib/components/DetailsHero.svelte';
import { getLocaleText } from '$lib/i18n/resolver.js';
import { DEFAULT_LOCALE } from '$lib/i18n/config';
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

	// Anweisungsueberdeckung: Title wird korrekt gerendert
	it('rendert Title korrekt', () => {
		const title = 'Inception';
		const backdrop = '/backdrop.jpg';
		const posterUrl = '/poster.jpg';
		
		render(DetailsHero, { props: { title, backdrop, posterUrl } });
		
		expect(screen.getByText(title, { selector: 'h1#details-hero-title' })).toBeInTheDocument();
	});

	// Anweisungsueberdeckung: Title wird zu notAvailable wenn leer
	it('zeigt notAvailable-Text wenn title leer ist', () => {
		render(DetailsHero, { props: { title: '', backdrop: '/backdrop.jpg', posterUrl: '/poster.jpg' } });
		
		expect(screen.getByText(labels.notAvailable, { selector: 'h1#details-hero-title' })).toBeInTheDocument();
	});

	// Anweisungsueberdeckung: Title wird zu notAvailable wenn nur whitespace
	it('zeigt notAvailable-Text wenn title nur whitespace ist', () => {
		render(DetailsHero, { props: { title: '   ', backdrop: '/backdrop.jpg', posterUrl: '/poster.jpg' } });
		
		expect(screen.getByText(labels.notAvailable, { selector: 'h1#details-hero-title' })).toBeInTheDocument();
	});

	// Anweisungsueberdeckung: Produktionsfirmen werden gerendert
	it('rendert Produktionsfirmen', () => {
		const productionCompanies = [
			{ id: 1, name: 'Warner Bros.' },
			{ id: 2, name: 'Legendary Pictures' }
		];
		
		render(DetailsHero, { props: { 
			title: 'Inception', 
			backdrop: '/backdrop.jpg', 
			posterUrl: '/poster.jpg',
			productionCompanies 
		}});
		
		expect(screen.getByText('Warner Bros.')).toBeInTheDocument();
		expect(screen.getByText('Legendary Pictures')).toBeInTheDocument();
	});

	// Anweisungsueberdeckung: emptyLabel wird gerendert wenn keine Produktionsfirmen
	it('zeigt emptyLabel wenn keine Produktionsfirmen', () => {
		const emptyLabel = 'Keine Informationen';
		
		render(DetailsHero, { props: { 
			title: 'Inception', 
			backdrop: '/backdrop.jpg', 
			posterUrl: '/poster.jpg',
			productionCompanies: [],
			emptyLabel 
		}});
		
		expect(screen.getByText(emptyLabel, { selector: 'li.details-hero-company' })).toBeInTheDocument();
	});

	// Anweisungsueberdeckung: notAvailable-Text wird gerendert wenn emptyLabel leer und keine Produktionsfirmen
	it('zeigt notAvailable-Text wenn emptyLabel leer und keine Produktionsfirmen', () => {
		render(DetailsHero, { props: { 
			title: 'Inception', 
			backdrop: '/backdrop.jpg', 
			posterUrl: '/poster.jpg',
			productionCompanies: [],
			emptyLabel: '' 
		}});
		
		expect(screen.getByText(labels.notAvailable, { selector: 'li.details-hero-company' })).toBeInTheDocument();
	});

	// Anweisungsueberdeckung: Backdrop wird als Hintergrund verwendet
	it('setzt backdrop als Hintergrund', () => {
		const backdrop = '/backdrop.jpg';
		
		render(DetailsHero, { props: { title: 'Inception', backdrop, posterUrl: '/poster.jpg' } });
		
		const section = screen.getByLabelText('details-hero-title', { selector: 'section' });
		expect(section).toHaveStyle(`--details-hero-backdrop: url('${backdrop}')`);
	});

	// Anweisungsueberdeckung: Poster wird als Fallback verwendet wenn kein backdrop
	it('verwendet posterUrl als Fallback wenn kein backdrop', () => {
		const posterUrl = '/poster.jpg';
		
		render(DetailsHero, { props: { title: 'Inception', backdrop: '', posterUrl } });
		
		const section = screen.getByLabelText('details-hero-title', { selector: 'section' });
		expect(section).toHaveStyle(`--details-hero-backdrop: url('${posterUrl}')`);
	});

	// Anweisungsueberdeckung: notAvailable.png wird als Fallback verwendet wenn kein backdrop und kein posterUrl
	it('verwendet notAvailable.png als Fallback wenn kein backdrop und kein posterUrl', () => {
		render(DetailsHero, { props: { title: 'Inception', backdrop: '', posterUrl: '' } });
		
		const section = screen.getByLabelText('details-hero-title', { selector: 'section' });
		expect(section).toHaveStyle(`--details-hero-backdrop: url('${notAvailable}')`);
	});

	// Anweisungsueberdeckung: Poster-Bild wird korrekt gerendert
	it('rendert Poster-Bild korrekt', () => {
		const posterUrl = '/poster.jpg';
		
		render(DetailsHero, { props: { title: 'Inception', backdrop: '/backdrop.jpg', posterUrl } });
		
		const posterImg = screen.getByAltText('');
		expect(posterImg).toHaveAttribute('src', posterUrl);
	});

	// Anweisungsueberdeckung: notAvailable.png wird als Poster-Fallback verwendet
	it('verwendet notAvailable.png als Poster-Fallback', () => {
		render(DetailsHero, { props: { title: 'Inception', backdrop: '/backdrop.jpg', posterUrl: '' } });
		
		const posterImg = screen.getByAltText('');
		expect(posterImg).toHaveAttribute('src', notAvailable);
	});

	// Anweisungsueberdeckung: Section hat korrekte aria-labelledby
	it('hat korrekte aria-labelledby', () => {
		render(DetailsHero, { props: { title: 'Inception', backdrop: '/backdrop.jpg', posterUrl: '/poster.jpg' } });
		
		const section = screen.getByRole('region', { name: 'details-hero-title' });
		expect(section).toHaveAttribute('aria-labelledby', 'details-hero-title');
	});

	// Anweisungsueberdeckung: Companies Section hat korrekte aria-labelledby
	it('hat korrekte aria-labelledby fuer companies section', () => {
		render(DetailsHero, { props: { title: 'Inception', backdrop: '/backdrop.jpg', posterUrl: '/poster.jpg' } });
		
		expect(screen.getByLabelText('Produktionsfirmen')).toBeInTheDocument();
	});
});
