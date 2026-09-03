/**
 * Rohe TMDB-Antworten für API-nahe Unit-Tests.
 *
 * Dieser Block enthält Response-Strukturen, wie sie direkt aus TMDB-Endpunkten
 * zurückkommen können, zum Beispiel für Listen-, Genre-, Zertifizierungs-
 * und Suchabfragen. Diese Fixtures gehören vor allem zu Tests für Methoden wie
 * `getList`, `searchMedia`, `getTrendingAll` oder ähnliche API-Wrapper.
 */
export const rawResponses = {
	movieList: {
		results: [
			{
				id: 550,
				title: 'Fight Club',
				release_date: '1999-10-15',
				vote_average: 8.4,
				genre_ids: [18],
				poster_path: '/fight-club.jpg'
			}
		],
		page: 1,
		total_pages: 2
	},
	movieGenres: {
		genres: [{ id: 18, name: 'Drama' }]
	},
	tvList: {
		results: [
			{
				id: 420,
				name: 'Dark',
				first_air_date: '2017-12-01',
				vote_average: 8.2,
				genre_ids: [9648],
				poster_path: '/dark.jpg'
			},
			{
				id: 421,
				name: 'Die Fliege',
				first_air_date: '1996-02-11',
				vote_average: 9.0,
				genre_ids: [53],
				poster_path: '/die-fliege-poster.jpg'
			}
		],
		page: 1,
		total_pages: 1,
		hasMore: true
	},
	emptyTvGenres: {
		genres: []
	},
	movieCertification: {
		results: [
			{
				iso_3166_1: 'DE',
				release_dates: [{ certification: 'FSK 16' }]
			}
		]
	},
	tvCertification: {
		results: [{ iso_3166_1: 'DE', rating: '16' }]
	},
	movieWatchProviders: {
		results: {
			DE: {
				link: 'https://example.com/watch/de',
				flatrate: [
					{
						provider_id: 8,
						provider_name: 'Netflix',
						logo_path: '/netflix.png',
						display_priority: 1
					}
				]
			}
		}
	},
	tvWatchProviders: {
		results: {
			DE: {
				link: 'https://example.com/watch/dark',
				buy: [
					{
						provider_id: 119,
						provider_name: 'Amazon Video',
						logo_path: '/amazon.png',
						display_priority: 2
					}
				]
			}
		}
	},
	featuredTodayMovieList: {
		results: [
			{
				id: 680,
				media_type: 'movie',
				title: 'Pulp Fiction',
				release_date: '1994-09-10',
				vote_average: 8.5,
				genre_ids: [53],
				backdrop_path: '/pulp-fiction-backdrop.jpg',
				poster_path: '/pulp-fiction-poster.jpg'
			},
			{
				id: 681,
				media_type: 'movie',
				title: 'Die Fliege',
				release_date: '1996-02-11',
				vote_average: 9.0,
				genre_ids: [53],
				backdrop_path: '/die-fliege-backdrop.jpg',
				poster_path: '/die-fliege-poster.jpg'
			}
		],
		page: 1,
		total_pages: 1
	},
	multiSearch: {
		results: [
			{
				id: 550,
				media_type: 'movie',
				title: 'Fight Club',
				release_date: '1999-10-15',
				vote_average: 8.4,
				genre_ids: [18],
				poster_path: '/fight-club.jpg'
			},
			{
				id: 420,
				media_type: 'tv',
				name: 'Dark',
				first_air_date: '2017-12-01',
				vote_average: 8.2,
				genre_ids: [9648],
				poster_path: '/dark.jpg'
			},
			{
				id: 99,
				media_type: 'person',
				name: 'Brad Pitt'
			}
		],
		page: 1,
		total_pages: 1
	},
	tvGenres: {
		genres: [{ id: 9648, name: 'Mystery' }]
	},

};

/**
 * Bereits normalisierte oder gezielt vorbereitete TMDB-Daten für Mapping-Tests.
 *
 * Dieser Block enthält Eingaben für reine Transformations- und Hilfsfunktionen,
 * also Daten, die direkt an Methoden wie `mapCardItem`, `mapFeaturedItem`,
 * `getTrailerUrls`, `mapCast`, `mapCrew` oder `mapDetails` übergeben werden.
 * Die Fixtures sind absichtlich kompakt und auf einzelne Mapping-Szenarien
 * zugeschnitten.
 */
export const mappedFixtures = {
	movieCardItem: {
		id: 550,
		title: 'Fight Club',
		release_date: '1999-10-15',
		vote_average: 8.4,
		genres: [
			{ id: 18, name: 'Drama' },
			{ id: 53, name: 'Thriller' }
		],
		poster_path: '/fight-club-poster.jpg',
		backdrop_path: '/fight-club-backdrop.jpg'
	},
	invalidCardItem: {
		title: 'Ungültiger Eintrag ohne ID',
		poster_path: '/invalid.jpg'
	},
	fallbackCardItem: {
		id: 77,
		name: '',
		first_air_date: '',
		vote_average: null,
		genre_ids: []
	},
	featuredItem: {
		id: 420,
		name: 'Dark',
		first_air_date: '2017-12-01',
		overview: 'Ein vermisstes Kind bringt düstere Geheimnisse ans Licht.',
		homepage: 'https://example.com/dark',
		genres: [{ id: 9648, name: 'Mystery' }],
		backdrop_path: '/dark-backdrop.jpg',
		poster_path: '/dark-poster.jpg'
	},
	details: {
		id: 680,
		title: 'Pulp Fiction',
		release_date: '1994-09-10',
		overview: 'Mehrere Geschichten verweben sich in Los Angeles.',
		homepage: 'https://example.com/pulp-fiction',
		genres: [{ id: 53, name: 'Thriller' }],
		vote_average: 8.5,
		runtime: 154,
		episode_run_time: [45],
		production_companies: [{ id: 14, name: 'Miramax' }],
		backdrop_path: '/pulp-fiction-backdrop.jpg',
		poster_path: '/pulp-fiction-poster.jpg',
		certification: 'FSK 16',
		videos: {
			results: [
				{ site: 'YouTube', type: 'Trailer', official: false, key: 'firstTrailer' },
				{ site: 'YouTube', type: 'Trailer', official: true, key: 'secondTrailer' },
				{ site: 'Vimeo', type: 'Trailer', official: true, key: 'ignoreMe' }
			]
		},
		credits: {
			cast: [],
			crew: []
		},
		providers: [
			{
				providerId: 8,
				providerName: 'Netflix',
				logoPath: '/netflix.png',
				link: 'https://netflix.com/de/title/80100172',
				type: 'flatrate'
			}
		]
	},
	trailerDetailsWithSingleMatch: {
		videos: {
			results: [
				{ site: 'Vimeo', type: 'Trailer', official: true, key: 'ignoreMe' },
				{ site: 'YouTube', type: 'Trailer', official: false, key: 'youtubeSingle' }
			]
		}
	},
	trailerDetailsWithoutMatch: {
		videos: {
			results: [{ site: 'Vimeo', type: 'Teaser', official: true, key: 'noTrailer' }]
		}
	},
	cast: Array.from({ length: 22 }, (_, index) => ({
		id: index + 1,
		credit_id: `cast-${index + 1}`,
		name: `Cast Person ${index + 1}`,
		character: `Character ${index + 1}`,
		order: index,
		profile_path: index === 0 ? null : `/cast-${index + 1}.jpg`
	})),
	crew: Array.from({ length: 21 }, (_, index) => ({
		id: index + 1,
		credit_id: `crew-${index + 1}`,
		name: `Crew Person ${index + 1}`,
		job: index === 0 ? undefined : `Job ${index + 1}`,
		department: index === 0 ? undefined : `Department ${index + 1}`,
		profile_path: index === 0 ? null : `/crew-${index + 1}.jpg`
	}))
};

mappedFixtures.detailsWithCredits = {
	...mappedFixtures.details,
	credits: {
		cast: mappedFixtures.cast,
		crew: mappedFixtures.crew
	}
};

// TV-spezifische Details-Fixture
mappedFixtures.tvShowDetails = {
	id: 420,
	title: 'Dark',
	mediaType: 'tv',
	rating: 8.2,
	certification: 'FSK 16',
	genres: [{ id: 9648, name: 'Mystery' }],
	overview: 'Ein vermisstes Kind bringt düstere Geheimnisse ans Licht.',
	homepage: 'https://example.com/dark',
	trailerUrls: [
		{ url: 'https://youtube.com/watch?v=trailer1' },
		{ url: 'https://youtube.com/watch?v=trailer2' }
	],
	releaseDate: '2017-12-01',
	runtime: 60,
	productionCompanies: [{ id: 1, name: 'Wiedemann & Berg Television' }],
	cast: mappedFixtures.cast.slice(0, 5), // z. B. nur erste 5
	crew: mappedFixtures.crew.slice(0, 5),
	imageUrl: '/dark-backdrop.jpg',
	posterUrl: '/dark-poster.jpg'
};

// Provider-Fixture für TV
mappedFixtures.tvProviders = {
	providers: [
		{
			providerId: 8,
			providerName: 'Netflix',
			logoPath: '/netflix.png',
			link: 'https://netflix.com/de/title/80100172',
			type: 'flatrate'
		}
	]
};
