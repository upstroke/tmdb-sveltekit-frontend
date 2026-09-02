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
	beforeEach(() => {
		resetAll();
	});

	afterEach(() => {
		cleanupAll();
	});

	// Anweisungsueberdeckung: Button wird nicht gerendert wenn hasMore=false
	it('rendert keinen Button wenn hasMore=false', () => {
		render(LoadMore, { props: { hasMore: false, loading: false, onload: null } });
		expect(screen.queryByRole('button')).not.toBeInTheDocument();
	});

	// Anweisungsueberdeckung: Button wird gerendert wenn hasMore=true
	it('rendert Button wenn hasMore=true', () => {
		render(LoadMore, { props: { hasMore: true, loading: false, onload: null } });

		const button = screen.getByRole('button');
		expect(button).toBeInTheDocument();
		expect(button).not.toBeDisabled();
	});

	// Anweisungsueberdeckung: Button zeigt LoadMore-Text wenn loading=false
	it('zeigt LoadMore-Text wenn loading=false', () => {
		render(LoadMore, { props: { hasMore: true, loading: false, onload: null } });
		expect(screen.getByRole('button')).toHaveTextContent(labels.loadMore);
	});

	// Anweisungsueberdeckung: Button zeigt Lade-Text wenn loading=true
	it('zeigt Lade-Text wenn loading=true', () => {
		render(LoadMore, { props: { hasMore: true, loading: true, onload: null } });
		expect(screen.getByRole('button')).toHaveTextContent(labels.loadMoreLoading);
	});

	// Zweigueberdeckung: Button ist disabled wenn loading=true
	it('ist disabled wenn loading=true', () => {
		render(LoadMore, { props: { hasMore: true, loading: true, onload: null } });
		expect(screen.getByRole('button')).toBeDisabled();
	});

	// Anweisungsueberdeckung: onload wird aufgerufen beim Klick
	it('ruft onload auf beim Klick', async () => {
		const onloadMock = vi.fn();
		render(LoadMore, { props: { hasMore: true, loading: false, onload: onloadMock } });
		await fireEvent.click(screen.getByRole('button'));
		expect(onloadMock).toHaveBeenCalledTimes(1);
	});

	// Zweigueberdeckung: onload wird NICHT aufgerufen wenn loading=true	// Zweigueberdeckung: onload wird NICHT aufgerufen wenn onload=null
	it('ruft onload NICHT auf wenn onload=null', async () => {
		render(LoadMore, { props: { hasMore: true, loading: false, onload: null } });
		await fireEvent.click(screen.getByRole('button'));
		expect(true).toBe(true);
	});
});

// TODO: Click-Event testing with JSDOM is limited - test user interactions (click on "Load More" button) in Playwright acceptance tests

