<!-- src/routes/+layout.svelte -->
<script>
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import TypeHeadSearch from '$lib/components/TypeHeadSearch.svelte';
	import FooterMain from '$lib/components/FooterMain.svelte';

	let { children } = $props();

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

	function navigateTo(path, storageKey) {
		const storedPage = getStoredPage(storageKey);

		if (storedPage <= 1) {
			goto(path);
			return;
		}

		goto(`${path}?page=${storedPage}`);
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div id="menuHeader" class="ui top fixed inverted menu hydrated">
	<nav class="ui container fluid">
		<div class="route-link item hydrated" id="home">
			<button
				class="nav-button"
				class:link-active={page.url.pathname === '/'}
				type="button"
				onclick={() => navigateTo('/', 'home-page')}
			>
				<i class="home icon"></i>
				<span>Home</span>
			</button>
		</div>

		<div class="route-link item hydrated" id="movies">
			<button
				class="nav-button"
				class:link-active={page.url.pathname === '/movies' ||
					page.url.pathname.startsWith('/movies/')}
				type="button"
				onclick={() => navigateTo('/movies', 'movies-page')}
			>
				<i class="film icon"></i>
				<span>Filme</span>
			</button>
		</div>

		<div class="route-link item hydrated" id="tvshows">
			<button
				class="nav-button"
				class:link-active={page.url.pathname === '/tv-shows' ||
					page.url.pathname.startsWith('/tv-shows/')}
				type="button"
				onclick={() => navigateTo('/tv-shows', 'tv-shows-page')}
			>
				<i class="tv icon"></i>
				<span>TV-Shows</span>
			</button>
		</div>

		<div class="item search">
			<TypeHeadSearch />
		</div>
	</nav>
</div>

{@render children()}

<FooterMain />
