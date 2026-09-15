<script>
	/**
	 * A single tab item.
	 *
	 * @typedef {Object} TabItem
	 * @property {string} id
	 * @property {string} label
	 * @property {string} content
	 */

	/**
	 * An accessible tab group component with keyboard navigation.
	 *
	 * @component
	 * @prop {TabItem[]} tabs - List of tab items to render.
	 * @prop {string} [activeTab] - ID of the initially active tab. Defaults to the first tab.
	 * @prop {string} [ariaLabel=''] - Accessible label for the tab list.
	 *
	 * @example
	 * <TabGroup
	 * 	tabs={[
	 * 		{ id: 'one', label: 'One', content: 'Content 1' },
	 * 		{ id: 'two', label: 'Two', content: 'Content 2' }
	 * 	]}
	 * 	activeTab="one"
	 * 	ariaLabel="Example tabs"
	 * />
	 */
	let {
		tabs = [],
		activeTab = $derived(tabs[0]?.id ?? ''),
		ariaLabel = ''
	} = $props();

	/** @type {HTMLButtonElement[]} */
	let tabRefs = $state([]);

	/**
	 * Selects a tab by id.
	 *
	 * @param {string} id
	 * @returns {void}
	 */
	function selectTab(id) {
		activeTab = id;
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
	 * Handles keyboard interaction on a tab.
	 *
	 * @param {KeyboardEvent} event
	 * @param {number} index
	 * @returns {void}
	 */
	function handleTabKeydown(event, index) {
		if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) {
			return;
		}

		event.preventDefault();

		const nextIndex = getNextIndex(event.key, index);
		activeTab = tabs[nextIndex].id;
		tabRefs[nextIndex]?.focus();
	}
</script>

<div class="ui secondary menu" role="tablist" aria-label={ariaLabel}>
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
		tabindex="0"
	>
		<p>{tab.content}</p>
	</div>
{/each}



<style lang="scss">
	@use '../../css/variables';

	.ui.secondary.menu[role='tablist'] > button.item {
		appearance: none;
		background: none;
		border: 0;
		padding: inherit;
		margin: 0;
		font: inherit;
		color: inherit;
		text-align: inherit;
		line-height: inherit;
		cursor: pointer;
	}

	.ui.secondary.menu[role='tablist'] > button.item:disabled {
		cursor: not-allowed;
	}

	.ui.secondary.menu[role='tablist'] > button.item:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 2px;
		border-radius: 0.28571429rem;
	}

	.ui.tab.segment[hidden] {
		display: none !important;
	}
</style>
