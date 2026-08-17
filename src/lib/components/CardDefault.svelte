<script>
	import { resolve } from '$app/paths';

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
</script>

{#if detailsHref}
	<a id={scrollId || undefined} class="ui card default-card" href={detailsHref}>
		{#if imageUrl}
			<div class="image">
				<img src={imageUrl} alt={title} />

				<div
						class="ui top right attached label
					{normalizedType === 'movie' ? 'blue' : 'teal'}"
				>
					{normalizedType}
				</div>
			</div>
		{/if}

		<div class="content">
			<div class="header">{title}</div>

			<div class="ui hidden divider small"></div>

			{#if genreText}
				<p class="meta genres">
					<i class="layer group icon"></i>
					{genreText}
				</p>
			{/if}

			{#if date}
				<p class="meta date">
					<i class="calendar icon"></i>
					{date}
				</p>
			{/if}
		</div>

		<div class="extra content">
			<span>Rating:&nbsp;</span>
			<i class="yellow star icon"></i>

			<small class="ui label">
				{rating ? rating.toFixed(1) : '–'}
			</small>
		</div>
	</a>
{/if}