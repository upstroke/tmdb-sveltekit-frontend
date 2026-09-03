import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { i18nMockDefault, getI18nLabels } from '$tests/mocks/i18n.mocks.js';

// Labels aus echtem ui.json (über Mock-Helper)
const labels = getI18nLabels();

// Mock für den i18n-Store (MUSS vor dem Import der Komponente kommen!)
vi.mock('$lib/stores/i18n', () => i18nMockDefault);

// Erst jetzt Komponente importieren
import MediaTypeLabel from '$lib/components/MediaTypeLabel.svelte';

describe('MediaTypeLabel', () => {
	describe('Rendering bei verschiedenen mediaType-Werten', () => {
		it('rendert kein Label bei undefined mediaType', () => {
			render(MediaTypeLabel, { props: { mediaType: undefined } });
			expect(screen.queryByText(labels.movie)).toBeNull();
			expect(screen.queryByText(labels.tvShow)).toBeNull();
		});

		it('rendert kein Label bei null mediaType', () => {
			render(MediaTypeLabel, { props: { mediaType: null } });
			expect(screen.queryByText(labels.movie)).toBeNull();
			expect(screen.queryByText(labels.tvShow)).toBeNull();
		});

		it('rendert kein Label bei unbekanntem mediaType', () => {
			render(MediaTypeLabel, { props: { mediaType: 'unknown' } });
			expect(screen.queryByText(labels.movie)).toBeNull();
			expect(screen.queryByText(labels.tvShow)).toBeNull();
		});

		it('rendert blaues Label für movie', () => {
			render(MediaTypeLabel, { props: { mediaType: 'movie' } });
			const label = screen.getByText(labels.movie);
			expect(label).toBeInTheDocument();
			expect(label).toHaveClass('ui', 'label', 'blue');
		});

		it('rendert türkises Label für tv', () => {
			render(MediaTypeLabel, { props: { mediaType: 'tv' } });
			const label = screen.getByText(labels.tvShow);
			expect(label).toBeInTheDocument();
			expect(label).toHaveClass('ui', 'label', 'teal');
		});
	});

	describe('Zusatzfunktionen', () => {
		it('wendet zusätzliche class-Prop korrekt an', () => {
			render(MediaTypeLabel, {
				props: { mediaType: 'movie', class: 'featured-card-type' }
			});
			const label = screen.getByText(labels.movie);
			expect(label).toHaveClass('featured-card-type');
		});

		it('verwendet span-Tag mit korrekter Klassenstruktur', () => {
			render(MediaTypeLabel, { props: { mediaType: 'tv' } });
			const label = screen.getByText(labels.tvShow);
			expect(label.tagName.toLowerCase()).toBe('span');
			expect(label.className).toMatch(/ui\s+label\s+teal/);
		});
	});
});
