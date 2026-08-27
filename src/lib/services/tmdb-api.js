import { getDate, getImageUrl, getMediaType, getTitle } from '$lib/services/tmdb/helpers';
import notAvailableImage from '$lib/assets/not-available.png';

const BASE_URL = 'https://api.themoviedb.org/3';

/**
 * Erstellt eine TMDB-API-Instanz als Plain Object.
 *
 * Die Factory kapselt request-spezifische Abhängigkeiten und hält den internen
 * Zustand über Closures statt über eine Klasse.
 *
 * @param {Function} fetchFn - Fetch-Funktion für HTTP-Anfragen.
 * @param {string} apiKey - TMDB-API-Schlüssel.
 * @param {string} [language='de-DE'] - Sprachcode für die API-Antworten.
 * @returns {Object} TMDB-API mit Methoden für Requests, Mapping und Caches.
 */
export function createTmdbApi(fetchFn, apiKey, language = 'de-DE') {
	const region = language.split('-')[1] ?? language.split('_')[1] ?? 'DE';
	let movieGenreMap = null;
	let tvGenreMap = null;
	const certificationCache = new Map();

	/**
	 * Führt eine standardisierte Anfrage an die TMDB-API aus.
	 *
	 * @param {string} path - API-Pfad relativ zur Basis-URL.
	 * @param {Object} [params={}] - Zusätzliche Query-Parameter.
	 * @returns {Promise<Object>} JSON-Antwort der API.
	 * @throws {Error} Wenn die Anfrage fehlschlägt.
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
			throw new Error(`TMDB-Anfrage fehlgeschlagen: ${response.status} ${response.statusText}`);
		}

		return response.json();
	}

	/**
	 * Lädt die Genre-Maps für Filme und Serien.
	 *
	 * Die Daten werden im Speicher gehalten und nur einmal pro Instanz geladen.
	 *
	 * @returns {Promise<void>}
	 */
	async function loadGenreMaps() {
		if (movieGenreMap && tvGenreMap) {
			return;
		}

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
	 * Wandelt Genre-IDs in lesbare Genre-Objekte um.
	 *
	 * @param {number[]} [genreIds=[]] - Liste der Genre-IDs.
	 * @param {string} mediaType - Medientyp.
	 * @returns {{id: number, name: string}[]} Aufgelöste Genres.
	 */
	function resolveGenres(genreIds = [], mediaType) {
		const map = mediaType === 'tv' ? tvGenreMap : movieGenreMap;

		return genreIds.map((id) => (map?.[id] ? { id, name: map[id] } : null)).filter(Boolean);
	}

	/**
	 * Wandelt einen TMDB-Eintrag in ein Kartenobjekt um.
	 *
	 * @param {Object} item - Rohdaten eines Films oder einer Serie.
	 * @param {string|null} [fallbackMediaType=null] - Alternativer Medientyp.
	 * @returns {Object} Normalisiertes Kartenobjekt.
	 */
	function mapCardItem(item, fallbackMediaType = null) {
		const mediaType = getMediaType(item, fallbackMediaType);

		if (!item?.id || !['movie', 'tv'].includes(mediaType)) {
			return null;
		}

		const genres = item.genres?.length
			? item.genres
			: resolveGenres(item.genre_ids ?? [], mediaType);
		const posterPath = item.poster_path ?? item.backdrop_path ?? '';

		return {
			id: item.id,
			mediaType,
			title: getTitle(item) || 'N/A',
			date: getDate(item) || '',
			rating: item.vote_average ?? 0,
			genres: genres.length ? genres : [{ id: 'na', name: 'N/A' }],
			imageUrl: getImageUrl(posterPath, 'w500') || notAvailableImage,
			posterUrl: getImageUrl(posterPath, 'w342') || notAvailableImage
		};
	}

	/**
	 * Ermittelt die lokale Altersfreigabe für ein Medium.
	 *
	 * Filme liefern Zertifizierungen über `release_dates`, TV-Serien über
	 * `content_ratings`. Die gewünschte Region wird aus dem API-Sprachcode
	 * abgeleitet, z. B. `de-DE` → `DE`.
	 *
	 * @param {string} mediaType - `movie` oder `tv`.
	 * @param {number|string} id - TMDB-ID.
	 * @returns {Promise<string>} Altersfreigabe oder leerer String.
	 */
	async function getCertification(mediaType, id) {
		const cacheKey = `${mediaType}-${id}`;
		if (certificationCache.has(cacheKey)) {
			return certificationCache.get(cacheKey);
		}

		let certification = '';

		try {
			if (mediaType === 'movie') {
				const data = await request(`/movie/${id}/release_dates`);
				const country = data.results?.find((entry) => entry.iso_3166_1 === region);
				certification =
					country?.release_dates?.find((release) => release.certification)?.certification ?? '';
			} else if (mediaType === 'tv') {
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
	 * Reichert Karten einer Seite mit lokalen Altersfreigaben an.
	 *
	 * @param {Object[]} cards - Normalisierte Karten.
	 * @returns {Promise<Object[]>} Karten mit `certification`.
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
	 * Wandelt Detaildaten in ein Featured-Objekt um.
	 *
	 * Das Featured-Objekt enthält getrennte Bildquellen für das breite
	 * Hintergrundbild und das Posterbild.
	 *
	 * @param {Object} details - TMDB-Detaildaten.
	 * @param {string|null} [fallbackMediaType=null] - Alternativer Medientyp.
	 * @returns {Object} Normalisiertes Featured-Objekt.
	 */
	function mapFeaturedItem(details, fallbackMediaType = null) {
		const mediaType = getMediaType(details, fallbackMediaType);

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
	 * Ermittelt die beste verfügbare Trailer-URL aus den Videodaten.
	 *
	 * Bevorzugt offizielle YouTube-Trailer, sonst den ersten passenden Trailer.
	 *
	 * @param {Object} details - TMDB-Detaildaten.
	 * @returns {string} YouTube-URL oder leerer String.
	 */
	function getTrailerUrl(details) {
		const videos = details.videos?.results ?? [];

		const trailer =
			videos.find(
				(video) => video.site === 'YouTube' && video.type === 'Trailer' && video.official === true
			) ?? videos.find((video) => video.site === 'YouTube' && video.type === 'Trailer');

		return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '';
	}

	/**
	 * Wandelt vollständige Detaildaten in ein UI-freundliches Objekt um.
	 *
	 * @param {Object} details - TMDB-Detaildaten.
	 * @param {string} fallbackMediaType - Optionaler Medientyp.
	 * @returns {Object} Normalisiertes Detailobjekt.
	 */
	function mapDetails(details, fallbackMediaType) {
		const mediaType = getMediaType(details, fallbackMediaType);

		return {
			id: details.id,
			mediaType,
			title: getTitle(details),
			releaseDate: getDate(details),
			overview: details.overview ?? '',
			homepage: details.homepage ?? '',
			trailerUrl: getTrailerUrl(details),
			genres: details.genres ?? [],
			rating: details.vote_average ?? 0,
			runtime: details.runtime ?? null,
			episodeRunTime: details.episode_run_time ?? [],
			productionCompanies: details.production_companies ?? [],
			imageUrl: getImageUrl(details.backdrop_path ?? details.poster_path ?? '', 'w1280'),
			posterUrl: getImageUrl(details.poster_path ?? '', 'w342'),
			cast: mapCast(details.credits?.cast ?? []),
			crew: mapCrew(details.credits?.crew ?? [])
		};
	}

	/**
	 * Formatiert die Darstellerliste.
	 *
	 * Es werden maximal 20 Personen übernommen.
	 *
	 * @param {Object[]} [cast=[]] - Cast-Liste aus TMDB.
	 * @returns {Object[]} Normalisierte Cast-Liste.
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
	 * Formatiert die Crew-Liste.
	 *
	 * Es werden maximal 20 Crew-Einträge übernommen.
	 *
	 * @param {Object[]} [crew=[]] - Crew-Liste aus TMDB.
	 * @returns {Object[]} Normalisierte Crew-Liste.
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
	 * Beschafft eine Liste von Filmen oder Serien.
	 *
	 * @param {string} endpoint - TMDB-Endpoint.
	 * @param {number} page - Seitenzahl.
	 * @param {string} [fallbackMediaType=null] - Optionaler Medientyp.
	 * @returns {Promise<{page:number,results:Object[],hasMore:boolean}>} Normalisierte Liste.
	 */
	async function getList(endpoint, page, fallbackMediaType = null) {
		const data = await request(endpoint, { page });
		const items = data.results ?? [];
		await loadGenreMaps();
		const results = items.map((item) => mapCardItem(item, fallbackMediaType)).filter(Boolean);

		return {
			page: data.page ?? page,
			results,
			hasMore: (data.page ?? page) < (data.total_pages ?? data.page ?? page)
		};
	}

	async function getTrendingAll(page = 1) {
		return getList('/trending/all/day', page);
	}

	async function getTrendingMovies(page = 1) {
		return getList('/trending/movie/day', page, 'movie');
	}

	async function getTrendingTVShows(page = 1) {
		return getList('/trending/tv/day', page, 'tv');
	}

	async function getPopularMovies(page = 1) {
		return getList('/movie/popular', page, 'movie');
	}

	async function getPopularTVShows(page = 1) {
		return getList('/tv/popular', page, 'tv');
	}

	async function getTopRatedMovies(page = 1) {
		return getList('/movie/top_rated', page, 'movie');
	}

	async function getTopRatedTVShows(page = 1) {
		return getList('/tv/top_rated', page, 'tv');
	}

	async function searchMovies(query, page = 1) {
		return getList('/search/movie', page, 'movie', { query, include_adult: true });
	}

	async function searchTVShows(query, page = 1) {
		return getList('/search/tv', page, 'tv', { query, include_adult: true });
	}

	async function searchMulti(query, page = 1) {
		await loadGenreMaps();

		const data = await request('/search/multi', { query, page, include_adult: true });

		return (data.results || [])
			.filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
			.map((item) => ({
				...mapCardItem(item),
				posterUrl: getImageUrl(item.poster_path ?? '', 'w342')
			}))
			.filter(Boolean);
	}

	async function getDetails(mediaType, id) {
		const endpoint = mediaType === 'tv' ? `/tv/${id}` : `/movie/${id}`;
		const data = await request(endpoint, { append_to_response: 'videos,credits' });
		const normalizedMediaType = getMediaType(data, mediaType);
		return mapDetails({ ...data, mediaType: normalizedMediaType }, mediaType);
	}

	return {
		request,
		loadGenreMaps,
		resolveGenres,
		mapCardItem,
		getCertification,
		enrichCardCertifications,
		mapFeaturedItem,
		getTrailerUrl,
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
		searchMovies,
		searchTVShows,
		searchMulti,
		getDetails
	};
}
