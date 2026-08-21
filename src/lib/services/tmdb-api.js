import { formatDate } from '$lib/utils/formatDate';
import notAvailableImage from '$lib/assets/not-available.png';

const BASE_URL = 'https://api.themoviedb.org/3';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

/**
 * Zugriffsschicht für die TMDB-API.
 *
 * Diese Klasse kapselt API-Anfragen, normalisiert die zurückgegebenen Daten
 * und bereitet sie für die Anzeige in der Anwendung auf.
 */
export class TmdbAPI {
	/**
	 * Erstellt eine neue Instanz der TMDB-API-Hilfsklasse.
	 *
	 * @param {Function} fetchFn - Fetch-Funktion für HTTP-Anfragen.
	 * @param {string} apiKey - TMDB-API-Schlüssel.
	 * @param {string} [language='de-DE'] - Sprachcode für die API-Antworten.
	 */
	constructor(fetchFn, apiKey, language = 'de-DE') {
		this.fetch = fetchFn;
		this.apiKey = apiKey;
		this.language = language;
		this.region = language.split('-')[1] ?? language.split('_')[1] ?? 'DE';
		this.movieGenreMap = null;
		this.tvGenreMap = null;
		this.certificationCache = new Map();
	}

	/**
	 * Führt eine standardisierte Anfrage an die TMDB-API aus.
	 *
	 * @param {string} path - API-Pfad relativ zur Basis-URL.
	 * @param {Object} [params={}] - Zusätzliche Query-Parameter.
	 * @returns {Promise<Object>} JSON-Antwort der API.
	 * @throws {Error} Wenn die Anfrage fehlschlägt.
	 */
	async request(path, params = {}) {
		const url = new URL(`${BASE_URL}${path}`);

		url.searchParams.set('api_key', this.apiKey);

		url.searchParams.set('language', this.language);

		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== null && value !== '') {
				url.searchParams.set(key, String(value));
			}
		}

		const response = await this.fetch(url.toString());

		if (!response.ok) {
			throw new Error(
				`TMDB-Anfrage fehlgeschlagen: ${response.status} ${response.statusText}`
			);
		}

		return response.json();
	}

	/**
	 * Ermittelt den Medientyp eines Eintrags.
	 *
	 * @param {Object} item - TMDB-Datensatz.
	 * @param {string|null} [fallback=null] - Alternativer Medientyp.
	 * @returns {string|null} `movie`, `tv` oder `null`.
	 */
	getMediaType(item, fallback = null) {
		return fallback ?? item.media_type ?? (item.title ? 'movie' : item.name ? 'tv' : null);
	}

	/**
	 * Gibt den Titel eines Eintrags zurück.
	 *
	 * @param {Object} item - TMDB-Datensatz.
	 * @returns {string} Titel oder leerer String.
	 */
	getTitle(item) {
		return item.title ?? item.name ?? '';
	}

	/**
	 * Gibt das relevante Datum eines Eintrags zurück.
	 *
	 * @param {Object} item - TMDB-Datensatz.
	 * @returns {string} Veröffentlichungs- oder Startdatum.
	 */
	getDate(item) {
		return item.release_date ?? item.first_air_date ?? '';
	}

	/**
	 * Gibt den Bildpfad eines Eintrags zurück.
	 *
	 * @param {Object} item - TMDB-Datensatz.
	 * @returns {string} Poster- oder Backdrop-Pfad.
	 */
	getImagePath(item) {
		return item.poster_path ?? item.backdrop_path ?? '';
	}

	/**
	 * Baut eine vollständige Bild-URL aus einem TMDB-Pfad.
	 *
	 * @param {string} path - Bildpfad.
	 * @param {string} [size='w500'] - TMDB-Bildgröße (z. B. `w92`, `w342`, `w500`, `w780`, `w1280`).
	 * @returns {string} Vollständige Bild-URL oder leerer String.
	 */
	getImageUrl(path, size = 'w500') {
		if (!path) {
			return '';
		}

		return `${IMAGE_BASE_URL}/${size}${path}`;
	}

	/**
	 * Lädt die Genre-Maps für Filme und Serien.
	 *
	 * Die Daten werden im Speicher gehalten und nur einmal pro Instanz geladen.
	 *
	 * @returns {Promise<void>}
	 */
	async loadGenreMaps() {
		if (this.movieGenreMap && this.tvGenreMap) {
			return;
		}

		const [movieData, tvData] = await Promise.all([
			this.request('/genre/movie/list'),
			this.request('/genre/tv/list')
		]);

		this.movieGenreMap = Object.fromEntries(
			(movieData.genres || []).map((genre) => [genre.id, genre.name])
		);

		this.tvGenreMap = Object.fromEntries(
			(tvData.genres || []).map((genre) => [genre.id, genre.name])
		);
	}

	/**
	 * Wandelt Genre-IDs in lesbare Genre-Objekte um.
	 *
	 * @param {number[]} [genreIds=[]] - Liste der Genre-IDs.
	 * @param {string} mediaType - Medientyp.
	 * @returns {{id: number, name: string}[]} Aufgelöste Genres.
	 */
	resolveGenres(genreIds = [], mediaType) {
		const map = mediaType === 'tv' ? this.tvGenreMap : this.movieGenreMap;

		return genreIds
			.map((id) =>
				map?.[id]
					? {
							id,
							name: map[id]
						}
					: null
			)
			.filter(Boolean);
	}

	/**
	 * Formatiert ein Datum für die Anzeige.
	 *
	 * @param {string} value - Rohdatum.
	 * @returns {string} Formatiertes Datum.
	 */
	formatDate(value) {
		return formatDate(value);
	}

	/**
	 * Wandelt einen TMDB-Eintrag in ein Kartenobjekt um.
	 *
	 * @param {Object} item - Rohdaten eines Films oder einer Serie.
	 * @param {string|null} [fallbackMediaType=null] - Alternativer Medientyp.
	 * @returns {Object} Normalisiertes Kartenobjekt.
	 */
	mapCardItem(item, fallbackMediaType = null) {
		const mediaType = this.getMediaType(item, fallbackMediaType);

		const genres = item.genres?.length
			? item.genres
			: this.resolveGenres(item.genre_ids ?? [], mediaType);

		return {
			id: item.id,
			mediaType: mediaType ?? 'na',
			title: this.getTitle(item) || 'N/A',
			date: this.formatDate(this.getDate(item)) || 'N/A',
			rating: item.vote_average ?? 0,
			genres: genres.length ? genres : [{ id: 'na', name: 'N/A' }],
			imageUrl: this.getImageUrl(this.getImagePath(item), 'w500') || notAvailableImage
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
	async getCertification(mediaType, id) {
		const cacheKey = `${mediaType}-${id}`;
		if (this.certificationCache.has(cacheKey)) {
			return this.certificationCache.get(cacheKey);
		}

		let certification = '';

		try {
			if (mediaType === 'movie') {
				const data = await this.request(`/movie/${id}/release_dates`);
				const country = data.results?.find((entry) => entry.iso_3166_1 === this.region);
				certification =
					country?.release_dates?.find((release) => release.certification)
						?.certification ?? '';
			} else if (mediaType === 'tv') {
				const data = await this.request(`/tv/${id}/content_ratings`);
				certification =
					data.results?.find((entry) => entry.iso_3166_1 === this.region)?.rating ?? '';
			}
		} catch (error) {
			console.warn(`Altersfreigabe konnte nicht geladen werden (${mediaType}/${id}):`, error);
		}

		this.certificationCache.set(cacheKey, certification);
		return certification;
	}

	/**
	 * Reichert Karten einer Seite mit lokalen Altersfreigaben an.
	 *
	 * @param {Object[]} cards - Normalisierte Karten.
	 * @returns {Promise<Object[]>} Karten mit `certification`.
	 */
	async enrichCardCertifications(cards = []) {
		return Promise.all(
			cards.map(async (card) => ({
				...card,
				certification: await this.getCertification(card.mediaType, card.id)
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
	mapFeaturedItem(details, fallbackMediaType = null) {
		const mediaType = this.getMediaType(details, fallbackMediaType);

		return {
			id: details.id,
			mediaType,
			title: this.getTitle(details),
			releaseDate: this.formatDate(this.getDate(details)),
			overview: details.overview ?? '',
			homepage: details.homepage ?? '',
			genres: details.genres ?? [],
			imageUrl: this.getImageUrl(details.backdrop_path ?? details.poster_path ?? '', 'w780'),
			posterUrl: this.getImageUrl(details.poster_path ?? '', 'w342')
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
	getTrailerUrl(details) {
		const videos = details.videos?.results ?? [];

		const trailer =
			videos.find(
				(video) =>
					video.site === 'YouTube' && video.type === 'Trailer' && video.official === true
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
	mapDetails(details, fallbackMediaType) {
		const mediaType = this.getMediaType(details, fallbackMediaType);

		return {
			id: details.id,
			mediaType,
			title: this.getTitle(details),
			releaseDate: this.formatDate(this.getDate(details)),
			overview: details.overview ?? '',
			homepage: details.homepage ?? '',
			trailerUrl: this.getTrailerUrl(details),
			genres: details.genres ?? [],
			rating: details.vote_average ?? 0,
			runtime: details.runtime ?? null,
			episodeRunTime: details.episode_run_time ?? [],
			productionCompanies: details.production_companies ?? [],
			imageUrl: this.getImageUrl(details.backdrop_path ?? details.poster_path ?? '', 'w1280'),
			posterUrl: this.getImageUrl(details.poster_path ?? '', 'w342'),
			cast: this.mapCast(details.credits?.cast ?? []),
			crew: this.mapCrew(details.credits?.crew ?? [])
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
	mapCast(cast = []) {
		return cast.slice(0, 20).map((person) => ({
			id: person.id,
			creditId: person.credit_id,
			name: person.name,
			character: person.character ?? ''
		}));
	}

	/**
	 * Formatiert die Crew-Liste.
	 *
	 * Es werden maximal 40 Personen übernommen.
	 *
	 * @param {Object[]} [crew=[]] - Crew-Liste aus TMDB.
	 * @returns {Object[]} Normalisierte Crew-Liste.
	 */
	mapCrew(crew = []) {
		return crew.slice(0, 40).map((person) => ({
			id: person.id,
			creditId: person.credit_id,
			name: person.name,
			job: person.job ?? ''
		}));
	}

	/**
	 * Lädt die wöchentlichen Trending-Filme.
	 *
	 * @param {number} [page=1] - Seitenzahl der API-Abfrage.
	 * @returns {Promise<{page:number,totalPages:number,results:Object[],hasMore:boolean}>}
	 * Normalisierte Ergebnisliste mit Paginierungsinfos.
	 */
	async getTrendingMovies(page = 1) {
		await this.loadGenreMaps();

		const data = await this.request('/trending/movie/week', { page });

		const allResults = await this.enrichCardCertifications(
			(data.results || []).map((item) => this.mapCardItem(item, 'movie'))
		);

		const results = Array.from(
			new Map(allResults.map((card) => [`${card.id}-${card.mediaType}`, card])).values()
		);

		const currentPage = data.page ?? page;

		const totalPages = data.total_pages ?? 1;

		return {
			page: currentPage,
			totalPages,
			results,
			hasMore: currentPage < totalPages
		};
	}

	/**
	 * Lädt die wöchentlichen Trending-Serien.
	 *
	 * @param {number} [page=1] - Seitenzahl der API-Abfrage.
	 * @returns {Promise<{page:number,totalPages:number,results:Object[],hasMore:boolean}>}
	 * Normalisierte Ergebnisliste mit Paginierungsinfos.
	 */
	async getTrendingTVShows(page = 1) {
		await this.loadGenreMaps();

		const data = await this.request('/trending/tv/week', { page });

		const allResults = await this.enrichCardCertifications(
			(data.results || []).map((item) => this.mapCardItem(item, 'tv'))
		);

		const results = Array.from(
			new Map(allResults.map((card) => [`${card.id}-${card.mediaType}`, card])).values()
		);

		const currentPage = data.page ?? page;

		const totalPages = data.total_pages ?? 1;

		return {
			page: currentPage,
			totalPages,
			results,
			hasMore: currentPage < totalPages
		};
	}

	/**
	 * Lädt die wöchentlichen Trending-Inhalte für Filme und Serien.
	 *
	 * @param {number} [page=1] - Seitenzahl der API-Abfrage.
	 * @returns {Promise<{page:number,totalPages:number,results:Object[],hasMore:boolean}>}
	 * Normalisierte Ergebnisliste mit Paginierungsinfos.
	 */
	async getTrendingAll(page = 1) {
		await this.loadGenreMaps();

		const data = await this.request('/trending/all/week', { page });

		const allResults = await this.enrichCardCertifications(
			(data.results || [])
				.filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
				.map((item) => this.mapCardItem(item))
		);

		const results = Array.from(
			new Map(allResults.map((card) => [`${card.id}-${card.mediaType}`, card])).values()
		);

		const currentPage = data.page ?? page;

		const totalPages = data.total_pages ?? 1;

		return {
			page: currentPage,
			totalPages,
			results,
			hasMore: currentPage < totalPages
		};
	}

	/**
	 * Lädt die Detaildaten eines Mediums inklusive Credits und Videos.
	 *
	 * @param {string} type - Medientyp, z. B. `movie` oder `tv`.
	 * @param {number|string} id - TMDB-ID des Mediums.
	 * @returns {Promise<Object>} Rohdaten aus der TMDB-API.
	 */
	async getDetails(type, id) {
		return this.request(`/${type}/${id}`, {
			append_to_response: 'credits,videos'
		});
	}

	/**
	 * Sucht nach Filmen und Serien in der globalen TMDB-Suche.
	 *
	 * Es werden nur Filme bzw. Serien zurückgegeben.
	 *
	 * @param {string} query - Suchbegriff.
	 * @returns {Promise<Object[]>} Normalisierte Suchergebnisse.
	 */
	async searchMulti(query) {
		const data = await this.request('/search/multi', {
			query,
			page: 1,
			include_adult: true
		});

		return (data.results ?? [])
			.filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
			.map((item) => this.mapSearchItem(item));
	}

	/**
	 * Wandelt ein Suchergebnis in ein einheitliches Objekt um.
	 *
	 * @param {Object} item - TMDB-Suchergebnis.
	 * @returns {Object} Normalisiertes Suchobjekt.
	 */
	mapSearchItem(item) {
		const mediaType = item.media_type === 'movie' ? 'movie' : 'tv';

		return {
			id: item.id,
			mediaType,
			title: mediaType === 'movie' ? (item.title ?? '') : (item.name ?? ''),
			rating: item.vote_average ?? 0,
			date: mediaType === 'movie' ? (item.release_date ?? '') : (item.first_air_date ?? ''),
			releaseDate:
				mediaType === 'movie' ? (item.release_date ?? '') : (item.first_air_date ?? ''),
			year:
				(mediaType === 'movie' ? item.release_date : item.first_air_date)?.slice(0, 4) ??
				'',
			posterUrl: this.getImageUrl(item.poster_path ?? '', 'w92')
		};
	}
}
