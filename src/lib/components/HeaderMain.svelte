<script>
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	/**
	 * Navigationslinks für den globalen Header.
	 *
	 * @param {Array<{
	 *   id: string,
	 *   label: string,
	 *   icon: string,
	 *   path: string,
	 *   storageKey: string,
	 *   active: (pathname: string) => boolean
	 * }>} navItems
	 */
	let { navItems = [] } = $props();

	function getStoredPage(key) {
		if (!browser) {
			return 1;
		}

		try {
			return Math.max(1, Number(sessionStorage.getItem(key) ?? '1') || 1);
		} catch (error) {
			console.warn(`Gespeicherte Seite für ${key} konnte nicht gelesen werden:`, error);

			return 1;
		}
	}

	function navigateTo(path, storageKey) {
		const storedPage = getStoredPage(storageKey);

		if (storedPage <= 1) {
			goto(path);
			return;
		}

		goto(`${path}?page=${storedPage}`);
	}
</script>

<div id="menuHeader" class="ui top fixed inverted menu hydrated">
	<nav class="ui container fluid">
		{#each navItems as item (item.id)}
			<div class="route-link item hydrated" id={item.id}>
				<button
					class="nav-button"
					class:link-active={item.active(page.url.pathname)}
					type="button"
					onclick={() => navigateTo(item.path, item.storageKey)}
				>
					<i class={`${item.icon} icon`}></i>
					<span>{item.label}</span>
				</button>
			</div>
		{/each}

		<div class="item search">
			<slot />
		</div>
	</nav>
</div>

<style lang="scss">
	#menuHeader {
		z-index: 1000;
		height: var(--header-height);
		min-height: var(--header-height);

		.route-link:has(.link-active) {
			background: rgba(255, 255, 255, 0.15);
			color: rgb(255 255 255) !important;
		}

		.item.search {
			margin-left: auto;
			min-width: 20vw;
		}

		> nav {
			height: 100%;
			display: flex;
			align-items: center;
		}

		.nav-button {
			display: flex;
			align-items: center;
			gap: 0.35rem;
			border: 0;
			padding: 0;
			background: transparent;
			color: inherit;
			font: inherit;
			cursor: pointer;

			&:hover:not(.link-active) span {
				text-decoration: underline;
				text-underline-offset: 2px;
			}

			&.link-active {
				pointer-events: none;
				font-weight: 700;
			}
		}
	}
</style>
