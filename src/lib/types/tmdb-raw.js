// @ts-check

/**
 * Raw TMDB API response types.
 *
 * These describe the TMDB API response fields that the application reads.
 * Shared base types (`Genre`, `MediaType`) live in `./tmdb.js`.
 * Everything here is re-exported from `./tmdb.js` for backwards compatibility.
 */

/**
 * Raw list or detail entry. Fields vary by endpoint, so most are optional.
 *
 * @typedef {Object} TmdbRawItem
 * @property {number=} id
 * @property {'movie' | 'tv' | 'person' | string=} media_type
 * @property {string=} title
 * @property {string=} name
 * @property {string=} release_date
 * @property {string=} first_air_date
 * @property {string | null=} poster_path
 * @property {string | null=} backdrop_path
 * @property {string=} overview
 * @property {string=} homepage
 * @property {number=} vote_average
 * @property {number[]=} genre_ids
 * @property {import('./tmdb.js').Genre[]=} genres
 */

/**
 * @typedef {Object} TmdbRawVideo
 * @property {string} site
 * @property {string} type
 * @property {string=} key
 */

/**
 * @typedef {Object} TmdbRawPerson
 * @property {number} id
 * @property {string} credit_id
 * @property {string} name
 * @property {string=} character
 * @property {string=} job
 * @property {string=} department
 * @property {number=} order
 * @property {string | null=} profile_path
 */

/**
 * @typedef {Object} TmdbRawProductionCompany
 * @property {number} id
 * @property {string} name
 * @property {string | null=} logo_path
 * @property {string=} origin_country
 */

/**
 * @typedef {Object} TmdbRawSeason
 * @property {number} id
 * @property {number} season_number
 * @property {string=} name
 * @property {string=} overview
 * @property {string | null=} air_date
 * @property {string | null=} poster_path
 * @property {number=} episode_count
 */

/**
 * @typedef {TmdbRawItem & {
 *   runtime?: number | null,
 *   episode_run_time?: number[],
 *   number_of_seasons?: number | null,
 *   number_of_episodes?: number | null,
 *   seasons?: TmdbRawSeason[],
 *   production_companies?: TmdbRawProductionCompany[],
 *   videos?: { results?: TmdbRawVideo[] },
 *   credits?: { cast?: TmdbRawPerson[], crew?: TmdbRawPerson[] },
 *   certification?: string
 * }} TmdbRawDetails
 */

/**
 * Raw detail data that is guaranteed to carry an ID.
 *
 * @typedef {TmdbRawDetails & { id: number }} TmdbRawDetailsWithId
 */

/**
 * @typedef {Object} TmdbRawProvider
 * @property {number} provider_id
 * @property {string} provider_name
 * @property {string | null=} logo_path
 * @property {number | null=} display_priority
 */

/**
 * @typedef {Object} TmdbRawEpisode
 * @property {number} id
 * @property {number} episode_number
 * @property {string=} name
 * @property {string=} overview
 * @property {string | null=} air_date
 * @property {number | null=} runtime
 * @property {number=} vote_average
 * @property {string | null=} still_path
 */

/**
 * @typedef {Object} TmdbRawListResponse
 * @property {number=} page
 * @property {number=} total_pages
 * @property {TmdbRawItem[]=} results
 */

/**
 * @typedef {Object} TmdbRawGenreListResponse
 * @property {{id: number, name: string}[]=} genres
 */

/**
 * @typedef {Object} TmdbRawWatchProviderRegion
 * @property {string=} link
 * @property {TmdbRawProvider[]=} flatrate
 * @property {TmdbRawProvider[]=} rent
 * @property {TmdbRawProvider[]=} buy
 */

/**
 * @typedef {Object} TmdbRawWatchProvidersResponse
 * @property {Record<string, TmdbRawWatchProviderRegion>=} results
 */

/**
 * @typedef {Object} TmdbRawReleaseDate
 * @property {string=} certification
 */

/**
 * @typedef {Object} TmdbRawMovieReleaseCountry
 * @property {string} iso_3166_1
 * @property {TmdbRawReleaseDate[]=} release_dates
 */

/**
 * @typedef {Object} TmdbRawMovieCertificationResponse
 * @property {TmdbRawMovieReleaseCountry[]=} results
 */

/**
 * @typedef {Object} TmdbRawTvRatingCountry
 * @property {string} iso_3166_1
 * @property {string=} rating
 */

/**
 * @typedef {Object} TmdbRawTvCertificationResponse
 * @property {TmdbRawTvRatingCountry[]=} results
 */

/**
 * @typedef {TmdbRawSeason & { episodes?: TmdbRawEpisode[] }} TmdbRawSeasonResponse
 */

export {};
