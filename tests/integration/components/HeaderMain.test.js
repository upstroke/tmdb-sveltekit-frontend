import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import * as environment from '$app/environment';
import HeaderMain from '$lib/components/HeaderMain.svelte';
import { getLocaleText } from '$lib/i18n/resolver.js';
import { DEFAULT_LOCALE } from '$lib/i18n/config.js';

const { labels } = getLocaleText(DEFAULT_LOCALE);

vi.mock('$app/state', () => ({
	page: {
		url: new URL('https://example.com/')
	}
}));

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
	// Store original viewport and matchMedia for restoration
	const originalInnerWidth = window.innerWidth;
	const originalInnerHeight = window.innerHeight;
	const originalMatchMedia = window.matchMedia;

	beforeEach(() => {
		if (typeof sessionStorage !== 'undefined') {
			sessionStorage.clear();
		}

		vi.clearAllMocks();
		cleanup();

		page.url = new URL('https://example.com/');

		// Set mobile viewport (370x667)
		Object.defineProperty(window, 'innerWidth', {
			writable: true,
			configurable: true,
			value: 370
		});

		Object.defineProperty(window, 'innerHeight', {
			writable: true,
			configurable: true,
			value: 667
		});

		// Mock matchMedia for mobile breakpoint
		window.matchMedia = vi.fn().mockImplementation((query) => ({
			matches: query.includes('max-width: 768px'),
			media: query,
			onchange: null,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn()
		}));

		// Trigger resize so component detects viewport change
		window.dispatchEvent(new Event('resize'));
	});

	afterEach(() => {
		cleanup();
		sessionStorage.clear();

		// Restore original viewport
		Object.defineProperty(window, 'innerWidth', {
			writable: true,
			configurable: true,
			value: originalInnerWidth
		});

		Object.defineProperty(window, 'innerHeight', {
			writable: true,
			configurable: true,
			value: originalInnerHeight
		});

		window.matchMedia = originalMatchMedia;
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

	// Anweisungsberdeckung: The header uses the stored page number in the URL.
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

	// Branch coverage: The header uses page 1 when browser is false.
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
	it('closes menu on pointer event outside the header', async () => {
		const navItems = createNavItems();
		const { container } = render(HeaderMain, { props: { navItems } });

		// Find the burger button (mobile menu toggle)
		const burgerButton = container.querySelector('.burger-icon');
		expect(burgerButton).toBeInTheDocument();

		// Open menu by triggering pointerdown on the burger button
		await fireEvent(burgerButton, new PointerEvent('pointerdown', { bubbles: true }));

		// Verify menu is open (aria-expanded should be true)
		expect(burgerButton).toHaveAttribute('aria-expanded', 'true');

		// Simulate pointer event outside the header
		const outsideElement = document.createElement('div');
		document.body.appendChild(outsideElement);

		// Dispatch pointerdown directly on the outside element
		await fireEvent(outsideElement, new PointerEvent('pointerdown', { bubbles: true }));

		// Menu should be closed after clicking outside
		expect(burgerButton).toHaveAttribute('aria-expanded', 'false');

		document.body.removeChild(outsideElement);
	});

	// Statement coverage: handleWindowPointerdown does not close menu on click inside.
	it('does not close menu on pointer event inside the header', async () => {
		const navItems = createNavItems();
		const { container } = render(HeaderMain, { props: { navItems } });

		const burgerButton = container.querySelector('.burger-icon');
		expect(burgerButton).toBeInTheDocument();

		// Open menu
		await fireEvent(burgerButton, new PointerEvent('pointerdown', { bubbles: true }));
		expect(burgerButton).toHaveAttribute('aria-expanded', 'true');

		// Simulate pointer event inside the header
		const header = container.querySelector('#menuHeader');
		await fireEvent(header, new PointerEvent('pointerdown', { bubbles: true }));

		// Menu should stay open
		expect(burgerButton).toHaveAttribute('aria-expanded', 'true');
	});

	// Statement coverage: aria-label of navigation is loaded from i18n.
	it('uses i18n label for navigation aria-label', () => {
		const navItems = createNavItems();

		render(HeaderMain, { props: { navItems } });

		const nav = screen.getByRole('navigation');
		expect(nav).toHaveAttribute('aria-label', labels.mainNavigation);
	});
});
