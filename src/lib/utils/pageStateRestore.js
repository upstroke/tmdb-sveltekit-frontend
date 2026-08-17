import { browser } from '$app/environment';
import { deduplicateMedia, getMediaKey } from '$lib/utils/deduplicateMedia';

/**
 * Liest die zuletzt gespeicherte Seite aus dem Session Storage.
 *
 * Gibt im Browser mindestens `1` zurück und fällt bei Fehlern ebenfalls
 * auf `1` zurück.
 *
 * @param {string} storageKey - Schlüssel für den Session-Storage-Eintrag.
 * @returns {number} Zuletzt gespeicherte Seitenzahl.
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
 * Stellt eine paginierte Liste aus gespeicherten und nachgeladenen Daten wieder her.
 *
 * Die Funktion nimmt die initialen Serverdaten, ergänzt sie bei Bedarf mit weiteren
 * Seiten und entfernt doppelte Medien anhand ihrer Schlüssel.
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
 * }} options - Konfiguration für die Wiederherstellung der Liste.
 * @returns {Promise<{
 *   featured: unknown,
 *   cards: Array<unknown>,
 *   page: number,
 *   hasMore: boolean
 * }>} Wiederhergestellter Listenstatus.
 */
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
