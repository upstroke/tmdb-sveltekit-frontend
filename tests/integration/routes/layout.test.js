import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';

import { getI18nLabels } from '$tests/mocks/i18n.mocks.js';
import Layout from '$routes/+layout.svelte';

// Mock for $app/state so page.url.origin is defined
vi.mock('$app/state', () => ({
	page: {
		url: new URL('https://example.com/')
	}
}));

describe('Layout (+layout.svelte)', () => {
	const labels = getI18nLabels();

	// Svelte 5: children is a snippet function
	const mockChildren = () => '<div data-testid="children">Mock Content</div>';

	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	// Statement coverage: HeaderMain with navigation is rendered
	it('renders HeaderMain with navigation', async () => {
		render(Layout, { props: { children: mockChildren } });

		await waitFor(() => {
			// HeaderMain should be rendered
			expect(screen.getByRole('banner')).toBeInTheDocument();
			// Navigation should contain the main items
			expect(screen.getByText(labels.home)).toBeInTheDocument();
			expect(screen.getByText(labels.movies)).toBeInTheDocument();
			expect(screen.getByText(labels.tvShows)).toBeInTheDocument();
		});
	});

	// Statement coverage: TypeHeadSearch is rendered in the header
	it('renders TypeHeadSearch in the header', async () => {
		render(Layout, { props: { children: mockChildren } });

		await waitFor(() => {
			// TypeHeadSearch should have a search input
			const searchInput = screen.getByRole('searchbox');
			expect(searchInput).toBeInTheDocument();
			expect(searchInput).toHaveAttribute('placeholder', labels.searchInput);
		});
	});

	// Statement coverage: FooterMain is rendered
	it('renders FooterMain', async () => {
		render(Layout, { props: { children: mockChildren } });

		await waitFor(() => {
			// FooterMain should be rendered
			expect(screen.getByRole('contentinfo')).toBeInTheDocument();
		});
	});

	// Statement coverage: children slot is embedded correctly
	it('embeds children slot correctly', async () => {
		const customChildren = () => '<div data-testid="custom-children">Custom Content</div>';

		render(Layout, { props: { children: customChildren } });

		// children should be rendered between HeaderMain and FooterMain
		await waitFor(() => {
			expect(screen.getByRole('banner')).toBeInTheDocument();
			expect(screen.getByRole('contentinfo')).toBeInTheDocument();
		});
	});

	// Statement coverage: navigation links have correct href paths
	it('navigation has correct paths', async () => {
		render(Layout, { props: { children: mockChildren } });

		await waitFor(() => {
			const homeLink = screen.getByRole('link', { name: labels.home });
			const moviesLink = screen.getByRole('link', { name: labels.movies });
			const tvShowsLink = screen.getByRole('link', { name: labels.tvShows });

			expect(homeLink).toHaveAttribute('href', '/');
			expect(moviesLink).toHaveAttribute('href', '/movies');
			expect(tvShowsLink).toHaveAttribute('href', '/tv-shows');
		});
	});

	// Statement coverage: favicon is set in svelte:head
	it('sets favicon in svelte:head', async () => {
		render(Layout, { props: { children: mockChildren } });

		await waitFor(() => {
			const favicon = document.querySelector('link[rel="icon"]');
			expect(favicon).toBeInTheDocument();
			expect(favicon).toHaveAttribute('href');
		});
	});
});
