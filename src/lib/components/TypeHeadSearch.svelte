<script>
	import { resolve } from '$app/paths';
	import { deduplicateById } from '$lib/utils/deduplicateById';

	/**
	 * Typeahead-Suchkomponente ohne externe Props.
	 *
	 * Die Komponente verwaltet Suchbegriff, Ladezustand, Fehler und die
	 * Ergebnislisten intern selbst.
	 */

	let query = $state('');
	let movies = $state([]);
	let tvShows = $state([]);
	let visible = $state(false);
	let loading = $state(false);
	let error = $state(null);

	let debounceTimer;
	let controller;

	/**
	 * Formatiert die Bewertung für die Anzeige.
	 *
	 * Rundet den Wert auf eine Nachkommastelle und stellt sicher,
	 * dass auch leere oder ungültige Werte als `0.0` erscheinen.
	 *
	 * @param {number|string|undefined|null} value - Rohwert der Bewertung.
	 * @returns {string} Formatierte Bewertung mit einer Nachkommastelle.
	 */
	function formatRating(value) {
		return Number(value ?? 0).toFixed(1);
	}

	/**
	 * Formatiert das Jahr aus einem Datumsstring.
	 *
	 * Nutzt nur die ersten vier Zeichen des Datums, also typischerweise
	 * das Veröffentlichungsjahr. Wenn kein Wert vorhanden ist, wird ein
	 * Platzhalter zurückgegeben.
	 *
	 * @param {string|undefined|null} value - Datumswert aus der Suche.
	 * @returns {string} Jahr oder Platzhalter.
	 */
	function formatYear(value) {
		return value?.slice(0, 4) || '- -';
	}

	/**
	 * Erzeugt die Ziel-URL für ein Suchergebnis.
	 *
	 * Filme werden auf die Film-Detailseite und Serien auf die TV-Detailseite
	 * verlinkt.
	 *
	 * @param {{ id: number|string, mediaType: 'movie' | 'tv' }} item - Suchergebnis.
	 * @returns {string} Interner Routenpfad zum Detailbereich.
	 */
	function resultHref(item) {
		if (item.mediaType === 'movie') {
			return resolve('/movies/[id]', {
				id: String(item.id)
			});
		}

		return resolve('/tv-shows/[id]', {
			id: String(item.id)
		});
	}

	/**
	 * Setzt alle Suchergebnisse und Fehlerzustände zurück.
	 *
	 * Wird verwendet, wenn die Eingabe zu kurz ist oder die Suche neu
	 * initialisiert werden soll.
	 */
	function resetResults() {
		movies = [];
		tvShows = [];
		visible = false;
		error = null;
	}

	/**
	 * Reagiert auf Benutzereingaben im Suchfeld.
	 *
	 * Entfernt alte Debounce-Timer, prüft die Mindestlänge des Suchbegriffs
	 * und startet erst dann die eigentliche Suche mit kurzer Verzögerung.
	 */
	function handleInput() {
		clearTimeout(debounceTimer);

		const term = query.trim();

		if (term.length < 4) {
			resetResults();
			return;
		}

		visible = true;

		debounceTimer = setTimeout(() => search(term), 300);
	}

	/**
	 * Führt die Suche gegen den Backend-Endpunkt aus.
	 *
	 * Bricht eine laufende Anfrage ab, bevor eine neue gestartet wird,
	 * und verarbeitet anschließend die Ergebnisse getrennt für Filme
	 * und TV-Serien.
	 *
	 * @param {string} term - Suchbegriff ohne führende oder nachgestellte Leerzeichen.
	 */
	async function search(term) {
		controller?.abort();
		controller = new AbortController();

		loading = true;
		error = null;

		try {
			const response = await fetch(`/search?q=${encodeURIComponent(term)}`, {
				signal: controller.signal
			});

			if (!response.ok) {
				error = 'Suche konnte nicht geladen werden.';
				return;
			}

			const data = await response.json();

			movies = deduplicateById(data.movies ?? []);

			tvShows = deduplicateById(data.tvShows ?? []);

			visible = movies.length > 0 || tvShows.length > 0;
		} catch (exception) {
			if (exception.name === 'AbortError') {
				return;
			}

			error = exception instanceof Error ? exception.message : 'Unbekannter Fehler';

			visible = false;
		} finally {
			loading = false;
		}
	}

	/**
	 * Schließt die Ergebnisliste, wenn außerhalb der Komponente geklickt wird.
	 *
	 * Diese Funktion wird vom globalen Klick-Handler verwendet, damit die
	 * Suchvorschläge verschwinden, sobald der Nutzer irgendwo anders hin klickt.
	 */
	function closeResults() {
		visible = false;
	}

	/**
	 * Öffnet die Ergebnisliste erneut, falls bereits passende Daten vorhanden sind.
	 *
	 * Der Fokus auf das Suchfeld soll die Ergebnisse wieder sichtbar machen,
	 * ohne eine neue Suche auszulösen.
	 */
	function showResults() {
		if (query.trim().length >= 4 && (movies.length > 0 || tvShows.length > 0 || loading || error)) {
			visible = true;
		}
	}
</script>

<div class="typeahead-search right menu searchbar hydrated">
	<div class="ui left aligned transparent category search">
		<div class="ui icon transparent inverted input">
			<input
				class="prompt"
				type="search"
				placeholder="Film oder TV-Serie finden"
				aria-label="Film oder TV-Serie finden"
				bind:value={query}
				oninput={handleInput}
				onfocus={showResults}
			/>

			<i class="search icon"></i>
		</div>

		{#if visible || loading || error}
			<div class="results transition show">
				{#if loading}
					<div class="result">Suche läuft …</div>
				{:else if error}
					<div class="result">
						{error}
					</div>
				{:else}
					{#if movies.length > 0}
						<div class="category">
							<div class="ui label blue">
								<p>Movies</p>
							</div>

							<div class="results transition show">
								{#each movies as item (`search-movie-${item.id}`)}
									<a class="result" href={resultHref(item)} onclick={closeResults}>
										<div class="ui horizontal card">
											{#if item.posterUrl}
												<div class="image">
													<img src={item.posterUrl} alt={item.title} />
												</div>
											{/if}

											<div class="content">
												<div class="title">
													{item.title}
												</div>

												<div class="meta">
													<small class="ui mini basic label">
														<i class="yellow star icon"></i>
														{formatRating(item.rating)}
													</small>
												</div>

												<div class="description">
													<small>
														<i class="calendar icon"></i>
														{formatYear(item.date)}
													</small>
												</div>
											</div>
										</div>
									</a>
								{/each}
							</div>
						</div>
					{/if}

					{#if tvShows.length > 0}
						<div class="category">
							<div class="ui label teal">
								<p>TV-Shows</p>
							</div>

							<div class="results transition show">
								{#each tvShows as item (`search-tv-${item.id}`)}
									<a class="result" href={resultHref(item)} onclick={closeResults}>
										<div class="ui horizontal card">
											{#if item.posterUrl}
												<div class="image">
													<img src={item.posterUrl} alt={item.title} />
												</div>
											{/if}

											<div class="content">
												<div class="title">
													{item.title}
												</div>

												<div class="meta">
													<small class="ui mini basic label">
														<i class="yellow star icon"></i>
														{formatRating(item.rating)}
													</small>
												</div>

												<div class="description">
													<small>
														<i class="calendar icon"></i>
														{formatYear(item.date)}
													</small>
												</div>
											</div>
										</div>
									</a>
								{/each}
							</div>
						</div>
					{/if}
				{/if}
			</div>
		{/if}
	</div>
</div>

<svelte:window
	onclick={(event) => {
		if (!event.target.closest('.typeahead-search')) {
			closeResults();
		}
	}}
/>
