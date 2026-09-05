/**
 * Initial paginated media data as passed to the UI on first page load.
 */
export const initialPagedMovieDataMock = {
	featured: { id: 99, mediaType: 'movie', title: 'Featured Movie' },
	cards: [{ id: 1, mediaType: 'movie', title: 'Movie 1' }],
	page: 1,
	hasMore: true
};

/**
 * Loaded response for page 2 with one duplicate and one new entry.
 * This data simulates a typical API response from fetchPageData(pageNumber).
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
 * Loaded response for page 3 with another duplicate and a new TV entry.
 * This data is used to verify deduplication across multiple loaded pages.
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
 * Incomplete initial page data with invalid cards.
 * This data simulates erroneous or incompletely normalized inputs.
 */
export const incompletePagedMovieDataMock = {
	featured: null,
	cards: [{ id: 1 }, { mediaType: 'movie' }, null],
	page: 1,
	hasMore: false
};

/**
 * Loaded response without the cards field.
 * This data simulates an incomplete API response that should be treated as an empty card list.
 */
export const pagedMovieResponseWithoutCardsMock = {
	page: 2,
	hasMore: false
};

/**
 * Error object for failed load operations via fetchPageData(pageNumber).
 */
export const fetchPageDataErrorMock = new Error('fetch page data failed');
