import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import MediaTypeLabel from '$lib/components/MediaTypeLabel.svelte';
import uiJson from '$lib/i18n/ui.json';
import { DEFAULT_LOCALE } from '$lib/i18n/config';

// Mock für den i18n-Store (technische Abhängigkeit)
// Verwendet Labels direkt aus src/lib/i18n/ui.json für die konfigurierte DEFAULT_LOCALE
// Keys: /locales/{DEFAULT_LOCALE}/labels/movie und /locales/{DEFAULT_LOCALE}/labels/tvShow
const labels = uiJson.locales[DEFAULT_LOCALE].labels;

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
		// Anweisungsüberdeckung: render mit undefined, kein Label erwartet
		it('rendert kein Label bei undefined mediaType', () => {
			// Anweisungsüberdeckung
			render(MediaTypeLabel, { props: { mediaType: undefined } });
			expect(screen.queryByText(labels.movie)).toBeNull();
			expect(screen.queryByText(labels.tvShow)).toBeNull();
		});

		// Anweisungsüberdeckung: render mit null, kein Label erwartet
		it('rendert kein Label bei null mediaType', () => {
			// Anweisungsüberdeckung
			render(MediaTypeLabel, { props: { mediaType: null } });
			expect(screen.queryByText(labels.movie)).toBeNull();
			expect(screen.queryByText(labels.tvShow)).toBeNull();
		});

		// Anweisungsüberdeckung: render mit unbekanntem Typ, kein Label erwartet
		it('rendert kein Label bei unbekanntem mediaType', () => {
			// Anweisungsüberdeckung
			render(MediaTypeLabel, { props: { mediaType: 'unknown' } });
			expect(screen.queryByText(labels.movie)).toBeNull();
			expect(screen.queryByText(labels.tvShow)).toBeNull();
		});

		// Anweisungsüberdeckung: movie-Pfad mit Label, Text und Klassen
		it('rendert blaues Label für movie', () => {
			// Anweisungsüberdeckung
			render(MediaTypeLabel, { props: { mediaType: 'movie' } });
			const label = screen.getByText(labels.movie);
			expect(label).toBeInTheDocument();
			expect(label).toHaveClass('ui', 'label', 'blue');
		});

		// Anweisungsüberdeckung: tv-Pfad mit Label, Text und Klassen
		it('rendert türkises Label für tv', () => {
			// Anweisungsüberdeckung
			render(MediaTypeLabel, { props: { mediaType: 'tv' } });
			const label = screen.getByText(labels.tvShow);
			expect(label).toBeInTheDocument();
			expect(label).toHaveClass('ui', 'label', 'teal');
		});
	});

	describe('Zusatzfunktionen', () => {
		// Anweisungsüberdeckung: class-Prop wird angewendet
		it('wendet zusätzliche class-Prop korrekt an', () => {
			// Anweisungsüberdeckung
			render(MediaTypeLabel, {
				props: { mediaType: 'movie', class: 'featured-card-type' }
			});
			const label = screen.getByText(labels.movie);
			expect(label).toHaveClass('featured-card-type');
		});

		// Zweigüberdeckung: span-Tag und Klassenstruktur
		it('verwendet span-Tag mit korrekter Klassenstruktur', () => {
			// Zweigüberdeckung
			render(MediaTypeLabel, { props: { mediaType: 'tv' } });
			const label = screen.getByText(labels.tvShow);
			expect(label.tagName.toLowerCase()).toBe('span');
			expect(label.className).toMatch(/ui\s+label\s+teal/);
		});
	});
});
