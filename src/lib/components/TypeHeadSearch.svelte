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

	function formatRating(value) {
		return Number(value ?? 0).toFixed(1);
	}

	function formatYear(value) {
		return value?.slice(0, 4) || '- -';
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

	function closeResults() {
		visible = false;
	}

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
					<div class="result">{error}</div>
				{:else}
					{#if movies.length > 0}
						<div class="category">
							<div class="ui label blue">Filme</div>
							<div class="results">
								{#each movies as item (item.id)}
									<a class="result" href={resultHref(item)} onclick={closeResults}>
										<div class="image">
											<img src={item.posterUrl} alt={item.title} />
										</div>
										<div class="content">
											<div class="title">{item.title}</div>
											<div class="description">{formatYear(item.releaseDate)} · {formatRating(item.rating)}</div>
											<div class="ui basic label">Film</div>
										</div>
									</a>
								{/each}
							</div>
						</div>
					{/if}

					{#if tvShows.length > 0}
						<div class="category">
							<div class="ui label blue">Serien</div>
							<div class="results">
								{#each tvShows as item (item.id)}
									<a class="result" href={resultHref(item)} onclick={closeResults}>
										<div class="image">
											<img src={item.posterUrl} alt={item.title} />
										</div>
										<div class="content">
											<div class="title">{item.title}</div>
											<div class="description">{formatYear(item.releaseDate)} · {formatRating(item.rating)}</div>
											<div class="ui basic label">TV</div>
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

<style lang="scss">
	.typeahead-search {
		position: relative;
		display: block;
		flex: 1 1 auto;
		width: 100%;
		min-width: 0;
		height: 100%;
	}

	.right.menu.searchbar {
		position: relative;
		display: block;
		width: 100%;
		height: 100%;

		.category.search {
			position: relative;
			display: block;
			width: 100%;
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
			display: flex;
			align-items: center;
			width: 100%;
			height: 100%;

			input.prompt {
				display: block;
				width: 100%;
				min-width: 0;
				height: 100%;
				visibility: visible;
				opacity: 1;
			}

			> .search.icon {
				flex: 0 0 auto;
			}
		}

		.ui.category.search > .results {
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
					overflow: visible;
				}

				> .name {
					display: block;
					width: 100%;
					margin: 0;
					padding: 0.75rem 1rem;
					box-sizing: border-box;
					font-weight: 700;
				}
			}

			.result {
				display: block;
				width: 100%;
				box-sizing: border-box;

				.content {
					position: relative;
					min-height: 3.5rem;
					padding: 0.75rem 4rem 0.75rem 1rem;
					box-sizing: border-box;

					.ui.basic.label {
						position: absolute;
						top: 0.75rem;
						right: 1rem;
						margin: 0;
					}
				}

				.title {
					padding-right: 0;
					line-height: 1.35;
				}

				.description {
					margin-top: 0.35rem;
					line-height: 1.2;
				}

				.image {
					width: 2em;
					height: 3em;
				}

				.content {
					margin: 0;
					padding-top: 2px;
					padding-bottom: 0;
				}
			}
		}

		.ui.category .ui.label {
			display: block;
			border-radius: 0;
		}
	}

	@media only screen and (max-width: 767px) {
		.min-width-0 {
			min-width: 0;
		}

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
