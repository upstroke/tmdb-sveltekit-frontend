import { describe, expect, it } from 'vitest';

import { getDate, getImageUrl, getMediaType, getTitle } from '$lib/services/tmdb/helpers.js';

describe('tmdb/helpers', () => {
	it('returns the explicit fallback media type before item-derived values', () => {
		// Äquivalenzklassenbildung: Ein expliziter Fallback übersteuert media_type und die Titel-/Namensableitung.
		expect(getMediaType({ media_type: 'tv', title: 'Inception', name: 'Ignored' }, 'movie')).toBe('movie');
	});

	it('returns the item media_type when no fallback is provided', () => {
		// Äquivalenzklassenbildung: Der vorhandene Medientyp aus dem Datensatz wird direkt übernommen.
		expect(getMediaType({ media_type: 'tv', title: 'Ignored' })).toBe('tv');
	});

	it('derives movie when title is present and no explicit media type exists', () => {
		// Äquivalenzklassenbildung: Ein Eintrag mit title wird als Film erkannt.
		expect(getMediaType({ title: 'Inception' })).toBe('movie');
	});

	it('derives tv when name is present and no title or explicit media type exists', () => {
		// Äquivalenzklassenbildung: Ein Eintrag mit name wird als Serie erkannt.
		expect(getMediaType({ name: 'Dark' })).toBe('tv');
	});

	it('returns null when media type cannot be determined', () => {
		// Äquivalenzklassenbildung: Ohne Fallback, media_type, title oder name ist kein Medientyp bestimmbar.
		expect(getMediaType({})).toBeNull();
	});

	it('returns title before name and falls back to an empty string', () => {
		// Äquivalenzklassenbildung: title hat Vorrang vor name; ohne beide Felder wird ein leerer String geliefert.
		expect(getTitle({ title: 'Inception', name: 'Ignored' })).toBe('Inception');
		expect(getTitle({ name: 'Dark' })).toBe('Dark');
		expect(getTitle({})).toBe('');
	});

	it('returns release_date before first_air_date and falls back to an empty string', () => {
		// Äquivalenzklassenbildung: release_date hat Vorrang vor first_air_date; ohne beide Felder wird ein leerer String geliefert.
		expect(getDate({ release_date: '2010-07-16', first_air_date: '2017-12-01' })).toBe('2010-07-16');
		expect(getDate({ first_air_date: '2017-12-01' })).toBe('2017-12-01');
		expect(getDate({})).toBe('');
	});

	it('returns an empty string for missing image paths and builds a full TMDB image URL otherwise', () => {
		// Grenzwertanalyse: Ein leerer, fehlender oder undefinierter Bildpfad liefert keine URL; ein vorhandener Pfad wird mit Standard- und Alternativgröße zusammengesetzt.
		expect(getImageUrl('')).toBe('');
		expect(getImageUrl(undefined)).toBe('');
		expect(getImageUrl(null)).toBe('');
		expect(getImageUrl('/poster.jpg')).toBe('https://image.tmdb.org/t/p/w500/poster.jpg');
		expect(getImageUrl('/poster.jpg', 'w780')).toBe('https://image.tmdb.org/t/p/w780/poster.jpg');
	});
});
