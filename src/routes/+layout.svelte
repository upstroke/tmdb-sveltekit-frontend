<!-- src/routes/+layout.svelte -->
<script>
	import favicon from '$lib/assets/favicon.svg';
	import TypeHeadSearch from '$lib/components/TypeHeadSearch.svelte';
	import FooterMain from '$lib/components/FooterMain.svelte';
	import HeaderMain from '$lib/components/HeaderMain.svelte';
	import '../css/app.scss';

	let { children } = $props();

	const navItems = [
		{ id: 'home', label: 'Home', icon: 'home', path: '/', storageKey: 'home-page', active: (pathname) => pathname === '/' },
		{ id: 'movies', label: 'Filme', icon: 'film', path: '/movies', storageKey: 'movies-page', active: (pathname) => pathname === '/movies' || pathname.startsWith('/movies/') },
		{ id: 'tvshows', label: 'TV-Shows', icon: 'tv', path: '/tv-shows', storageKey: 'tv-shows-page', active: (pathname) => pathname === '/tv-shows' || pathname.startsWith('/tv-shows/') }
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
