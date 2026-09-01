import { describe, expect, it, vi } from 'vitest';
import notAvailableImage from '$lib/assets/not-available.png';
import { createTmdbApi } from '$lib/services/tmdb-api';
import { mappedFixtures } from '$tests/fixtures/tmdb/tmdb.fixtures.js';

function createApi() {
	return createTmdbApi(vi.fn(), 'test-api-key');
}

describe('tmdb api mapping', () => {
	describe('mapCardItem', () => {
		// Zweigüberdeckung: Ungültige Karten ohne ID werden verworfen.
		it('gibt null zurück, wenn der Eintrag keine gültige ID oder keinen unterstützten Medientyp hat', () => {
			const api = createApi();

			expect(api.mapCardItem(mappedFixtures.invalidCardItem)).toBeNull();
		});

		// Anweisungsüberdeckung: Ein vollständiger Filmeintrag wird in das Kartenformat gemappt.
		it('mappt einen vollständigen Filmeintrag in das interne Kartenformat', () => {
			const api = createApi();

			expect(api.mapCardItem(mappedFixtures.movieCardItem)).toEqual({
				id: 550,
				mediaType: 'movie',
				title: 'Fight Club',
				date: '1999-10-15',
				rating: 8.4,
				genres: [
					{ id: 18, name: 'Drama' },
					{ id: 53, name: 'Thriller' }
				],
				imageUrl: 'https://image.tmdb.org/t/p/w500/fight-club-poster.jpg',
				posterUrl: 'https://image.tmdb.org/t/p/w342/fight-club-poster.jpg'
			});
		});

		// Zweigüberdeckung: Fehlende Titel, Genres und Bilder werden auf Fallback-Werte normalisiert.
		it('setzt Fallback-Werte, wenn Titel, Genres und Bildpfade fehlen', () => {
			const api = createApi();

			expect(api.mapCardItem(mappedFixtures.fallbackCardItem, 'tv')).toEqual({
				id: 77,
				mediaType: 'tv',
				title: 'N/A',
				date: '',
				rating: 0,
				genres: [{ id: 'na', name: 'N/A' }],
				imageUrl: notAvailableImage,
				posterUrl: notAvailableImage
			});
		});
	});


	describe('resolveGenres', () => {
		// Anweisungsüberdeckung: Genre-IDs werden mit den geladenen Genre-Maps in lesbare Objekte aufgelöst.
		it('löst Genre-IDs anhand des Medientyps in Genre-Objekte auf', async () => {
			const fetchFn = vi
				.fn()
				.mockResolvedValueOnce(
					{
						ok: true,
						json: vi.fn().mockResolvedValue({ genres: [{ id: 18, name: 'Drama' }] })
					}
				)
				.mockResolvedValueOnce(
					{
						ok: true,
						json: vi.fn().mockResolvedValue({ genres: [{ id: 9648, name: 'Mystery' }] })
					}
				);
			const api = createTmdbApi(fetchFn, 'test-api-key', 'de-DE');

			await api.loadGenreMaps();

			expect(api.resolveGenres([18], 'movie')).toEqual([{ id: 18, name: 'Drama' }]);
			expect(api.resolveGenres([9648], 'tv')).toEqual([{ id: 9648, name: 'Mystery' }]);
		});

		// Zweigüberdeckung: Wiederholtes Laden mit gefüllten Caches beendet die Funktion sofort ohne weitere Requests.
		it('lädt Genre-Maps nach initialem Befüllen kein zweites Mal', async () => {
			const fetchFn = vi
				.fn()
				.mockResolvedValueOnce({
					ok: true,
					json: vi.fn().mockResolvedValue({ genres: [{ id: 18, name: 'Drama' }] })
				})
				.mockResolvedValueOnce({
					ok: true,
					json: vi.fn().mockResolvedValue({ genres: [{ id: 9648, name: 'Mystery' }] })
				});
			const api = createTmdbApi(fetchFn, 'test-api-key', 'de-DE');

			await api.loadGenreMaps();
			await api.loadGenreMaps();

			expect(fetchFn).toHaveBeenCalledTimes(2);
		});
	});

	describe('mapFeaturedItem', () => {
		// Anweisungsüberdeckung: Featured-Daten werden in das UI-Format überführt.
		it('mappt Featured-Daten mit Backdrop- und Posterbild korrekt', () => {
			const api = createApi();

			expect(api.mapFeaturedItem(mappedFixtures.featuredItem)).toEqual({
				id: 420,
				mediaType: 'tv',
				title: 'Dark',
				releaseDate: '2017-12-01',
				overview: 'Ein vermisstes Kind bringt düstere Geheimnisse ans Licht.',
				homepage: 'https://example.com/dark',
				genres: [{ id: 9648, name: 'Mystery' }],
				imageUrl: 'https://image.tmdb.org/t/p/w780/dark-backdrop.jpg',
				posterUrl: 'https://image.tmdb.org/t/p/w342/dark-poster.jpg'
			});
		});
	});

	describe('getTrailerUrls', () => {
		// Anweisungsüberdeckung: Alle passenden YouTube-Trailer werden in ihrer Originalreihenfolge übernommen.
		it('liefert alle passenden YouTube-Trailer in ihrer vorhandenen Reihenfolge zurück', () => {
			const api = createApi();

			expect(api.getTrailerUrls(mappedFixtures.details)).toEqual([
				'https://www.youtube.com/watch?v=firstTrailer',
				'https://www.youtube.com/watch?v=secondTrailer'
			]);
		});

		// Zweigüberdeckung: Ein einzelner passender YouTube-Trailer wird als Eintrag in der Liste zurückgegeben.
		it('liefert genau einen Eintrag zurück, wenn nur ein passender YouTube-Trailer vorhanden ist', () => {
			const api = createApi();

			expect(api.getTrailerUrls(mappedFixtures.trailerDetailsWithSingleMatch)).toEqual([
				'https://www.youtube.com/watch?v=youtubeSingle'
			]);
		});

		// Zweigüberdeckung: Ohne passenden Trailer wird eine leere Liste zurückgegeben.
		it('gibt eine leere Liste zurück, wenn kein passender YouTube-Trailer vorhanden ist', () => {
			const api = createApi();

			expect(api.getTrailerUrls(mappedFixtures.trailerDetailsWithoutMatch)).toEqual([]);
		});
	});

	describe('mapCast', () => {
		// Zweigüberdeckung: Die Cast-Liste wird auf maximal zwanzig Personen begrenzt und mit Bild-Fallback versehen.
		it('begrenzt die Cast-Liste auf zwanzig Einträge und setzt für fehlende Profilbilder den Fallback', () => {
			const api = createApi();
			const mappedCast = api.mapCast(mappedFixtures.cast);

			expect(mappedCast).toHaveLength(20);
			expect(mappedCast[0]).toEqual({
				id: 1,
				creditId: 'cast-1',
				name: 'Cast Person 1',
				character: 'Character 1',
				order: 0,
				profilePath: '',
				imageUrl: notAvailableImage
			});
			expect(mappedCast[19]).toEqual({
				id: 20,
				creditId: 'cast-20',
				name: 'Cast Person 20',
				character: 'Character 20',
				order: 19,
				profilePath: '/cast-20.jpg',
				imageUrl: 'https://image.tmdb.org/t/p/w185/cast-20.jpg'
			});
		});
	});

	describe('mapCrew', () => {
		// Zweigüberdeckung: Die Crew-Liste wird auf maximal zwanzig Einträge begrenzt und normalisiert optionale Felder.
		it('begrenzt die Crew-Liste auf zwanzig Einträge und normalisiert fehlende Felder', () => {
			const api = createApi();
			const mappedCrew = api.mapCrew(mappedFixtures.crew);

			expect(mappedCrew).toHaveLength(20);
			expect(mappedCrew[0]).toEqual({
				id: 1,
				creditId: 'crew-1',
				name: 'Crew Person 1',
				job: '',
				department: '',
				profilePath: '',
				imageUrl: notAvailableImage
			});
			expect(mappedCrew[19]).toEqual({
				id: 20,
				creditId: 'crew-20',
				name: 'Crew Person 20',
				job: 'Job 20',
				department: 'Department 20',
				profilePath: '/crew-20.jpg',
				imageUrl: 'https://image.tmdb.org/t/p/w185/crew-20.jpg'
			});
		});
	});

	describe('mapDetails', () => {
		// Anweisungsüberdeckung: Detaildaten werden inklusive Trailerliste, Cast, Crew und Zertifizierung vollständig gemappt.
		it('mappt vollständige Detaildaten in das interne Detailformat', () => {
			const api = createApi();

			expect(api.mapDetails(mappedFixtures.detailsWithCredits, 'movie')).toEqual({
				id: 680,
				mediaType: 'movie',
				title: 'Pulp Fiction',
				releaseDate: '1994-09-10',
				overview: 'Mehrere Geschichten verweben sich in Los Angeles.',
				homepage: 'https://example.com/pulp-fiction',
				trailerUrls: [
					'https://www.youtube.com/watch?v=firstTrailer',
					'https://www.youtube.com/watch?v=secondTrailer'
				],
				genres: [{ id: 53, name: 'Thriller' }],
				rating: 8.5,
				runtime: 154,
				episodeRunTime: [45],
				productionCompanies: [{ id: 14, name: 'Miramax' }],
				imageUrl: 'https://image.tmdb.org/t/p/w1280/pulp-fiction-backdrop.jpg',
				posterUrl: 'https://image.tmdb.org/t/p/w342/pulp-fiction-poster.jpg',
				cast: api.mapCast(mappedFixtures.cast),
				crew: api.mapCrew(mappedFixtures.crew),
				certification: 'FSK 16'
			});
		});
	});
});
