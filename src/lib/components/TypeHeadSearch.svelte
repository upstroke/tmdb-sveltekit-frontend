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
	let announcement = $state('');
	let selectedResultKey = $state(null);
	let inputElement;

	let hasResults = $derived(movies.length > 0 || tvShows.length > 0);
	let hasSearchTerm = $derived(query.trim().length >= 4);
	let hasStatusMessage = $derived(!resultsClosed && (showLoading || !!error || (hasSearchTerm && !hasResults)));
	let resultsVisible = $derived(!resultsClosed && (hasResults || loading || !!error));

	let debounceTimer;
	let loadingTimer;
	let announcementTimer;
	let controller;
	let previousLocale = $state(null);

	const searchHintId = 'typeahead-search-hint';
	const resultsId = 'typeahead-search-results';

	$effect(() => {
		if (previousLocale == null) {
			previousLocale = activeLocale;
			return;
		}
		if (activeLocale === previousLocale) return;
		previousLocale = activeLocale;
		const term = query.trim();
		if (term.length >= 4) void search(term);
	});

	function formatRating(value) { return Number(value ?? 0).toFixed(1); }
	function formatYear(value) {
		if (!value) return fallbacks.dateFallback;
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return fallbacks.dateFallback;
		return String(date.getFullYear());
	}
	function ratingAriaLabel(value) { return `${texts.rating}: ${formatRating(value)} ${formats.outOfTen}`; }
	function withLocale(href) {
		if (!href) return href;
		const url = new URL(href, page.url.origin);
		url.searchParams.set('locale', activeLocale);
		return `${url.pathname}${url.search}${url.hash}`;
	}
	function resultHref(item) {
		if (item.mediaType === 'movie') return resolve('/movies/[id]', { id: String(item.id) });
		return resolve('/tv-shows/[id]', { id: String(item.id) });
	}
	function clearAnnouncement() { clearTimeout(announcementTimer); announcement = ''; }
	function scheduleAnnouncement(message) {
		clearTimeout(announcementTimer);
		announcement = '';
		if (!message) return;
		announcementTimer = setTimeout(() => { requestAnimationFrame(() => { announcement = message; }); }, 500);
	}
	function resetResults() { clearTimeout(loadingTimer); clearAnnouncement(); showLoading = false; loading = false; resultsClosed = false; selectedResultKey = null; movies = []; tvShows = []; error = null; }
	function handleInput() {
		clearTimeout(debounceTimer); clearAnnouncement(); selectedResultKey = null;
		const term = query.trim();
		if (term.length < 4) { resetResults(); return; }
		resultsClosed = false;
		debounceTimer = setTimeout(() => search(term), 300);
	}
	async function search(term) {
		controller?.abort(); clearTimeout(loadingTimer); clearAnnouncement(); selectedResultKey = null; showLoading = false; controller = new AbortController(); loading = true; error = null;
		loadingTimer = setTimeout(() => { if (loading) showLoading = true; }, 300);
		try {
			const response = await fetch(`/search?q=${encodeURIComponent(term)}&locale=${encodeURIComponent(activeLocale)}`, { signal: controller.signal });
			if (!response.ok) { error = messages.searchError; scheduleAnnouncement(messages.searchError); return; }
			const data = await response.json(); movies = deduplicateById(data.movies ?? []); tvShows = deduplicateById(data.tvShows ?? []);
			const resultCount = movies.length + tvShows.length;
			if (resultCount > 0) scheduleAnnouncement(messages.searchResultsCount.replace('{count}', String(resultCount)));
			else if (term.length >= 4) scheduleAnnouncement(messages.searchNoResults);
		} catch (exception) {
			if (exception.name === 'AbortError') return;
			error = exception instanceof Error ? exception.message : messages.searchError; scheduleAnnouncement(messages.searchError);
		} finally { clearTimeout(loadingTimer); showLoading = false; loading = false; }
	}
	function handleKeydown(event) { if (event.key === 'Escape') { event.preventDefault(); closeResults({ restoreFocus: true }); } }
	function selectResult(resultKey) { selectedResultKey = resultKey; closeResults(); }
	function closeResults({ restoreFocus = false } = {}) { clearAnnouncement(); resultsClosed = true; if (restoreFocus) inputElement?.focus(); }
	function handleWindowClick(event) { if (!event.target.closest('#typeahead-search')) closeResults(); }
	function showResults() { if (query.trim().length >= 4 && (hasResults || loading || error)) resultsClosed = false; }
</script>

<svelte:window onclick={handleWindowClick} onkeydown={handleKeydown} />

<search id="typeahead-search">
	<form id="typeahead-search-form" onsubmit={(event) => event.preventDefault()} role="search">
		<label class="u-sr-only" for="typeahead-search-input">{texts.searchInput}</label>
		<div class="input-wrapper">
			<input aria-autocomplete="list" aria-controls={resultsId} aria-describedby={searchHintId} aria-expanded={resultsVisible && hasResults} aria-haspopup="listbox" role="combobox" autocomplete="off" bind:this={inputElement} bind:value={query} id="typeahead-search-input" onfocus={showResults} oninput={handleInput} placeholder={texts.searchInput} type="search" />
			<i aria-hidden="true" class="search icon"></i>
			<p class="u-sr-only" id={searchHintId}>{messages.searchHint}</p>
			{#if hasStatusMessage}
				<div id="status-messages-layer"><section id="status-messages" aria-hidden="true">
					{#if error}<div class="search-error-panel"><p class="result result-error">{error}</p></div>
					{:else if loading}<p class="result">{messages.searchLoading}</p>
					{:else if hasSearchTerm && !hasResults}<div class="search-empty-state"><p class="result">{messages.searchNoResults}</p></div>{/if}
				</section></div>
			{/if}
		</div>
		{#if hasResults}
			<div id={resultsId} role="listbox" aria-label={messages.searchResults} class:results-closed={resultsClosed} style:display={resultsClosed ? 'none' : ''}>
				{#if movies.length > 0}
					<div role="group" aria-labelledby="typeahead-movies-heading">
						<h2 id="typeahead-movies-heading" class="typeahead-results-heading ui label blue {titles.movies ? '' : 'u-not-available'}">{titles.movies}</h2>
						{#each movies as item (item.id)}
							<a role="option" class="result" data-result-link="true" href={withLocale(resultHref(item))} onclick={() => selectResult(`movie-${item.id}`)} aria-selected={selectedResultKey === `movie-${item.id}` ? 'true' : 'false'} aria-labelledby={'typeahead-result-type-movie-' + item.id + ' typeahead-result-title-movie-' + item.id + ' typeahead-result-desc-movie-' + item.id}><figure class="image" aria-hidden="true"><img src={item.posterUrl || item.imageUrl || notAvailable} alt="" /></figure><div class="content"><header class="result-header"><h3 class="title {item.title ? '' : 'u-not-available'}" id={'typeahead-result-title-movie-' + item.id}>{item.title}</h3></header><p class="description" id={'typeahead-result-desc-movie-' + item.id}><time class={item.date ? '' : 'u-not-available'} datetime={item.date}>{formatYear(item.date)}</time><span aria-hidden="true"> · </span><span class="rating" aria-label={ratingAriaLabel(item.rating)}><i class="yellow star icon" aria-hidden="true"></i><span class={item.rating ? '' : 'u-not-available'}>{formatRating(item.rating)}</span></span></p><span class="u-sr-only" id={'typeahead-result-type-movie-' + item.id}>{titles.movies}</span></div></a>
						{/each}
					</div>
				{/if}
				{#if tvShows.length > 0}
					<div role="group" aria-labelledby="typeahead-tv-heading">
						<h2 id="typeahead-tv-heading" class="typeahead-results-heading ui label blue {titles.tvShows ? '' : 'u-not-available'}">{titles.tvShows}</h2>
						{#each tvShows as item (item.id)}
							<a role="option" class="result" data-result-link="true" href={withLocale(resultHref(item))} onclick={() => selectResult(`tv-${item.id}`)} aria-selected={selectedResultKey === `tv-${item.id}` ? 'true' : 'false'} aria-labelledby={'typeahead-result-type-tv-' + item.id + ' typeahead-result-title-tv-' + item.id + ' typeahead-result-desc-tv-' + item.id}><figure class="image" aria-hidden="true"><img src={item.posterUrl || item.imageUrl || notAvailable} alt="" /></figure><div class="content"><header class="result-header"><h3 class="title {item.title ? '' : 'u-not-available'}" id={'typeahead-result-title-tv-' + item.id}>{item.title}</h3></header><p class="description" id={'typeahead-result-desc-tv-' + item.id}><time class={item.date ? '' : 'u-not-available'} datetime={item.date}>{formatYear(item.date)}</time><span aria-hidden="true"> · </span><span class="rating" aria-label={ratingAriaLabel(item.rating)}><i class="yellow star icon" aria-hidden="true"></i><span class={item.rating ? '' : 'u-not-available'}>{formatRating(item.rating)}</span></span></p><span class="u-sr-only" id={'typeahead-result-type-tv-' + item.id}>{titles.tvShows}</span></div></a>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</form>
</search>

<div class="u-sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>

<style lang="scss">
	@use '../../css/variables';
	#typeahead-search { flex: 1; display: flex; justify-content: flex-end;
		#typeahead-search-form { position: relative; flex: 1; display: flex; }
		.input-wrapper { flex: 1; display: flex; justify-content: flex-end; align-items: center; padding: 0.5rem 0; flex-wrap: nowrap; }
		.search.icon { margin-left: 0.5rem; }
		#typeahead-search-input { border: none; background: transparent; color: white; padding: 0.5rem 0 0.5rem 0.5rem; margin-right: 0.5rem; line-height: 0; width: 50%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
		#typeahead-search-input:focus-visible { outline: 2px solid #2185d0 !important; outline-offset: 0; border: none; box-shadow: none; }
		#typeahead-search-input::-webkit-search-cancel-button { filter: brightness(0) invert(1); cursor: pointer; position: relative; margin-left: 0.5rem; }
		#typeahead-search-results { position: fixed; right: 2px; top: var(--header-height); z-index: 1002; color: black; min-width: var(--typeahead-search-results-width); max-width: var(--typeahead-search-results-width); max-height: calc(100vh - var(--header-height) - var(--footer-height) - 6px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5); overflow-x: hidden; overflow-y: auto; border-radius: 6px; background: white; }
		#typeahead-search-results [role="group"] { background: white; }
		#typeahead-search-results [role="group"] > a.result { display: flex; padding: 0.5em 1em; transition: background-color 180ms ease; }
		#typeahead-search-results [role="group"] > a.result:hover, #typeahead-search-results [role="group"] > a.result:focus-visible, #typeahead-search-results [role="group"] > a.result[aria-selected="true"] { background: rgba(0, 0, 0, 0.08); }
		#typeahead-search-results [role="group"] > a.result:focus-visible { outline: 2px solid #2185d0; outline-offset: -3px; }
		#typeahead-search-results .category { background: white; }
		.typeahead-results-heading { font-size: 1em; font-weight: 500; width: 100%; border-radius: 0; &.ui.label.blue { background-color: var(--mediatype-label-blue); border-color: var(--mediatype-label-blue); color: white; } &.ui.label.teal { background-color: var(--mediatype-label-teal); border-color: var(--mediatype-label-teal); color: white; } }
		.image { align-self: stretch; flex: 0 0 2em; width: 2em; height: 3em; max-height: 3em; margin: 0 1rem 0 0; overflow: hidden; }
		.image img { display: block; width: 100%; height: 100%; min-height: 100%; object-fit: cover; }
		.content { position: relative; display: flex; flex-direction: column; min-width: 0; }
		.result-header { min-width: 0; white-space: normal; }
		.title { color: black; padding-right: 0; line-height: 1; font-size: 1em; font-weight: bold; white-space: normal; overflow-wrap: anywhere; }
		.description { line-height: 1.2; color: var(--color-text-muted); font-size: 1em; }
		#status-messages-layer { position: absolute; right: 32px; top: calc(var(--header-height) + 0.5rem); z-index: 1000; }
		#status-messages { padding: 0.85rem; color: black; background: white; border-radius: 6px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5); overflow: hidden; }
		#status-messages .search-empty-state, #status-messages .search-error-panel, #status-messages .result, #status-messages .result-error { margin: 0; }
		@media only screen and (max-width: 767.98px) { #typeahead-search-results { min-width: unset; max-width: unset; width: 100vw; } }
	}
</style>