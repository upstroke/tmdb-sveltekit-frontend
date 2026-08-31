import { describe, expect, it } from 'vitest';
import { getDate, getImageUrl, getMediaType, getTitle } from '$lib/services/tmdb/helpers';

/**
 * Teststrategie: Anweisungs- und Zweigüberdeckung (Statement & Branch Coverage).
 * Gültige Eingaben: Die Tests decken die regulären Rückgabepfade mit erwarteten Werten ab.
 * Ungültige Eingaben / Fehlerfälle: Die Tests prüfen leere Werte, fehlende Felder und Rückfallverhalten.
 */
describe('tmdb helpers', () => {
	describe('getMediaType', () => {
		// Anweisungsüberdeckung: Fallback-Pfad wird ausgeführt.
		it('gibt den übergebenen Fallback-Medientyp zurück', () => {
			expect(getMediaType({ title: 'Inception', media_type: 'tv' }, 'movie')).toBe('movie');
		});

		// Zweigüberdeckung: media_type-Zweig wird geprüft.
		it('gibt den media_type des Eintrags zurück, wenn kein Fallback gesetzt ist', () => {
			expect(getMediaType({ media_type: 'tv' })).toBe('tv');
		});

		// Zweigüberdeckung: title-basierte Ableitung wird geprüft.
		it('leitet movie aus einem vorhandenen title ab', () => {
			expect(getMediaType({ title: 'Inception' })).toBe('movie');
		});

		// Zweigüberdeckung: name-basierte Ableitung wird geprüft.
		it('leitet tv aus einem vorhandenen name ab', () => {
			expect(getMediaType({ name: 'Dark' })).toBe('tv');
		});

		// Zweigüberdeckung: Kein Medientyp ermittelbar (else/null-Pfad).
		it('gibt null zurück, wenn kein Medientyp ermittelt werden kann', () => {
			expect(getMediaType({})).toBeNull();
		});
	});

	describe('getTitle', () => {
		// Anweisungsüberdeckung: title-Pfad wird ausgeführt.
		it('gibt den title eines Eintrags zurück', () => {
			expect(getTitle({ title: 'Inception', name: 'Dark' })).toBe('Inception');
		});

		// Zweigüberdeckung: name-Pfad wird geprüft.
		it('gibt den name zurück, wenn kein title vorhanden ist', () => {
			expect(getTitle({ name: 'Dark' })).toBe('Dark');
		});

		// Zweigüberdeckung: Weder title noch name (else-Pfad).
		it('gibt einen leeren String zurück, wenn weder title noch name vorhanden sind', () => {
			expect(getTitle({})).toBe('');
		});
	});

	describe('getDate', () => {
		// Anweisungsüberdeckung: release_date-Pfad wird ausgeführt.
		it('gibt das release_date eines Eintrags zurück', () => {
			expect(getDate({ release_date: '2010-07-16', first_air_date: '2017-12-01' })).toBe('2010-07-16');
		});

		// Zweigüberdeckung: first_air_date-Pfad wird geprüft.
		it('gibt das first_air_date zurück, wenn kein release_date vorhanden ist', () => {
			expect(getDate({ first_air_date: '2017-12-01' })).toBe('2017-12-01');
		});

		// Zweigüberdeckung: Kein Datum vorhanden (else-Pfad).
		it('gibt einen leeren String zurück, wenn kein Datum vorhanden ist', () => {
			expect(getDate({})).toBe('');
		});
	});

	describe('getImageUrl', () => {
		// Zweigüberdeckung: Leerer Pfad (früher return/else-Pfad).
		it('gibt einen leeren String zurück, wenn kein Pfad vorhanden ist', () => {
			expect(getImageUrl('')).toBe('');
		});

		// Anweisungsüberdeckung: Standardgröße w500 wird verwendet.
		it('baut mit der Standardgröße w500 eine vollständige Bild-URL', () => {
			expect(getImageUrl('/poster.jpg')).toBe('https://image.tmdb.org/t/p/w500/poster.jpg');
		});

		// Anweisungsüberdeckung: Explizite Größe wird verwendet.
		it('baut mit einer expliziten Größe eine vollständige Bild-URL', () => {
			expect(getImageUrl('/poster.jpg', 'w780')).toBe('https://image.tmdb.org/t/p/w780/poster.jpg');
		});
	});
});
