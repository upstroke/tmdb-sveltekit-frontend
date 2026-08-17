<script>
	import { resolve } from '$app/paths';

	/**
	 * Erwartete Props für die Featured-Karte.
	 *
	 * @param {number|string} id - ID des Mediums.
	 * @param {'movie'|'tv'|string} mediaType - Medientyp der Karte.
	 * @param {string} title - Titel des Mediums.
	 * @param {string} [releaseDate=''] - Veröffentlichungsdatum oder Startdatum.
	 * @param {string} [overview=''] - Kurzbeschreibung des Mediums.
	 * @param {string} [homepage=''] - Offizielle Website des Mediums.
	 * @param {Array<{id: number|string, name: string}>} [genres=[]] - Liste der Genres.
	 * @param {string} [imageUrl=''] - URL des Vorschaubilds.
	 */
	let {
		id,
		mediaType,
		title,
		releaseDate = '',
		overview = '',
		homepage = '',
		genres = [],
		imageUrl = ''
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

<div class="ui fluid card basic featured-card">
	{#if imageUrl}
		<div class="image">
			<img src={imageUrl} alt={title} />
		</div>
	{/if}

	<div class="content">
		{#if genreText}
			<div class="content">
				<h4 class="sub header">
					<i class="layer group icon"></i>
					<span>{genreText}</span>
				</h4>
			</div>

			<div class="ui hidden divider"></div>
		{/if}

		<h2 class="header">{title}</h2>

		{#if releaseDate}
			<p class="meta">
				<i class="calendar icon"></i>
				{releaseDate}
			</p>
		{/if}

		{#if overview}
			<div class="description">
				<p>{overview}</p>
			</div>
		{/if}
	</div>

	<div class="extra content actions">
		{#if detailsHref}
			<a class="ui primary button" href={detailsHref}> Weitere Informationen </a>
		{/if}

		{#if homepage}
			<a class="ui button" href={homepage} target="_blank" rel="noopener noreferrer">
				Offizielle Website
			</a>
		{/if}
	</div>
</div>
