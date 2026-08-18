<script>
	import { resolve } from '$app/paths';
	import notAvailable from '$lib/assets/not-available.png';

	/**
	 * Erwartete Props für die Standard-Karte.
	 *
	 * @param {number|string} id - ID des Mediums.
	 * @param {'movie'|'tv'|string} mediaType - Medientyp der Karte.
	 * @param {string} title - Titel des Mediums.
	 * @param {string} [date=''] - Anzeige-Datum des Mediums.
	 * @param {number} [rating=0] - Bewertung des Mediums.
	 * @param {Array<{id: number|string, name: string}>} [genres=[]] - Liste der Genres.
	 * @param {string} [imageUrl=''] - URL des Vorschaubilds.
	 * @param {string} [scrollId=''] - Optionale DOM-ID für das Karten-Element.
	 */
	let {
		id,
		mediaType,
		title,
		date = '',
		rating = 0,
		genres = [],
		imageUrl = '',
		scrollId = ''
	} = $props();

	let normalizedType = $derived(mediaType === 'movie' ? 'movie' : mediaType === 'tv' ? 'tv' : null);

	let detailsHref = $derived(
			normalizedType === 'movie'
					? resolve('/movies/[id]', {
						id: String(id)
					})
					: normalizedType === 'tv'
							? resolve('/tv-shows/[id]', {
								id: String(id)
							})
							: undefined
	);

	let genreText = $derived((genres ?? []).map((genre) => genre.name).join(' / '));
	let cardImageUrl = $derived(imageUrl || notAvailable);
	let cardTitle = $derived(title?.trim() || 'N/A');
	let cardDate = $derived(date?.trim() || 'N/A');
	let cardRating = $derived(rating ? rating.toFixed(1) : 'N/A');
</script>

{#if detailsHref}
	<a id={scrollId || undefined} class="ui card default-card" href={detailsHref}>
		<div class="image">
			<img src={cardImageUrl} alt={cardTitle} />

			<div
					class="ui top right attached label
				{normalizedType === 'movie' ? 'blue' : 'teal'}"
			>
				{normalizedType}
			</div>
		</div>

		<div class="content">
			<div class="header">{cardTitle}</div>

			<div class="ui hidden divider small"></div>

			{#if genreText}
				<p class="meta genres">
					<i class="layer group icon"></i>
					{genreText}
				</p>
			{:else}
				<p class="meta genres">N/A</p>
			{/if}

			{#if date}
				<p class="meta date">
					<i class="calendar icon"></i>
					{cardDate}
				</p>
			{:else}
				<p class="meta date">N/A</p>
			{/if}
		</div>

		<div class="extra content">
			<span>Rating:&nbsp;</span>
			<i class="yellow star icon"></i>

			<small class="ui label">
				{cardRating}
			</small>
		</div>
	</a>
{/if}

<style lang="scss">
	a.default-card[id] {
		scroll-padding-top: calc(var(--header-height) + 2rem);
	}
</style>
