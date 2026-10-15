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

/**
 * Props of `DetailsHero.svelte`.
 *
 * @typedef {Object} DetailsHeroProps
 * @property {string=} title Title of the media; a fallback text is shown if empty.
 * @property {string=} backdrop Background image URL; falls back to `posterUrl`.
 * @property {string=} posterUrl Poster URL; a placeholder is used if empty.
 * @property {Pick<import('./tmdb-raw.js').TmdbRawProductionCompany, 'id' | 'name'>[]=} productionCompanies Production companies of the media.
 * @property {string=} emptyLabel Text for the empty state of production companies.
 */

/**
 * Props of `DialogMessage.svelte`.
 *
 * @typedef {Object} DialogMessageProps
 * @property {string} message Message text; the dialog opens as soon as a message is present.
 * @property {string=} title Dialog heading; defaults to the localized error title.
 */

/**
 * Navigation entry of `HeaderMain.svelte`, built in `routes/+layout.svelte`.
 *
 * @typedef {Object} NavItem
 * @property {string} id Unique ID, also used as the list item ID.
 * @property {string} label Visible link text.
 * @property {string} icon Icon class name.
 * @property {string} path Target path.
 * @property {string} storageKey Session storage key for the last opened page number.
 * @property {(pathname: string) => boolean} active Returns true if the item matches the current path.
 */

/**
 * Props of `HeaderMain.svelte`.
 *
 * @typedef {Object} HeaderMainProps
 * @property {NavItem[]=} navItems Navigation entries; defaults to an empty list.
 * @property {import('svelte').Snippet=} children Optional content rendered next to the navigation, e.g. the search.
 */

/**
 * Props of `LoadMore.svelte`.
 *
 * @typedef {Object} LoadMoreProps
 * @property {boolean=} hasMore Indicates whether more entries are available.
 * @property {boolean=} loading Indicates whether more entries are currently being loaded.
 * @property {(() => void | Promise<void>) | null=} onload Callback for loading more entries.
 */

/**
 * Props of `MediaTypeLabel.svelte`.
 *
 * @typedef {Object} MediaTypeLabelProps
 * @property {import('./tmdb.js').MediaType | string | null=} mediaType Media type from which text and color variant are derived; unknown or missing values render nothing.
 * @property {string=} class Additional CSS classes for the label.
 */

/**
 * Episode entry shown inside a tab of `TabGroupe.svelte`.
 * Reduced view of `TmdbRawEpisode` (`name` is required for display).
 *
 * @typedef {Object} TabEpisode
 * @property {number=} id TMDB episode ID.
 * @property {string} name Episode title.
 * @property {string=} air_date Air date (ISO string).
 * @property {string=} overview Episode summary.
 */

/**
 * Single tab of `TabGroupe.svelte`.
 *
 * @typedef {Object} Tab
 * @property {string | number} id Unique tab ID (also used for the `tab-<id>` element ID).
 * @property {string} label Visible tab label.
 * @property {boolean=} loading Shows the loading state while content is fetched.
 * @property {TabEpisode[]=} episodes Optional episode list rendered in the tab panel.
 * @property {string=} content Optional plain text content of the tab panel.
 */

/**
 * Props of `TabGroupe.svelte`.
 *
 * @typedef {Object} TabGroupeProps
 * @property {Tab[]=} tabs Tabs to render; the first tab is active if `initialTab` is not set.
 * @property {(string | number)=} initialTab ID of the initially active tab.
 * @property {string=} ariaLabel Accessible label of the tab list (required for WCAG 4.1.2).
 * @property {((id: string) => void)=} onTabSelect Called with the tab ID after a tab was selected.
 */

export {};
