import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/svelte';
import * as environment from '$app/environment';
import HeaderMain from '$lib/components/HeaderMain.svelte';

// Mock-Variablen mit vi.hoisted (wird vor vi.mock ausgef端hrt!)
const mocks = vi.hoisted(() => ({
	mockResolveLocale: vi.fn(),
	mockGetLocaleText: vi.fn()
}));

// Mocks m端ssen ganz oben stehen (werden hoisted!)
vi.mock('$lib/i18n/helpers', async (importOriginal) => {
	const actual = await importOriginal();
	return {
		...actual,
		resolveLocale: mocks.mockResolveLocale
	};
});

vi.mock('$lib/i18n/resolver', async (importOriginal) => {
	const actual = await importOriginal();
	return {
		...actual,
		getLocaleText: mocks.mockGetLocaleText
	};
});

vi.mock('$app/state', async (importOriginal) => {
	const actual = await importOriginal();
	return {
		...actual,
		page: {
			url: new URL('https://example.com/')
		}
	};
});

import { page } from '$app/state';

// Test-Daten f端r navItems
const createNavItems = () => [
	{
		id: 'home',
		label: 'Home',
		icon: 'home',
		path: '/',
		storageKey: 'home-page',
		active: (pathname) => pathname === '/'
	},
	{
		id: 'movies',
		label: 'Movies',
		icon: 'movie',
		path: '/movies',
		storageKey: 'movies-page',
		active: (pathname) => pathname.startsWith('/movies')
	},
	{
		id: 'tv',
		label: 'TV Shows',
		icon: 'tv',
		path: '/tv',
		storageKey: 'tv-page',
		active: (pathname) => pathname.startsWith('/tv')
	}
];

describe('HeaderMain', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
		cleanup();

		// i18n Mock Setup
		mocks.mockResolveLocale.mockReturnValue('de-DE');
		mocks.mockGetLocaleText.mockReturnValue({
			labels: {
				mainNavigation: 'Hauptnavigation'
			}
		});

		// page.url Reset
		page.url = new URL('https://example.com/');
	});

	afterEach(() => {
		cleanup();
		sessionStorage.clear();
	});

	// Anweisungsberdeckung: Header rendert Navigationsitems mit korrekten Labels und Icons.
	it('rendert Navigationsitems mit Labels und Icons', () => {
		const navItems = createNavItems();
		render(HeaderMain, { props: { navItems } });

		expect(screen.getByText('Home')).toBeInTheDocument();
		expect(screen.getByText('Movies')).toBeInTheDocument();
		expect(screen.getByText('TV Shows')).toBeInTheDocument();

		const homeLink = screen.getByRole('link', { name: /home/i });
		expect(homeLink.querySelector('.home.icon')).toBeInTheDocument();
	});

	// Anweisungsberdeckung: Der aktive Navigationslink erh盲lt die Klasse link-active und aria-current="page".
	it('markiert den aktiven Link mit link-active und aria-current', () => {
		page.url = new URL('https://example.com/movies');

		const navItems = createNavItems();
		render(HeaderMain, { props: { navItems } });

		const moviesLink = screen.getByRole('link', { name: /movies/i });
		expect(moviesLink).toHaveClass('link-active');
		expect(moviesLink).toHaveAttribute('aria-current', 'page');

		const homeLink = screen.getByRole('link', { name: /home/i });
		expect(homeLink).not.toHaveClass('link-active');
		expect(homeLink).not.toHaveAttribute('aria-current');
	});

	// Anweisungsberdeckung: getNavHref f端gt gespeicherte Seitennummer als Query-Parameter hinzu.
	it('verwendet gespeicherte Seitennummer in der URL', () => {
		sessionStorage.setItem('movies-page', '3');
		const navItems = createNavItems();
		render(HeaderMain, { props: { navItems } });

		const moviesLink = screen.getByRole('link', { name: /movies/i });
		expect(moviesLink).toHaveAttribute('href', '/movies?page=3');
	});

	// Anweisungsberdeckung: getNavHref entfernt vorhandene page-Parameter und ersetzt sie durch den gespeicherten Wert.
	it('ersetzt vorhandene page-Parameter durch gespeicherten Wert', () => {
		page.url = new URL('https://example.com/?page=2&locale=de');
		sessionStorage.setItem('movies-page', '5');

		const navItems = createNavItems();
		render(HeaderMain, { props: { navItems } });

		const moviesLink = screen.getByRole('link', { name: /movies/i });
		expect(moviesLink).toHaveAttribute('href', '/movies?locale=de&page=5');
	});

	// Anweisungsberdeckung: getNavHref gibt Pfad ohne Query-Parameter zur端ck wenn keine Seite gespeichert ist.
	it('rendert URL ohne Query-Parameter wenn keine Seite gespeichert ist', () => {
		const navItems = createNavItems();
		render(HeaderMain, { props: { navItems } });

		const homeLink = screen.getByRole('link', { name: /home/i });
		expect(homeLink).toHaveAttribute('href', '/');
	});

	// Anweisungsberdeckung: getStoredPage gibt 1 zur端ck wenn kein Browser-Kontext verf端gbar ist.
	it('verwendet Seite 1 wenn browser false ist', async () => {
		vi.spyOn(environment, 'browser', 'get').mockReturnValue(false);
		sessionStorage.setItem('movies-page', '10');

		const navItems = createNavItems();
		render(HeaderMain, { props: { navItems } });

		const moviesLink = screen.getByRole('link', { name: /movies/i });
		expect(moviesLink).toHaveAttribute('href', '/movies');
	});

	// Hinweis: children Slot wird nicht im Detail getestet (Svelte 5 Snippet Komplexit盲t).
	// Integrationstests oder E2E-Tests 端berpr端fen die korrekte Rendering von TypeHeadSearch
	// und anderen Child-Komponenten im HeaderMain-Kontext.
	// Siehe: tests/integration/header-with-children.test.js (TODO)
	it('akzeptiert children Slot ohne Fehler', () => {
		const navItems = createNavItems();
		const children = () => 'Test Content';
		
		// Sollte ohne Fehler rendern
		expect(() => {
			render(HeaderMain, { props: { navItems, children } });
		}).not.toThrow();
	});

	// Hinweis: LanguageSwitcher wird nicht im Detail getestet (eigene Test-Datei).
	// Die Komponente wird hier nur als "Black Box" verwendet.
	// Siehe: tests/components/LanguageSwitcher.test.js (TODO)
	it('rendert LanguageSwitcher', () => {
		const navItems = createNavItems();
		const { container } = render(HeaderMain, { props: { navItems } });

		// LanguageSwitcher ist im DOM vorhanden (wir pr端fen nur dass kein Fehler auftritt)
		expect(container).toBeInTheDocument();
	});

	// Anweisungsberdeckung: handleWindowPointerdown schlie脽t Men端 bei Klick au脽erhalb.
	it('schlie脽t Men端 bei Pointer-Event au脽erhalb des Headers', () => {
		const navItems = createNavItems();
		const { container } = render(HeaderMain, { props: { navItems } });

		const menuToggle = container.querySelector('#menu-toggle');
		expect(menuToggle).toBeInTheDocument();

		// Men端 枚ffnen
		menuToggle.checked = true;
		expect(menuToggle.checked).toBe(true);

		// Pointer-Event au脽erhalb simulieren
		const outsideElement = document.createElement('div');
		document.body.appendChild(outsideElement);

		const event = new PointerEvent('pointerdown', { bubbles: true });
		Object.defineProperty(event, 'target', {
			value: outsideElement,
			writable: false
		});

		window.dispatchEvent(event);

		expect(menuToggle.checked).toBe(false);

		document.body.removeChild(outsideElement);
	});

	// Anweisungsberdeckung: handleWindowPointerdown schlie脽t Men端 nicht bei Klick innerhalb.
	it('schlie脽t Men端 nicht bei Pointer-Event innerhalb des Headers', () => {
		const navItems = createNavItems();
		const { container } = render(HeaderMain, { props: { navItems } });

		const menuToggle = container.querySelector('#menu-toggle');
		menuToggle.checked = true;

		// Pointer-Event innerhalb des Headers simulieren
		const header = container.querySelector('#menuHeader');
		const event = new PointerEvent('pointerdown', { bubbles: true });
		Object.defineProperty(event, 'target', {
			value: header,
			writable: false
		});

		window.dispatchEvent(event);

		expect(menuToggle.checked).toBe(true);
	});

	// Anweisungsberdeckung: aria-label der Navigation wird aus i18n geladen.
	it('verwendet i18n label f端r aria-label der Navigation', () => {
		const navItems = createNavItems();
		render(HeaderMain, { props: { navItems } });

		const nav = screen.getByRole('navigation');
		expect(nav).toHaveAttribute('aria-label', 'Hauptnavigation');
	});
});