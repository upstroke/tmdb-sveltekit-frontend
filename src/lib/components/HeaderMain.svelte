<script>
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
	import { i18n } from '$lib/stores/i18n';

	/**
	 * Renders the global header with navigation, mobile menu,
	 * optional content slot, and language selector.
	 *
	 * The navigation links preserve the active path and the last used page number per route.
	 *
	 * @component
	 * @prop {Array<{
	 *   id: string,
	 *   label: string,
	 *   icon: string,
	 *   path: string,
	 *   storageKey: string,
	 *   active: (pathname: string) => boolean
	 * }>} [navItems=[]] - Navigation items for the global header.
	 * @prop {Snippet|undefined} [children] - Optional Svelte 5 snippet content between navigation and language selector.
	 *
	 * @example
	 * <HeaderMain navItems={navigationItems}>
	 * 	<TypeHeadSearch />
	 * </HeaderMain>
	 */
	let { navItems = [], children } = $props();
	const { labels } = $derived($i18n);

	// Use $state for reactivity
	let menuOpen = $state(false);

	/**
	 * Closes the mobile menu on pointer interactions outside the header.
	 *
	 * @param {PointerEvent} event - Pointer event at window level.
	 * @returns {void}
	 */
	function handleWindowPointerdown(event) {
		if (menuOpen && !event.target.closest('#menuHeader')) {
			menuOpen = false;
		}
	}

	/**
	 * Toggle menu open/close
	 */
	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	/**
	 * Retrieves the last stored page number for a route from session storage.
	 *
	 * Falls back to page 1 if browser context is missing or value is invalid.
	 *
	 * @param {string} key - Storage key for the respective route.
	 * @returns {number} Stored page number, minimum 1.
	 */
	function getStoredPage(key) {
		if (!browser) {
			return 1;
		}

		try {
			return Math.max(1, Number(sessionStorage.getItem(key) ?? '1') || 1);
		} catch (error) {
			console.warn(`saved page for ${key} could not be read:`, error);

			return 1;
		}
	}

	/**
	 * Generates a navigation link including stored page number and active locale.
	 *
	 * Existing query parameters are preserved, only an existing `page` parameter
	 * is replaced with the stored value.
	 *
	 * @param {string} path - Target path for navigation.
	 * @param {string} storageKey - Storage key for the last opened page.
	 * @returns {string} Target URL for the navigation link.
	 */
	function getNavHref(path, storageKey) {
		const storedPage = getStoredPage(storageKey);
		const query = page.url.search
			.slice(1)
			.split('&')
			.filter((entry) => entry && !entry.startsWith('page='));

		if (storedPage > 1) {
			query.push(`page=${encodeURIComponent(storedPage)}`);
		}

		const search = query.join('&');
		return search ? `${path}?${search}` : path;
	}
</script>

<svelte:window onpointerdown={handleWindowPointerdown} />

<header class="header" id="menuHeader">
	<button
		class="burger-icon"
		type="button"
		aria-label={labels.navigationToggle}
		aria-expanded={menuOpen ? 'true' : 'false'}
		aria-controls="navmenu"
		onpointerdown={toggleMenu}
	>
		<span></span>
		<span></span>
		<span></span>
	</button>

	<div class="nav-wrapper">
		<nav
			id="navmenu"
			aria-label={labels.mainNavigation}
		>
			<ul class="nav-list">
				{#each navItems as item (item.id)}
					<li class="nav-item" id={item.id}>
						<a
							class:link-active={item.active(page.url.pathname)}
							href={getNavHref(item.path, item.storageKey)}
							data-sveltekit-reload
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
		<LanguageSwitcher />
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
		justify-content: space-between;
		width: 100%;
		padding: 0 3%;
		background: #1b1c1d;
		color: #fff;
		box-shadow: 0 2px 7px rgba(0, 0, 0, 0.9);
	}

	/* Desktop first: hide the burger button and show horizontal navigation */
	.burger-icon {
		display: none;
	}

	.nav-wrapper {
		display: flex;
		flex: 1;
		flex-direction: row;
		align-items: center;
		justify-content: flex-end;
		gap: 1rem;
	}

	#navmenu {
		display: block;
	}

	.nav-list {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0;
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
	.nav-item a.link-active {
		background: rgba(255, 255, 255, 0.15);
	}

	/* Mobile navigation */
	@media only screen and (max-width: 767.98px) {
		.burger-icon {
			position: relative;
			display: block;
			flex: 0 0 44px;
			width: 44px;
			height: 44px;
			padding: 0;
			cursor: pointer;
			background: none;
			border: none;
		}

		/* Center all lines so the two outer lines can form an exact X */
		.burger-icon span {
			position: absolute;
			top: 50%;
			left: 50%;
			display: block;
			width: 22px;
			height: 2px;
			border-radius: 2px;
			background: #fff;
			transform-origin: center;
			transition:
				transform 220ms cubic-bezier(0.16, 1, 0.3, 1),
				opacity 220ms cubic-bezier(0.16, 1, 0.3, 1);
		}

		/* Closed state: three horizontal hamburger lines */
		.burger-icon span:nth-child(1) {
			transform: translate(-50%, calc(-50% - 8px));
		}

		.burger-icon span:nth-child(2) {
			transform: translate(-50%, -50%);
			opacity: 1;
		}

		.burger-icon span:nth-child(3) {
			transform: translate(-50%, calc(-50% + 8px));
		}

		/* Open state: outer lines overlap and form a centered X */
		.burger-icon[aria-expanded='true'] span:nth-child(1) {
			transform: translate(-50%, -50%) rotate(45deg);
		}

		.burger-icon[aria-expanded='true'] span:nth-child(2) {
			transform: translate(-50%, -50%) scaleX(0);
			opacity: 0;
		}

		.burger-icon[aria-expanded='true'] span:nth-child(3) {
			transform: translate(-50%, -50%) rotate(-45deg);
		}

		.nav-wrapper {
			position: relative;
			justify-content: flex-start;
		}

		#navmenu {
			position: absolute;
			top: 100%;
			left: calc(-3% - 15px);
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

		/* Display the menu while the burger button is expanded */
		.burger-icon[aria-expanded='true'] ~ .nav-wrapper #navmenu {
			transform: translateY(0);
			opacity: 1;
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
		}

		.nav-item:last-child a {
			border-bottom: none;
		}

		.nav-item:first-child a {
			box-shadow: inset 0 8px 14px rgba(0, 0, 0, 0.28);
		}
	}
</style>

