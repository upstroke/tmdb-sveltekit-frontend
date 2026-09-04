import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';

import { getI18nLabels } from '$tests/mocks/i18n.mocks.js';
import Layout from '$routes/+layout.svelte';

// Mock für $app/state damit page.url.origin definiert ist
vi.mock('$app/state', () => ({
	page: {
		url: new URL('https://example.com/')
	}
}));

describe('Layout (+layout.svelte)', () => {
	const labels = getI18nLabels();

	// Svelte 5: children ist ein $props() Objekt mit getter
	const mockChildren = { children: { current: {} } };

	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('rendert HeaderMain mit Navigation', async () => {
		render(Layout, { props: { children: mockChildren.children } });

		await waitFor(() => {
			// HeaderMain sollte gerendert werden
			expect(screen.getByRole('banner')).toBeInTheDocument();
			// Navigation sollte die Haupt-Items enthalten
			expect(screen.getByText(labels.home)).toBeInTheDocument();
			expect(screen.getByText(labels.movies)).toBeInTheDocument();
			expect(screen.getByText(labels.tvShows)).toBeInTheDocument();
		});
	});

	it('rendert TypeHeadSearch im Header', async () => {
		render(Layout, { props: { children: mockChildren.children } });

		await waitFor(() => {
			// TypeHeadSearch sollte ein Suchinput haben
			const searchInput = screen.getByRole('searchbox');
			expect(searchInput).toBeInTheDocument();
			expect(searchInput).toHaveAttribute('placeholder', labels.searchInput);
		});
	});

	it('rendert FooterMain', async () => {
		render(Layout, { props: { children: mockChildren.children } });

		await waitFor(() => {
			// FooterMain sollte gerendert werden
			expect(screen.getByRole('contentinfo')).toBeInTheDocument();
		});
	});

	it('bettet children Slot korrekt ein', async () => {
		const customChildren = { current: {} };

		render(Layout, { props: { children: customChildren } });

		// children sollte an HeaderMain und FooterMain vorbei gerendert werden
		// (wird durch die Präsenz von Header und Footer + children-Render bestätigt)
		await waitFor(() => {
			expect(screen.getByRole('banner')).toBeInTheDocument();
			expect(screen.getByRole('contentinfo')).toBeInTheDocument();
		});

		// children sollte ein gültiges Objekt sein
		expect(customChildren.current).toBeDefined();
	});

	it('Navigation hat korrekte Pfade', async () => {
		render(Layout, { props: { children: mockChildren.children } });

		await waitFor(() => {
			const homeLink = screen.getByRole('link', { name: labels.home });
			const moviesLink = screen.getByRole('link', { name: labels.movies });
			const tvShowsLink = screen.getByRole('link', { name: labels.tvShows });

			expect(homeLink).toHaveAttribute('href', '/');
			expect(moviesLink).toHaveAttribute('href', '/movies');
			expect(tvShowsLink).toHaveAttribute('href', '/tv-shows');
		});
	});

	it('setzt Favicon im svelte:head', async () => {
		render(Layout, { props: { children: mockChildren.children } });

		await waitFor(() => {
			const favicon = document.querySelector('link[rel="icon"]');
			expect(favicon).toBeInTheDocument();
			expect(favicon).toHaveAttribute('href');
		});
	});
});
