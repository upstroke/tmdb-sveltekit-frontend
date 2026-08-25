/**
 * Initiale paginierte Mediendaten, wie sie beim ersten Laden einer Seite
 * bereits an die UI übergeben werden.
 */
export const initialPagedMovieDataMock = {
	featured: { id: 99, mediaType: 'movie', title: 'Featured Movie' },
	cards: [{ id: 1, mediaType: 'movie', title: 'Movie 1' }],
	page: 1,
	hasMore: true
};

/**
 * Nachgeladene Antwort für Seite 2 mit einem Duplikat und einem neuen Eintrag.
 * Diese Daten simulieren eine typische API-Antwort aus fetchPageData(pageNumber).
 */
export const pagedMovieResponsePage2Mock = {
	page: 2,
	hasMore: true,
	cards: [
		{ id: 1, mediaType: 'movie', title: 'Movie 1 duplicate' },
		{ id: 2, mediaType: 'movie', title: 'Movie 2' }
	]
};

/**
 * Nachgeladene Antwort für Seite 3 mit einem weiteren Duplikat und einem neuen TV-Eintrag.
 * Diese Daten dienen dazu, Deduplikation über mehrere nachgeladene Seiten zu prüfen.
 */
export const pagedMovieResponsePage3Mock = {
	page: 3,
	hasMore: false,
	cards: [
		{ id: 2, mediaType: 'movie', title: 'Movie 2 duplicate' },
		{ id: 3, mediaType: 'tv', title: 'TV Show 3' }
	]
};

/**
 * Unvollständige initiale Seitendaten mit ungültigen Karten.
 * Diese Daten simulieren fehlerhafte oder unvollständig normalisierte Eingaben.
 */
export const incompletePagedMovieDataMock = {
	featured: null,
	cards: [{ id: 1 }, { mediaType: 'movie' }, null],
	page: 1,
	hasMore: false
};

/**
 * Nachgeladene Antwort ohne cards-Feld.
 * Diese Daten simulieren eine unvollständige API-Antwort, die als leere Kartenliste behandelt werden soll.
 */
export const pagedMovieResponseWithoutCardsMock = {
	page: 2,
	hasMore: false
};

/**
 * Fehlerobjekt für fehlgeschlagene Nachladevorgänge über fetchPageData(pageNumber).
 */
export const fetchPageDataErrorMock = new Error('fetch page data failed');
