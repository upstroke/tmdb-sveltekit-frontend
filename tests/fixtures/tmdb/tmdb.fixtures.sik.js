/**
 * Raw TMDB responses for API-level unit tests.
 *
 * This block contains response structures as they might come directly from TMDB
 * endpoints, for example for list, genre, certification, and search queries.
 * These fixtures primarily belong to tests for methods such as `getList`,
 * `searchMedia`, `getTrendingAll`, or similar API wrappers.
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
				id: 421,
				name: 'The Fly',
				first_air_date: '1996-02-11',
				vote_average: 9.0,
				genre_ids: [53],
				poster_path: '/die-fliege-poster.jpg'
			}
		],
		page: 1,
		total_pages: 1,
		hasMore: false
	},
	emptyTvGenres: {
		genres: []
	},
	movieCertification: {
		results: [
			{
				iso_3166_1: 'US',
				release_dates: [{ certification: 'PG' }]
			}
		]
	},
	tvCertification: {
		results: [{ iso_3166_1: 'US', rating: 'PG' }]
	},
	movieWatchProviders: {
		results: {
			US: {
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
			US: {
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
	}
};

/**
 * Already normalized or specifically prepared TMDB data for mapping tests.
 *
 * This block contains inputs for pure transformation and helper functions,
 * i.e. data that is passed directly to methods such as `mapCardItem`,
 * `mapFeaturedItem`, `getTrailerUrls`, `mapCast`, `mapCrew`, or `mapDetails`.
 * The fixtures are intentionally compact and tailored to individual mapping
 * scenarios.
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
		title: 'Invalid entry without ID',
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
		overview: 'A missing child brings dark secrets to light.',
		homepage: 'https://example.com/dark',
		genres: [{ id: 9648, name: 'Mystery' }],
		backdrop_path: '/dark-backdrop.jpg',
		poster_path: '/dark-poster.jpg'
	},
	details: {
		id: 680,
		title: 'Pulp Fiction',
		release_date: '1994-09-10',
		overview: 'Multiple stories intertwine in Los Angeles.',
		homepage: 'https://example.com/pulp-fiction',
		genres: [{ id: 53, name: 'Thriller' }],
		vote_average: 8.5,
		runtime: 154,
		episode_run_time: [45],
		production_companies: [{ id: 14, name: 'Miramax' }],
		backdrop_path: '/pulp-fiction-backdrop.jpg',
		poster_path: '/pulp-fiction-poster.jpg',
		certification: 'PG',
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

// TV-specific details fixture
mappedFixtures.tvShowDetails = {
	id: 420,
	title: 'Dark',
	mediaType: 'tv',
	rating: 8.2,
	certification: 'PG',
	genres: [{ id: 9648, name: 'Mystery' }],
	overview: 'A missing child brings dark secrets to light.',
	homepage: 'https://example.com/dark',
	trailerUrls: [
		{ url: 'https://youtube.com/watch?v=trailer1' },
		{ url: 'https://youtube.com/watch?v=trailer2' }
	],
	releaseDate: '2017-12-01',
	runtime: 60,
	productionCompanies: [{ id: 1, name: 'Wiedemann & Berg Television' }],
	cast: mappedFixtures.cast.slice(0, 5), // e.g. only first 5
	crew: mappedFixtures.crew.slice(0, 5),
	imageUrl: '/dark-backdrop.jpg',
	posterUrl: '/dark-poster.jpg'
};

// Provider fixture for TV
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

// Seasons fixtures
rawResponses.tvDetailsWithSeasons = {
	id: 420,
	name: 'Dark',
	overview: 'A German sci-fi thriller.',
	homepage: 'https://www.netflix.com/dark',
	vote_average: 8.8,
	first_air_date: '2017-12-01',
	backdrop_path: '/dark-backdrop.jpg',
	poster_path: '/dark-poster.jpg',
	genres: [{ id: 10765, name: 'Sci-Fi & Fantasy' }],
	episode_run_time: [60],
	production_companies: [{ id: 1, name: 'Wiedemann & Berg' }],
	number_of_seasons: 3,
	number_of_episodes: 26,
	seasons: [
		{
			id: 1001,
			season_number: 1,
			name: 'Season 1',
			episode_count: 10,
			air_date: '2017-12-01',
			poster_path: '/dark-s1.jpg',
			overview: 'The first season.'
		},
		{
			id: 1002,
			season_number: 2,
			name: 'Season 2',
			episode_count: 8,
			air_date: '2019-06-21',
			poster_path: '/dark-s2.jpg',
			overview: 'The second season.'
		},
		{
			id: 1003,
			season_number: 3,
			name: 'Season 3',
			episode_count: 8,
			air_date: '2020-06-27',
			poster_path: '/dark-s3.jpg',
			overview: 'The final season.'
		}
	],
	videos: {
		results: [{ site: 'YouTube', type: 'Trailer', key: 'darkTrailer' }]
	},
	credits: { cast: [], crew: [] }
};

rawResponses.seasonDetails = {
	id: 1001,
	season_number: 1,
	name: 'Season 1',
	overview: 'The first season of Dark.',
	air_date: '2017-12-01',
	poster_path: '/dark-s1.jpg',
	episodes: [
		{
			id: 5001,
			episode_number: 1,
			name: 'Secrets',
			overview: 'Children go missing in Winden.',
			air_date: '2017-12-01',
			runtime: 51,
			vote_average: 8.5,
			still_path: '/dark-s1e1.jpg'
		},
		{
			id: 5002,
			episode_number: 2,
			name: 'Lies',
			overview: 'The past and future collide.',
			air_date: '2017-12-01',
			runtime: 53,
			vote_average: 8.3,
			still_path: null
		},
		{
			id: 5003,
			episode_number: 3,
			name: 'Past and Present',
			overview: 'It is 1986. Ulrich suspects the boys are in the caves.',
			air_date: '2017-12-01',
			runtime: 45,
			vote_average: 8.1,
			still_path: '/dark-s1e3.jpg'
		}
	]
};

rawResponses.seasonDetailsSpecials = {
	id: 1000,
	season_number: 0,
	name: 'Specials',
	overview: 'Special episodes and extras.',
	air_date: '2017-11-01',
	poster_path: '/dark-specials.jpg',
	episodes: [
		{
			id: 5000,
			episode_number: 0,
			name: 'Making Of',
			overview: 'Behind the scenes.',
			air_date: '2017-11-01',
			runtime: 10,
			vote_average: 7.5,
			still_path: '/dark-making-of.jpg'
		}
	]
};

rawResponses.seasonDetailsEmpty = {
	id: 1004,
	season_number: 4,
	name: 'Season 4',
	overview: 'A season with no episodes yet.',
	air_date: null,
	poster_path: null,
	episodes: []
};

// Mapped fixtures for seasons
mappedFixtures.tvShowDetailsWithSeasons = {
	id: 420,
	mediaType: 'tv',
	title: 'Dark',
	numberOfSeasons: 3,
	numberOfEpisodes: 26,
	seasons: rawResponses.tvDetailsWithSeasons.seasons
};

mappedFixtures.seasonDetails = {
	id: 1001,
	seasonNumber: 1,
	name: 'Season 1',
	overview: 'The first season of Dark.',
	airDate: '2017-12-01',
	posterUrl: 'https://image.tmdb.org/t/p/w342/dark-s1.jpg',
	episodes: [
		{
			id: 5001,
			episodeNumber: 1,
			name: 'Secrets',
			overview: 'Children go missing in Winden.',
			airDate: '2017-12-01',
			runtime: 51,
			rating: 8.5,
			stillUrl: 'https://image.tmdb.org/t/p/w300/dark-s1e1.jpg'
		},
		{
			id: 5002,
			episodeNumber: 2,
			name: 'Lies',
			overview: 'The past and future collide.',
			airDate: '2017-12-01',
			runtime: 53,
			rating: 8.3,
			stillUrl: null
		},
		{
			id: 5003,
			episodeNumber: 3,
			name: 'Past and Present',
			overview: "It's 1986. Ulrich suspects the boys are in the caves.",
			airDate: '2017-12-01',
			runtime: 45,
			rating: 8.1,
			stillUrl: 'https://image.tmdb.org/t/p/w300/dark-s1e3.jpg'
		}
	]
};

mappedFixtures.seasonDetailsSpecials = {
	id: 1000,
	seasonNumber: 0,
	name: 'Specials',
	overview: 'Special episodes and extras.',
	airDate: '2017-11-01',
	posterUrl: 'https://image.tmdb.org/t/p/w342/dark-specials.jpg',
	episodes: [
		{
			id: 5000,
			episodeNumber: 0,
			name: 'Making Of',
			overview: 'Behind the scenes.',
			airDate: '2017-11-01',
			runtime: 10,
			rating: 7.5,
			stillUrl: 'https://image.tmdb.org/t/p/w300/dark-making-of.jpg'
		}
	]
};

mappedFixtures.seasonDetailsEmpty = {
	id: 1004,
	seasonNumber: 4,
	name: 'Season 4',
	overview: 'A season with no episodes yet.',
	airDate: null,
	posterUrl: null,
	episodes: []
};
