// @ts-check

/**
 * Central type definitions for the UI locale data in `$lib/i18n/ui.json`.
 */

/**
 * @typedef {Object} LocaleFallbacks
 * @property {string} notAvailable
 * @property {string} dateFallback
 */

/**
 * @typedef {Object} LocaleLabels
 * @property {string} rating
 * @property {string} genre
 * @property {string} genres
 * @property {string} releaseDate
 * @property {string} productionCompanies
 * @property {string} moreInfo
 * @property {string} officialWebsite
 * @property {string} firstAirDate
 * @property {string} mediaType
 * @property {string} overview
 * @property {string} homepage
 * @property {string} trailer
 * @property {string} production
 * @property {string} runtime
 * @property {string} cast
 * @property {string} actor
 * @property {string} role
 * @property {string} crew
 * @property {string} job
 * @property {string} certification
 * @property {string} searchInput
 * @property {string} languageSelect
 * @property {string} navigationToggle
 * @property {string} mainNavigation
 * @property {string} movie
 * @property {string} tvShow
 * @property {string} streamingProviders
 * @property {string} streamingDataProvidedBy
 * @property {string} providerTypeFlatrate
 * @property {string} providerTypeRent
 * @property {string} providerTypeBuy
 * @property {string} seasons
 * @property {string} season
 */

/**
 * @typedef {Object} LocaleMessages
 * @property {string} loading
 * @property {string} loadMoreError
 * @property {string} unknownError
 * @property {string} pageSaveWarning
 * @property {string} loadTimeout
 * @property {string} noTvShows
 * @property {string} noGenres
 * @property {string} noRole
 * @property {string} noCast
 * @property {string} noCrew
 * @property {string} noJob
 * @property {string} searchLoading
 * @property {string} searchError
 * @property {string} searchNoResults
 * @property {string} noContent
 * @property {string} noMoviesFound
 * @property {string} apiKeyMissing
 * @property {string} contentLoadError
 * @property {string} moviesLoadError
 * @property {string} movieLoadError
 * @property {string} moreMoviesLoadError
 * @property {string} tvShowsLoadError
 * @property {string} tvShowLoadError
 * @property {string} moreTvShowsLoadError
 * @property {string} searchHint
 * @property {string} searchResults
 * @property {string} loadMore
 * @property {string} dialogErrorTitle
 * @property {string} dialogOk
 * @property {string} loadMoreLoading
 * @property {string} searchResultsCount
 */

/**
 * @typedef {Object} LocaleFormats
 * @property {string} outOfTen
 * @property {string} minutes
 * @property {string} detailsSuffix
 */

/**
 * @typedef {Object} LocaleTitles
 * @property {string} home
 * @property {string} movies
 * @property {string} movieDetails
 * @property {string} tvShowDetails
 * @property {string} tvShows
 * @property {string} topRatedProductions
 * @property {string} featuredToday
 * @property {string} trendingToday
 */

/**
 * @typedef {Object} LocaleButtons
 * @property {string} watchTrailer
 */

/**
 * @typedef {Object} LocaleData
 * @property {string} languageCode
 * @property {string} languageShortCode
 * @property {LocaleFallbacks} fallbacks
 * @property {LocaleLabels} labels
 * @property {LocaleMessages} messages
 * @property {LocaleFormats} formats
 * @property {LocaleTitles} titles
 * @property {LocaleButtons} buttons
 */

/**
 * Nested translation catalog; leaves are strings.
 * Used for generic walks over the locale data in `ui.json`.
 *
 * @typedef {{ [key: string]: string | LocaleCatalog }} LocaleCatalog
 */

export {};
