<script>
    import { resolve } from '$app/paths';
    import { goto } from '$app/navigation';
    import { deduplicateById } from '$lib/utils/deduplicateById';
    import notAvailable from '$lib/assets/not-available.png';
    import uiText from '$lib/i18n/ui.json';

    const locale = 'de-DE';
    const texts = uiText.locales[locale].labels;
	const messages = uiText.locales[locale].messages;
	const titles = uiText.locales[locale].titles;
	const formats = uiText.locales[locale].formats;

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
    let visible = $state(false);
    let loading = $state(false);
    let error = $state(null);

    let hasResults = $derived(movies.length > 0 || tvShows.length > 0);
    let resultsVisible = $derived(visible || loading || !!error);

    let debounceTimer;
    let controller;

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
     * Ermittelt die Zielroute für einen Suchtreffer anhand seines Medientyps.
     *
     * @param {{ id: number | string, mediaType: 'movie' | 'tv' }} item - Normalisierter Suchtreffer.
     * @returns {string} Aufgelöste interne Route zur Detailseite.
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
     * Setzt Ergebnislisten und Fehlermeldung auf den Ausgangszustand zurück.
     *
     * @returns {void}
     */
    function resetResults() {
        movies = [];
        tvShows = [];
        visible = false;
        error = null;
    }

    /**
     * Verarbeitet Eingaben im Suchfeld und startet die Suche verzögert.
     *
     * Bei weniger als vier Zeichen werden vorhandene Treffer sofort entfernt.
     * @returns {void}
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
        controller = new AbortController();

        loading = true;
        error = null;

        try {
            const response = await fetch(`/search?q=${encodeURIComponent(term)}`, {
                signal: controller.signal
            });

            if (!response.ok) {
                error = messages.searchError;
                return;
            }

            const data = await response.json();

            movies = deduplicateById(data.movies ?? []);
            tvShows = deduplicateById(data.tvShows ?? []);
            visible = true;
        } catch (exception) {
            if (exception.name === 'AbortError') {
                return;
            }

            error = exception instanceof Error ? exception.message : messages.searchError;
            visible = false;
        } finally {
            loading = false;
        }
    }
    
    /**
     * Reagiert auf Tastatureingaben im Suchfeld.
     *
     * Aktuell wird nur die Escape-Taste ausgewertet, um die Ergebnisliste zu schließen.
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
        visible = false;
    }

    /**
     * Schließt die Ergebnisliste bei Pointer-Interaktionen außerhalb der Komponente.
     *
     * @param {PointerEvent} event - Pointer-Ereignis auf Fensterebene.
     * @returns {void}
     */
    function handleDocumentPointerdown(event) {
        if (!event.target.closest('.typeahead-search')) {
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
            visible = true;
        }
    }

    /**
     * Verarbeitet Klicks auf Suchtreffer und navigiert kontrolliert zur Detailseite.
     *
     * Das Standardverhalten des Links wird unterbunden, damit die Liste vor dem
     * Routenwechsel geschlossen und die Navigation über SvelteKit ausgeführt wird.
     *
     * @param {MouseEvent} event - Klickereignis des Treffers.
     * @param {{ id: number | string, mediaType: 'movie' | 'tv' }} item - Ausgewählter Suchtreffer.
     * @returns {void}
     */
    function handleLinkClick(event, item) {
        event.preventDefault();
        event.stopPropagation();

        const href = resultHref(item);
        closeResults();
        goto(href);
    }
</script>

<svelte:window onpointerdown={handleDocumentPointerdown} />

<search class="typeahead-search right menu searchbar hydrated">
    <form role="search" class="ui left aligned transparent category search" onsubmit={(e) => e.preventDefault()}>
        <label class="u-sr-only" for="typeahead-search-input">{texts.searchInput}</label>
        <div class="ui icon transparent inverted input">
            <input
                    id="typeahead-search-input"
                    class="prompt"
                    type="search"
                    placeholder={texts.searchInput}
                    bind:value={query}
                    oninput={handleInput}
                    onfocus={showResults}
                    onkeydown={handleKeydown}
                    aria-describedby={searchHintId}
                    autocomplete="off"
            />

            <i class="search icon" aria-hidden="true"></i>
        </div>
        <p id="typeahead-search-hint" class="u-sr-only">{messages.searchHint}</p>

        {#if resultsVisible}
            <div id="typeahead-search-results" class="results transition show" aria-label={messages.searchResults} aria-live="polite">
                {#if loading}
                    <p class="result" role="status">{messages.searchLoading}</p>
                {:else if error}
                    <p class="result" role="status">{error === messages.searchError ? messages.searchError : error}</p>
                {:else}
                    {#if movies.length > 0}
                        <section class="category" aria-labelledby="typeahead-movies-heading">
                            <h2 id="typeahead-movies-heading" class="ui label blue">{titles.movies}</h2>
                            <ul class="results" aria-label={titles.movies}>
                                {#each movies as item (item.id)}
                                    <li>
                                        <a class="result" href={resultHref(item)} onclick={(e) => handleLinkClick(e, item)}>
                                            <figure class="image" aria-hidden="true">
                                                <img src={item.posterUrl || notAvailable} alt="" />
                                            </figure>
                                            <div class="content">
                                                <header class="result-header">
                                                    <h3 class="title">{item.title}</h3>
                                                </header>
                                                <p class="description">
                                                    <time datetime={item.date}>{formatYear(item.date)}</time>
                                                    <span aria-hidden="true"> · </span>
                                                    <span class="rating" aria-label={ratingAriaLabel(item.rating)}>
														<i class="yellow star icon" aria-hidden="true"></i>
														<span>{formatRating(item.rating)}</span>
													</span>
                                                </p>
                                            </div>
                                        </a>
                                    </li>
                                {/each}
                            </ul>
                        </section>
                    {/if}

                    {#if tvShows.length > 0}
                        <section class="category" aria-labelledby="typeahead-tv-heading">
                            <h2 id="typeahead-tv-heading" class="ui label blue">{titles.tvShows}</h2>
                            <ul class="results" aria-label={titles.tvShows}>
                                {#each tvShows as item (item.id)}
                                    <li>
                                        <a class="result" href={resultHref(item)} onclick={(e) => handleLinkClick(e, item)}>
                                            <figure class="image" aria-hidden="true">
                                                <img src={item.posterUrl || notAvailable} alt="" />
                                            </figure>
                                            <div class="content">
                                                <header class="result-header">
                                                    <h3 class="title">{item.title}</h3>
                                                </header>
                                                <p class="description">
                                                    <time datetime={item.date}>{formatYear(item.date)}</time>
                                                    <span aria-hidden="true"> · </span>
                                                    <span class="rating" aria-label={ratingAriaLabel(item.rating)}>
														<i class="yellow star icon" aria-hidden="true"></i>
														<span>{formatRating(item.rating)}</span>
													</span>
                                                </p>
                                            </div>
                                        </a>
                                    </li>
                                {/each}
                            </ul>
                        </section>
                    {/if}

                    {#if !hasResults}
                        <p class="result" role="status">{messages.searchNoResults}</p>
                    {/if}
                {/if}
            </div>
        {/if}
    </form>
</search>

<style lang="scss">
	@use '../../css/variables';
	@use '../../css/mixins' as *;
	.typeahead-search {
		position: relative;
		display: block;
		flex: 0 0 auto;
		width: fit-content;
		min-width: 0;
		height: 100%;
	}

	.right.menu.searchbar {
		position: relative;
		display: block;
		width: fit-content;
		height: 100%;

		.category.search {
			position: relative;
			display: block;
			width: fit-content;
			height: 100%;
			margin-left: 0;

			> .results {
				position: absolute;
				z-index: 1000;
				top: calc(100% + var(--search-dropdown-gap));
				right: 0;
				left: auto;
				display: block;
				width: min(var(--search-dropdown-width), calc(100vw - 2rem));
				height: auto;
				max-height: calc(100vh - var(--header-height) - var(--footer-height) - var(--search-dropdown-gap));
				margin: 0;
				overflow-x: hidden;
				overflow-y: auto;
				box-sizing: border-box;
			}
		}

		.ui.icon.input {
			position: relative;
			top: auto;
			right: auto;
			display: inline-flex;
			align-items: center;
			width: fit-content;
			height: 100%;

			input.prompt {
				display: block;
				width: clamp(16rem, 30vw, 28rem);
				min-width: 0;
				height: 100%;
				padding-right: 2.25rem;
				visibility: visible;
				opacity: 1;

				&::-webkit-search-cancel-button {
					filter: brightness(0) invert(1);
					margin-left: 0.5rem;
				}
			}

			> .search.icon {
				flex: 0 0 auto;
			}
		}

		.category.search > .results {
			.category {
				display: block;
				width: 100%;
				height: auto;

				.results {
					position: static;
					z-index: auto;
					display: block;
					width: 100%;
					height: auto;
					max-height: none;
					margin: 0;
					padding: 0;
					overflow: visible;
					list-style: none;
				}

				> .ui.label {
					display: block;
					width: 100%;
					margin: 0;
					padding: 0.75rem 1rem;
					box-sizing: border-box;
					font-weight: 700;
				}
			}

			li {
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
			}

			.result {
				display: flex;
				align-items: stretch;
				width: 100%;
				box-sizing: border-box;

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
					flex: 1 1 auto;
					min-height: 3.5rem;
					margin: 0;
					padding: 2px 4rem 0 0;
					box-sizing: border-box;
				}

				.title {
					padding-right: 0;
					line-height: 1.35;
				}

				.description {
					margin-top: 0.35rem;
					line-height: 1.2;
				}
			}
		}

		.ui.category .ui.label,
		.category .ui.label {
			display: block;
			border-radius: 0;
		}
	}

	@include mobile-only {
		.right.menu.searchbar {
			.ui.category.search > .results {
				position: fixed;
				z-index: 9999;
				top: var(--header-height);
				right: 0;
				left: 0;
				width: 100%;
				max-width: none;
				max-height: calc(100vh - var(--header-height) - var(--footer-height));
				border: none;
				border-radius: 0;
				box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
			}
		}
	}
</style>
