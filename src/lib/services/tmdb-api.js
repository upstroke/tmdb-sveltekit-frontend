import { formatDateGerman } from '$lib/utils/formatDate';
import notAvailableImage from '$lib/assets/not-available.png';

const BASE_URL = 'https://api.themoviedb.org/3';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export class TmdbAPI {
	constructor(fetchFn, apiKey, language = 'de-DE') {
		this.fetch = fetchFn;
		this.apiKey = apiKey;
		this.language = language;
		this.movieGenreMap = null;
		this.tvGenreMap = null;
	}

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
			throw new Error(`TMDB request failed: ${response.status} ${response.statusText}`);
		}

		return response.json();
	}

	getMediaType(item, fallback = null) {
		return fallback ?? item.media_type ?? (item.title ? 'movie' : item.name ? 'tv' : null);
	}

	getTitle(item) {
		return item.title ?? item.name ?? '';
	}

	getDate(item) {
		return item.release_date ?? item.first_air_date ?? '';
	}

	getImagePath(item) {
		return item.poster_path ?? item.backdrop_path ?? '';
	}

	getImageUrl(path, size = 'w500') {
		if (!path) {
			return '';
		}

		return `${IMAGE_BASE_URL}/${size}${path}`;
	}

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

	formatDate(value) {
		return formatDateGerman(value);
	}

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
			imageUrl: this.getImageUrl(details.backdrop_path ?? details.poster_path ?? '', 'w780')
		};
	}

	getTrailerUrl(details) {
		const videos = details.videos?.results ?? [];

		const trailer =
			videos.find(
				(video) => video.site === 'YouTube' && video.type === 'Trailer' && video.official === true
			) ?? videos.find((video) => video.site === 'YouTube' && video.type === 'Trailer');

		return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '';
	}

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
			posterUrl: this.getImageUrl(details.poster_path ?? '', 'w500'),
			cast: this.mapCast(details.credits?.cast ?? []),
			crew: this.mapCrew(details.credits?.crew ?? [])
		};
	}

	mapCast(cast = []) {
		return cast.slice(0, 20).map((person) => ({
			id: person.id,
			creditId: person.credit_id,
			name: person.name,
			character: person.character ?? ''
		}));
	}

	mapCrew(crew = []) {
		return crew.slice(0, 40).map((person) => ({
			id: person.id,
			creditId: person.credit_id,
			name: person.name,
			job: person.job ?? ''
		}));
	}

	async getTrendingMovies(page = 1) {
		await this.loadGenreMaps();

		const data = await this.request('/trending/movie/week', { page });

		const allResults = (data.results || []).map((item) => this.mapCardItem(item, 'movie'));

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

	async getTrendingTVShows(page = 1) {
		await this.loadGenreMaps();

		const data = await this.request('/trending/tv/week', { page });

		const allResults = (data.results || []).map((item) => this.mapCardItem(item, 'tv'));

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

	async getTrendingAll(page = 1) {
		await this.loadGenreMaps();

		const data = await this.request('/trending/all/week', { page });

		const allResults = (data.results || [])
			.filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
			.map((item) => this.mapCardItem(item));

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

	async getDetails(type, id) {
		return this.request(`/${type}/${id}`, {
			append_to_response: 'credits,videos'
		});
	}

	async searchMulti(query) {
		const data = await this.request('/search/multi', {
			query,
			page: 1,
			include_adult: false
		});

		return (data.results ?? [])
			.filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
			.map((item) => this.mapSearchItem(item));
	}

	mapSearchItem(item) {
		const mediaType = item.media_type === 'movie' ? 'movie' : 'tv';

		return {
			id: item.id,
			mediaType,
			title: mediaType === 'movie' ? (item.title ?? '') : (item.name ?? ''),
			rating: item.vote_average ?? 0,
			date: mediaType === 'movie' ? (item.release_date ?? '') : (item.first_air_date ?? ''),
			year: (mediaType === 'movie' ? item.release_date : item.first_air_date)?.slice(0, 4) ?? '',
			posterUrl: this.getImageUrl(item.poster_path ?? '', 'w92') // ← NEU
		};
	}
}
