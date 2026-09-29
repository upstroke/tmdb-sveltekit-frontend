<!-- src/routes/+layout.svelte -->
<script>
	import favicon from '$lib/assets/favicon.svg';
	import TypeHeadSearch from '$lib/components/TypeHeadSearch.svelte';
	import FooterMain from '$lib/components/FooterMain.svelte';
	import HeaderMain from '$lib/components/HeaderMain.svelte';
	import { i18n } from '$lib/stores/i18n';
	import { locale } from '$lib/stores/locale';
	import '$css/app.scss';

	let { children } = $props();

	const { titles } = $derived($i18n);

	/**
	 * Keeps <html lang> in sync with the active locale.
	 *
	 * hooks.server.js sets the lang attribute via transformPageChunk on the
	 * initial server render. However, the LanguageSwitcher uses goto() with
	 * replaceState:true, which is a client-side history update only — no new
	 * server request is made, so the hook never runs again after a language
	 * switch. This effect mirrors every locale store change directly onto
	 * document.documentElement.lang, keeping the attribute current without
	 * requiring a full page reload.
	 */
	$effect(() => {
		document.documentElement.lang = $locale;
	});

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
