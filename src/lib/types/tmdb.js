// @ts-check

/**
 * Central type definitions for the TMDB service layer and the pages.
 *
 * Raw types describe the TMDB API response fields that the application reads.
 * They live in `./tmdb-raw.js` and are re-exported here.
 * Normalized types describe the objects returned by `createTmdbApi`.
 * Page types describe the data the route pages receive from their load functions.
 */

/** @typedef {'movie' | 'tv'} MediaType */

/** @typedef {'w92' | 'w185' | 'w300' | 'w342' | 'w500' | 'w780' | 'w1280'} ImageSize */

/**
 * @typedef {Object} Genre
 * @property {number | string} id Numeric TMDB ID, or `'na'` for the fallback entry.
 * @property {string} name
 */

/* ---------- Request ---------- */

/**
 * Query parameters accepted by `request`. Empty values are skipped.
 *
 * @typedef {Record<string, string | number | boolean | null | undefined>} RequestParams
 */

/* ---------- Raw TMDB data (re-exported from tmdb-raw.js) ---------- */

/** @typedef {import('./tmdb-raw.js').TmdbRawItem} TmdbRawItem */
/** @typedef {import('./tmdb-raw.js').TmdbRawVideo} TmdbRawVideo */
/** @typedef {import('./tmdb-raw.js').TmdbRawPerson} TmdbRawPerson */
/** @typedef {import('./tmdb-raw.js').TmdbRawProductionCompany} TmdbRawProductionCompany */
/** @typedef {import('./tmdb-raw.js').TmdbRawSeason} TmdbRawSeason */
/** @typedef {import('./tmdb-raw.js').TmdbRawDetails} TmdbRawDetails */
/** @typedef {import('./tmdb-raw.js').TmdbRawDetailsWithId} TmdbRawDetailsWithId */
/** @typedef {import('./tmdb-raw.js').TmdbRawProvider} TmdbRawProvider */
/** @typedef {import('./tmdb-raw.js').TmdbRawEpisode} TmdbRawEpisode */
/** @typedef {import('./tmdb-raw.js').TmdbRawListResponse} TmdbRawListResponse */
/** @typedef {import('./tmdb-raw.js').TmdbRawGenreListResponse} TmdbRawGenreListResponse */
/** @typedef {import('./tmdb-raw.js').TmdbRawWatchProviderRegion} TmdbRawWatchProviderRegion */
/** @typedef {import('./tmdb-raw.js').TmdbRawWatchProvidersResponse} TmdbRawWatchProvidersResponse */
/** @typedef {import('./tmdb-raw.js').TmdbRawReleaseDate} TmdbRawReleaseDate */
/** @typedef {import('./tmdb-raw.js').TmdbRawMovieReleaseCountry} TmdbRawMovieReleaseCountry */
/** @typedef {import('./tmdb-raw.js').TmdbRawMovieCertificationResponse} TmdbRawMovieCertificationResponse */
/** @typedef {import('./tmdb-raw.js').TmdbRawTvRatingCountry} TmdbRawTvRatingCountry */
/** @typedef {import('./tmdb-raw.js').TmdbRawTvCertificationResponse} TmdbRawTvCertificationResponse */
/** @typedef {import('./tmdb-raw.js').TmdbRawSeasonResponse} TmdbRawSeasonResponse */

/* ---------- Normalized data ---------- */

/**
 * @typedef {Object} CardItem
 * @property {number} id
 * @property {MediaType} mediaType
 * @property {string} title
 * @property {string} date
 * @property {number} rating
 * @property {Genre[]} genres
 * @property {string} imageUrl
 * @property {string} posterUrl
 * @property {string=} certification Added by `enrichCardCertifications`.
 */

/**
 * @typedef {Object} PagedResult
 * @property {number} page
 * @property {CardItem[]} results
 * @property {boolean} hasMore
 */

/**
 * @typedef {Object} WatchProvider
 * @property {number} providerId
 * @property {string} providerName
 * @property {string} type `flatrate`, `rent`, or `buy`.
 * @property {string | null} link
 * @property {string | null} logoPath
 * @property {number | null} displayPriority
 */

/**
 * @typedef {Object} WatchProviders
 * @property {string} link
 * @property {WatchProvider[]} providers
 */

/**
 * @typedef {Object} CastMember
 * @property {number} id
 * @property {string} creditId
 * @property {string} name
 * @property {string} character
 * @property {number | null} order
 * @property {string} profilePath
 * @property {string} imageUrl
 */

/**
 * @typedef {Object} CrewMember
 * @property {number} id
 * @property {string} creditId
 * @property {string} name
 * @property {string} job
 * @property {string} department
 * @property {string} profilePath
 * @property {string} imageUrl
 */

/**
 * Result of `mapDetails`, without certification and providers from extra requests.
 *
 * @typedef {Object} MappedDetails
 * @property {number} id
 * @property {MediaType | null} mediaType
 * @property {string} title
 * @property {string} releaseDate
 * @property {string} overview
 * @property {string} homepage
 * @property {string[]} trailerUrls
 * @property {Genre[]} genres
 * @property {number} rating
 * @property {number | null} runtime
 * @property {number[]} episodeRunTime
 * @property {TmdbRawProductionCompany[]} productionCompanies
 * @property {string} imageUrl
 * @property {string} posterUrl
 * @property {CastMember[]} cast
 * @property {CrewMember[]} crew
 * @property {string} certification
 */

/**
 * Result of `mapFeaturedItem`.
 *
 * @typedef {Object} MappedFeatured
 * @property {number} id
 * @property {MediaType | null} mediaType
 * @property {string} title
 * @property {string} releaseDate
 * @property {string} overview
 * @property {string} homepage
 * @property {Genre[]} genres
 * @property {string} imageUrl
 * @property {string} posterUrl
 */

/**
 * @typedef {MappedDetails & { providers: WatchProviders | null }} MovieDetails
 */

/**
 * @typedef {MovieDetails & {
 *   numberOfSeasons: number | null,
 *   numberOfEpisodes: number | null,
 *   seasons: TmdbRawSeason[]
 * }} TvDetails
 */

/**
 * @typedef {Object} Episode
 * @property {number} id
 * @property {number} episodeNumber
 * @property {string} name
 * @property {string} overview
 * @property {string | null} airDate
 * @property {number | null} runtime
 * @property {number} rating
 * @property {string | null} stillUrl
 */

/**
 * @typedef {Object} SeasonDetails
 * @property {number} id
 * @property {number} seasonNumber
 * @property {string} name
 * @property {string} overview
 * @property {string | null} airDate
 * @property {string | null} posterUrl
 * @property {Episode[]} episodes
 */

/**
 * Season entry of a TV show detail page, enriched with its episodes.
 *
 * @typedef {TmdbRawSeason & { episodes: Episode[] }} TvSeasonWithEpisodes
 */

/**
 * TV show detail data as returned by the TV show detail page loader.
 *
 * @typedef {Omit<TvDetails, 'seasons'> & { seasons: TvSeasonWithEpisodes[] }} TvShowWithEpisodes
 */

/**
 * `getFeaturedToday` returns a movie shape (from `mapDetails`) or a reduced TV
 * shape (from `mapFeaturedItem`). Narrow by checking for `cast`.
 *
 * @typedef {MappedDetails & {
 *   providers: WatchProviders | null
 * }} FeaturedMovie
 */

/**
 * @typedef {MappedFeatured & {
 *   productionCompanies: TmdbRawProductionCompany[],
 *   certification: string,
 *   providers: WatchProviders | null,
 *   trailerUrls: string[]
 * }} FeaturedTv
 */

/** @typedef {FeaturedMovie | FeaturedTv} FeaturedItem */

/* ---------- Page data ---------- */

/**
 * Return value of the load functions of the home, movies and TV shows pages.
 * All properties are always present.
 *
 * @typedef {Object} ListPageData
 * @property {MappedFeatured | null} featured
 * @property {CardItem[]} cards
 * @property {number} page
 * @property {boolean} hasMore
 * @property {string | null} error
 */

/**
 * Page data as consumed by components and the paged `/trending`, `/movies`
 * and `/tv-shows` endpoints; every property is optional.
 *
 * @typedef {Partial<ListPageData>} PageData
 */

export {};
