<script>
    import { resolve } from '$app/paths';
    import { goto } from '$app/navigation';
    import { deduplicateById } from '$lib/utils/deduplicateById';
    import notAvailable from '$lib/assets/not-available.png';

    /**
     * Typeahead-Suchkomponente ohne externe Props.
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

    function formatRating(value) {
        return Number(value ?? 0).toFixed(1);
    }

    function formatYear(value) {
        return value?.slice(0, 4) || '- -';
    }

    function ratingAriaLabel(value) {
        return `Bewertung: ${formatRating(value)} von 10`;
    }

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

    function resetResults() {
        movies = [];
        tvShows = [];
        visible = false;
        error = null;
    }

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
            visible = true;
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

    // Nur noch die Logik für die Escape-Taste
    function handleKeydown(event) {
        if (event.key === 'Escape') {
            closeResults();
        }
    }

    function closeResults() {
        visible = false;
    }

    function handleDocumentPointerdown(event) {
        if (!event.target.closest('.typeahead-search')) {
            closeResults();
        }
    }

    function showResults() {
        if (query.trim().length >= 4 && (movies.length > 0 || tvShows.length > 0 || loading || error)) {
            visible = true;
        }
    }

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
    <!-- HIER: onkeydown gelöscht, um a11y-Fehler auf nicht-interaktiven Elementen zu vermeiden -->
    <form role="search" class="ui left aligned transparent category search" onsubmit={(e) => e.preventDefault()}>
        <label class="u-sr-only" for="typeahead-search-input">Film oder TV-Serie finden</label>
        <div class="ui icon transparent inverted input">
            <!-- HIER: onkeydown hinzugefügt. Das Input-Feld fängt die Pfeiltasten jetzt sauber ab -->
            <input
                    id="typeahead-search-input"
                    class="prompt"
                    type="search"
                    placeholder="Film oder TV-Serie finden"
                    bind:value={query}
                    oninput={handleInput}
                    onfocus={showResults}
                    onkeydown={handleKeydown}
                    aria-describedby="typeahead-search-hint"
                    autocomplete="off"
            />

            <i class="search icon" aria-hidden="true"></i>
        </div>
        <p id="typeahead-search-hint" class="u-sr-only">Mindestens vier Zeichen eingeben, um Suchergebnisse für Filme und TV anzuzeigen.</p>

        {#if resultsVisible}
            <div id="typeahead-search-results" class="results transition show" aria-label="Suchergebnisse" aria-live="polite">
                {#if loading}
                    <p class="result" role="status">Suche läuft …</p>
                {:else if error}
                    <p class="result" role="status">{error}</p>
                {:else}
                    {#if movies.length > 0}
                        <section class="category" aria-labelledby="typeahead-movies-heading">
                            <h2 id="typeahead-movies-heading" class="ui label blue">Filme</h2>
                            <ul class="results" aria-label="Filmergebnisse">
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
                            <h2 id="typeahead-tv-heading" class="ui label blue">TV</h2>
                            <ul class="results" aria-label="TVergebnisse">
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
                        <p class="result" role="status">Keine Ergebnisse gefunden.</p>
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
