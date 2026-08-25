<script>
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { deduplicateById } from '$lib/utils/deduplicateById';
	import notAvailable from '$lib/assets/not-available.png';
	import { i18n } from '$lib/stores/i18n';
	import { resolveLocale } from '$lib/i18n/helpers';

	const { labels: texts, messages, titles, formats } = $derived($i18n);
	const activeLocale = $derived(resolveLocale(page.url.searchParams.get('locale')));

	/**
	 * Stellt die Typeahead-Suche im Header für Filme und TV-Serien bereit.
	 *
	 * Die Komponente verwaltet Suchbegriff, Ladezustand, Fehlerzustand und
	 * Sichtbarkeit der Ergebnisliste vollständig intern. Ab mindestens vier
	 * Zeichen wird die lokale `/search`-Route mit Debounce abgefragt, laufende
	 * Requests werden per `AbortController` abgebrochen und die Antworten nach
	 * Medientyp in Filme und TV-Serien getrennt dargestellt.
	 *
	 * Während einer laufenden Suche wird ein Ladehinweis in der Ergebnisliste
	 * angezeigt. Liegen nach erfolgreicher Suche weder Film- noch TV-Treffer
	 * vor, blendet die Komponente stattdessen eine explizite Leerzustandsanzeige
	 * für fehlende Ergebnisse ein.
	 *
	 * Zusätzlich kapselt die Komponente das UI-Verhalten für Fokus, Escape,
	 * Außenklick und Navigation aus der Trefferliste. Klicks auf Treffer werden
	 * über `goto()` verarbeitet, damit die Ergebnisliste vor dem Routenwechsel
	 * sauber geschlossen wird.
	 *
	 * @component
	 * @example
	 * <TypeHeadSearch />
	 */

	let query = $state('');
	let movies = $state([]);
	let tvShows = $state([]);
	let loading = $state(false);
	let showLoading = $state(false);
	let resultsClosed = $state(false);
	let error = $state(null);

	let hasResults = $derived(movies.length > 0 || tvShows.length > 0);
	let hasSearchTerm = $derived(query.trim().length >= 4);
	let hasStatusMessage = $derived(
		!resultsClosed && (showLoading || !!error || (hasSearchTerm && !hasResults))
	);

	let debounceTimer;
	let loadingTimer;
	let controller;
	let previousLocale = $state(activeLocale);

	/**
	 * Reagiert auf Locale-Wechsel und startet bei aktivem Suchbegriff eine neue Suche.
	 *
	 * Die aktuell angezeigten Treffer werden dadurch an die neue Locale angepasst,
	 * ohne dass der Suchbegriff erneut eingegeben werden muss.
	 *
	 * @returns {void}
	 */
	$effect(() => {
		if (activeLocale === previousLocale) {
			return;
		}

		previousLocale = activeLocale;
		const term = query.trim();

		if (term.length >= 4) {
			void search(term);
		}
	});

	/**
	 * Formatiert einen Bewertungswert mit einer Nachkommastelle.
	 *
	 * @param {number | string | null | undefined} value - Ursprünglicher Bewertungswert.
	 * @returns {string} Bewertung als String mit genau einer Nachkommastelle.
	 */
	function formatRating(value) {
		return Number(value ?? 0).toFixed(1);
	}

	/**
	 * Leitet aus einem Datumsstring das Jahr für die Trefferanzeige ab.
	 *
	 * @param {string | null | undefined} value - ISO-Datum eines Films oder einer Serie.
	 * @returns {string} Vierstelliges Jahr oder ein Platzhalter ohne Datum.
	 */
	function formatYear(value) {
		return value?.slice(0, 4) || '- -';
	}

	/**
	 * Erstellt das Screenreader-Label für die dargestellte Bewertung.
	 *
	 * @param {number | string | null | undefined} value - Bewertungswert des Treffers.
	 * @returns {string} Lokalisierter ARIA-Text für die Bewertungsausgabe.
	 */
	function ratingAriaLabel(value) {
		return `${texts.rating}: ${formatRating(value)} ${formats.outOfTen}`;
	}

	const searchHintId = 'typeahead-search-hint';

	/**
	 * Ergänzt eine interne Route um die aktuell aktive Locale.
	 *
	 * @param {string} href - Interne Zielroute ohne oder mit bestehenden Query-Parametern.
	 * @returns {string} Zielroute inklusive aktiver Locale.
	 */
	function withLocale(href) {
		if (!href) {
			return href;
		}

		const url = new URL(href, page.url.origin);
		url.searchParams.set('locale', activeLocale);
		return `${url.pathname}${url.search}${url.hash}`;
	}

	/**
	 * Ermittelt die interne Detailroute für einen Suchtreffer anhand seines Medientyps.
	 *
	 * @param {{ id: number | string, mediaType: 'movie' | 'tv' }} item - Suchtreffer aus der Ergebnisliste.
	 * @returns {string} Interne Detailroute für Film- oder TV-Detailseite.
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
	 * Setzt Ergebnislisten, Statusmeldungen und Ladezustände auf den Ausgangszustand zurück.
	 *
	 * Bereits laufende Ladehinweise werden dabei ebenfalls beendet.
	 *
	 * @returns {void}
	 */
	function resetResults() {
		clearTimeout(loadingTimer);
		showLoading = false;
		loading = false;
		resultsClosed = false;
		movies = [];
		tvShows = [];
		error = null;
	}

	/**
	 * Verarbeitet Eingaben im Suchfeld und stößt die Suche mit Debounce erneut an.
	 *
	 * Bei weniger als vier Zeichen werden vorhandene Treffer und Statusmeldungen
	 * sofort zurückgesetzt.
	 *
	 * @returns {void}
	 */
	function handleInput() {
		clearTimeout(debounceTimer);

		const term = query.trim();

		if (term.length < 4) {
			resetResults();
			return;
		}

		resultsClosed = false;
		debounceTimer = setTimeout(() => search(term), 300);
	}

	/**
	 * Lädt Suchergebnisse für den übergebenen Begriff von der lokalen Search-Route.
	 *
	 * Laufende Requests werden vor einem neuen Aufruf abgebrochen, um veraltete
	 * Antworten nicht mehr in den State zu übernehmen.
	 *
	 * @param {string} term - Bereinigter Suchbegriff ab vier Zeichen.
	 * @returns {Promise<void>} Wird aufgelöst, sobald State und Ergebnislisten aktualisiert wurden.
	 */
	async function search(term) {
		controller?.abort();
		clearTimeout(loadingTimer);
		showLoading = false;
		controller = new AbortController();

		loading = true;
		error = null;
		loadingTimer = setTimeout(() => {
			if (loading) {
				showLoading = true;
			}
		}, 300);

		try {
			const response = await fetch(
				`/search?q=${encodeURIComponent(term)}&locale=${encodeURIComponent(activeLocale)}`,
				{
					signal: controller.signal
				}
			);

			if (!response.ok) {
				error = messages.searchError;
				return;
			}

			const data = await response.json();

			movies = deduplicateById(data.movies ?? []);
			tvShows = deduplicateById(data.tvShows ?? []);
		} catch (exception) {
			if (exception.name === 'AbortError') {
				return;
			}

			error = exception instanceof Error ? exception.message : messages.searchError;
		} finally {
			clearTimeout(loadingTimer);
			showLoading = false;
			loading = false;
		}
	}

	/**
	 * Reagiert auf Tastatureingaben im Suchfeld und schließt die Trefferliste per Escape.
	 *
	 * @param {KeyboardEvent} event - Tastaturereignis des Suchfelds.
	 * @returns {void}
	 */
	function handleKeydown(event) {
		if (event.key === 'Escape') {
			closeResults();
		}
	}

	/**
	 * Blendet die Ergebnisliste aus, ohne den Suchbegriff zurückzusetzen.
	 *
	 * @returns {void}
	 */
	function closeResults() {
		resultsClosed = true;
	}

	/**
	 * Schließt die Ergebnisliste bei Klicks außerhalb der Komponente.
	 *
	 * Click wird statt Pointerdown verwendet, damit Links innerhalb der
	 * Trefferliste ihre Navigation normal abschließen können.
	 *
	 * @param {MouseEvent} event - Klickereignis auf Fensterebene.
	 * @returns {void}
	 */
	function handleWindowClick(event) {
		if (!event.target.closest('#typeahead-search')) {
			closeResults();
		}
	}

	/**
	 * Blendet vorhandene Ergebnisse oder Statusmeldungen beim erneuten Fokussieren ein.
	 *
	 * @returns {void}
	 */
	function showResults() {
		if (query.trim().length >= 4 && (movies.length > 0 || tvShows.length > 0 || loading || error)) {
			resultsClosed = false;
		}
	}
</script>

<svelte:window onclick={handleWindowClick} />

<search id="typeahead-search">
	<form id="typeahead-search-form" onsubmit={(e) => e.preventDefault()} role="search">
		<label class="u-sr-only" for="typeahead-search-input">{texts.searchInput}</label>
		<div class="input-wrapper">
			<input
				aria-describedby={searchHintId}
				autocomplete="off"
				bind:value={query}
				id="typeahead-search-input"
				onfocus={showResults}
				oninput={handleInput}
				onkeydown={handleKeydown}
				placeholder={texts.searchInput}
				type="search"
			/>

			<i aria-hidden="true" class="search icon"></i>

			<p class="u-sr-only" id="typeahead-search-hint">{messages.searchHint}</p>

			{#if hasStatusMessage}
				<div id="status-messages-layer">
					{#if error}
						<section id="status-messages" role="alert" aria-atomic="true">
							<div class="search-error-panel">
								<p class="result result-error">
									{error === messages.searchError ? messages.searchError : error}
								</p>
							</div>
						</section>
					{:else if loading}
						<section id="status-messages" role="status" aria-live="polite" aria-atomic="true">
							<p class="result">{messages.searchLoading}</p>
						</section>
					{:else if hasSearchTerm && !hasResults}
						<section id="status-messages" role="status" aria-live="polite" aria-atomic="true">
							<div class="search-empty-state">
								<p class="result {messages.searchNoResults ? '' : 'u-not-available'}">
									{messages.searchNoResults}
								</p>
							</div>
						</section>
					{/if}
				</div>
			{/if}
		</div>

		{#if !resultsClosed && hasResults}
			<div id="typeahead-search-results" aria-label={messages.searchResults} aria-live="polite">
				<section class="category" aria-labelledby="typeahead-movies-heading">
					<h2
						id="typeahead-movies-heading"
						class="ui label blue {titles.movies ? '' : 'u-not-available'}"
					>
						{titles.movies}
					</h2>
					<ul class="results" aria-label={titles.movies}>
						{#each movies as item (item.id)}
							<li>
								<a
									class="result"
									href={withLocale(resultHref(item))}
									onclick={closeResults}
									data-result-link="true"
								>
									<figure class="image" aria-hidden="true">
										<img src={item.posterUrl || notAvailable} alt="" />
									</figure>
									<div class="content">
										<header class="result-header">
											<h3 class="title {item.title ? '' : 'u-not-available'}">{item.title}</h3>
										</header>
										<p class="description">
											<time class={item.date ? '' : 'u-not-available'} datetime={item.date}
												>{formatYear(item.date)}</time
											>
											<span aria-hidden="true"> · </span>
											<span class="rating" aria-label={ratingAriaLabel(item.rating)}>
												<i class="yellow star icon" aria-hidden="true"></i>
												<span class={item.rating ? '' : 'u-not-available'}
													>{formatRating(item.rating)}</span
												>
											</span>
										</p>
									</div>
								</a>
							</li>
						{/each}
					</ul>
				</section>

				{#if tvShows.length > 0}
					<section class="category" aria-labelledby="typeahead-tv-heading">
						<h2
							id="typeahead-tv-heading"
							class="ui label blue {titles.tvShows ? '' : 'u-not-available'}"
						>
							{titles.tvShows}
						</h2>
						<ul class="results" aria-label={titles.tvShows}>
							{#each tvShows as item (item.id)}
								<li>
									<a
										class="result"
										href={withLocale(resultHref(item))}
										onclick={closeResults}
										data-result-link="true"
									>
										<figure class="image" aria-hidden="true">
											<img src={item.posterUrl || notAvailable} alt="" />
										</figure>
										<div class="content">
											<header class="result-header">
												<h3 class="title {item.title ? '' : 'u-not-available'}">{item.title}</h3>
											</header>
											<p class="description">
												<time class={item.date ? '' : 'u-not-available'} datetime={item.date}
													>{formatYear(item.date)}</time
												>
												<span aria-hidden="true"> · </span>
												<span class="rating" aria-label={ratingAriaLabel(item.rating)}>
													<i class="yellow star icon" aria-hidden="true"></i>
													<span class={item.rating ? '' : 'u-not-available'}
														>{formatRating(item.rating)}</span
													>
												</span>
											</p>
										</div>
									</a>
								</li>
							{/each}
						</ul>
					</section>
				{/if}
			</div>
		{/if}
	</form>
</search>

<style lang="scss">
	@use '../../css/variables';

	#typeahead-search {
		flex: 1;
		display: flex;
		justify-content: flex-end;

		#typeahead-search-form {
			position: relative;
			flex: 1;
			display: flex;
		}

		.input-wrapper {
			flex: 1;
			display: flex;
			justify-content: flex-end;
			align-items: center;
			padding: 0.5rem 0;
			flex-wrap: nowrap;

			.search.icon {
				margin-left: 0.5rem;
			}
		}

		#typeahead-search-input {
			border: none;
			background: transparent;
			color: white;
			padding: 0.5rem 0 0.5rem 0.5rem;
			margin-right: 0.5rem;
			line-height: 0;
			width: 50%;

			&:focus-visible {
				outline: 2px solid #2185d0 !important;
				outline-offset: 0;
				border: none;
				box-shadow: none;
			}

			&::-webkit-search-cancel-button {
				filter: brightness(0) invert(1);
				cursor: pointer;
				position: relative;
				margin-left: 0.5rem;
			}
		}

		#typeahead-search-results {
			position: fixed;
			right: 2px;
			top: var(--header-height);
			z-index: 1002;
			color: black;
			min-width: var(--typeahead-search-results-width);
			max-width: var(--typeahead-search-results-width);
			max-height: calc(100vh - var(--header-height) - var(--footer-height) - 6px);
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
			overflow-x: hidden;
			overflow-y: auto;
			border-radius: 6px;
			background: white;
		}

		#typeahead-search-results .category {
			background: white;

			#typeahead-movies-heading,
			#typeahead-tv-heading {
				font-size: 1em;
				font-weight: 500;
				width: 100%;
				border-radius: 0;
			}

			ul.results {
				margin: 0;
				padding: 0;

				> li {
					list-style: none;
					padding: 0.5em 1em;
					transition: background-color 180ms ease;

					&:hover,
					&:has(a.result:focus-visible) {
						background: rgba(0, 0, 0, 0.08);
					}

					&:has(a.result:focus-visible) {
						outline: 2px solid #2185d0;
						outline-offset: -3px;
					}

					&:hover a.result,
					&:has(a.result:focus-visible) a.result {
						background: transparent;
					}

					&:has(a.result:focus-visible) a.result {
						outline: none;
					}

					> a {
						display: flex;
					}
				}
			}

			.image {
				align-self: stretch;
				flex: 0 0 2em;
				width: 2em;
				height: 3em;
				max-height: 3em;
				margin: 0 1rem 0 0;
				overflow: hidden;
			}

			.image img {
				display: block;
				width: 100%;
				height: 100%;
				min-height: 100%;
				object-fit: cover;
			}

			.content {
				position: relative;
				display: flex;
				flex-direction: column;
				min-width: 0;
			}

			.result-header {
				min-width: 0;
				white-space: normal;
			}

			.title {
				color: black;
				padding-right: 0;
				line-height: 1;
				font-size: 1em;
				font-weight: bold;
				white-space: normal;
				overflow-wrap: anywhere;
			}

			.description {
				line-height: 1.2;
				color: #999;
				font-size: 1em;
			}
		}

		#status-messages-layer {
			position: absolute;
			right: 32px;
			top: calc(var(--header-height) + 0.5rem);
			z-index: 1000;
		}

		#status-messages {
			padding: 0.85rem;
			color: black;
			background: white;
			border-radius: 6px;
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
			overflow: hidden;
		}

		#status-messages .search-empty-state,
		#status-messages .search-error-panel,
		#status-messages .result,
		#status-messages .result-error {
			margin: 0;
		}
	}
</style>
