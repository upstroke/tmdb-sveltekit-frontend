import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { i18nMockDefault, getI18nLabels } from '$tests/mocks/i18n.mocks.js';

// Labels from real ui.json (via mock helper)
const labels = getI18nLabels();

// Mock for the i18n store (MUST come before importing the component!)
vi.mock('$lib/stores/i18n', () => i18nMockDefault);

// Import component only after mocks
import MediaTypeLabel from '$lib/components/MediaTypeLabel.svelte';

describe('MediaTypeLabel', () => {
	describe('Rendering for different mediaType values', () => {
		it('does not render label for undefined mediaType', () => {
			render(MediaTypeLabel, { props: { mediaType: undefined } });
			expect(screen.queryByText(labels.movie)).toBeNull();
			expect(screen.queryByText(labels.tvShow)).toBeNull();
		});

		it('does not render label for null mediaType', () => {
			render(MediaTypeLabel, { props: { mediaType: null } });
			expect(screen.queryByText(labels.movie)).toBeNull();
			expect(screen.queryByText(labels.tvShow)).toBeNull();
		});

		it('does not render label for unknown mediaType', () => {
			render(MediaTypeLabel, { props: { mediaType: 'unknown' } });
			expect(screen.queryByText(labels.movie)).toBeNull();
			expect(screen.queryByText(labels.tvShow)).toBeNull();
		});

		it('renders blue label for movie', () => {
			render(MediaTypeLabel, { props: { mediaType: 'movie' } });
			const label = screen.getByText(labels.movie);
			expect(label).toBeInTheDocument();
			expect(label).toHaveClass('ui', 'label', 'blue');
		});

		it('renders teal label for tv', () => {
			render(MediaTypeLabel, { props: { mediaType: 'tv' } });
			const label = screen.getByText(labels.tvShow);
			expect(label).toBeInTheDocument();
			expect(label).toHaveClass('ui', 'label', 'teal');
		});
	});

	describe('Additional features', () => {
		it('applies additional class prop correctly', () => {
			render(MediaTypeLabel, {
				props: { mediaType: 'movie', class: 'featured-card-type' }
			});
			const label = screen.getByText(labels.movie);
			expect(label).toHaveClass('featured-card-type');
		});

		it('uses span tag with correct class structure', () => {
			render(MediaTypeLabel, { props: { mediaType: 'tv' } });
			const label = screen.getByText(labels.tvShow);
			expect(label.tagName.toLowerCase()).toBe('span');
			expect(label.className).toMatch(/ui\s+label\s+teal/);
		});
	});
});
