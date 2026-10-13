// @ts-check

import { getDate, getImageUrl, getMediaType, getTitle } from '$lib/services/tmdb/helpers';
import notAvailableImage from '$lib/assets/not-available.png';
import { DEFAULT_LOCALE } from '$lib/i18n/config';

/** @typedef {import('./tmdb/types.js').MediaType} MediaType */
/** @typedef {import('./tmdb/types.js').Genre} Genre */
/** @typedef {import('./tmdb/types.js').TmdbRawItem} TmdbRawItem */
/** @typedef {import('./tmdb/types.js').TmdbRawDetails} TmdbRawDetails */
/** @typedef {import('./tmdb/types.js').TmdbRawPerson} TmdbRawPerson */
/** @typedef {import('./tmdb/types.js').TmdbRawProvider} TmdbRawProvider */
/** @typedef {import('./tmdb/types.js').TmdbRawEpisode} TmdbRawEpisode */
/** @typedef {import('./tmdb/types.js').TmdbRawListResponse} TmdbRawListResponse */
/** @typedef {import('./tmdb/types.js').TmdbRawGenreListResponse} TmdbRawGenreListResponse */
/** @typedef {import('./tmdb/types.js').TmdbRawWatchProvidersResponse} TmdbRawWatchProvidersResponse */
/** @typedef {import('./tmdb/types.js').TmdbRawMovieCertificationResponse} TmdbRawMovieCertificationResponse */
/** @typedef {import('./tmdb/types.js').TmdbRawTvCertificationResponse} TmdbRawTvCertificationResponse */
/** @typedef {import('./tmdb/types.js').TmdbRawSeasonResponse} TmdbRawSeasonResponse */
/** @typedef {import('./tmdb/types.js').CardItem} CardItem */
/** @typedef {import('./tmdb/types.js').PagedResult} PagedResult */
/** @typedef {import('./tmdb/types.js').WatchProvider} WatchProvider */
/** @typedef {import('./tmdb/types.js').WatchProviders} WatchProviders */
/** @typedef {import('./tmdb/types.js').CastMember} CastMember */
/** @typedef {import('./tmdb/types.js').CrewMember} CrewMember */
/** @typedef {import('./tmdb/types.js').MappedDetails} MappedDetails */
/** @typedef {import('./tmdb/types.js').MappedFeatured} MappedFeatured */
/** @typedef {import('./tmdb/types.js').MovieDetails} MovieDetails */
/** @typedef {import('./tmdb/types.js').TvDetails} TvDetails */
/** @typedef {import('./tmdb/types.js').SeasonDetails} SeasonDetails */
/** @typedef {import('./tmdb/types.js').FeaturedItem} FeaturedItem */

/**
 * Raw detail data that is guaranteed to carry an ID.
 *
 * @typedef {TmdbRawDetails & { id: number }} TmdbRawDetailsWithId
 */

/**
 * Query parameters accepted by `request`. Empty values are skipped.
 *
 * @typedef {Record<string, string | number | boolean | null | undefined>} RequestParams
 */

/** @typedef {ReturnType<typeof createTmdbApi>} TmdbApi */

const BASE_URL = 'https://api.themoviedb.org/3';

/**
 * Creates a TMDB API instance as a plain object.
 *
 * The factory encapsulates request-specific dependencies and maintains internal
 * state via closures instead of a class.
 *
 * @param {typeof fetch} fetchFn - Fetch function for HTTP requests.
 * @param {string} apiKey - TMDB API key.
 * @param {string} [language=DEFAULT_LOCALE] - Language code for API responses.
 */
export function createTmdbApi(fetchFn, apiKey, language = DEFAULT_LOCALE) {
	const region = language.split('-')[1] ?? language.split('_')[1] ?? 'DE';
	/** @type {Record<string, string> | null} */
	let movieGenreMap = null;
	/** @type {Record<string, string> | null} */
	let tvGenreMap = null;
	/** @type {Map<string, string>} */
	const certificationCache = new Map();
	/** @type {Map<string, WatchProviders | null>} */
	const watchProvidersCache = new Map();

	/**
	 * Executes a standardized request to the TMDB API.
	 *
	 * The response type depends on the endpoint. Callers annotate the result
	 * with the matching `TmdbRaw*Response` type.
	 *
	 * @param {string} path - API path relative to the base URL.
	 * @param {RequestParams} [params={}] - Additional query parameters.
	 * @returns {Promise<any>} JSON response from the API.
	 * @throws {Error} If the request fails.
	 */
	async function request(path, params = {}) {
		const url = new URL(`${BASE_URL}${path}`);

		url.searchParams.set('api_key', apiKey);
		url.searchParams.set('language', language);

		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== null && value !== '') {
				url.searchParams.set(key, String(value));
			}
		}

		const response = await fetchFn(url.toString());

		if (!response.ok) {
			throw new Error(`TMDB request failed: ${response.status} ${response.statusText}`);
		}

		return response.json();
	}

	/**
	 * Loads the genre maps for movies and TV shows.
	 *
	 * The data is kept in memory and loaded only once per instance.
	 *
	 * @returns {Promise<void>}
	 */
	async function loadGenreMaps() {
		if (movieGenreMap && tvGenreMap) {
			return;
		}

		/** @type {[TmdbRawGenreListResponse, TmdbRawGenreListResponse]} */
		const [movieData, tvData] = await Promise.all([
			request('/genre/movie/list'),
			request('/genre/tv/list')
		]);

		movieGenreMap = Object.fromEntries(
			(movieData.genres || []).map((genre) => [genre.id, genre.name])
		);
		tvGenreMap = Object.fromEntries((tvData.genres || []).map((genre) => [genre.id, genre.name]));
	}

	/**
	 * Converts genre IDs into readable genre objects.
	 *
	 * IDs without a known name are dropped.
	 *
	 * @param {number[] | undefined} genreIds - List of genre IDs (empty if missing).
	 * @param {string | null} mediaType - Media type (`tv` uses the TV genre map, everything else the movie map).
	 * @returns {Genre[]} Resolved genres.
	 */
	function resolveGenres(genreIds, mediaType) {
		const map = mediaType === 'tv' ? tvGenreMap : movieGenreMap;
		const ids = genreIds ?? [];

		return /** @type {Genre[]} */ (
			ids.map((id) => (map?.[id] ? { id, name: map[id] } : null)).filter(Boolean)
		);
	}

	/**
	 * Converts a TMDB entry into a card object.
	 *
	 * Returns `null` for entries without an ID and for entries that are neither
	 * a movie nor a TV show (for example people in mixed lists).
	 *
	 * @param {TmdbRawItem} item - Raw data of a movie or TV show.
	 * @param {string | null} [fallbackMediaType=null] - Alternative media type.
	 * @returns {CardItem | null} Normalized card object or null.
	 */
	function mapCardItem(item, fallbackMediaType = null) {
		const mediaType = getMediaType(item, fallbackMediaType);

		if (!item?.id || !mediaType || !['movie', 'tv'].includes(mediaType)) {
			return null;
		}

		const cardMediaType = /** @type {MediaType} */ (mediaType);
		const genres = item.genres?.length
			? item.genres
			: resolveGenres(item.genre_ids ?? [], cardMediaType);
		const posterPath = item.poster_path ?? item.backdrop_path ?? '';

		return {
			id: item.id,
			mediaType: cardMediaType,
			title: getTitle(item) || 'N/A',
			date: getDate(item) || '',
			rating: item.vote_average ?? 0,
			genres: genres.length ? genres : [{ id: 'na', name: 'N/A' }],
			imageUrl: getImageUrl(posterPath, 'w500') || notAvailableImage,
			posterUrl: getImageUrl(posterPath, 'w342') || notAvailableImage
		};
	}

	/**
	 * Converts a watch provider into a UI-friendly object.
	 *
	 * @param {TmdbRawProvider} provider - TMDB provider data.
	 * @param {string} type - Provider type, e.g. `flatrate`, `rent`, or `buy`.
	 * @param {string | null | undefined} baseLink - Link to the provider list.
	 * @returns {WatchProvider | null} Normalized provider or null.
	 */
	function mapWatchProvider(provider, type, baseLink) {
		if (!provider?.provider_id || !provider?.provider_name) {
			return null;
		}

		return {
			providerId: provider.provider_id,
			providerName: provider.provider_name,
			type,
			link: baseLink ?? null,
			logoPath: provider.logo_path ?? null,
			displayPriority: provider.display_priority ?? null
		};
	}

	/**
	 * Converts a list of watch providers into UI-friendly objects.
	 *
	 * @param {TmdbRawProvider[] | undefined} providers - Provider list from TMDB (empty if missing).
	 * @param {string} type - Provider type.
	 * @param {string | null | undefined} baseLink - Link to the provider list.
	 * @returns {WatchProvider[]} Normalized provider list.
	 */
	function mapWatchProviderList(providers, type, baseLink) {
		const list = providers ?? [];

		return /** @type {WatchProvider[]} */ (
			list.map((provider) => mapWatchProvider(provider, type, baseLink)).filter(Boolean)
		);
	}

	/**
	 * Retrieves local streaming providers for a media item.
	 *
	 * Movies and TV shows provide watch provider data via the endpoint
	 * `/{mediaType}/{id}/watch/providers`. The desired region is derived
	 * from the API language code, e.g. `de-DE` → `DE`.
	 *
	 * Errors are logged and result in `null`. The result is cached per instance.
	 *
	 * @param {string} mediaType - `movie` or `tv`.
	 * @param {number | string} id - TMDB ID.
	 * @returns {Promise<WatchProviders | null>} Watch provider data or null.
	 */
	async function getWatchProviders(mediaType, id) {
		const cacheKey = `${mediaType}-${id}`;
		if (watchProvidersCache.has(cacheKey)) {
			return /** @type {WatchProviders | null} */ (watchProvidersCache.get(cacheKey));
		}

		const region = language.split('-')[1] ?? language.split('_')[1] ?? 'DE';
		/** @type {WatchProviders | null} */
		let providers = null;

		try {
			/** @type {TmdbRawWatchProvidersResponse} */
			const data = await request(`/${mediaType}/${id}/watch/providers`);
			const regionData = data.results?.[region];

			if (regionData) {
				const mappedProviders = [
					...mapWatchProviderList(regionData.flatrate, 'flatrate', regionData.link),
					...mapWatchProviderList(regionData.rent, 'rent', regionData.link),
					...mapWatchProviderList(regionData.buy, 'buy', regionData.link)
				];

				providers = mappedProviders.length
					? {
							link: regionData.link ?? '',
							providers: mappedProviders
						}
					: null;
			}
		} catch (error) {
			console.warn(`Streaming-Provider konnten nicht geladen werden (${mediaType}/${id}):`, error);
		}

		watchProvidersCache.set(cacheKey, providers);
		return providers;
	}

	/**
	 * Retrieves the local age rating for a media item.
	 *
	 * Movies provide certifications via `release_dates`, TV shows via
	 * `content_ratings`. The desired region is derived from the API
	 * language code, e.g. `de-DE` → `DE`.
	 *
	 * Errors are logged and result in an empty string. The result is cached per instance.
	 *
	 * @param {string} mediaType - `movie` or `tv`.
	 * @param {number | string} id - TMDB ID.
	 * @returns {Promise<string>} Age rating or empty string.
	 */
	async function getCertification(mediaType, id) {
		const cacheKey = `${mediaType}-${id}`;
		if (certificationCache.has(cacheKey)) {
			return /** @type {string} */ (certificationCache.get(cacheKey));
		}

		let certification = '';

		try {
			if (mediaType === 'movie') {
				/** @type {TmdbRawMovieCertificationResponse} */
				const data = await request(`/movie/${id}/release_dates`);
				const country = data.results?.find((entry) => entry.iso_3166_1 === region);
				certification =
					country?.release_dates?.find((release) => release.certification)?.certification ?? '';
			} else if (mediaType === 'tv') {
				/** @type {TmdbRawTvCertificationResponse} */
				const data = await request(`/tv/${id}/content_ratings`);
				certification = data.results?.find((entry) => entry.iso_3166_1 === region)?.rating ?? '';
			}
		} catch (error) {
			console.warn(`Altersfreigabe konnte nicht geladen werden (${mediaType}/${id}):`, error);
		}

		certificationCache.set(cacheKey, certification);
		return certification;
	}

	/**
	 * Enriches page cards with local age ratings.
	 *
	 * @param {CardItem[]} [cards=[]] - Normalized cards.
	 * @returns {Promise<CardItem[]>} Cards with `certification`.
	 */
	async function enrichCardCertifications(cards = []) {
		return Promise.all(
			cards.map(async (card) => ({
				...card,
				certification: await getCertification(card.mediaType, card.id)
			}))
		);
	}

	/**
	 * Converts a featured detail object into the UI format.
	 *
	 * @param {TmdbRawDetailsWithId} details - TMDB detail data.
	 * @param {string | null} [fallbackMediaType=null] - Alternative media type.
	 * @returns {MappedFeatured} Normalized featured object.
	 */
	function mapFeaturedItem(details, fallbackMediaType = null) {
		const mediaType = /** @type {MediaType | null} */ (getMediaType(details, fallbackMediaType));

		return {
			id: details.id,
			mediaType,
			title: getTitle(details),
			releaseDate: getDate(details),
			overview: details.overview ?? '',
			homepage: details.homepage ?? '',
			genres: details.genres ?? [],
			imageUrl: getImageUrl(details.backdrop_path ?? details.poster_path ?? '', 'w780'),
			posterUrl: getImageUrl(details.poster_path ?? '', 'w342')
		};
	}

	/**
	 * Retrieves all available trailer URLs from video data.
	 *
	 * All matching YouTube trailers are included in their delivered order.
	 *
	 * @param {TmdbRawDetails} details - TMDB detail data.
	 * @returns {string[]} List of YouTube URLs.
	 */
	function getTrailerUrls(details) {
		const videos = details.videos?.results ?? [];

		return videos
			.filter((video) => video.site === 'YouTube' && video.type === 'Trailer' && video.key)
			.map((video) => `https://www.youtube.com/watch?v=${video.key}`);
	}

	/**
	 * Converts complete detail data into a UI-friendly object.
	 *
	 * Certification and providers come from separate requests and are added by the callers.
	 *
	 * @param {TmdbRawDetailsWithId} details - TMDB detail data.
	 * @param {string | null} [fallbackMediaType] - Optional media type.
	 * @returns {MappedDetails} Normalized detail object.
	 */
	function mapDetails(details, fallbackMediaType) {
		const mediaType = /** @type {MediaType | null} */ (getMediaType(details, fallbackMediaType));

		return {
			id: details.id,
			mediaType,
			title: getTitle(details),
			releaseDate: getDate(details),
			overview: details.overview ?? '',
			homepage: details.homepage ?? '',
			trailerUrls: getTrailerUrls(details),
			genres: details.genres ?? [],
			rating: details.vote_average ?? 0,
			runtime: details.runtime ?? null,
			episodeRunTime: details.episode_run_time ?? [],
			productionCompanies: details.production_companies ?? [],
			imageUrl: getImageUrl(details.backdrop_path ?? details.poster_path ?? '', 'w1280'),
			posterUrl: getImageUrl(details.poster_path ?? '', 'w342'),
			cast: mapCast(details.credits?.cast ?? []),
			crew: mapCrew(details.credits?.crew ?? []),
			certification: details.certification ?? ''
		};
	}

	/**
	 * Formats the cast list.
	 *
	 * A maximum of 20 people are included.
	 *
	 * @param {TmdbRawPerson[]} [cast=[]] - Cast list from TMDB.
	 * @returns {CastMember[]} Normalized cast list.
	 */
	function mapCast(cast = []) {
		return cast.slice(0, 20).map((person) => ({
			id: person.id,
			creditId: person.credit_id,
			name: person.name,
			character: person.character ?? '',
			order: person.order ?? null,
			profilePath: person.profile_path ?? '',
			imageUrl: getImageUrl(person.profile_path ?? '', 'w185') || notAvailableImage
		}));
	}

	/**
	 * Formats the crew list.
	 *
	 * A maximum of 20 crew entries are included.
	 *
	 * @param {TmdbRawPerson[]} [crew=[]] - Crew list from TMDB.
	 * @returns {CrewMember[]} Normalized crew list.
	 */
	function mapCrew(crew = []) {
		return crew.slice(0, 20).map((person) => ({
			id: person.id,
			creditId: person.credit_id,
			name: person.name,
			job: person.job ?? '',
			department: person.department ?? '',
			profilePath: person.profile_path ?? '',
			imageUrl: getImageUrl(person.profile_path ?? '', 'w185') || notAvailableImage
		}));
	}

	/**
	 * Fetches a list of movies or TV shows.
	 *
	 * Entries that are neither movie nor TV show are dropped.
	 *
	 * @param {string} endpoint - TMDB endpoint.
	 * @param {number} page - Page number.
	 * @param {string | null} [fallbackMediaType=null] - Optional media type.
	 * @returns {Promise<PagedResult>} Normalized list response.
	 */
	async function getList(endpoint, page, fallbackMediaType = null) {
		/** @type {TmdbRawListResponse} */
		const data = await request(endpoint, { page });
		const items = data.results ?? [];
		await loadGenreMaps();
		const results = /** @type {CardItem[]} */ (
			items.map((item) => mapCardItem(item, fallbackMediaType)).filter(Boolean)
		);
		const enrichedResults = await enrichCardCertifications(results);

		return {
			page: data.page ?? page,
			results: enrichedResults,
			hasMore: (data.page ?? page) < (data.total_pages ?? data.page ?? page)
		};
	}

	/**
	 * Returns the current trending movies and TV shows of the day.
	 *
	 * @param {number} [page=1] - Page number.
	 * @returns {Promise<PagedResult>} Normalized list response.
	 */
	async function getTrendingAll(page = 1) {
		return getList('/trending/all/day', page);
	}

	/**
	 * Returns the current movie trends.
	 *
	 * @param {number} [page=1] - Page number.
	 * @returns {Promise<PagedResult>} Normalized list response.
	 */
	async function getTrendingMovies(page = 1) {
		return getList('/trending/movie/day', page, 'movie');
	}

	/**
	 * Returns the current TV show trends.
	 *
	 * @param {number} [page=1] - Page number.
	 * @returns {Promise<PagedResult>} Normalized list response.
	 */
	async function getTrendingTVShows(page = 1) {
		return getList('/trending/tv/day', page, 'tv');
	}

	/**
	 * Returns the most popular movies.
	 *
	 * @param {number} [page=1] - Page number.
	 * @returns {Promise<PagedResult>} Normalized list response.
	 */
	async function getPopularMovies(page = 1) {
		return getList('/movie/popular', page, 'movie');
	}

	/**
	 * Returns the most popular TV shows.
	 *
	 * @param {number} [page=1] - Page number.
	 * @returns {Promise<PagedResult>} Normalized list response.
	 */
	async function getPopularTVShows(page = 1) {
		return getList('/tv/popular', page, 'tv');
	}

	/**
	 * Returns the top-rated movies.
	 *
	 * @param {number} [page=1] - Page number.
	 * @returns {Promise<PagedResult>} Normalized list response.
	 */
	async function getTopRatedMovies(page = 1) {
		return getList('/movie/top_rated', page, 'movie');
	}

	/**
	 * Returns the top-rated TV shows.
	 *
	 * @param {number} [page=1] - Page number.
	 * @returns {Promise<PagedResult>} Normalized list response.
	 */
	async function getTopRatedTVShows(page = 1) {
		return getList('/tv/top_rated', page, 'tv');
	}

	/**
	 * Returns the featured item of the day.
	 *
	 * Movies are mapped with `mapDetails` (including cast and crew), TV shows with
	 * the reduced `mapFeaturedItem`. Narrow the result with `'cast' in item`.
	 *
	 * @returns {Promise<FeaturedItem | null>} Normalized featured object or null.
	 */
	async function getFeaturedToday() {
		/** @type {TmdbRawListResponse} */
		const data = await request('/trending/all/day');
		const items = data.results ?? [];
		const featured =
			items.find((item) => item.media_type === 'movie' && item.backdrop_path) ??
			items.find((item) => item.media_type === 'tv' && item.backdrop_path) ??
			items[0] ??
			null;

		if (!featured) {
			return null;
		}

		const mediaType = /** @type {MediaType} */ (getMediaType(featured, featured.media_type));
		const featuredId = /** @type {number} */ (featured.id);
		/** @type {TmdbRawDetailsWithId} */
		const details = await request(`/${mediaType}/${featuredId}`, {
			append_to_response: 'videos,credits'
		});
		const mapFn = mediaType === 'movie' ? mapDetails : mapFeaturedItem;
		const mapped = mapFn({ ...featured, ...details }, mediaType);
		const productionCompanies = details.production_companies ?? [];
		const certification = await getCertification(mediaType, featuredId);
		const providers = await getWatchProviders(mediaType, featuredId);

		return {
			...mapped,
			productionCompanies,
			certification,
			providers,
			trailerUrls: getTrailerUrls({ ...featured, ...details })
		};
	}

	/**
	 * Returns the detail data of a movie.
	 *
	 * @param {number | string} id - TMDB ID of the movie.
	 * @returns {Promise<MovieDetails>} Normalized movie detail object.
	 */
	async function getMovieDetails(id) {
		/** @type {TmdbRawDetailsWithId} */
		const details = await request(`/movie/${id}`, { append_to_response: 'videos,credits' });
		const mapped = mapDetails(details, 'movie');
		const certification = await getCertification('movie', id);
		const providers = await getWatchProviders('movie', id);

		return {
			...mapped,
			certification,
			providers
		};
	}

	/**
	 * Returns the detail data of a TV show.
	 *
	 * The response includes season metadata such as the total number of seasons
	 * and episodes. The `seasons` array contains one entry per season with its
	 * name, episode count, air date, and poster path.
	 *
	 * @param {number | string} id - TMDB ID of the TV show.
	 * @returns {Promise<TvDetails>} Normalized TV show detail object.
	 */
	async function getTVShowDetails(id) {
		/** @type {TmdbRawDetailsWithId} */
		const details = await request(`/tv/${id}`, { append_to_response: 'videos,credits' });
		const mapped = mapDetails(details, 'tv');
		const certification = await getCertification('tv', id);
		const providers = await getWatchProviders('tv', id);

		return {
			...mapped,
			certification,
			providers,
			numberOfSeasons: details.number_of_seasons ?? null,
			numberOfEpisodes: details.number_of_episodes ?? null,
			seasons: details.seasons ?? []
		};
	}

	/**
	 * Returns the episodes of a specific TV show season.
	 *
	 * Each episode includes its number, title, overview, air date, runtime,
	 * rating, and still image URL.
	 *
	 * @param {number | string} showId - TMDB ID of the TV show.
	 * @param {number} seasonNumber - Season number (0 = specials).
	 * @returns {Promise<SeasonDetails>} Normalized season object with episode list.
	 */
	async function getTVSeasonDetails(showId, seasonNumber) {
		/** @type {TmdbRawSeasonResponse} */
		const data = await request(`/tv/${showId}/season/${seasonNumber}`);

		const episodes = (data.episodes ?? []).map((ep) => ({
			id: ep.id,
			episodeNumber: ep.episode_number,
			name: ep.name ?? '',
			overview: ep.overview ?? '',
			airDate: ep.air_date ?? null,
			runtime: ep.runtime ?? null,
			rating: ep.vote_average ?? 0,
			stillUrl: getImageUrl(ep.still_path ?? '', 'w300') || null
		}));

		return {
			id: data.id,
			seasonNumber: data.season_number,
			name: data.name ?? '',
			overview: data.overview ?? '',
			airDate: data.air_date ?? null,
			posterUrl: getImageUrl(data.poster_path ?? '', 'w342') || null,
			episodes
		};
	}

	/**
	 * Searches movies and TV shows by a free-text query.
	 *
	 * Uses `/search/multi`. Adult content is excluded and entries that are neither
	 * movie nor TV show are dropped. Genre names are resolved from the loaded genre maps.
	 *
	 * @param {string} query - Search term.
	 * @param {number} [page=1] - Page number.
	 * @returns {Promise<PagedResult>} Normalized search result page.
	 */
	async function searchMedia(query, page = 1) {
		/** @type {TmdbRawListResponse} */
		const data = await request('/search/multi', { query, page, include_adult: false });
		const items = data.results ?? [];
		await loadGenreMaps();
		const results = /** @type {CardItem[]} */ (
			items.map((item) => mapCardItem(item, item.media_type)).filter(Boolean)
		).map((item) => ({
			...item,
			mediaType: /** @type {MediaType} */ (item.mediaType === 'movie' ? 'movie' : 'tv')
		}));

		return {
			page: data.page ?? page,
			results,
			hasMore: (data.page ?? page) < (data.total_pages ?? data.page ?? page)
		};
	}

	return {
		request,
		loadGenreMaps,
		resolveGenres,
		mapCardItem,
		mapWatchProvider,
		mapWatchProviderList,
		getCertification,
		getWatchProviders,
		enrichCardCertifications,
		mapFeaturedItem,
		getTrailerUrls,
		mapDetails,
		mapCast,
		mapCrew,
		getList,
		getTrendingAll,
		getTrendingMovies,
		getTrendingTVShows,
		getPopularMovies,
		getPopularTVShows,
		getTopRatedMovies,
		getTopRatedTVShows,
		getFeaturedToday,
		getMovieDetails,
		getTVShowDetails,
		getTVSeasonDetails,
		searchMedia
	};
}
