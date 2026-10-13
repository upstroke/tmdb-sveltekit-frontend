<!-- src/routes/+layout.svelte -->
<script>
	import favicon from '$lib/assets/favicon.svg';
	import TypeHeadSearch from '$lib/components/TypeHeadSearch.svelte';
	import FooterMain from '$lib/components/FooterMain.svelte';
	import HeaderMain from '$lib/components/HeaderMain.svelte';
	import { i18n } from '$lib/stores/i18n';
	import { locale } from '$lib/stores/locale';
	import { validateLocales } from '$lib/i18n/helpers.js';
	import { dev } from '$app/environment';
	import '$css/app.scss';

	/**
	 * @typedef {Object} NavItem
	 * @property {string} id
	 * @property {string} label
	 * @property {string} icon
	 * @property {string} path
	 * @property {string} storageKey
	 * @property {(pathname: string) => boolean} active
	 */

	let { children } = $props();

	const { titles } = $derived($i18n);

	const navItems = $derived(
		/** @type {NavItem[]} */ ([
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
		])
	);

	if (dev) {
		validateLocales();
	}

	$effect(() => {
		document.documentElement.lang = $locale;
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
