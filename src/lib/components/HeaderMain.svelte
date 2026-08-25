<script>
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
	import { i18n } from '$lib/stores/i18n';

	/**
	 * Rendert die globale Kopfzeile mit Navigation, mobilem Menü,
	 * optionalem Inhalts-Slot und Sprachauswahl.
	 *
	 * Die Navigationslinks übernehmen den aktiven Pfad sowie die zuletzt
	 * verwendete Seitennummer pro Route.
	 *
	 * @component
	 * @prop {Array<{
	 *   id: string,
	 *   label: string,
	 *   icon: string,
	 *   path: string,
	 *   storageKey: string,
	 *   active: (pathname: string) => boolean
	 * }>} [navItems=[]] - Navigationspunkte für den globalen Header.
	 * @prop {Snippet|undefined} [children] - Optionaler Svelte-5-Snippet-Inhalt zwischen Navigation und Sprachauswahl.
	 *
	 * @example
	 * <HeaderMain navItems={navigationItems}>
	 * 	<TypeHeadSearch />
	 * </HeaderMain>
	 */
	let { navItems = [], children } = $props();
	const { labels } = $derived($i18n);
	let menuToggle;

	/**
	 * Schließt das mobile Menü bei Pointer-Interaktionen außerhalb des Headers.
	 *
	 * @param {PointerEvent} event - Pointer-Ereignis auf Fensterebene.
	 * @returns {void}
	 */
	function handleWindowPointerdown(event) {
		if (menuToggle?.checked && !event.target.closest('#menuHeader')) {
			menuToggle.checked = false;
		}
	}

	/**
	 * Liest die zuletzt gemerkte Seitennummer für eine Route aus dem Session-Storage.
	 *
	 * Bei fehlendem Browser-Kontext oder ungültigen Werten wird auf Seite 1
	 * zurückgefallen.
	 *
	 * @param {string} key - Storage-Schlüssel der jeweiligen Route.
	 * @returns {number} Gespeicherte Seitennummer, mindestens 1.
	 */
	function getStoredPage(key) {
		if (!browser) {
			return 1;
		}

		try {
			return Math.max(1, Number(sessionStorage.getItem(key) ?? '1') || 1);
		} catch (error) {
			console.warn(`saved page fo ${key} could not be written:`, error);

			return 1;
		}
	}

	/**
	 * Erzeugt einen Navigationslink inklusive gemerkter Seitennummer und aktiver Locale.
	 *
	 * Vorhandene Query-Parameter bleiben erhalten, nur ein bestehender `page`-
	 * Parameter wird durch den gespeicherten Wert ersetzt.
	 *
	 * @param {string} path - Zielpfad der Navigation.
	 * @param {string} storageKey - Storage-Schlüssel für die zuletzt geöffnete Seite.
	 * @returns {string} Ziel-URL für den Navigationslink.
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
	<input bind:this={menuToggle} type="checkbox" id="menu-toggle" class="menu-toggle" />

	<label for="menu-toggle" class="burger-icon" aria-label="Navigation öffnen oder schließen">
		<span></span>
		<span></span>
		<span></span>
	</label>

	<div class="nav-wrapper">
		<nav class="nav-menu" aria-label={labels.mainNavigation}>
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
			transition:
				transform 220ms cubic-bezier(0.16, 1, 0.3, 1),
				opacity 220ms cubic-bezier(0.16, 1, 0.3, 1);
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
