import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { cleanupAll, resetAll } from '$tests/setup/test-utils.js';

import TabList from '$lib/components/TabList.svelte';

const tabs = [
	{ id: 'movies', label: 'Filme' },
	{ id: 'series', label: 'Serien' },
	{ id: 'watchlist', label: 'Merkliste' }
];

describe('TabList', () => {
	beforeEach(() => {
		resetAll();
	});

	afterEach(() => {
		cleanupAll();
	});

	// Statement coverage: The tablist and all tab buttons are rendered.
	it('renders all tabs with correct roles and labels', () => {
		render(TabList, { props: { tabs } });

		expect(screen.getByRole('tablist')).toBeInTheDocument();

		const tabButtons = screen.getAllByRole('tab');
		expect(tabButtons).toHaveLength(3);
		expect(tabButtons[0]).toHaveTextContent('Filme');
		expect(tabButtons[1]).toHaveTextContent('Serien');
		expect(tabButtons[2]).toHaveTextContent('Merkliste');
	});

	// Statement coverage: The first tab is selected and has tabindex=0 by default.
	it('marks the first tab as selected by default', () => {
		render(TabList, { props: { tabs } });

		const tabButtons = screen.getAllByRole('tab');
		expect(tabButtons[0]).toHaveAttribute('aria-selected', 'true');
		expect(tabButtons[1]).toHaveAttribute('aria-selected', 'false');
		expect(tabButtons[2]).toHaveAttribute('aria-selected', 'false');
	});

	// Statement coverage: Only the active tab has tabindex=0; all others have tabindex=-1.
	it('sets tabindex=0 on the active tab and tabindex=-1 on inactive tabs', () => {
		render(TabList, { props: { tabs } });

		const tabButtons = screen.getAllByRole('tab');
		expect(tabButtons[0]).toHaveAttribute('tabindex', '0');
		expect(tabButtons[1]).toHaveAttribute('tabindex', '-1');
		expect(tabButtons[2]).toHaveAttribute('tabindex', '-1');
	});

	// Statement coverage: ArrowRight moves focus and selection to the next tab.
	it('moves focus to the next tab on ArrowRight', async () => {
		const user = userEvent.setup();
		render(TabList, { props: { tabs } });

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
		render(TabList, { props: { tabs } });

		const tabButtons = screen.getAllByRole('tab');
		tabButtons[1].focus();
		await user.keyboard('{ArrowLeft}');

		expect(tabButtons[0]).toHaveFocus();
		expect(tabButtons[0]).toHaveAttribute('aria-selected', 'true');
	});

	// Branch coverage: ArrowRight on the last tab wraps around to the first.
	it('wraps from the last tab to the first on ArrowRight', async () => {
		const user = userEvent.setup();
		render(TabList, { props: { tabs } });

		const tabButtons = screen.getAllByRole('tab');
		tabButtons[2].focus();
		await user.keyboard('{ArrowRight}');

		expect(tabButtons[0]).toHaveFocus();
	});

	// Branch coverage: ArrowLeft on the first tab wraps around to the last.
	it('wraps from the first tab to the last on ArrowLeft', async () => {
		const user = userEvent.setup();
		render(TabList, { props: { tabs } });

		const tabButtons = screen.getAllByRole('tab');
		tabButtons[0].focus();
		await user.keyboard('{ArrowLeft}');

		expect(tabButtons[2]).toHaveFocus();
	});

	// Statement coverage: Home moves focus to the first tab.
	it('jumps to the first tab on Home', async () => {
		const user = userEvent.setup();
		render(TabList, { props: { tabs } });

		const tabButtons = screen.getAllByRole('tab');
		tabButtons[2].focus();
		await user.keyboard('{Home}');

		expect(tabButtons[0]).toHaveFocus();
	});

	// Statement coverage: End moves focus to the last tab.
	it('jumps to the last tab on End', async () => {
		const user = userEvent.setup();
		render(TabList, { props: { tabs } });

		const tabButtons = screen.getAllByRole('tab');
		tabButtons[0].focus();
		await user.keyboard('{End}');

		expect(tabButtons[2]).toHaveFocus();
	});

	// Branch coverage: Tab key is not intercepted – focus leaves the tablist.
	it('does not trap Tab key – focus leaves the tablist on Tab', async () => {
		const user = userEvent.setup();
		render(TabList, { props: { tabs } });

		const tabButtons = screen.getAllByRole('tab');
		tabButtons[0].focus();
		await user.keyboard('{Tab}');

		expect(tabButtons[0]).not.toHaveFocus();
		expect(tabButtons[1]).not.toHaveFocus();
		expect(tabButtons[2]).not.toHaveFocus();
	});

	// Statement coverage: Clicking a tab activates it and updates aria-selected and tabindex.
	it('activates a tab on click and updates aria-selected', async () => {
		const user = userEvent.setup();
		render(TabList, { props: { tabs } });

		const tabButtons = screen.getAllByRole('tab');
		await user.click(tabButtons[1]);

		expect(tabButtons[1]).toHaveAttribute('aria-selected', 'true');
		expect(tabButtons[0]).toHaveAttribute('aria-selected', 'false');
		expect(tabButtons[1]).toHaveAttribute('tabindex', '0');
		expect(tabButtons[0]).toHaveAttribute('tabindex', '-1');
	});
});
