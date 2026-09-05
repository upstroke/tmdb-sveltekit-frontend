import { describe, expect, it } from 'vitest';

import { getCertificationMeta } from '$lib/utils/certificationMeta';

/**
 * These tests execute the statements of getCertificationMeta:
 * empty value, known rating, normalized rating system,
 * and unknown rating/system.
 */
describe('certificationMeta', () => {
	describe('getCertificationMeta', () => {
		// Statement coverage: empty/invalid values are checked.
		it('returns null when no value is present', () => {
			expect(getCertificationMeta()).toBeNull();
			expect(getCertificationMeta(null)).toBeNull();
			expect(getCertificationMeta('')).toBeNull();
			expect(getCertificationMeta('   ')).toBeNull();
		});

		// Statement coverage: known German age ratings are checked.
		it('returns metadata for known US age ratings', () => {
			expect(getCertificationMeta('PG-13')).toEqual({
				label: 'PG-13',
				description: 'Parents Strongly Cautioned',
				color: '#ef6c00',
				textColor: '#ffffff',
				value: "PG-13"
			});
		});

		// Statement coverage: normalization of the rating system is checked.
		it('normalizes the rating system and accepts lowercase letters and spaces', () => {
			expect(getCertificationMeta('PG-13', 'us')).toEqual({
				label: 'PG-13',
				description: 'Parents Strongly Cautioned',
				color: '#ef6c00',
				textColor: '#ffffff',
				value: 'PG-13'
			});
		});

		// Statement coverage: fallback for missing or invalid rating system.
		it('uses US as fallback for missing or invalid rating system', () => {
			expect(getCertificationMeta('XY', undefined)).toEqual({
				label: 'XY',
				color: 'transparent',
				textColor: 'inherit',
				value: 'XY'
			});

			expect(getCertificationMeta('XYZ', 'unknown')).toEqual({
				label: 'XYZ',
				color: 'transparent',
				textColor: 'inherit',
				value: 'XYZ'
			});
		});

		// Statement coverage: unknown ratings return neutral fallback metadata.
		it('returns a neutral fallback metadata structure for unknown ratings', () => {
			expect(getCertificationMeta('XYZ', 'US')).toEqual({
				label: 'XYZ',
				color: 'transparent',
				textColor: 'inherit',
				value: 'XYZ'
			});
		});

		// Statement coverage: trimming of the value is checked.
		it('trims only the value without corrupting known keys', () => {
			expect(getCertificationMeta('NR', 'US')).toEqual({
				value: 'NR',
				label: 'NR',
				description: 'Not Rated / Unrated',
				color: '#757575',
				textColor: '#ffffff'
			});
		});
	});
});
