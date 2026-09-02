import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import MediaTypeLabel from '$lib/components/MediaTypeLabel.svelte';
import uiJson from '$lib/i18n/ui.json';

// Mock für den i18n-Store (technische Abhngigkeit)
// Verwendet Labels direkt aus src/lib/i18n/ui.json
// Keys: /locales/de-DE/labels/movie und /locales/de-DE/labels/tvShow
const labels = uiJson.locales['de-DE'].labels;

vi.mock('$lib/stores/i18n', () => ({
	i18n: {
		subscribe(run) {
			run({
				labels: {
					movie: labels.movie,
					tvShow: labels.tvShow
				}
			});
			return () => {};
		}
	}
}));

describe('MediaTypeLabel', () => {
	describe('Rendering bei verschiedenen mediaType-Werten', () => {
		// Anweisungsberdeckung: render mit undefined, kein Label erwartet
		it('rendert kein Label bei undefined mediaType', () => {
			// Anweisungsberdeckung
			render(MediaTypeLabel, { props: { mediaType: undefined } });
			expect(screen.queryByRole('generic')).toBeNull();
		});

		// Anweisungsberdeckung: render mit null, kein Label erwartet
		it('rendert kein Label bei null mediaType', () => {
			// Anweisungsberdeckung
			render(MediaTypeLabel, { props: { mediaType: null } });
			expect(screen.queryByRole('generic')).toBeNull();
		});

		// Anweisungsberdeckung: render mit unbekanntem Typ, kein Label erwartet
		it('rendert kein Label bei unbekanntem mediaType', () => {
			// Anweisungsberdeckung
			render(MediaTypeLabel, { props: { mediaType: 'unknown' } });
			expect(screen.queryByRole('generic')).toBeNull();
		});

		// Anweisungsberdeckung: movie-Pfad mit Label, Text und Klassen
		it('rendert blaues Label für movie', () => {
			// Anweisungsberdeckung
			render(MediaTypeLabel, { props: { mediaType: 'movie' } });
			const label = screen.getByText(labels.movie);
			expect(label).toBeInTheDocument();
			expect(label).toHaveClass('ui', 'label', 'blue');
		});

		// Anweisungsberdeckung: tv-Pfad mit Label, Text und Klassen
		it('rendert türkises Label für tv', () => {
			// Anweisungsberdeckung
			render(MediaTypeLabel, { props: { mediaType: 'tv' } });
			const label = screen.getByText(labels.tvShow);
			expect(label).toBeInTheDocument();
			expect(label).toHaveClass('ui', 'label', 'teal');
		});
	});

	describe('Zusatzfunktionen', () => {
		// Anweisungsberdeckung: class-Prop wird angewendet
		it('wendet zusätzliche class-Prop korrekt an', () => {
			// Anweisungsberdeckung
			render(MediaTypeLabel, {
				props: { mediaType: 'movie', class: 'featured-card-type' }
			});
			const label = screen.getByText(labels.movie);
			expect(label).toHaveClass('featured-card-type');
		});

		// Zweigberdeckung: span-Tag und Klassenstruktur
		it('verwendet span-Tag mit korrekter Klassenstruktur', () => {
			// Zweigberdeckung
			render(MediaTypeLabel, { props: { mediaType: 'tv' } });
			const label = screen.getByText(labels.tvShow);
			expect(label.tagName.toLowerCase()).toBe('span');
			expect(label.className).toMatch(/ui\s+label\s+teal/);
		});
	});
});
