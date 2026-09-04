<script lang="ts">
	import { page } from '$app/stores';
	import { NavList } from '$components';
	import { titles } from '$lib/constants';

	import type { NavItem } from '$lib/types';

	const navItems: NavItem[] = $derived([
		{
			id: 'home',
			label: titles.home,
			icon: 'home',
			path: '/',
			storageKey: 'home-page',
			active: (pathname: string) => pathname === '/'
		},
		{
			id: 'movies',
			label: titles.movies,
			icon: 'film',
			path: '/movies',
			storageKey: 'movies-page',
			active: (pathname: string) => pathname === '/movies' || pathname.startsWith('/movies/')
		},
		{
			id: 'tvshows',
			label: titles.tvShows,
			icon: 'tv',
			path: '/tv-shows',
			storageKey: 'tv-shows-page',
			active: (pathname: string) => pathname === '/tv-shows' || pathname.startsWith('/tv-shows/')
		}
	]);

	const activeNavItem = $derived(
		navItems.find((item) => item.active(page.url.pathname))
	);

	const pageTitle = $derived(activeNavItem?.label ?? 'TMDB');
</script>

<svelte:head>
	<title>{pageTitle} | TMDB</title>
</svelte:head>

<div class="app">
	<header>
		<NavList {navItems} />
	</header>

	<main>
		<slot />
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	header {
		position: sticky;
		top: 0;
		z-index: 100;
		background-color: var(--color-bg-primary);
		border-bottom: 1px solid var(--color-border-secondary);
	}

	main {
		flex: 1;
		padding: 1.5rem;
		max-width: 1400px;
		margin: 0 auto;
		width: 100%;
	}
</style>
