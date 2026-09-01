import { describe, expect, it } from 'vitest';

import { getCertificationMeta } from '$lib/utils/certificationMeta';

/**
 * Die Tests führen die ausführbaren Anweisungen von
 * getCertificationMeta aus: leerer Wert, bekanntes Rating,
 * normalisiertes Rating-System sowie unbekanntes Rating/System.
 */
describe('certificationMeta', () => {
	describe('getCertificationMeta', () => {
		// Anweisungsüberdeckung: Leere/ungültige Werte werden geprüft.
		it('gibt null zurück, wenn kein Wert vorhanden ist', () => {
			expect(getCertificationMeta()).toBeNull();
			expect(getCertificationMeta(null)).toBeNull();
			expect(getCertificationMeta('')).toBeNull();
			expect(getCertificationMeta('   ')).toBeNull();
		});

		// Anweisungsüberdeckung: Bekannte deutsche Altersfreigaben werden geprüft.
		it('liefert Metadaten für bekannte deutsche Altersfreigaben', () => {
			expect(getCertificationMeta('12')).toEqual({
				value: '12',
				label: 'FSK 12',
				age: 12,
				color: '#4caf50',
				textColor: '#000000'
			});
		});

		// Anweisungsüberdeckung: Normalisierung des Rating-Systems wird geprüft.
		it('normalisiert das Rating-System und akzeptiert Kleinbuchstaben sowie Leerzeichen', () => {
			expect(getCertificationMeta('PG-13', ' us ')).toEqual({
				value: 'PG-13',
				label: 'PG-13',
				description: 'Parents Strongly Cautioned',
				color: '#ef6c00',
				textColor: '#ffffff'
			});
		});

		// Anweisungsüberdeckung: Fallback bei fehlendem oder ungültigem Rating-System.
		it('verwendet DE als Fallback bei fehlendem oder ungültigem Rating-System', () => {
			expect(getCertificationMeta('16', undefined)).toEqual({
				value: '16',
				label: 'FSK 16',
				age: 16,
				color: '#1976d2',
				textColor: '#ffffff'
			});

			expect(getCertificationMeta('16', 'unknown')).toEqual({
				value: '16',
				label: '16',
				color: 'transparent',
				textColor: 'inherit'
			});
		});

		// Anweisungsüberdeckung: Unbekannte Ratings führen zu neutralem Fallback.
		it('gibt bei unbekannten Ratings eine neutrale Fallback-Metadatenstruktur zurück', () => {
			expect(getCertificationMeta('XYZ', 'DE')).toEqual({
				value: 'XYZ',
				label: 'XYZ',
				color: 'transparent',
				textColor: 'inherit'
			});
		});

		// Anweisungsüberdeckung: Trimmen des Werts wird geprüft.
		it('trimmt nur den Wert, ohne bekannte Schlüssel zu verfälschen', () => {
			expect(getCertificationMeta('  NR  ', 'US')).toEqual({
				value: 'NR',
				label: 'NR',
				description: 'Not Rated / Unrated',
				color: '#757575',
				textColor: '#ffffff'
			});
		});
	});
});
