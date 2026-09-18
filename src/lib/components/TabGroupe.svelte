<script>
  import { i18n } from '$lib/stores/i18n';
  import { formatDate } from '$lib/utils/formatDate.js';
  import { page } from '$app/state';
  import { DEFAULT_LOCALE } from '$lib/i18n/config.js';
  import { tick } from 'svelte';
  const { labels, messages } = $derived($i18n);

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

  // Ensure activeTab is always a string
  let activeTab = $state(String(initialTab ?? tabs[0]?.id ?? ''));

	$effect(() => {
		// Sobald activeTab sich ändert, sucht Svelte das Element im AKTUELLEN DOM
		if (activeTab) {
			const activeElement = document.getElementById(`tab-${activeTab}`);

			// Korrektur: Nutze getAttribute('role'), da .role auf DOM-Knoten undefined sein kann
			const currentRole = document.activeElement?.getAttribute('role');
			const isButton = document.activeElement?.tagName === 'BUTTON';

			if (currentRole === 'tab' || isButton) {
				activeElement?.focus();
			}
		}
	});

  let focusedEpisodeIndex = $state(tabs.map(() => 0));
  let episodeListRefs = $state({});

	function selectTab(id) {
		activeTab = String(id);
		const tabIndex = tabs.findIndex((t) => String(t.id) === String(id));
		if (tabIndex !== -1) focusedEpisodeIndex[tabIndex] = 0;
		onTabSelect?.(String(id));
	}

	function isSelected(id) {
		return String(activeTab) === String(id);
	}

  function getNextTabIndex(key, index) {
    if (key === 'ArrowRight') return (index + 1) % tabs.length;
    if (key === 'ArrowLeft') return (index - 1 + tabs.length) % tabs.length;
    if (key === 'Home') return 0;
    if (key === 'End') return tabs.length - 1;
    return index;
  }

	function handleTabKeydown(event) { // Kein index-Argument mehr!
		const navigationKeys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
		if (!navigationKeys.includes(event.key)) {
			return;
		}
		event.preventDefault();

		// Hole das aktuelle Element und dessen data-tab ID oder berechne den Index
		const currentTabId = event.currentTarget.getAttribute('data-tab');
		const index = tabs.findIndex(t => String(t.id) === String(currentTabId));

		if (index === -1) return;

		const nextIndex = getNextTabIndex(event.key, index);
		const nextTabId = tabs[nextIndex].id;

		selectTab(nextTabId);
	}

	async function handleEpisodeKeydown(event, tabIndex, episodeIndex, total) {
    const navigationKeys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!navigationKeys.includes(event.key)) {
      return;
    }

    event.preventDefault();

    const moves = {
      ArrowDown: (episodeIndex + 1) % total,
      ArrowUp: (episodeIndex - 1 + total) % total,
      Home: 0,
      End: total - 1
    };

    const nextIndex = moves[event.key];

    focusedEpisodeIndex[tabIndex] = nextIndex;

    await tick();
    await tick();

    const ol = episodeListRefs[tabIndex];
    if (ol) {
      const items = Array.from(ol.querySelectorAll('li.episode-item'));
      items[nextIndex]?.focus({ preventScroll: false });
    }
  }
</script>

<div class="ui pointing secondary menu" role="tablist" aria-label={ariaLabel}>
  {#each tabs as tab (tab.id)}
		<button
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
			onkeydown={handleTabKeydown}
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
  >
    {#if tab.loading}
      <p aria-live="polite">{messages.loading}</p>
    {:else if tab.episodes && tab.episodes.length > 0}
      <ol
        class="episodes-list"
        bind:this={episodeListRefs[tabIndex]}
      >
        {#each tab.episodes as episode, episodeIndex (episode.id ?? episodeIndex)}
					<li
						class="episode-item"
						tabindex={isSelected(tab.id) && episodeIndex === focusedEpisodeIndex[tabIndex] ? 0 : -1}
						onkeydown={(event) => handleEpisodeKeydown(event, tabIndex, episodeIndex, tab.episodes.length)}
					>
            <h4 class="episode-title">
              {episodeIndex + 1}. {episode.name}
            </h4>
            {#if episode.air_date}
              <span class="u-sr-only">{labels.firstAirDate}</span>
							<time class="episode-air-date">
								{formatDate(episode.air_date, page.url.searchParams.get('locale') ?? DEFAULT_LOCALE)}
							</time>
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
		flex-wrap: wrap;

    .item {
      cursor: pointer;
      font-size: 1.2em;

      &:focus-visible {
        outline: 2px solid var(--focus-ring-blue);
        outline-offset: -2px;
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
    padding: 0 .5rem;
    margin-bottom: 0.5rem;

    &:focus-visible {
      background: rgba(0, 0, 0, 0.06);
      outline-offset: 2px;
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
