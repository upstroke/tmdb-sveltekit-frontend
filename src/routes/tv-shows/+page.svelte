<script>
	import { browser } from '$app/environment';

	import CardDefault from '$lib/components/CardDefault.svelte';
	import CardFeatured from '$lib/components/CardFeatured.svelte';
	import LoadMore from '$lib/components/LoadMore.svelte';
	import DialogMessage from '$lib/components/DialogMessage.svelte';

	import { deduplicateMedia, getMediaKey } from '$lib/utils/deduplicateMedia';
	import { restorePagedList } from '$lib/utils/pageStateRestore';

	const STORAGE_KEY = 'tv-shows-page';

	/**
	 * Erwartete Props für die Seite.
	 *
	 * @typedef {Object} PageData
	 * @property {{
	 *   id: number|string,
	 *   mediaType: 'movie'|'tv'|string,
	 *   title: string,
	 *   releaseDate?: string,
	 *   overview?: string,
	 *   homepage?: string,
	 *   genres?: Array<{id: number|string, name: string}>,
	 *   imageUrl?: string
	 * } | null} [featured]
	 * @property {Array<{
	 *   id: number|string,
	 *   mediaType: 'movie'|'tv'|string,
	 *   title: string,
	 *   date?: string,
	 *   rating?: number,
	 *   genres?: Array<{id: number|string, name: string}>,
	 *   imageUrl?: string
	 * }>} [cards]
	 * @property {number} [page]
	 * @property {boolean} [hasMore]
	 * @property {string | null} [error]
	 */

	/**
	 * Geladene Seitendaten aus dem Server-Load.
	 *
	 * @type {{ data: PageData }}
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

	/**
	 * Initialisiert den Seitenzustand einmalig.
	 *
	 * Beim ersten Render werden gespeicherte Seitenwerte über `restorePagedList`
	 * wiederhergestellt. Die Funktion lädt bei Bedarf weitere Seiten nach,
	 * setzt `featured`, `cards`, `page` und `hasMore` und behandelt Fehler mit
	 * einer sichtbaren Meldung.
	 */
	$effect(() => {
		if (initialized) {
			return;
		}

		initialized = true;
		error = data.error ?? null;

		(async () => {
			loading = true;

			try {
				const restored = await restorePagedList({
					storageKey: STORAGE_KEY,
					initialData: data,
					fetchPageData: async (pageNumber) => {
						const response = await fetch(`/tv-shows?page=${pageNumber}`, {
							headers: {
								accept: 'application/json'
							}
						});

						if (!response.ok) {
							throw new Error('Weitere Inhalte konnten nicht geladen werden.');
						}

						return response.json();
					}
				});

				featured = restored.featured;
				cards = restored.cards;
				page = restored.page;
				hasMore = restored.hasMore;
			} catch (restoreError) {
				error = restoreError instanceof Error ? restoreError.message : 'Unbekannter Fehler';
			} finally {
				loading = false;
			}
		})();
	});

	/**
	 * Scrollt nach dem Nachladen zur ersten neu eingefügten Karte.
	 *
	 * Sobald `scrollTargetId` gesetzt ist, beobachtet der Effekt das Ziel-Element
	 * im Browser und führt ein sanftes Scrollen aus, sobald es im Viewport
	 * auftaucht. Danach wird der Observer wieder entfernt.
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
			sessionStorage.setItem(STORAGE_KEY, String(value));
		} catch (storageError) {
			console.warn('TV-Shows-Seite konnte nicht gespeichert werden:', storageError);
		}
	}

	/**
	 * Merkt sich das Ziel für das Scrollen zur ersten neu geladenen Karte.
	 *
	 * @param {number} previousCardsCount - Anzahl der Karten vor dem Nachladen.
	 */
	function markScrollTarget(previousCardsCount) {
		scrollTargetId = `tv-card-${previousCardsCount + 1}`;
	}

	/**
	 * Lädt weitere TV-Shows nach.
	 *
	 * Die Funktion verhindert Doppelaufrufe, holt weitere Karten über die
	 * TV-Shows-Route, dedupliziert die Ergebnisse und setzt das Scrollziel
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

			const response = await fetch(`/tv-shows?page=${nextPage}`, {
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
	<title>TV-Shows</title>
</svelte:head>

<main class="ui container fluid tv-shows-page">
	{#if error}
		<DialogMessage message={error} />
	{/if}

	<h2 class="ui dividing header">TV-Shows</h2>

	{#if featured}
		<CardFeatured {...featured} />
	{/if}

	<h2 class="ui dividing header">Am besten bewertete Produktionen</h2>

	{#if cards.length > 0}
		<ul class="ui four doubling cards media-card-list">
			{#each cards as item, index (`page-tv-${item.mediaType}-${item.id}`)}
				<li>
					<CardDefault {...item} scrollId={`tv-card-${index + 1}`} />
				</li>
			{/each}
		</ul>

		{#if hasMore}
			<LoadMore {hasMore} {loading} onload={() => loadMore()} />
		{/if}
	{:else if !error}
		<p>Keine TV-Shows gefunden.</p>
	{/if}
</main>
