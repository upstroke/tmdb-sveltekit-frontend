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
	let { navItems = [], children } = $props();

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

<header class="header" id="menuHeader">
	<input type="checkbox" id="menu-toggle" class="menu-toggle" />

	<label for="menu-toggle" class="burger-icon" aria-label="Navigation öffnen oder schließen">
		<span></span>
		<span></span>
		<span></span>
	</label>

	<div class="nav-wrapper">
		<nav class="nav-menu" aria-label="Hauptnavigation">
			<ul class="nav-list">
				{#each navItems as item (item.id)}
					<li class="nav-item" id={item.id}>
						<a
							class:link-active={item.active(page.url.pathname)}
							href={getNavHref(item.path, item.storageKey)}
							aria-current={item.active(page.url.pathname) ? 'page' : undefined}
						>
							<i class={`${item.icon} icon`} aria-hidden="true"></i>
							<span class="text-node">{item.label}</span>
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<!-- typehead-search -->
		{@render children?.()}
	</div>

</header>

<style lang="scss">
	.header {
		position: fixed;
		top: 0;
		right: 0;
		left: 0;
		z-index: 1000;
		display: flex;
		align-items: center;
		width: 100%;
		padding: 0 3%;
		background: #1b1c1d;
		color: #fff;
		box-shadow: 0 2px 7px rgba(0, 0, 0, 0.9);
	}

	.menu-toggle {
		display: none;
	}

	/* Desktop first: Navigation ist standardmäßig horizontal sichtbar. */
	.burger-icon {
		display: none;
	}

	.nav-wrapper {
		display: flex;
		flex-direction: row;
		flex: 1;
	}

	.nav-menu {
		display: block;
		flex: 0 0 auto;
	}

	.nav-list {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.nav-item a {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		min-height: 0;
		padding: 1rem;
		color: white;
		text-decoration: none;
		transition:
			background-color 350ms cubic-bezier(0.16, 1, 0.3, 1),
			color 180ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.nav-item a:hover,
	.nav-item a:focus-visible,
	.nav-item a.link-active {
		background: rgba(255, 255, 255, 0.15);
	}

	/* Mobile override: Burger sichtbar, Liste vertikal und zunächst verborgen. */
	@media only screen and (max-width: 767.98px) {
		.burger-icon {
			position: relative;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			flex: 0 0 44px;
			width: 44px;
			height: 44px;
			padding: 11px;
			cursor: pointer;
		}

		.burger-icon span {
			position: absolute;
			left: 11px;
			display: block;
			width: 22px;
			height: 2px;
			border-radius: 2px;
			background: #fff;
			transform-origin: center;
			transition: transform 220ms cubic-bezier(0.16, 1, 0.3, 1), opacity 220ms cubic-bezier(0.16, 1, 0.3, 1);
		}

		.burger-icon span:nth-child(1) {
			top: 13px;
		}

		.burger-icon span:nth-child(2) {
			top: 21px;
		}

		.burger-icon span:nth-child(3) {
			top: 29px;
		}

		.menu-toggle:checked + .burger-icon span:nth-child(1) {
			transform: translateY(8px) rotate(45deg);
		}

		.menu-toggle:checked + .burger-icon span:nth-child(2) {
			opacity: 0;
			transform: scaleX(0);
		}

		.menu-toggle:checked + .burger-icon span:nth-child(3) {
			transform: translateY(-8px) rotate(-45deg);
		}

		.nav-menu {
			position: absolute;
			top: 100%;
			left: 3%;
			width: min(18rem, 100vw);
			background: #202020;
			border-radius: 0 0 6px 6px;
			box-shadow: 4px 8px 8px -6px rgba(0, 0, 0, 0.6);
			transform: translateY(-0.5rem);
			opacity: 0;
			visibility: hidden;
			pointer-events: none;
			transition:
				opacity 250ms ease,
				transform 450ms cubic-bezier(0.16, 1, 0.3, 1);
		}

		.menu-toggle:checked ~ .nav-wrapper .nav-menu {
			opacity: 1;
			transform: translateY(0);
			visibility: visible;
			pointer-events: auto;
		}

		.nav-list {
			flex-direction: column;
			align-items: stretch;
			gap: 0;
		}

		.nav-item {
			width: 100%;
		}

		.nav-item a {
			min-height: 44px;
			padding: 0.85rem 1rem;
			border-bottom: 1px solid #343434;
			transition:
				background-color 350ms cubic-bezier(0.16, 1, 0.3, 1),
				color 180ms cubic-bezier(0.16, 1, 0.3, 1);
		}

		.nav-item:last-child a {
			border-bottom: none;
		}

		.nav-item:first-child a {
			box-shadow: inset 0 8px 14px rgba(0, 0, 0, 0.28);
		}

	}
</style>
