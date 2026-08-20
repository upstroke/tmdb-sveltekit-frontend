<script>
	import { resolve } from '$app/paths';
	import MediaTypeLabel from '$lib/components/MediaTypeLabel.svelte';
	import notAvailable from '$lib/assets/not-available.png';
	import { getCertificationMeta } from '$lib/utils/certificationMeta';

	/**
	 * Erwartete Props für die Standard-Karte.
	 *
	 * @param {number|string} id - ID des Mediums.
	 * @param {'movie'|'tv'|string} mediaType - Medientyp der Karte.
	 * @param {string} title - Titel des Mediums.
	 * @param {string} [date=''] - Anzeige-Datum des Mediums.
	 * @param {number} [rating=0] - Bewertung des Mediums.
	 * @param {string} [certification=''] - Lokale Altersfreigabe.
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
		certification = '',
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
	let certificationMeta = $derived(getCertificationMeta(certification));
</script>

{#if detailsHref}
	<a
		id={scrollId || undefined}
		class="ui card default-card"
		href={detailsHref}
	>
		<figure class="image">
			<img src={cardImageUrl} alt={`Poster von ${cardTitle}`} />

			<MediaTypeLabel mediaType={normalizedType} class="top right attached" />
		</figure>

		<div class="content">
			<h3 class="header">{cardTitle}</h3>

			<div class="u-spacer" aria-hidden="true"></div>

			<dl class="card-meta">
				<div class="card-meta-item">
					<dt class="u-sr-only">Altersfreigabe</dt>
					<dd
						class="meta certification"
						style={certificationMeta
							? `--certification-icon-color: ${certificationMeta.color === '#ffffff' ? 'transparent' : certificationMeta.color}; --certification-icon-border-color: ${certificationMeta.color === '#ffffff' ? 'var(--color-text-muted, #9b9b9b)' : certificationMeta.color}`
							: `--certification-icon-color: transparent; --certification-icon-border-color: var(--color-text-muted, #9b9b9b)`}
					>
						<span class="certification-content">
							<span class="certification-icon" aria-hidden="true"></span>
							<span class="certification-text">{certificationMeta?.label ?? 'N/A'}</span>
						</span>
					</dd>
				</div>

				<div class="card-meta-item">
					<dt class="u-sr-only">Genre</dt>
					<dd class="meta genres">
						<i class="layer group icon" aria-hidden="true"></i>
						<span>{genreText || 'N/A'}</span>
					</dd>
				</div>

				<div class="card-meta-item">
					<dt class="u-sr-only">Erscheinungsdatum</dt>
					<dd class="meta date">
						<i class="calendar icon" aria-hidden="true"></i>
						{#if date}
							<time datetime={date}>{cardDate}</time>
						{:else}
							<span>N/A</span>
						{/if}
					</dd>
				</div>
			</dl>
		</div>

		<footer class="extra content">
			<span>
				<i class="yellow star icon" aria-hidden="true"></i>
				<span class="u-sr-only">Bewertung:</span> <span class="rating-value">{cardRating}</span> von 10
			</span>
		</footer>
	</a>
{/if}

<style lang="scss">
	.default-card figure.image {
		margin: 0;
	}

	a.default-card[id] {
		scroll-padding-top: calc(var(--header-height) + 2rem);
	}
</style>
