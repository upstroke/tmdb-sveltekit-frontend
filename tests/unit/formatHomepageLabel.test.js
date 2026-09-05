import { describe, expect, it } from 'vitest';
import { formatHomepageLabel } from '$lib/utils/formatHomepageLabel';

/**
 * Test strategy: statement coverage.
 * The tests cover missing URLs, both protocols, and URLs
 * with path, query, and fragment.
 */
describe('formatHomepageLabel', () => {
	// Statement coverage: missing inputs return an empty string.
	it('returns an empty string for a missing URL', () => {
		expect(formatHomepageLabel()).toBe('');
	});

	// Statement coverage: https is removed from the display.
	it('removes the https protocol', () => {
		expect(formatHomepageLabel('https://example.com')).toBe('example.com');
	});

	// Statement coverage: http is removed from the display.
	// Statement coverage: HTTP URLs also go through the protocol removal branch.
	it('removes the http protocol', () => {
		expect(formatHomepageLabel('http://example.com')).toBe('example.com');
	});

	// Branch coverage: only the leading protocol is removed, the rest is preserved.
	it('removes only the leading protocol and preserves the remaining path', () => {
		expect(formatHomepageLabel('https://example.com/films?id=42#details')).toBe(
			'example.com/films?id=42#details'
		);
	});

	// Branch coverage: URLs without a protocol remain unchanged.
	it('leaves URLs without http or https protocol unchanged', () => {
		expect(formatHomepageLabel('www.example.com')).toBe('www.example.com');
	});
});
