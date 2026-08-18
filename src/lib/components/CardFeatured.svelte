<script>
	import { resolve } from '$app/paths';
	import notAvailable from '$lib/assets/not-available.png';

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
	let featuredImageUrl = $derived(imageUrl || notAvailable);
	let featuredTitle = $derived(title?.trim() || 'N/A');
	let featuredReleaseDate = $derived(releaseDate?.trim() || 'N/A');
	let featuredOverview = $derived(overview?.trim() || 'N/A');
	let featuredHomepage = $derived(homepage?.trim() || 'N/A');
</script>

<div class="ui fluid card basic featured-card">
	<div class="image">
		<img src={featuredImageUrl} alt={featuredTitle} />
	</div>

	<div class="content">
		{#if genreText}
			<div class="content">
				<h4 class="sub header">
					<i class="layer group icon"></i>
					<span>{genreText}</span>
				</h4>
			</div>

			<div class="ui hidden divider"></div>
		{:else}
			<div class="content">
				<h4 class="sub header">N/A</h4>
			</div>

			<div class="ui hidden divider"></div>
		{/if}

		<h2 class="header">{featuredTitle}</h2>

		<p class="meta">
			<i class="calendar icon"></i>
			{featuredReleaseDate}
		</p>

		<div class="description">
			<p>{featuredOverview}</p>
		</div>
	</div>

	<div class="extra content actions">
		{#if detailsHref}
			<a class="ui primary button" href={detailsHref}>Weitere Informationen</a>
		{/if}

		{#if featuredHomepage !== 'N/A'}
			<a class="ui button" href={featuredHomepage} target="_blank" rel="noopener noreferrer">
				Offizielle Website
			</a>
		{/if}
	</div>
</div>

<style lang="scss">
	.ui.featured-card {
		margin-bottom: 5rem;

		.sub.header {
			position: relative;
			text-transform: none;
			font-size: 0.85714286em;
		}
	}
</style>
