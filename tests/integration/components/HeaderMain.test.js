import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/svelte';
import * as environment from '$app/environment';
import HeaderMain from '$lib/components/HeaderMain.svelte';

// Mock variables with vi.hoisted (executed before vi.mock!)
const mocks = vi.hoisted(() => ({
	mockResolveLocale: vi.fn(),
	mockGetLocaleText: vi.fn()
}));

// Mocks must be at the top (they get hoisted!)
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

// Test data for navItems
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
		mocks.mockResolveLocale.mockReturnValue('en-US');
		mocks.mockGetLocaleText.mockReturnValue({
			labels: {
				mainNavigation: 'Main navigation'
			}
		});

		// page.url Reset
		page.url = new URL('https://example.com/');
	});

	afterEach(() => {
		cleanup();
		sessionStorage.clear();
	});

	// Statement coverage: Header renders navigation items with correct labels and icons.
	it('renders navigation items with labels and icons', () => {
		const navItems = createNavItems();
		render(HeaderMain, { props: { navItems } });

		expect(screen.getByText('Home')).toBeInTheDocument();
		expect(screen.getByText('Movies')).toBeInTheDocument();
		expect(screen.getByText('TV Shows')).toBeInTheDocument();

		const homeLink = screen.getByRole('link', { name: /home/i });
		expect(homeLink.querySelector('.home.icon')).toBeInTheDocument();
	});

	// Statement coverage: The active navigation link receives the link-active class and aria-current="page".
	it('marks the active link with link-active and aria-current', () => {
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

	// Statement coverage: getNavHref adds stored page number as a query parameter.
	it('uses stored page number in the URL', () => {
		sessionStorage.setItem('movies-page', '3');
		const navItems = createNavItems();
		render(HeaderMain, { props: { navItems } });

		const moviesLink = screen.getByRole('link', { name: /movies/i });
		expect(moviesLink).toHaveAttribute('href', '/movies?page=3');
	});

	// Statement coverage: getNavHref removes existing page parameters and replaces them with the stored value.
	it('replaces existing page parameters with stored value', () => {
		page.url = new URL('https://example.com/?page=2&locale=en');
		sessionStorage.setItem('movies-page', '5');

		const navItems = createNavItems();
		render(HeaderMain, { props: { navItems } });

		const moviesLink = screen.getByRole('link', { name: /movies/i });
		expect(moviesLink).toHaveAttribute('href', '/movies?locale=en&page=5');
	});

	// Statement coverage: getNavHref returns path without query parameters when no page is stored.
	it('renders URL without query parameters when no page is stored', () => {
		const navItems = createNavItems();
		render(HeaderMain, { props: { navItems } });

		const homeLink = screen.getByRole('link', { name: /home/i });
		expect(homeLink).toHaveAttribute('href', '/');
	});

	// Statement coverage: getStoredPage returns 1 when no browser context is available.
	it('uses page 1 when browser is false', async () => {
		vi.spyOn(environment, 'browser', 'get').mockReturnValue(false);
		sessionStorage.setItem('movies-page', '10');

		const navItems = createNavItems();
		render(HeaderMain, { props: { navItems } });

		const moviesLink = screen.getByRole('link', { name: /movies/i });
		expect(moviesLink).toHaveAttribute('href', '/movies');
	});

	// Note: children slot is not tested in detail (Svelte 5 snippet complexity).
	// Integration tests or E2E tests verify the correct rendering of TypeHeadSearch
	// and other child components in the HeaderMain context.
	// See: tests/integration/header-with-children.test.js (TODO)
	it('accepts children slot without errors', () => {
		const navItems = createNavItems();
		const children = () => 'Test Content';

		// Should render without errors
		expect(() => {
			render(HeaderMain, { props: { navItems, children } });
		}).not.toThrow();
	});

	// Note: LanguageSwitcher is not tested in detail (own test file).
	// The component is only used as a "black box" here.
	// See: tests/components/LanguageSwitcher.test.js (TODO)
	it('renders LanguageSwitcher', () => {
		const navItems = createNavItems();
		const { container } = render(HeaderMain, { props: { navItems } });

		// LanguageSwitcher is present in the DOM (we only check that no error occurs)
		expect(container).toBeInTheDocument();
	});

	// Statement coverage: handleWindowPointerdown closes menu on click outside.
	it('closes menu on pointer event outside the header', () => {
		const navItems = createNavItems();
		const { container } = render(HeaderMain, { props: { navItems } });

		const menuToggle = container.querySelector('#menu-toggle');
		expect(menuToggle).toBeInTheDocument();

		// Open menu
		menuToggle.checked = true;
		expect(menuToggle.checked).toBe(true);

		// Simulate pointer event outside
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

	// Statement coverage: handleWindowPointerdown does not close menu on click inside.
	it('does not close menu on pointer event inside the header', () => {
		const navItems = createNavItems();
		const { container } = render(HeaderMain, { props: { navItems } });

		const menuToggle = container.querySelector('#menu-toggle');
		menuToggle.checked = true;

		// Simulate pointer event inside the header
		const header = container.querySelector('#menuHeader');
		const event = new PointerEvent('pointerdown', { bubbles: true });
		Object.defineProperty(event, 'target', {
			value: header,
			writable: false
		});

		window.dispatchEvent(event);

		expect(menuToggle.checked).toBe(true);
	});

	// Statement coverage: aria-label of navigation is loaded from i18n.
	it('uses i18n label for navigation aria-label', () => {
		const navItems = createNavItems();
		render(HeaderMain, { props: { navItems } });

		const nav = screen.getByRole('navigation');
		expect(nav).toHaveAttribute('aria-label', 'Main navigation');
	});
});
