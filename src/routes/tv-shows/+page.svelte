<script>
	import { browser } from '$app/environment';

	import CardDefault from '$lib/components/CardDefault.svelte';
	import CardFeatured from '$lib/components/CardFeatured.svelte';
	import LoadMore from '$lib/components/LoadMore.svelte';

	import { deduplicateMedia, getMediaKey } from '$lib/utils/deduplicateMedia';

	const STORAGE_KEY = 'tv-shows-page';

	let { data } = $props();

	let featured = $state(null);
	let cards = $state([]);
	let page = $state(1);
	let hasMore = $state(false);
	let error = $state(null);
	let loading = $state(false);
	let initialized = $state(false);

	$effect(() => {
		if (initialized) {
			return;
		}

		featured = data.featured ?? null;
		cards = deduplicateMedia(data.cards ?? []);
		page = data.page ?? 1;
		hasMore = data.hasMore === true;
		error = data.error ?? null;

		initialized = true;
	});

	function savePage(value) {
		if (!browser) {
			return;
		}

		try {
			sessionStorage.setItem(STORAGE_KEY, String(value));
		} catch (storageError) {
			console.warn('TV-Shows-Seite konnte nicht gespeichert werden:', storageError);
		}
	}

	function scrollToFirstNewCard(selector) {
		return new Promise((resolve) => {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					try {
						const target = document.querySelector(selector);

						if (!target) {
							resolve();
							return;
						}

						const rootStyles = getComputedStyle(document.documentElement);

						const headerHeight = parseFloat(rootStyles.getPropertyValue('--header-height')) || 0;

						const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight;

						window.scrollTo({
							top: Math.max(0, targetTop),
							behavior: 'smooth'
						});
					} catch (scrollError) {
						console.warn('Scrollen zur neuen Karte fehlgeschlagen:', scrollError);
					} finally {
						resolve();
					}
				});
			});
		});
	}

	async function loadMore() {
		if (loading || !hasMore) {
			return;
		}

		loading = true;
		error = null;

		const controller = new AbortController();

		const timeoutId = setTimeout(() => {
			controller.abort();
		}, 15000);

		try {
			const nextPage = page + 1;

			const response = await fetch(`/tv-shows?page=${nextPage}`, {
				headers: {
					accept: 'application/json'
				},
				signal: controller.signal
			});

			if (!response.ok) {
				throw new Error('Weitere Inhalte konnten nicht geladen werden.');
			}

			const result = await response.json();

			const existingKeys = new Set(cards.map(getMediaKey).filter(Boolean));

			const newCards = deduplicateMedia(result.cards ?? []).filter(
				(card) => !existingKeys.has(getMediaKey(card))
			);

			if (newCards.length === 0) {
				hasMore = false;
				savePage(page);
				return;
			}

			const previousCardsCount = cards.length;

			const selector = `.tv-shows-page .cards .default-card:nth-child(${previousCardsCount + 1})`;

			cards = [...cards, ...newCards];
			page = result.page ?? nextPage;
			hasMore = result.hasMore === true;

			savePage(page);

			await scrollToFirstNewCard(selector);
		} catch (exception) {
			if (exception.name === 'AbortError') {
				error = 'Das Laden hat zu lange gedauert.';
			} else {
				error = exception instanceof Error ? exception.message : 'Unbekannter Fehler';
			}
		} finally {
			clearTimeout(timeoutId);
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>TV-Shows</title>
</svelte:head>

<main class="ui container fluid tv-shows-page">
	<h2 class="ui dividing header">TV-Shows</h2>

	{#if error}
		<div class="ui negative message">
			<div class="header">Fehler beim Laden</div>

			<p>{error}</p>
		</div>
	{/if}

	{#if featured}
		<CardFeatured {...featured} />
	{/if}

	<h2 class="ui dividing header">Am besten bewertete Produktionen</h2>

	{#if cards.length > 0}
		<div class="ui four doubling cards">
			{#each cards as item (`page-tvshows-${item.mediaType}-${item.id}`)}
				<CardDefault {...item} />
			{/each}
		</div>

		{#if hasMore}
			<LoadMore {hasMore} {loading} onload={() => loadMore()} />
		{/if}
	{:else if !error}
		<p>Keine TV-Shows gefunden.</p>
	{/if}
</main>
