<script>
	import { browser } from '$app/environment';

	import CardDefault from '$lib/components/CardDefault.svelte';
	import CardFeatured from '$lib/components/CardFeatured.svelte';
	import LoadMore from '$lib/components/LoadMore.svelte';

	import { deduplicateMedia, getMediaKey } from '$lib/utils/deduplicateMedia';

	const STORAGE_KEY = 'movies-page';

	/**
	 * Erwartete Props für die Seite.
	 *
	 * @param {{
	 *   featured?: {
	 *     id: number|string,
	 *     mediaType: 'movie'|'tv'|string,
	 *     title: string,
	 *     releaseDate?: string,
	 *     overview?: string,
	 *     homepage?: string,
	 *     genres?: Array<{id: number|string, name: string}>,
	 *     imageUrl?: string
	 *   } | null,
	 *   cards?: Array<{
	 *     id: number|string,
	 *     mediaType: 'movie'|'tv'|string,
	 *     title: string,
	 *     date?: string,
	 *     rating?: number,
	 *     genres?: Array<{id: number|string, name: string}>,
	 *     imageUrl?: string
	 *   }>,
	 *   page?: number,
	 *   hasMore?: boolean,
	 *   error?: string | null
	 * }} data - Geladene Seitendaten aus dem Server-Load.
	 */
	let { data } = $props();

	let featured = $state(null);
	let cards = $state([]);
	let page = $state(1);
	let hasMore = $state(false);
	let error = $state(null);
	let loading = $state(false);
	let initialized = $state(false);

	let scrollTargetId = $state(null);
	let observer = null;

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

	$effect(() => {
		if (!browser || !scrollTargetId) {
			return;
		}

		if (observer) {
			observer.disconnect();
		}

		const target = document.getElementById(scrollTargetId);

		if (!target) {
			scrollTargetId = null;
			return;
		}

		observer = new IntersectionObserver(
				(entries, currentObserver) => {
					if (entries.some((entry) => entry.isIntersecting)) {
						target.scrollIntoView({ behavior: 'smooth', block: 'start' });
						currentObserver.disconnect();
						scrollTargetId = null;
					}
				},
				{
					threshold: 0.1
				}
		);

		observer.observe(target);

		return () => {
			observer?.disconnect();
		};
	});

	function savePage(value) {
		if (!browser) {
			return;
		}

		try {
			sessionStorage.setItem(STORAGE_KEY, String(value));
		} catch (storageError) {
			console.warn('Movies-Seite konnte nicht gespeichert werden:', storageError);
		}
	}

	/**
	 * Merkt sich das Ziel für das Scrollen zur ersten neu geladenen Karte.
	 *
	 * @param {number} previousCardsCount - Anzahl der Karten vor dem Nachladen.
	 */
	function markScrollTarget(previousCardsCount) {
		scrollTargetId = `movie-card-${previousCardsCount + 1}`;
	}

	/**
	 * Lädt weitere Filme nach.
	 *
	 * Die Funktion verhindert Doppelaufrufe, holt weitere Karten über die
	 * Movies-Route, dedupliziert die Ergebnisse und setzt das Scrollziel
	 * auf die erste neu eingefügte Karte.
	 *
	 * @returns {Promise<void>} Wird abgeschlossen, wenn das Nachladen beendet ist.
	 */
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

			const response = await fetch(`/movies?page=${nextPage}`, {
				headers: {
					accept: 'application/json'
				},
				signal: controller.signal
			});

			if (!response.ok) {
				error = 'Weitere Inhalte konnten nicht geladen werden.';
				return;
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

			cards = [...cards, ...newCards];
			page = result.page ?? nextPage;
			hasMore = result.hasMore === true;

			savePage(page);
			markScrollTarget(previousCardsCount);
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
	<title>Filme</title>
</svelte:head>

<main class="ui container fluid movies-page">
	<h2 class="ui dividing header">Filme</h2>

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
			{#each cards as item, index (`page-movies-${item.mediaType}-${item.id}`)}
				<CardDefault {...item} scrollId={`movie-card-${index + 1}`} />
			{/each}
		</div>

		{#if hasMore}
			<LoadMore {hasMore} {loading} onload={() => loadMore()} />
		{/if}
	{:else if !error}
		<p>Keine Filme gefunden.</p>
	{/if}
</main>
