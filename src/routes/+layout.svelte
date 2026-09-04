<!-- src/routes/+layout.svelte -->
<script>
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/favicon.svg';
	import TypeHeadSearch from '$lib/components/TypeHeadSearch.svelte';
	import FooterMain from '$lib/components/FooterMain.svelte';
	import HeaderMain from '$lib/components/HeaderMain.svelte';
	import { i18n } from '$lib/stores/i18n';
	import '$css/app.scss';

	let { children } = $props();

	const { titles } = $derived($i18n);

	const navItems = $derived([
		{
			id: 'home',
			label: titles.home,
			icon: 'home',
			path: '/',
			storageKey: 'home-page',
			active: (pathname) => pathname === '/'
		},
		{
			id: 'movies',
			label: titles.movies,
			icon: 'film',
			path: '/movies',
			storageKey: 'movies-page',
			active: (pathname) => pathname === '/movies' || pathname.startsWith('/movies/')
		},
		{
			id: 'tvshows',
			label: titles.tvShows,
			icon: 'tv',
			path: '/tv-shows',
			storageKey: 'tv-shows-page',
			active: (pathname) => pathname === '/tv-shows' || pathname.startsWith('/tv-shows/')
		}
	]);

	onMount(() => {
		const updateTitle = () => {
			const activeNavItem = navItems.find((item) => item.active(window.location.pathname));
			const pageTitle = activeNavItem?.label ?? 'TMDB';
			document.title = `${pageTitle} | TMDB`;
		};

		updateTitle();

		// Optional: Update title on navigation
		const observer = new MutationObserver(updateTitle);
		observer.observe(document.body, { subtree: true, childList: true });

		return () => observer.disconnect();
	});
</script>

<svelte:head>
	<link href={favicon} rel="icon" />
	<title>TMDB</title>
</svelte:head>

<HeaderMain {navItems}>
	<TypeHeadSearch />
</HeaderMain>

{@render children()}

<FooterMain />
