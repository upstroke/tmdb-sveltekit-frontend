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
	const storageKey = 'home-page';

	/**
	 * Expected data from the server load of the homepage.
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
	 * }} data - Loaded homepage data.
	 */
	let { data } = $props();
	let previousData;

	let featured = $state(null);
	let cards = $state([]);
	let previousCards = $state([]);
	let currentPage = $state(1);
	let hasMore = $state(false);
	let error = $state(null);
	let loading = $state(false);
	let restoringCards = $state(false);
	let initialized = $state(false);
	let showLoadingCards = $state(true);

	let scrollTargetId = $state(null);
	let observer = null;

	/**
	 * Restores the homepage state on first render.
	 *
	 * The effect runs only once, loads saved page values via
	 * `restorePagedList` and sets `featured`, `cards`, `page` and `hasMore`.
	 * On errors, a message is written to `error`, while `loading`
	 * controls the loading state.
	 */
	$effect(() => {
		if (data === previousData) {
			return;
		}

		previousData = data;
		initialized = false;
		previousCards = cards;
		featured = null;
		cards = [];
		currentPage = 1;
		hasMore = false;
		error = data.error ?? null;
		restoringCards = previousCards.length > 0;
		showLoadingCards = true;
	});

	$effect(() => {
		if (initialized) {
			return;
		}

		initialized = true;

		(async () => {
			loading = true;
			restoringCards = previousCards.length > 0;

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
				previousCards = restored.cards;
				currentPage = restored.page;
				hasMore = restored.hasMore;
			} catch (restoreError) {
				error = restoreError instanceof Error ? restoreError.message : messages.unknownError;
			} finally {
				restoringCards = false;
				loading = false;
				showLoadingCards = false;
			}
		})();
	});

	/**
	 * Scrolls to the first newly inserted card after loading more.
	 *
	 * Once `scrollTargetId` is set, the effect observes the target element
	 * in the browser and performs smooth scrolling as soon as it appears in the viewport.
	 * After that, the observer is removed again.
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
	 * Saves the last loaded page to session storage.
	 *
	 * @param {number} value - Page number to save.
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
	 * Marks the target for scrolling to the first newly loaded card.
	 *
	 * @param {number} previousCardsCount - Number of cards before loading more.
	 */
	function markScrollTarget(previousCardsCount) {
		scrollTargetId = `home-card-${previousCardsCount + 1}`;
	}

	/**
	 * Loads the next page with trending content.
	 *
	 * The function prevents duplicate calls, fetches more cards via the
	 * trending route, deduplicates the results, and sets the scroll target
	 * to the first newly inserted card.
	 *
	 * @returns {Promise<void>} Resolves when loading more is complete.
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
	<title>{titles.home} TMDB</title>
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
				<li style={`--stagger-delay: ${index * 90}ms`}>
					<!-- Staggers the loading shimmer per card so the grid doesn't animate in lockstep. -->
					<!-- The child card reads this CSS variable as `--stagger-delay`. -->
					<CardDefault {...item} isLoading={showLoadingCards} scrollId={`home-card-${index + 1}`} />
				</li>
			{/each}
		</ul>

		<LoadMore {hasMore} {loading} onload={() => loadMore()} />
	{:else if restoringCards && previousCards.length > 0 && !error}
		<ul class="ui four doubling cards media-card-list" aria-busy="true" aria-live="polite">
			{#each previousCards as item, index (`restoring-home-${item.mediaType}-${item.id}`)}
				<li>
					<CardDefault {...item} isLoading={showLoadingCards} scrollId={`home-card-${index + 1}`} />
				</li>
			{/each}
		</ul>

		<!-- LoadMore wird IMMER gerendert, nicht nur wenn hasMore -->
		<LoadMore {hasMore} {loading} onload={() => loadMore()} />
	{:else if !error}
		<p class={messages.noContent ? '' : 'u-not-available'}>{messages.noContent}</p>
	{/if}
</main>
