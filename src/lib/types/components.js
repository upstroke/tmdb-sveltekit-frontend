// @ts-check

/**
 * Prop type definitions for Svelte components.
 */

/**
 * Props of `CardDefault.svelte`.
 *
 * @typedef {Object} CardDefaultProps
 * @property {number | string} id TMDB ID of the media item.
 * @property {import('./tmdb.js').MediaType} mediaType Media type and target route of the card.
 * @property {string=} title
 * @property {string=} date Release or air date.
 * @property {number=} rating
 * @property {string | number=} certification Age rating, e.g. FSK or US rating.
 * @property {Pick<import('./tmdb.js').Genre, 'name'>[]=} genres
 * @property {string=} imageUrl Poster URL; a placeholder is used if empty.
 * @property {string=} scrollId Optional HTML id for the card.
 * @property {boolean=} isLoading Shows the loading state of the card.
 */

/**
 * Props of `CardFeatured.svelte`.
 *
 * @typedef {Object} CardFeaturedProps
 * @property {number | string} id TMDB ID of the media item for the detail link.
 * @property {import('./tmdb.js').MediaType | null} mediaType Media type and target route of the card; `null` renders the card without a detail link.
 * @property {string=} title
 * @property {string=} releaseDate Release or premiere date.
 * @property {string=} overview Short description of the media.
 * @property {string=} homepage URL of the official website.
 * @property {{ id?: number | string, name: string }[]=} genres
 * @property {string=} imageUrl Background image URL; a placeholder is used if empty.
 * @property {string=} posterUrl Poster URL; falls back to `imageUrl`.
 */

export {};
