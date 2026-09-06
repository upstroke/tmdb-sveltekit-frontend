import { browser } from '$app/environment';
import { deduplicateMedia, getMediaKey } from '$lib/utils/deduplicateMedia';

/**
 * Reads the last saved page from session storage.
 *
 * Returns at least `1` in the browser and falls back to `1` on errors.
 *
 * @param {string} storageKey - Key for the session storage entry.
 * @returns {number} Last saved page number.
 */
export function getStoredPage(storageKey) {
	if (!browser) return 1;

	try {
		return Math.max(1, Number(sessionStorage.getItem(storageKey) ?? '1') || 1);
	} catch {
		return 1;
	}
}

/**
 * Restores a paginated list from saved and loaded data.
 *
 * The function takes the initial server data, supplements it with additional
 * pages if necessary, and removes duplicate media based on their keys.
 *
 * @param {{
 *   storageKey: string,
 *   initialData: {
 *     featured?: unknown,
 *     cards?: Array<unknown>,
 *     page?: number,
 *     hasMore?: boolean
 *   },
 *   fetchPageData: (pageNumber: number) => Promise<{
 *     featured?: unknown,
 *     cards?: Array<unknown>,
 *     page?: number,
 *     hasMore?: boolean
 *   }>
 * }} options - Configuration for restoring the list.
 * @returns {Promise<{
 *   featured: unknown,
 *   cards: Array<unknown>,
 *   page: number,
 *   hasMore: boolean
 * }>} Restored list state.
 */
export async function restorePagedList({ storageKey, initialData, fetchPageData }) {
	const storedPage = getStoredPage(storageKey);
	let currentCards = deduplicateMedia(initialData.cards ?? []);
	let currentFeatured = initialData.featured ?? null;
	let currentHasMore = initialData.hasMore === true;
	let currentPage = initialData.page ?? 1;

	if (!browser || storedPage <= currentPage) {
		return {
			featured: currentFeatured,
			cards: currentCards,
			page: currentPage,
			hasMore: currentHasMore
		};
	}

	for (let nextPage = currentPage + 1; nextPage <= storedPage; nextPage += 1) {
		const result = await fetchPageData(nextPage);
		const incomingCards = deduplicateMedia(result.cards ?? []);
		const existingKeys = new Set(currentCards.map(getMediaKey).filter(Boolean));

		const newCards = incomingCards.filter((card) => !existingKeys.has(getMediaKey(card)));

		if (newCards.length > 0) {
			currentCards = [...currentCards, ...newCards];
		}

		currentPage = result.page ?? nextPage;
		currentHasMore = result.hasMore === true;
		currentFeatured = currentFeatured ?? initialData.featured ?? null;
	}

	return {
		featured: currentFeatured,
		cards: currentCards,
		page: currentPage,
		hasMore: currentHasMore
	};
}
