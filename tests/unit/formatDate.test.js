import { describe, expect, it } from 'vitest';
import { formatDate } from '$lib/utils/formatDate';

/**
 * The tests cover empty, invalid, incomplete, and valid date values
 * with different locales and indirectly verify the new helper functions
 * through various formatDate cases.
 */
describe('formatDate', () => {
	// Statement coverage: empty value returns an empty string.
	it('returns an empty string for an empty value', () => {
		expect(formatDate('')).toBe('');
	});

	// Branch coverage: non-parseable string returns the original value.
	it('returns the original value for a non-parseable string', () => {
		expect(formatDate('am-no-date')).toBe('am-no-date');
	});

	// Branch coverage: invalid calendar day is rejected by strict ISO check, but fallback still formats.
	it('formats an invalid calendar day via the general Date fallback', () => {
		expect(formatDate('2024-02-30')).toBe('3/1/2024');
	});

	// Branch coverage: empty ISO segments are rejected in digit check and returned unchanged.
	it('returns the original value for an ISO-like date with an empty segment', () => {
		expect(formatDate('2024--15')).toBe('2024--15');
	});

	// Branch coverage: invalid month remains invalid even in fallback.
	it('returns the original value for an invalid month', () => {
		expect(formatDate('2024-13-15')).toBe('2024-13-15');
	});

	// Branch coverage: incomplete year-month format is formatted by the general Date fallback.
	it('formats an incomplete ISO date in year-month format via the general Date fallback', () => {
		expect(formatDate('2024-01')).toBe('1/1/2024');
	});

	// Branch coverage: incomplete year format is formatted by the general Date fallback.
	it('formats an incomplete ISO date in year format via the general Date fallback', () => {
		expect(formatDate('2024')).toBe('1/1/2024');
	});

	// Branch coverage: invalid time returns the original value.
	it('returns the original value for a date with an invalid time', () => {
		expect(formatDate('2024-01-15T25:00:00')).toBe('2024-01-15T25:00:00');
	});

	// Branch coverage: hour 24 is converted to the next day by the general Date fallback.
	it('formats a date with hour 24 via the general Date fallback', () => {
		expect(formatDate('2024-01-15T24:00:00')).toBe('1/16/2024');
	});

	// Branch coverage: invalid minute returns the original value.
	it('returns the original value for a date with an invalid minute', () => {
		expect(formatDate('2024-01-15T10:60:00')).toBe('2024-01-15T10:60:00');
	});

	// Branch coverage: invalid seconds return the original value.
	it('returns the original value for a date with invalid seconds', () => {
		expect(formatDate('2024-01-15T10:00:60')).toBe('2024-01-15T10:00:60');
	});

	// Branch coverage: invalid timezone returns the original value.
	it('returns the original value for a date with an invalid timezone', () => {
		expect(formatDate('2024-01-15T10:00:00+25:00')).toBe('2024-01-15T10:00:00+25:00');
	});

	// Branch coverage: non-two-digit segments end up in fallback and become parseable there.
	it('formats ISO-like dates without two-digit month or day via the general Date fallback', () => {
		expect(formatDate('2024-1-15')).toBe('1/15/2024');
		expect(formatDate('2024-01-5')).toBe('1/5/2024');
	});

	// Statement coverage: complete ISO date with UTC time is formatted.
	it('formats a complete ISO date with UTC time', () => {
		expect(formatDate('2024-01-15T10:00:00Z', 'en-US')).toBe('1/15/2024');
	});

	// Statement coverage: complete ISO date with offset is formatted.
	it('formats a complete ISO date with timezone offset', () => {
		expect(formatDate('2024-01-15T10:00:00+02:00', 'en-US')).toBe('1/15/2024');
	});

	// Statement coverage: parseable date is formatted with the provided locale.
	it('formats a parseable date with the provided locale', () => {
		expect(formatDate('2024-01-15', 'en-US')).toBe('1/15/2024');
	});

	// Branch coverage: non-string values are already rejected in the first validation.
	it('returns an empty string for a value not passed as a string', () => {
		expect(formatDate(null)).toBe('');
	});

	// Statement coverage: a complete ISO date with negative offset remains valid and is formatted.
	it('formats a complete ISO date with negative timezone offset', () => {
		expect(formatDate('2024-01-15T10:00:00-05:00', 'en-US')).toBe('1/15/2024');
	});

	// Branch coverage: a time portion with too few segments remains invalid and is returned unchanged.
	it('returns the original value for a date with an incomplete time portion', () => {
		expect(formatDate('2024-01-15T10')).toBe('2024-01-15T10');
	});

	// Branch coverage: non-numeric time segments remain invalid and are returned unchanged.
	it('returns the original value for a date with non-numeric time segments', () => {
		expect(formatDate('2024-01-15TAB:00:00')).toBe('2024-01-15TAB:00:00');
	});
});
