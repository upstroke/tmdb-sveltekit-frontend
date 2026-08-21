<!-- src/routes/+layout.svelte -->
<script>
	import favicon from '$lib/assets/favicon.svg';
	import TypeHeadSearch from '$lib/components/TypeHeadSearch.svelte';
	import FooterMain from '$lib/components/FooterMain.svelte';
	import HeaderMain from '$lib/components/HeaderMain.svelte';
	import uiText from '$lib/i18n/ui.json';
	import '../css/app.scss';

	let { children } = $props();

	const navItems = [
		{ id: 'home', label: uiText.locales['de-DE'].titles.home, icon: 'home', path: '/', storageKey: 'home-page', active: (pathname) => pathname === '/' },
		{ id: 'movies', label: uiText.locales['de-DE'].titles.movies, icon: 'film', path: '/movies', storageKey: 'movies-page', active: (pathname) => pathname === '/movies' || pathname.startsWith('/movies/') },
		{ id: 'tvshows', label: uiText.locales['de-DE'].titles.tvShows, icon: 'tv', path: '/tv-shows', storageKey: 'tv-shows-page', active: (pathname) => pathname === '/tv-shows' || pathname.startsWith('/tv-shows/') }
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<HeaderMain {navItems}>
	<TypeHeadSearch />
</HeaderMain>

{@render children()}

<FooterMain />
