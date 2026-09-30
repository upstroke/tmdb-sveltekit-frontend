/**
 * The tests cover all branches of getLocaleText in resolver.js:
 * - the default locale is used when no argument is provided
 * - a known locale returns locale-specific translations
 * - an unknown locale falls back to the default locale data
 * - the returned object always contains the required top-level keys
 * - individual translation values are correctly mapped
 */
import { describe, it, expect } from 'vitest';
import { getLocaleText } from './resolver.js';

describe('getLocaleText', () => {
	// Statement coverage: calling without arguments returns the default locale.
	it('returns en-US data when called without arguments', () => {
		const result = getLocaleText();
		expect(result.locale).toBe('en-US');
	});

	// Statement coverage: the returned object contains all required top-level keys.
	it('always returns an object with the required top-level keys', () => {
		const result = getLocaleText('en-US');
		['locale', 'labels', 'messages', 'titles', 'buttons', 'formats', 'fallbacks'].forEach(
			(key) => {
				expect(result).toHaveProperty(key);
			}
		);
	});

	// Branch coverage: a supported locale returns its own translation data.
	it('returns de-DE labels when de-DE is requested', () => {
		const result = getLocaleText('de-DE');
		expect(result.locale).toBe('de-DE');
		expect(result.labels.rating).toBe('Bewertung');
	});

	it('returns es-ES labels when es-ES is requested', () => {
		const result = getLocaleText('es-ES');
		expect(result.locale).toBe('es-ES');
		expect(result.labels.rating).toBe('Valoración');
	});

	it('returns fr-FR labels when fr-FR is requested', () => {
		const result = getLocaleText('fr-FR');
		expect(result.locale).toBe('fr-FR');
		expect(result.labels.rating).toBe('Note');
	});

	it('returns ru-RU labels when ru-RU is requested', () => {
		const result = getLocaleText('ru-RU');
		expect(result.locale).toBe('ru-RU');
		expect(result.labels.rating).toBe('Рейтинг');
	});

	it('returns vi-VN labels when vi-VN is requested', () => {
		const result = getLocaleText('vi-VN');
		expect(result.locale).toBe('vi-VN');
		expect(result.labels.rating).toBe('Đánh giá');
	});

	// Branch coverage: an unknown locale falls back to the default locale data.
	it('falls back to en-US data for an unknown locale', () => {
		const result = getLocaleText('xx-XX');
		expect(result.locale).toBe('xx-XX');
		expect(result.labels.rating).toBe('Rating');
	});

	// Branch coverage: null as argument is treated as missing and falls back.
	it('falls back to en-US data when null is passed', () => {
		const result = getLocaleText(null);
		expect(result.labels.rating).toBe('Rating');
	});

	// Statement coverage: the messages section is populated correctly.
	it('returns the correct messages for de-DE', () => {
		const result = getLocaleText('de-DE');
		expect(result.messages.loading).toBe('Lade Inhalte …');
	});

	// Statement coverage: the titles section is populated correctly.
	it('returns the correct titles for en-US', () => {
		const result = getLocaleText('en-US');
		expect(result.titles.home).toBe('Home');
	});

	// Statement coverage: the formats section is populated correctly.
	it('returns the correct formats for de-DE', () => {
		const result = getLocaleText('de-DE');
		expect(result.formats.minutes).toBe('Minuten');
	});

	// Statement coverage: the buttons section is populated correctly.
	it('returns the correct buttons for en-US', () => {
		const result = getLocaleText('en-US');
		expect(result.buttons.watchTrailer).toBe('Watch trailer {index}');
	});

	// Statement coverage: the fallbacks section is populated correctly.
	it('returns the correct fallbacks for en-US', () => {
		const result = getLocaleText('en-US');
		expect(result.fallbacks.notAvailable).toBe('N/A');
		expect(result.fallbacks.dateFallback).toBe('- -');
	});

	// Branch coverage: each supported locale returns its own fallback values.
	it('returns locale-specific fallback for es-ES', () => {
		const result = getLocaleText('es-ES');
		expect(result.fallbacks.notAvailable).toBe('N/D');
	});
});
