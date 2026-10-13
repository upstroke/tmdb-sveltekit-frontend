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

export {};
