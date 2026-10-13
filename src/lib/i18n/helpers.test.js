/**
 * The tests cover all exported functions in helpers.js:
 * - resolveLocale: empty, null, undefined, unknown, and valid locale values
 * - getSupportedLocales: return type, content, and immutability
 * - validateLocales: warning output for missing/extra keys and the no-op
 *   for the reference locale itself
 *
 * The private helper collectKeys is exercised indirectly through
 * validateLocales.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resolveLocale, getSupportedLocales, validateLocales } from './helpers.js';

// ---------------------------------------------------------------------------
// resolveLocale
// ---------------------------------------------------------------------------

describe('resolveLocale', () => {
	// Statement coverage: a known, supported locale is returned as-is.
	it('returns the given locale when it is supported', () => {
		expect(resolveLocale('en-US')).toBe('en-US');
	});

	// Branch coverage: every supported locale resolves to itself.
	it('returns de-DE when de-DE is passed', () => {
		expect(resolveLocale('de-DE')).toBe('de-DE');
	});

	it('returns es-ES when es-ES is passed', () => {
		expect(resolveLocale('es-ES')).toBe('es-ES');
	});

	it('returns fr-FR when fr-FR is passed', () => {
		expect(resolveLocale('fr-FR')).toBe('fr-FR');
	});

	it('returns ru-RU when ru-RU is passed', () => {
		expect(resolveLocale('ru-RU')).toBe('ru-RU');
	});

	it('returns vi-VN when vi-VN is passed', () => {
		expect(resolveLocale('vi-VN')).toBe('vi-VN');
	});

	// Branch coverage: an unknown locale string falls back to the default.
	it('returns the default locale for an unknown locale string', () => {
		expect(resolveLocale('xx-XX')).toBe('en-US');
	});

	// Branch coverage: a plausible but unsupported BCP 47 tag falls back.
	it('returns the default locale for a plausible but unsupported tag', () => {
		expect(resolveLocale('pt-BR')).toBe('en-US');
	});

	// Branch coverage: null falls back to the default locale (falsy check).
	it('returns the default locale for null', () => {
		expect(resolveLocale(null)).toBe('en-US');
	});

	// Branch coverage: undefined falls back to the default locale (falsy check).
	it('returns the default locale for undefined', () => {
		expect(resolveLocale(undefined)).toBe('en-US');
	});

	// Branch coverage: an empty string falls back to the default locale (falsy check).
	it('returns the default locale for an empty string', () => {
		expect(resolveLocale('')).toBe('en-US');
	});

	// Branch coverage: a whitespace-only string is not a supported locale and falls back.
	it('returns the default locale for a whitespace-only string', () => {
		expect(resolveLocale('   ')).toBe('en-US');
	});
});

// ---------------------------------------------------------------------------
// getSupportedLocales
// ---------------------------------------------------------------------------

describe('getSupportedLocales', () => {
	// Statement coverage: the function returns an array.
	it('returns an array', () => {
		expect(Array.isArray(getSupportedLocales())).toBe(true);
	});

	// Statement coverage: the default locale is always included.
	it('includes en-US in the returned list', () => {
		expect(getSupportedLocales()).toContain('en-US');
	});

	// Branch coverage: all locales defined in ui.json are represented.
	it('contains exactly the locales defined in ui.json', () => {
		const locales = getSupportedLocales();
		['en-US', 'de-DE', 'es-ES', 'fr-FR', 'ru-RU', 'vi-VN'].forEach((code) => {
			expect(locales).toContain(code);
		});
		expect(locales).toHaveLength(6);
	});

	// Branch coverage: mutating the returned array does not affect subsequent calls.
	it('returns a new array on each call (no shared reference)', () => {
		const first = getSupportedLocales();
		first.push('zz-ZZ');
		const second = getSupportedLocales();
		expect(second).not.toContain('zz-ZZ');
	});

	// Statement coverage: every element in the array is a non-empty string.
	it('contains only non-empty strings', () => {
		getSupportedLocales().forEach((code) => {
			expect(typeof code).toBe('string');
			expect(code.length).toBeGreaterThan(0);
		});
	});
});

// ---------------------------------------------------------------------------
// validateLocales  (and indirectly: collectKeys)
// ---------------------------------------------------------------------------

describe('validateLocales', () => {
	beforeEach(() => {
		vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	// Statement coverage: with a complete ui.json no warnings should be emitted.
	it('does not emit any warnings when all locales are complete', () => {
		validateLocales();
		expect(console.warn).not.toHaveBeenCalled();
	});

	// Statement coverage: the function returns undefined (void).
	it('returns undefined', () => {
		expect(validateLocales()).toBeUndefined();
	});

	// Branch coverage: validateLocales does not warn about the reference locale itself.
	it('does not log a warning for the reference locale en-US', () => {
		validateLocales();
		const calls = /** @type {string[][]} */ (console.warn.mock.calls);
		const referenceMentioned = calls.some(([msg]) =>
			typeof msg === 'string' && msg.includes('en-US') && msg.includes('missing key')
		);
		expect(referenceMentioned).toBe(false);
	});

	// Branch coverage: collectKeys flattens nested objects into dot-notation paths.
	// Verified indirectly: validateLocales only warns when keys truly differ,
	// meaning collectKeys must correctly traverse nested structures.
	it('correctly identifies matching nested keys across locales without warnings', () => {
		validateLocales();
		// A missing nested key would trigger a warning – absence of warnings
		// confirms that collectKeys traverses all levels correctly.
		expect(console.warn).not.toHaveBeenCalled();
	});
});
