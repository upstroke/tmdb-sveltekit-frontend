import { browser } from '$app/environment';
import { deduplicateMedia, getMediaKey } from '$lib/utils/deduplicateMedia';

export function getStoredPage(storageKey) {
	if (!browser) return 1;

	try {
		return Math.max(1, Number(sessionStorage.getItem(storageKey) ?? '1') || 1);
	} catch {
		return 1;
	}
}

export async function restorePagedList({
																				 storageKey,
																				 initialData,
																				 fetchPageData
																			 }) {
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
