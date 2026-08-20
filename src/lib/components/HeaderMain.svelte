<script>
	import { browser } from '$app/environment';
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

	function getNavHref(path, storageKey) {
		const storedPage = getStoredPage(storageKey);

		return storedPage <= 1 ? path : `${path}?page=${storedPage}`;
	}
</script>

<header id="menuHeader" class="ui top fixed inverted menu hydrated">
	<nav class="ui container fluid" aria-label="Hauptnavigation">
		<ul class="route-links">
			{#each navItems as item (item.id)}
				<li class="route-link item hydrated" id={item.id}>
					<a
						class="nav-link"
						class:link-active={item.active(page.url.pathname)}
						href={getNavHref(item.path, item.storageKey)}
						aria-current={item.active(page.url.pathname) ? 'page' : undefined}
					>
						<i class={`${item.icon} icon`} aria-hidden="true"></i>
						<span>{item.label}</span>
					</a>
				</li>
			{/each}
		</ul>

		<div class="item search">
			<slot />
		</div>
	</nav>
</header>

<style lang="scss">
	#menuHeader {
		z-index: 1000;
		box-shadow: 0 2px 7px rgba(0, 0, 0, 0.9);

		.route-link:has(.link-active) {
			background: rgba(255, 255, 255, 0.15);
			color: rgb(255 255 255) !important;
		}

		.item.search {
			margin-left: auto;
			min-width: 20vw;
		}

		.route-links {
			display: flex;
			align-items: center;
			height: 100%;
			margin: 0;
			padding: 0;
			list-style: none;
		}

		.nav-link {
			display: flex;
			align-items: center;
			gap: 0.35rem;
			padding: 0;
			background: transparent;
			color: inherit;
			font: inherit;
			text-decoration: none;
			cursor: pointer;

			&:hover:not(.link-active) span,
			&:focus-visible:not(.link-active) span {
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
