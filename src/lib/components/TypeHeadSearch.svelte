<script>
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { deduplicateById } from '$lib/utils/deduplicateById';
	import notAvailable from '$lib/assets/not-available.png';
	import { i18n } from '$lib/stores/i18n';
	import { resolveLocale } from '$lib/i18n/helpers';

	const { labels: texts, messages, titles, formats, fallbacks } = $derived($i18n);
	const activeLocale = $derived(resolveLocale(page.url.searchParams.get('locale')));

	let query = $state('');
	let movies = $state([]);
	let tvShows = $state([]);
	let loading = $state(false);
	let showLoading = $state(false);
	let resultsClosed = $state(false);
	let error = $state(null);
	let announceNoResults = $state(false);
	let announceResultCount = $state(0);

	let hasResults = $derived(movies.length > 0 || tvShows.length > 0);
	let hasSearchTerm = $derived(query.trim().length >= 4);
	let hasStatusMessage = $derived(
		!resultsClosed && (showLoading || !!error || (hasSearchTerm && !hasResults))
	);
	let totalResults = $derived(movies.length + tvShows.length);

	let debounceTimer;
	let loadingTimer;
	let controller;
	let previousLocale = $state(null);

	const searchHintId = 'typeahead-search-hint';

	$effect(() => {
		if (previousLocale == null) {
			previousLocale = activeLocale;
			return;
		}

		if (activeLocale === previousLocale) {
			return;
		}

		previousLocale = activeLocale;
		const term = query.trim();

		if (term.length >= 4) {
			void search(term);
		}
	});

	function formatRating(value) {
		return Number(value ?? 0).toFixed(1);
	}

	function formatYear(value) {
		if (!value) return fallbacks.dateFallback;

		const date = new Date(value);
		if (Number.isNaN(date.getTime())) {
			return fallbacks.dateFallback;
		}

		return String(date.getFullYear());
	}

	function ratingAriaLabel(value) {
		return `${texts.rating}: ${formatRating(value)} ${formats.outOfTen}`;
	}

	function withLocale(href) {
		if (!href) return href;

		const url = new URL(href, page.url.origin);
		url.searchParams.set('locale', activeLocale);
		return `${url.pathname}${url.search}${url.hash}`;
	}

	function resultHref(item) {
		if (item.mediaType === 'movie') {
			return resolve('/movies/[id]', { id: String(item.id) });
		}

		return resolve('/tv-shows/[id]', { id: String(item.id) });
	}

	function resetResults() {
		clearTimeout(loadingTimer);
		showLoading = false;
		loading = false;
		resultsClosed = false;
		movies = [];
		tvShows = [];
		error = null;
		announceNoResults = false;
		announceResultCount = 0;
	}

	function handleInput() {
		clearTimeout(debounceTimer);

		const term = query.trim();
		if (term.length < 4) {
			resetResults();
			return;
		}

		resultsClosed = false;
		announceNoResults = false;
		announceResultCount = 0;
		debounceTimer = setTimeout(() => search(term), 300);
	}

	async function search(term) {
		controller?.abort();
		clearTimeout(loadingTimer);
		showLoading = false;
		controller = new AbortController();

		loading = true;
		error = null;
		announceNoResults = false;
		announceResultCount = 0;
		loadingTimer = setTimeout(() => {
			if (loading) showLoading = true;
		}, 300);

		try {
			const response = await fetch(
				`/search?q=${encodeURIComponent(term)}&locale=${encodeURIComponent(activeLocale)}`,
				{ signal: controller.signal }
			);

			if (!response.ok) {
				error = messages.searchError;
				return;
			}

			const data = await response.json();
			movies = deduplicateById(data.movies ?? []);
			tvShows = deduplicateById(data.tvShows ?? []);

			// Trigger announcements AFTER data is loaded
			if (movies.length + tvShows.length > 0) {
				announceResultCount = movies.length + tvShows.length;
			} else if (hasSearchTerm && !hasResults) {
				announceNoResults = true;
			}
		} catch (exception) {
			if (exception.name === 'AbortError') return;
			error = exception instanceof Error ? exception.message : messages.searchError;
		} finally {
			clearTimeout(loadingTimer);
			showLoading = false;
			loading = false;
		}
	}

	function handleKeydown(event) {
		if (event.key === 'Escape') {
			closeResults();
		}
	}

	function closeResults() {
		announceNoResults = false;
		announceResultCount = 0;
		resultsClosed = true;
	}

	function handleWindowClick(event) {
		if (!event.target.closest('#typeahead-search')) {
			closeResults();
		}
	}

	function showResults() {
		if (query.trim().length >= 4 && (movies.length > 0 || tvShows.length > 0 || loading || error)) {
			resultsClosed = false;
		}
	}
</script>

<svelte:window onclick={handleWindowClick} />

<search id="typeahead-search">
	<form id="typeahead-search-form" onsubmit={(event) => event.preventDefault()} role="search">
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

			<!-- Static hint only -->
			<p class="u-sr-only" id={searchHintId}>{messages.searchHint}</p>

			{#if hasStatusMessage}
				<!-- Visible UI only (no aria-live here) -->
				<div id="status-messages-layer">
					<section id="status-messages" aria-hidden="true">
						{#if error}
							<div class="search-error-panel">
								<p class="result result-error">{error === messages.searchError ? messages.searchError : error}</p>
							</div>
						{:else if loading}
							<p class="result">{messages.searchLoading}</p>
						{:else if hasSearchTerm && !hasResults}
							<div class="search-empty-state">
								<p class="result {messages.searchNoResults ? '' : 'u-not-available'}">{messages.searchNoResults}</p>
							</div>
						{/if}
					</section>
				</div>
			{/if}
		</div>

		{#if !resultsClosed && hasResults}
			<div id="typeahead-search-results" aria-label={messages.searchResults}>
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
									data-result-link="true"
									href={withLocale(resultHref(item))}
									onclick={closeResults}
									aria-labelledby={'typeahead-result-type-movie-' + item.id + ' typeahead-result-title-movie-' + item.id + ' typeahead-result-desc-movie-' + item.id}
								>
									<figure class="image" aria-hidden="true">
										<img src={item.posterUrl || item.imageUrl || notAvailable} alt="" />
									</figure>
									<div class="content">
										<header class="result-header">
											<h3
												class="title {item.title ? '' : 'u-not-available'}"
												id={'typeahead-result-title-movie-' + item.id}
											>
												{item.title}
											</h3>
										</header>
										<p class="description" id={'typeahead-result-desc-movie-' + item.id}>
											<time class={item.date ? '' : 'u-not-available'} datetime={item.date}>
												{formatYear(item.date)}
											</time>
											<span aria-hidden="true"> · </span>
											<span class="rating" aria-label={ratingAriaLabel(item.rating)}>
												<i class="yellow star icon" aria-hidden="true"></i>
												<span class={item.rating ? '' : 'u-not-available'}>{formatRating(item.rating)}</span>
											</span>
										</p>
										<span class="u-sr-only" id={'typeahead-result-type-movie-' + item.id}>
											{titles.movies}
										</span>
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
										data-result-link="true"
										href={withLocale(resultHref(item))}
										onclick={closeResults}
										aria-labelledby={'typeahead-result-type-tv-' + item.id + ' typeahead-result-title-tv-' + item.id + ' typeahead-result-desc-tv-' + item.id}
									>
										<figure class="image" aria-hidden="true">
											<img src={item.posterUrl || item.imageUrl || notAvailable} alt="" />
										</figure>
										<div class="content">
											<header class="result-header">
												<h3
													class="title {item.title ? '' : 'u-not-available'}"
													id={'typeahead-result-title-tv-' + item.id}
												>
													{item.title}
												</h3>
											</header>
											<p class="description" id={'typeahead-result-desc-tv-' + item.id}>
												<time class={item.date ? '' : 'u-not-available'} datetime={item.date}>
													{formatYear(item.date)}
												</time>
												<span aria-hidden="true"> · </span>
												<span class="rating" aria-label={ratingAriaLabel(item.rating)}>
													<i class="yellow star icon" aria-hidden="true"></i>
													<span class={item.rating ? '' : 'u-not-available'}>{formatRating(item.rating)}</span>
												</span>
											</p>
											<span class="u-sr-only" id={'typeahead-result-type-tv-' + item.id}>
												{titles.tvShows}
											</span>
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

<!-- Global live region OUTSIDE the search component -->
<div class="u-sr-only" aria-live="polite" aria-atomic="true">
	{#if announceNoResults}
		<p>{messages.searchNoResults}</p>
	{/if}
	{#if announceResultCount > 0}
		<p>{messages.searchResultsCount.replace('{count}', String(announceResultCount))}</p>
	{/if}
</div>

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
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;

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

				&.ui.label.blue {
					background-color: var(--mediatype-label-blue);
					border-color: var(--mediatype-label-blue);
					color: white;
				}

				&.ui.label.teal {
					background-color: var(--mediatype-label-teal);
					border-color: var(--mediatype-label-teal);
					color: white;
				}
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
				color: var(--color-text-muted);
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

		@media only screen and (max-width: 767.98px) {
			#typeahead-search-results {
				min-width: unset;
				max-width: unset;
				width: 100vw;
			}
		}
	}
</style>