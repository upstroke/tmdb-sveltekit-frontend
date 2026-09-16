<script>
	import { i18n } from '$lib/stores/i18n';
	import { formatDate } from '$lib/utils/formatDate.js';
	import {page} from "$app/state";
	import {DEFAULT_LOCALE} from "$lib/i18n/config.js";
	const { labels } = $derived($i18n);


	/**
	 * A single tab item.
	 *
	 * @typedef {Object} TabItem
	 * @property {string} id
	 * @property {string} label
	 * @property {string} [content]
	 * @property {Array<{episode_number: number, name: string, overview: string, air_date: string|null}>} [episodes]
	 */

	/**
	 * An accessible tab group component with keyboard navigation.
	 * Supports lazy-loaded episode lists per tab panel.
	 *
	 * Keyboard behaviour (WAI-ARIA Tabs Pattern):
	 * - Tab: moves focus into the tablist, landing on the active tab (tabindex=0).
	 *   A second Tab leaves the tablist and moves focus to the active tabpanel.
	 * - ArrowRight / ArrowLeft: cycle focus between tabs within the tablist.
	 *   preventDefault keeps the browser from leaving the tablist via these keys.
	 * - Home / End: jump to the first / last tab.
	 * - Tab (from within the tablist): not intercepted → browser moves focus
	 *   naturally to the next focusable element (the active tabpanel).
	 *
	 * @component
	 * @prop {TabItem[]} tabs - List of tab items to render.
	 * @prop {string} [initialTab] - ID of the initially active tab. Defaults to the first tab.
	 * @prop {string} ariaLabel - Accessible label for the tab list. Required for WCAG compliance.
	 * @prop {(id: string) => void} [onTabSelect] - Callback fired when a tab is selected.
	 *
	 * @example
	 * <TabGroupe
	 * 	tabs={[
	 * 		{ id: 'one', label: 'One', content: 'Content 1' },
	 * 		{ id: 'two', label: 'Two', content: 'Content 2' }
	 * 	]}
	 * 	ariaLabel="Example tabs"
	 * />
	 */
	let {
		tabs = [],
		initialTab = undefined,
		ariaLabel = '',
		onTabSelect = undefined
	} = $props();

	if (import.meta.env.DEV && !ariaLabel) {
		console.warn('[TabGroupe] The ariaLabel prop is required for accessibility (WCAG 4.1.2). Please provide a descriptive label for the tab list.');
	}

	/** @type {string} */
	let activeTab = $state(initialTab ?? tabs[0]?.id ?? '');

	/** @type {HTMLButtonElement[]} */
	let tabRefs = $state([]);

	/**
	 * Selects a tab by id and fires the optional onTabSelect callback.
	 *
	 * @param {string} id
	 * @returns {void}
	 */
	function selectTab(id) {
		activeTab = id;
		onTabSelect?.(id);
	}

	/**
	 * Returns whether a tab is selected.
	 *
	 * @param {string} id
	 * @returns {boolean}
	 */
	function isSelected(id) {
		return activeTab === id;
	}

	/**
	 * Returns the next tab index for keyboard navigation.
	 *
	 * @param {string} key
	 * @param {number} index
	 * @returns {number}
	 */
	function getNextIndex(key, index) {
		if (key === 'ArrowRight') return (index + 1) % tabs.length;
		if (key === 'ArrowLeft') return (index - 1 + tabs.length) % tabs.length;
		if (key === 'Home') return 0;
		if (key === 'End') return tabs.length - 1;
		return index;
	}

	/**
	 * Handles keyboard interaction on a tab button.
	 *
	 * Arrow keys and Home/End navigate within the tablist and call preventDefault
	 * so the browser does not scroll or leave the list. The Tab key is intentionally
	 * not intercepted: the browser moves focus to the next element in the natural
	 * tab order, which is the active tabpanel (tabindex=0).
	 *
	 * @param {KeyboardEvent} event
	 * @param {number} index
	 * @returns {void}
	 */
	function handleTabKeydown(event, index) {
		const navigationKeys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];

		if (!navigationKeys.includes(event.key)) {
			// Tab and all other keys fall through – no preventDefault.
			// Tab will move focus to the active tabpanel naturally.
			return;
		}

		// Prevent page scroll and keep focus inside the tablist.
		event.preventDefault();

		const nextIndex = getNextIndex(event.key, index);
		// Use selectTab() to keep state and onTabSelect callback in sync.
		selectTab(tabs[nextIndex].id);
		tabRefs[nextIndex]?.focus();
	}
</script>

<div class="ui pointing secondary menu" role="tablist" aria-label={ariaLabel}>
	{#each tabs as tab, index (tab.id)}
		<button
			bind:this={tabRefs[index]}
			class="item"
			class:active={isSelected(tab.id)}
			type="button"
			role="tab"
			id={"tab-" + tab.id}
			data-tab={tab.id}
			aria-selected={isSelected(tab.id)}
			aria-controls={"panel-" + tab.id}
			tabindex={isSelected(tab.id) ? 0 : -1}
			onclick={() => selectTab(tab.id)}
			onkeydown={(event) => handleTabKeydown(event, index)}
		>
			{tab.label}
		</button>
	{/each}
</div>

{#each tabs as tab (tab.id)}
	<div
		class="ui tab segment"
		class:active={isSelected(tab.id)}
		id={"panel-" + tab.id}
		data-tab={tab.id}
		role="tabpanel"
		aria-labelledby={"tab-" + tab.id}
		hidden={!isSelected(tab.id)}
		tabindex={isSelected(tab.id) ? 0 : -1}
	>
		{#if tab.loading}
			<p aria-live="polite">Loading…</p>
		{:else if tab.episodes && tab.episodes.length > 0}
			<ol class="episodes-list">
				{#each tab.episodes as episode (episode.episode_number)}
					<li class="episode-item">
						<h4 class="episode-title">
							{episode.episode_number}. {episode.name}
						</h4>
						{#if episode.air_date}
							<span class="u-sr-only">{labels.firstAirDate}</span><time class="episode-air-date">{formatDate(episode.air_date, page.url.searchParams.get('locale') ?? DEFAULT_LOCALE)}</time>
						{/if}
						{#if episode.overview}
							<p class="episode-overview">{episode.overview}</p>
						{/if}
					</li>
				{/each}
			</ol>
		{:else if tab.episodes && tab.episodes.length === 0}
			<p>{tab.content ?? ''}</p>
		{:else}
			<p>{tab.content ?? ''}</p>
		{/if}
	</div>
{/each}



<style lang="scss">
	@use '../../css/variables';

	.ui.pointing.secondary.menu {
		border-bottom: 1px solid rgba(34, 36, 38, 0.15);

		.item {
			cursor: pointer;
			font-size: 1.2em;

			&:focus-visible {
				outline: 2px solid var(--focus-ring-blue);
				outline-offset: 2px;
				border-radius: 2px;
			}

			&.active {
				border-color: var(--focus-ring-blue);
			}

			&:hover:not(.active) {
				border-color: var(--color-text-muted);
			}
		}
	}

	.ui.tab {
		font-size: 1rem;
		&.segment {
			border: none;
			box-shadow: none;
			padding: 0;
		}
	}

	.episodes-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.episode-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-bottom: 0.5rem;

		.episode-title {
			margin-bottom: 0;
		}

		p.episode-overview {
			margin-bottom: 0;
		}
	}

	.episode-air-date {
		font-size: 0.875rem;
		color: var(--color-text-muted, #666);
	}

	.episode-overview {
		margin: 0;
		font-size: 0.9rem;
	}
</style>
