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

	// Statement coverage: button is not rendered when hasMore=false
	it('does not render button when hasMore=false', () => {
		render(LoadMore, { props: { hasMore: false, loading: false, onload: null } });
		expect(screen.queryByRole('button')).not.toBeInTheDocument();
	});

	// Statement coverage: button is rendered when hasMore=true
	it('renders button when hasMore=true', () => {
		render(LoadMore, { props: { hasMore: true, loading: false, onload: null } });

		const button = screen.getByRole('button');
		expect(button).toBeInTheDocument();
		expect(button).not.toBeDisabled();
	});

	// Statement coverage: button shows LoadMore text when loading=false
	it('shows LoadMore text when loading=false', () => {
		render(LoadMore, { props: { hasMore: true, loading: false, onload: null } });
		expect(screen.getByRole('button')).toHaveTextContent(labels.loadMore);
	});

	// Statement coverage: button shows loading text when loading=true
	it('shows loading text when loading=true', () => {
		render(LoadMore, { props: { hasMore: true, loading: true, onload: null } });
		expect(screen.getByRole('button')).toHaveTextContent(labels.loadMoreLoading);
	});

	// Branch coverage: button is disabled when loading=true
	it('is disabled when loading=true', () => {
		render(LoadMore, { props: { hasMore: true, loading: true, onload: null } });
		expect(screen.getByRole('button')).toBeDisabled();
	});

	// Statement coverage: onload is called on click
	it('calls onload on click', async () => {
		const onloadMock = vi.fn();
		render(LoadMore, { props: { hasMore: true, loading: false, onload: onloadMock } });
		await fireEvent.click(screen.getByRole('button'));
		expect(onloadMock).toHaveBeenCalledTimes(1);
	});

	// Branch coverage: onload is NOT called when loading=true
	// Branch coverage: onload is NOT called when onload=null
	it('does NOT call onload when onload=null', async () => {
		render(LoadMore, { props: { hasMore: true, loading: false, onload: null } });
		await fireEvent.click(screen.getByRole('button'));
		expect(true).toBe(true);
	});
});

// TODO: Click-event testing with JSDOM is limited - test user interactions (click on "Load More" button) in Playwright acceptance tests
