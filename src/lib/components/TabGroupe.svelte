<script>
	import { i18n } from '$lib/stores/i18n';
	import { formatDate } from '$lib/utils/formatDate.js';
	import { page } from '$app/state';
	import { DEFAULT_LOCALE } from '$lib/i18n/config.js';
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
	 *   A second Tab moves focus to the active tabpanel.
	 * - ArrowRight / ArrowLeft / Home / End: cycle focus between tab buttons.
	 *   preventDefault keeps the browser from leaving the tablist via these keys.
	 * - Tab (from tablist): not intercepted → browser moves focus to the active tabpanel.
	 *
	 * Inside the tabpanel (episode list):
	 * - ArrowDown / ArrowUp: move focus between episode list items (roving tabindex).
	 *   preventDefault keeps focus inside the list.
	 * - Home / End: jump to first / last episode.
	 * - Tab: not intercepted → focus leaves the panel naturally.
	 *
	 * @component
	 * @prop {TabItem[]} tabs - List of tab items to render.
	 * @prop {string} [initialTab] - ID of the initially active tab. Defaults to the first tab.
	 * @prop {string} ariaLabel - Accessible label for the tab list. Required for WCAG compliance.
	 * @prop {(id: string) => void} [onTabSelect] - Callback fired when a tab is selected.
	 *
	 * @example
	 * <TabGroupe
	 *   tabs={[
	 *     { id: 'one', label: 'One', content: 'Content 1' },
	 *     { id: 'two', label: 'Two', content: 'Content 2' }
	 *   ]}
	 *   ariaLabel="Example tabs"
	 * />
	 */
	let {
		tabs = [],
		initialTab = undefined,
		ariaLabel = '',
		onTabSelect = undefined
	} = $props();

	if (import.meta.env.DEV && !ariaLabel) {
		console.warn(
			'[TabGroupe] The ariaLabel prop is required for accessibility (WCAG 4.1.2). Please provide a descriptive label for the tab list.'
		);
	}

	/** @type {string} */
	let activeTab = $state(initialTab ?? tabs[0]?.id ?? '');

	/** @type {HTMLButtonElement[]} */
	let tabRefs = $state([]);

	/**
	 * Per-tab episode list item refs: episodeRefs[tabIndex][episodeIndex] → <li>.
	 * @type {HTMLLIElement[][]}
	 */
	let episodeRefs = $state(tabs.map(() => []));

	/**
	 * Currently focused episode index per tab.
	 * Resets to 0 when a tab is activated.
	 * @type {number[]}
	 */
	let focusedEpisodeIndex = $state(tabs.map(() => 0));

	/**
	 * Selects a tab by id, resets the focused episode index for that tab,
	 * and fires the optional onTabSelect callback.
	 *
	 * @param {string} id
	 * @returns {void}
	 */
	function selectTab(id) {
		activeTab = id;
		const tabIndex = tabs.findIndex((t) => t.id === id);
		if (tabIndex !== -1) focusedEpisodeIndex[tabIndex] = 0;
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
	 * Returns the next tab button index for keyboard navigation.
	 *
	 * @param {string} key
	 * @param {number} index
	 * @returns {number}
	 */
	function getNextTabIndex(key, index) {
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

		const nextIndex = getNextTabIndex(event.key, index);
		// Use selectTab() to keep state and onTabSelect callback in sync.
		selectTab(tabs[nextIndex].id);
		tabRefs[nextIndex]?.focus();
	}

	/**
	 * Handles keyboard interaction within an episode list.
	 *
	 * ArrowDown / ArrowUp / Home / End navigate between list items and call
	 * preventDefault to keep focus inside the list (trap). The Tab key is
	 * intentionally not intercepted so focus leaves the panel naturally.
	 *
	 * @param {KeyboardEvent} event
	 * @param {number} tabIndex - Index of the parent tab.
	 * @param {number} episodeIndex - Index of the currently focused episode.
	 * @param {number} total - Total number of episodes in this tab.
	 * @returns {void}
	 */
	function handleEpisodeKeydown(event, tabIndex, episodeIndex, total) {
		/** @type {Record<string, number>} */
		const moves = {
			ArrowDown: (episodeIndex + 1) % total,
			ArrowUp: (episodeIndex - 1 + total) % total,
			Home: 0,
			End: total - 1
		};

		if (!(event.key in moves)) {
			// Tab and all other keys fall through – focus leaves the panel naturally.
			return;
		}

		// Prevent page scroll and keep focus inside the episode list.
		event.preventDefault();

		const nextEpisode = moves[event.key];
		focusedEpisodeIndex[tabIndex] = nextEpisode;
		episodeRefs[tabIndex][nextEpisode]?.focus();
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

{#each tabs as tab, tabIndex (tab.id)}
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
				{#each tab.episodes as episode, episodeIndex (episode.episode_number)}
					<li
						bind:this={episodeRefs[tabIndex][episodeIndex]}
						class="episode-item"
						tabindex={episodeIndex === focusedEpisodeIndex[tabIndex] ? 0 : -1}
						onkeydown={(event) =>
							handleEpisodeKeydown(event, tabIndex, episodeIndex, tab.episodes.length)}
					>
						<h4 class="episode-title">
							{episode.episode_number}. {episode.name}
						</h4>
						{#if episode.air_date}
							<span class="u-sr-only">{labels.firstAirDate}</span><time
								class="episode-air-date"
								>{formatDate(
									episode.air_date,
									page.url.searchParams.get('locale') ?? DEFAULT_LOCALE
								)}</time
							>
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

		&:focus-visible {
			outline: 2px solid var(--focus-ring-blue);
			outline-offset: 4px;
			border-radius: 2px;
		}

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
