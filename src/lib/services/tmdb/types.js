// @ts-check

/**
 * Central type definitions for the TMDB service layer.
 *
 * Raw types describe the TMDB API response fields that the application reads.
 * Normalized types describe the objects returned by `createTmdbApi`.
 */

/** @typedef {'movie' | 'tv'} MediaType */

/** @typedef {'w92' | 'w185' | 'w300' | 'w342' | 'w500' | 'w780' | 'w1280'} ImageSize */

/**
 * @typedef {Object} Genre
 * @property {number | string} id Numeric TMDB ID, or `'na'` for the fallback entry.
 * @property {string} name
 */

/* ---------- Raw TMDB data ---------- */

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
 * @property {Genre[]=} genres
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

export {};
