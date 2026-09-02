import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import LoadMore from '$lib/components/LoadMore.svelte';
import { getI18nLabels } from '$tests/mocks/i18n.mocks.js';
import { cleanupAll, resetAll } from '$tests/setup/test-utils.js';

const labels = getI18nLabels();

vi.mock('$lib/stores/i18n', async () => ({
	i18n: {
		subscribe(run) {
			run({ messages: labels });
			return () => {};
		}
	}
}));

describe('LoadMore', () => {
	/**
	 * Testtechnik: Komponenten-Test mit Vitest
	 * - Happy Path: Button wird gerendert und ist klickbar
	 * - Negative FÃ¤lle: Button wird nicht gerendert, ist disabled
	 */

	beforeEach(() => {
		resetAll();
	});

	afterEach(() => {
		cleanupAll();
	});

	it('rendert keinen Button wenn hasMore=false', () => {
		// Arrange
		render(LoadMore, { props: { hasMore: false, loading: false, onload: null } });

		// Act + Assert
		expect(screen.queryByRole('button')).not.toBeInTheDocument();
	});

	it('rendert Button wenn hasMore=true', () => {
		// Arrange
		render(LoadMore, { props: { hasMore: true, loading: false, onload: null } });

		// Act + Assert
		const button = screen.getByRole('button');
		expect(button).toBeInTheDocument();
		expect(button).not.toBeDisabled();
	});

	it('zeigt LoadMore-Text wenn loading=false', () => {
		// Arrange
		render(LoadMore, { props: { hasMore: true, loading: false, onload: null } });

		// Act + Assert
		expect(screen.getByRole('button')).toHaveTextContent(labels.loadMore);
	});

	it('zeigt Lade-Text wenn loading=true', () => {
		// Arrange
		render(LoadMore, { props: { hasMore: true, loading: true, onload: null } });

		// Act + Assert
		expect(screen.getByRole('button')).toHaveTextContent(labels.loadMoreLoading);
	});

	it('ist disabled wenn loading=true', () => {
		// Arrange
		render(LoadMore, { props: { hasMore: true, loading: true, onload: null } });

		// Act + Assert
		expect(screen.getByRole('button')).toBeDisabled();
	});

	it('ruft onload auf beim Klick', async () => {
		// Arrange
		const onloadMock = vi.fn();
		render(LoadMore, { props: { hasMore: true, loading: false, onload: onloadMock } });

		// Act
		await fireEvent.click(screen.getByRole('button'));

		// Assert
		expect(onloadMock).toHaveBeenCalledTimes(1);
	});

	it('ruft onload NICHT auf wenn loading=true', async () => {
		// Arrange
		const onloadMock = vi.fn();
		render(LoadMore, { props: { hasMore: true, loading: true, onload: onloadMock } });

		// Act
		await fireEvent.click(screen.getByRole('button'));

		// Assert
		expect(onloadMock).not.toHaveBeenCalled();
	});

	it('ruft onload NICHT auf wenn onload=null', async () => {
		// Arrange
		render(LoadMore, { props: { hasMore: true, loading: false, onload: null } });

		// Act + Assert (kein Fehler beim Klick)
		await fireEvent.click(screen.getByRole('button'));
		expect(true).toBe(true);
	});
});
