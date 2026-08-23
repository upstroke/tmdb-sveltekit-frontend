<script>
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { i18n } from '$lib/stores/i18n';
	import { resolveLocale } from '$lib/i18n/helpers';

	import CardFeatured from '$lib/components/CardFeatured.svelte';
	import CardDefault from '$lib/components/CardDefault.svelte';
	import LoadMore from '$lib/components/LoadMore.svelte';
	import DialogMessage from '$lib/components/DialogMessage.svelte';

	import { deduplicateMedia, getMediaKey } from '$lib/utils/deduplicateMedia';
	import { restorePagedList } from '$lib/utils/pageStateRestore';

	const { titles, messages } = $derived($i18n);
	const activeLocale = $derived(resolveLocale(page.url.searchParams.get('locale')));
	const storageKey = $derived(`home-page-${activeLocale}`);

	/**
	 * Erwartete Daten aus dem Server-Load der Startseite.
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
	 *     title?: string,
	 *     date?: string,
	 *     rating?: number,
	 *     genres?: Array<{id: number|string, name: string}>,
	 *     imageUrl?: string
	 *   }>,
	 *   page?: number,
	 *   hasMore?: boolean,
	 *   error?: string | null
	 * }} data - Geladene Startseiten-Daten.
	 */
	let { data } = $props();
	let previousData;

	let featured = $state(null);
	let cards = $state([]);
	let currentPage = $state(1);
	let hasMore = $state(false);
	let error = $state(null);
	let loading = $state(false);
	let initialized = $state(false);

	let scrollTargetId = $state(null);
	let observer = null;

	/**
	 * Stellt den Startseitenzustand beim ersten Render wieder her.
	 *
	 * Der Effekt läuft nur einmal, lädt gespeicherte Seitenwerte über
	 * `restorePagedList` und setzt `featured`, `cards`, `page` und `hasMore`.
	 * Bei Fehlern wird eine Meldung in `error` geschrieben, während `loading`
	 * den Ladezustand steuert.
	 */
	$effect(() => {
		if (data === previousData) {
			return;
		}

		previousData = data;
		initialized = false;
		featured = null;
		cards = [];
		currentPage = 1;
		hasMore = false;
		error = data.error ?? null;
	});

	$effect(() => {
		if (initialized) {
			return;
		}

		initialized = true;

		(async () => {
			loading = true;

			try {
				const restored = await restorePagedList({
					storageKey: storageKey,
					initialData: data,
					fetchPageData: async (pageNumber) => {
						const response = await fetch(
							`/trending?page=${pageNumber}&locale=${encodeURIComponent(activeLocale)}`,
							{
								headers: {
									accept: 'application/json'
								}
							}
						);

						if (!response.ok) {
							throw new Error(messages.loadMoreError);
						}

						return response.json();
					}
				});

				featured = restored.featured;
				cards = restored.cards;
				currentPage = restored.page;
				hasMore = restored.hasMore;
			} catch (restoreError) {
				error = restoreError instanceof Error ? restoreError.message : messages.unknownError;
			} finally {
				loading = false;
			}
		})();
	});

	/**
	 * Scrollt nach dem Nachladen zur ersten neu eingefügten Karte.
	 *
	 * Sobald `scrollTargetId` gesetzt ist, beobachtet der Effekt das Ziel-Element
	 * im Browser und führt ein sanftes Scrollen aus, sobald es im Viewport auftaucht.
	 * Danach wird der Observer wieder entfernt.
	 */
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

	/**
	 * Speichert die zuletzt geladene Seite im Session Storage.
	 *
	 * @param {number} value - Seitennummer, die gespeichert werden soll.
	 */
	function savePage(value) {
		if (!browser) {
			return;
		}

		try {
			sessionStorage.setItem(storageKey, String(value));
		} catch (storageError) {
			console.warn(messages.pageSaveWarning, storageError);
		}
	}

	/**
	 * Merkt sich das Ziel für das Scrollen zur ersten neu geladenen Karte.
	 *
	 * @param {number} previousCardsCount - Anzahl der Karten vor dem Nachladen.
	 */
	function markScrollTarget(previousCardsCount) {
		scrollTargetId = `home-card-${previousCardsCount + 1}`;
	}

	/**
	 * Lädt die nächste Seite mit Trending-Inhalten nach.
	 *
	 * Die Funktion verhindert Doppelaufrufe, holt weitere Karten über die
	 * Trending-Route, dedupliziert die Ergebnisse und setzt das Scrollziel
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
			const nextPage = currentPage + 1;

			const response = await fetch(
				`/trending?page=${nextPage}&locale=${encodeURIComponent(activeLocale)}`,
				{
					headers: {
						accept: 'application/json'
					},
					signal: controller.signal
				}
			);

			if (!response.ok) {
				error = messages.loadMoreError;
				return;
			}

			const result = await response.json();

			const existingKeys = new Set(cards.map(getMediaKey).filter(Boolean));

			const newCards = deduplicateMedia(result.cards ?? []).filter(
				(card) => !existingKeys.has(getMediaKey(card))
			);

			if (newCards.length === 0) {
				hasMore = false;
				savePage(currentPage);
				return;
			}

			const previousCardsCount = cards.length;

			cards = [...cards, ...newCards];
			currentPage = result.page ?? nextPage;
			hasMore = result.hasMore === true;

			savePage(currentPage);
			markScrollTarget(previousCardsCount);
		} catch (exception) {
			if (exception.name === 'AbortError') {
				error = messages.loadTimeout;
			} else {
				error = exception instanceof Error ? exception.message : messages.unknownError;
			}
		} finally {
			clearTimeout(timeoutId);
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>{titles.home}</title>
</svelte:head>

<main class="ui container fluid home-page">
	{#if error}
		<DialogMessage message={error} />
	{/if}

	{#if featured}
		<h2 class="ui dividing header {titles.featuredToday ? '' : 'u-not-available'}">
			{titles.featuredToday}
		</h2>

		<CardFeatured {...featured} />
	{/if}

	<h2 class="ui dividing header {titles.trendingToday ? '' : 'u-not-available'}">
		{titles.trendingToday}
	</h2>

	{#if cards.length > 0}
		<ul class="ui four doubling cards media-card-list">
			{#each cards as item, index (`page-home-${item.mediaType}-${item.id}`)}
				<li>
					<CardDefault {...item} scrollId={`home-card-${index + 1}`} />
				</li>
			{/each}
		</ul>

		{#if hasMore}
			<LoadMore {hasMore} {loading} onload={() => loadMore()} />
		{/if}
	{:else if !error}
		<p class={messages.noContent ? '' : 'u-not-available'}>{messages.noContent}</p>
	{/if}
</main>
