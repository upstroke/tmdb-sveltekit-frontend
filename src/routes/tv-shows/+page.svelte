<script>
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { resolveLocale } from '$lib/i18n/helpers';
	import { i18n } from '$lib/stores/i18n';

	import CardDefault from '$lib/components/CardDefault.svelte';
	import CardFeatured from '$lib/components/CardFeatured.svelte';
	import LoadMore from '$lib/components/LoadMore.svelte';
	import DialogMessage from '$lib/components/DialogMessage.svelte';
	import { restorePagedList } from '$lib/utils/pageStateRestore';
	import { deduplicateMedia, getMediaKey } from '$lib/utils/deduplicateMedia';

	const { titles, messages } = $derived($i18n);
	const activeLocale = $derived(resolveLocale(page.url.searchParams.get('locale')));
	const storageKey = 'tv-shows-page';

	/**
	 * Expected props for the page.
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
	 * Loaded page data from the server load.
	 *
	 * @type {{ data: PageData }}
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
	 * Initializes the page state once.
	 *
	 * On the first render, stored page values are restored via `restorePagedList`.
	 * The function loads additional pages if needed, sets `featured`, `cards`,
	 * `page`, and `hasMore`, and handles errors with a visible message.
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
							`/tv-shows?page=${pageNumber}&locale=${encodeURIComponent(activeLocale)}`,
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

				featured = restored.featured ?? null;
				cards = restored.cards ?? [];
				currentPage = restored.page ?? 1;
				hasMore = restored.hasMore ?? false;
			} catch (restoreError) {
				error = restoreError instanceof Error ? restoreError.message : messages.unknownError;
			} finally {
				loading = false;
			}
		})();
	});

	/**
	 * Scrolls to the first newly inserted card after loading more content.
	 *
	 * Once `scrollTargetId` is set, the effect observes the target element
	 * in the browser and performs a smooth scroll as soon as it appears
	 * in the viewport. The observer is then removed again.
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
	 * Stores the most recently loaded page in session storage.
	 *
	 * @param {number} value - The page number to store.
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
	 * Sets the target for scrolling to the first newly loaded card.
	 *
	 * @param {number} previousCardsCount - The number of cards before loading more.
	 */
	function markScrollTarget(previousCardsCount) {
		scrollTargetId = `tv-card-${previousCardsCount + 1}`;
	}

	/**
	 * Loads more TV shows.
	 *
	 * The function prevents duplicate calls, fetches additional cards via the
	 * TV shows route, deduplicates the results, and sets the scroll target
	 * to the first newly inserted card.
	 *
	 * @returns {Promise<void>} Resolves when loading more content is complete.
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
				`/tv-shows?page=${nextPage}&locale=${encodeURIComponent(activeLocale)}`,
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
	<title>{titles.tvShows} TMDB</title>
</svelte:head>

<main class="ui container fluid tv-shows-page">
	{#if error}
		<DialogMessage message={error} />
	{/if}

	<h2 class="ui dividing header {titles.tvShows ? '' : 'u-not-available'}">{titles.tvShows}</h2>

	{#if featured}
		<CardFeatured {...featured} />
	{/if}

	<h2 class="ui dividing header {titles.topRatedProductions ? '' : 'u-not-available'}">
		{titles.topRatedProductions}
	</h2>

	{#if cards.length > 0}
		<ul class="ui four doubling cards media-card-list">
			{#each cards as item, index (`page-tv-${item.mediaType}-${item.id}`)}
				<li style={`--stagger-delay: ${index * 90}ms`}>
					<!-- Staggers the card loading pulse so the grid reveals itself with slight variation. -->
					<!-- CardDefault consumes this as `--stagger-delay` for the loading state. -->
					<CardDefault {...item} scrollId={`tv-card-${index + 1}`} />
				</li>
			{/each}
		</ul>

		<!-- LoadMore wird IMMER gerendert, nicht nur wenn hasMore -->
		<LoadMore {hasMore} {loading} onload={() => loadMore()} />
	{:else if !error}
		<p class={messages.noTvShows ? '' : 'u-not-available'}>{messages.noTvShows}</p>
	{/if}
</main>
