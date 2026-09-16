import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { cleanupAll, resetAll } from '$tests/setup/test-utils.js';

import TabGroupe from '$lib/components/TabGroupe.svelte';

vi.mock('$lib/stores/i18n', () => ({
	i18n: {
		subscribe: vi.fn((fn) => {
			fn({
				labels: { firstAirDate: 'First air date' },
				messages: { loading: 'Loading…' }
			});
			return () => {};
		})
	}
}));

vi.mock('$app/state', () => ({
	page: {
		url: new URL('http://localhost:3000/'),
		params: {}
	}
}));

vi.mock('$lib/i18n/config.js', () => ({
	DEFAULT_LOCALE: 'en'
}));

vi.mock('$lib/utils/formatDate.js', () => ({
	formatDate: vi.fn((date) => date ?? '')
}));

const tabs = [
	{
		id: 'season-1',
		label: 'Season 1',
		episodes: [
			{ episode_number: 1, name: 'Pilot', overview: 'The beginning.', air_date: '2021-01-01' },
			{ episode_number: 2, name: 'Follow-Up', overview: 'The sequel.', air_date: '2021-01-08' },
			{ episode_number: 3, name: 'Finale', overview: 'The end.', air_date: '2021-01-15' }
		]
	},
	{
		id: 'season-2',
		label: 'Season 2',
		episodes: [
			{ episode_number: 1, name: 'New Start', overview: 'Season 2 begins.', air_date: '2022-01-01' }
		]
	},
	{ id: 'season-3', label: 'Season 3', content: 'No episodes yet.' }
];

describe('TabGroupe', () => {
	beforeEach(() => {
		resetAll();
	});

	afterEach(() => {
		cleanupAll();
	});

	// ---------------------------------------------------------------------------
	// Rendering
	// ---------------------------------------------------------------------------

	// Statement coverage: The tablist and all tab buttons are rendered.
	it('renders all tabs with correct roles and labels', () => {
		render(TabGroupe, { props: { tabs, ariaLabel: 'Seasons' } });

		expect(screen.getByRole('tablist')).toBeInTheDocument();

		const tabButtons = screen.getAllByRole('tab');
		expect(tabButtons).toHaveLength(3);
		expect(tabButtons[0]).toHaveTextContent('Season 1');
		expect(tabButtons[1]).toHaveTextContent('Season 2');
		expect(tabButtons[2]).toHaveTextContent('Season 3');
	});

	// Statement coverage: The tablist carries the ariaLabel prop.
	it('applies the ariaLabel to the tablist', () => {
		render(TabGroupe, { props: { tabs, ariaLabel: 'Seasons' } });

		expect(screen.getByRole('tablist')).toHaveAttribute('aria-label', 'Seasons');
	});

	// Statement coverage: The first tab is selected and has tabindex=0 by default.
	it('marks the first tab as selected by default', () => {
		render(TabGroupe, { props: { tabs, ariaLabel: 'Seasons' } });

		const tabButtons = screen.getAllByRole('tab');
		expect(tabButtons[0]).toHaveAttribute('aria-selected', 'true');
		expect(tabButtons[1]).toHaveAttribute('aria-selected', 'false');
		expect(tabButtons[2]).toHaveAttribute('aria-selected', 'false');
	});

	// Statement coverage: Only the active tab has tabindex=0; all others have tabindex=-1.
	it('sets tabindex=0 on the active tab and tabindex=-1 on inactive tabs', () => {
		render(TabGroupe, { props: { tabs, ariaLabel: 'Seasons' } });

		const tabButtons = screen.getAllByRole('tab');
		expect(tabButtons[0]).toHaveAttribute('tabindex', '0');
		expect(tabButtons[1]).toHaveAttribute('tabindex', '-1');
		expect(tabButtons[2]).toHaveAttribute('tabindex', '-1');
	});

	// Branch coverage: initialTab prop sets a different tab as active.
	it('activates the tab specified by initialTab', () => {
		render(TabGroupe, { props: { tabs, ariaLabel: 'Seasons', initialTab: 'season-2' } });

		const tabButtons = screen.getAllByRole('tab');
		expect(tabButtons[1]).toHaveAttribute('aria-selected', 'true');
		expect(tabButtons[0]).toHaveAttribute('aria-selected', 'false');
	});

	// Statement coverage: The active tabpanel is visible; inactive panels are hidden.
	it('shows the active tabpanel and hides inactive ones', () => {
		render(TabGroupe, { props: { tabs, ariaLabel: 'Seasons' } });

		const panels = screen.getAllByRole('tabpanel', { hidden: true });
		expect(panels[0]).not.toHaveAttribute('hidden');
		expect(panels[1]).toHaveAttribute('hidden');
		expect(panels[2]).toHaveAttribute('hidden');
	});

	// Statement coverage: Episodes are rendered inside the active tabpanel.
	it('renders episode items inside the active tabpanel', () => {
		render(TabGroupe, { props: { tabs, ariaLabel: 'Seasons' } });

		expect(screen.getByText('1. Pilot')).toBeInTheDocument();
		expect(screen.getByText('2. Follow-Up')).toBeInTheDocument();
		expect(screen.getByText('3. Finale')).toBeInTheDocument();
	});

	// Branch coverage: A tab with only content (no episodes) renders the content text.
	it('renders content text when a tab has no episodes array', () => {
		render(TabGroupe, {
			props: { tabs, ariaLabel: 'Seasons', initialTab: 'season-3' }
		});

		expect(screen.getByText('No episodes yet.')).toBeInTheDocument();
	});

	// Branch coverage: A tab with an empty episodes array renders the content fallback.
	it('renders content text when episodes array is empty', () => {
		const tabsWithEmpty = [
			{ id: 'season-1', label: 'Season 1', episodes: [], content: 'No data.' }
		];
		render(TabGroupe, { props: { tabs: tabsWithEmpty, ariaLabel: 'Seasons' } });

		expect(screen.getByText('No data.')).toBeInTheDocument();
	});

	// ---------------------------------------------------------------------------
	// Tab keyboard navigation (tablist)
	// ---------------------------------------------------------------------------

	// Statement coverage: ArrowRight moves focus and selection to the next tab.
	it('moves focus to the next tab on ArrowRight', async () => {
		const user = userEvent.setup();
		render(TabGroupe, { props: { tabs, ariaLabel: 'Seasons' } });

		const tabButtons = screen.getAllByRole('tab');
		tabButtons[0].focus();
		await user.keyboard('{ArrowRight}');

		expect(tabButtons[1]).toHaveFocus();
		expect(tabButtons[1]).toHaveAttribute('aria-selected', 'true');
		expect(tabButtons[1]).toHaveAttribute('tabindex', '0');
	});

	// Statement coverage: ArrowLeft moves focus and selection to the previous tab.
	it('moves focus to the previous tab on ArrowLeft', async () => {
		const user = userEvent.setup();
		render(TabGroupe, { props: { tabs, ariaLabel: 'Seasons' } });

		const tabButtons = screen.getAllByRole('tab');
		tabButtons[1].focus();
		await user.keyboard('{ArrowLeft}');

		expect(tabButtons[0]).toHaveFocus();
		expect(tabButtons[0]).toHaveAttribute('aria-selected', 'true');
	});

	// Branch coverage: ArrowRight on the last tab wraps around to the first.
	it('wraps from the last tab to the first on ArrowRight', async () => {
		const user = userEvent.setup();
		render(TabGroupe, { props: { tabs, ariaLabel: 'Seasons' } });

		const tabButtons = screen.getAllByRole('tab');
		tabButtons[2].focus();
		await user.keyboard('{ArrowRight}');

		expect(tabButtons[0]).toHaveFocus();
	});

	// Branch coverage: ArrowLeft on the first tab wraps around to the last.
	it('wraps from the first tab to the last on ArrowLeft', async () => {
		const user = userEvent.setup();
		render(TabGroupe, { props: { tabs, ariaLabel: 'Seasons' } });

		const tabButtons = screen.getAllByRole('tab');
		tabButtons[0].focus();
		await user.keyboard('{ArrowLeft}');

		expect(tabButtons[2]).toHaveFocus();
	});

	// Statement coverage: Home moves focus to the first tab.
	it('jumps to the first tab on Home', async () => {
		const user = userEvent.setup();
		render(TabGroupe, { props: { tabs, ariaLabel: 'Seasons' } });

		const tabButtons = screen.getAllByRole('tab');
		tabButtons[2].focus();
		await user.keyboard('{Home}');

		expect(tabButtons[0]).toHaveFocus();
	});

	// Statement coverage: End moves focus to the last tab.
	it('jumps to the last tab on End', async () => {
		const user = userEvent.setup();
		render(TabGroupe, { props: { tabs, ariaLabel: 'Seasons' } });

		const tabButtons = screen.getAllByRole('tab');
		tabButtons[0].focus();
		await user.keyboard('{End}');

		expect(tabButtons[2]).toHaveFocus();
	});

	// Branch coverage: Tab key is not intercepted – focus leaves the tablist.
	it('does not trap the Tab key – focus leaves the tablist on Tab', async () => {
		const user = userEvent.setup();
		render(TabGroupe, { props: { tabs, ariaLabel: 'Seasons' } });

		const tabButtons = screen.getAllByRole('tab');
		tabButtons[0].focus();
		await user.keyboard('{Tab}');

		expect(tabButtons[0]).not.toHaveFocus();
		expect(tabButtons[1]).not.toHaveFocus();
		expect(tabButtons[2]).not.toHaveFocus();
	});

	// Statement coverage: Clicking a tab activates it and updates aria-selected.
	it('activates a tab on click and updates aria-selected', async () => {
		const user = userEvent.setup();
		render(TabGroupe, { props: { tabs, ariaLabel: 'Seasons' } });

		const tabButtons = screen.getAllByRole('tab');
		await user.click(tabButtons[1]);

		expect(tabButtons[1]).toHaveAttribute('aria-selected', 'true');
		expect(tabButtons[0]).toHaveAttribute('aria-selected', 'false');
		expect(tabButtons[1]).toHaveAttribute('tabindex', '0');
		expect(tabButtons[0]).toHaveAttribute('tabindex', '-1');
	});

	// Statement coverage: onTabSelect callback fires when a tab is selected.
	it('fires onTabSelect callback when a tab is selected', async () => {
		const user = userEvent.setup();
		const onTabSelect = vi.fn();
		render(TabGroupe, { props: { tabs, ariaLabel: 'Seasons', onTabSelect } });

		const tabButtons = screen.getAllByRole('tab');
		await user.click(tabButtons[1]);

		expect(onTabSelect).toHaveBeenCalledOnce();
		expect(onTabSelect).toHaveBeenCalledWith('season-2');
	});

	// ---------------------------------------------------------------------------
	// Episode list keyboard navigation (tabpanel)
	// ---------------------------------------------------------------------------

	// Statement coverage: The first episode item has tabindex=0; others have tabindex=-1.
	it('sets tabindex=0 on the first episode and tabindex=-1 on others', () => {
		render(TabGroupe, { props: { tabs, ariaLabel: 'Seasons' } });

		const items = document.querySelectorAll('.episode-item');
		expect(items[0]).toHaveAttribute('tabindex', '0');
		expect(items[1]).toHaveAttribute('tabindex', '-1');
		expect(items[2]).toHaveAttribute('tabindex', '-1');
	});

	// Statement coverage: ArrowDown moves focus to the next episode item.
	it('moves focus to the next episode on ArrowDown', async () => {
		const user = userEvent.setup();
		render(TabGroupe, { props: { tabs, ariaLabel: 'Seasons' } });

		const items = document.querySelectorAll('.episode-item');
		items[0].focus();
		await user.keyboard('{ArrowDown}');

		expect(items[1]).toHaveFocus();
		expect(items[1]).toHaveAttribute('tabindex', '0');
		expect(items[0]).toHaveAttribute('tabindex', '-1');
	});

	// Statement coverage: ArrowUp moves focus to the previous episode item.
	it('moves focus to the previous episode on ArrowUp', async () => {
		const user = userEvent.setup();
		render(TabGroupe, { props: { tabs, ariaLabel: 'Seasons' } });

		const items = document.querySelectorAll('.episode-item');
		items[1].focus();
		await user.keyboard('{ArrowUp}');

		expect(items[0]).toHaveFocus();
	});

	// Branch coverage: ArrowDown on the last episode wraps to the first.
	it('wraps from the last episode to the first on ArrowDown', async () => {
		const user = userEvent.setup();
		render(TabGroupe, { props: { tabs, ariaLabel: 'Seasons' } });

		const items = document.querySelectorAll('.episode-item');
		items[2].focus();
		await user.keyboard('{ArrowDown}');

		expect(items[0]).toHaveFocus();
	});

	// Branch coverage: ArrowUp on the first episode wraps to the last.
	it('wraps from the first episode to the last on ArrowUp', async () => {
		const user = userEvent.setup();
		render(TabGroupe, { props: { tabs, ariaLabel: 'Seasons' } });

		const items = document.querySelectorAll('.episode-item');
		items[0].focus();
		await user.keyboard('{ArrowUp}');

		expect(items[2]).toHaveFocus();
	});

	// Statement coverage: Home moves focus to the first episode.
	it('jumps to the first episode on Home', async () => {
		const user = userEvent.setup();
		render(TabGroupe, { props: { tabs, ariaLabel: 'Seasons' } });

		const items = document.querySelectorAll('.episode-item');
		items[2].focus();
		await user.keyboard('{Home}');

		expect(items[0]).toHaveFocus();
	});

	// Statement coverage: End moves focus to the last episode.
	it('jumps to the last episode on End', async () => {
		const user = userEvent.setup();
		render(TabGroupe, { props: { tabs, ariaLabel: 'Seasons' } });

		const items = document.querySelectorAll('.episode-item');
		items[0].focus();
		await user.keyboard('{End}');

		expect(items[2]).toHaveFocus();
	});

	// Branch coverage: Tab key is not intercepted inside the episode list.
	it('does not trap the Tab key inside the episode list', async () => {
		const user = userEvent.setup();
		render(TabGroupe, { props: { tabs, ariaLabel: 'Seasons' } });

		const items = document.querySelectorAll('.episode-item');
		items[0].focus();
		await user.keyboard('{Tab}');

		expect(items[0]).not.toHaveFocus();
		expect(items[1]).not.toHaveFocus();
		expect(items[2]).not.toHaveFocus();
	});

	// Branch coverage: Switching tabs resets the focused episode index to 0.
	it('resets focused episode index to 0 when switching tabs', async () => {
		const user = userEvent.setup();
		render(TabGroupe, { props: { tabs, ariaLabel: 'Seasons' } });

		// Navigate to episode 2 in Season 1.
		const items = document.querySelectorAll('.episode-item');
		items[0].focus();
		await user.keyboard('{ArrowDown}');

		// Switch to Season 2 and back.
		const tabButtons = screen.getAllByRole('tab');
		await user.click(tabButtons[1]);
		await user.click(tabButtons[0]);

		// After switching back, the first episode must have tabindex=0 again.
		const refreshedItems = document.querySelectorAll('.episode-item');
		expect(refreshedItems[0]).toHaveAttribute('tabindex', '0');
	});
});
