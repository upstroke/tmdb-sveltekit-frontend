<script>
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import MediaTypeLabel from '$lib/components/MediaTypeLabel.svelte';
	import notAvailable from '$lib/assets/not-available.png';
	import { i18n } from '$lib/stores/i18n';
	import { getCertificationMeta } from '$lib/utils/certificationMeta';

	const { labels, formats, fallbacks } = $derived($i18n);

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

	let detailsHref = $derived.by(() => {
		let href;

		if (normalizedType === 'movie') {
			href = resolve('/movies/[id]', { id: String(id) });
		} else if (normalizedType === 'tv') {
			href = resolve('/tv-shows/[id]', { id: String(id) });
		} else {
			return undefined;
		}

		const url = new URL(href, page.url.origin);
		url.searchParams.set('locale', page.url.searchParams.get('locale') ?? 'de-DE');
		return `${url.pathname}${url.search}${url.hash}`;
	});

	let genreText = $derived((genres ?? []).map((genre) => genre.name).join(' / '));
	let notAvailableText = $derived(fallbacks.notAvailable);
	let cardImageUrl = $derived(imageUrl || notAvailable);
	let cardTitle = $derived(title?.trim() || notAvailableText);
	let cardDate = $derived(date?.trim() || '');
	let cardRating = $derived(
		typeof rating === 'number' && rating > 0 ? rating.toFixed(1) : notAvailableText
	);
	let certificationMeta = $derived(getCertificationMeta(certification));
	let hasGenres = $derived(Boolean(genreText));
</script>

{#if detailsHref}
	<a id={scrollId || undefined} class="ui card default-card" href={detailsHref}>
		<figure class="image">
			<img src={cardImageUrl} alt={`Poster von ${cardTitle}`} />

			<MediaTypeLabel mediaType={normalizedType} class="top right attached" />
		</figure>

		<div class="content">
			<h3 class="header {cardTitle ? '' : 'u-not-available'}">{cardTitle}</h3>

			<div class="u-spacer" aria-hidden="true"></div>

			<dl class="card-meta">
				<div class="card-meta-item">
					<dt class="u-sr-only">{labels.certification}</dt>
					<dd
						class="meta certification"
						style={certificationMeta
							? `--certification-icon-color: ${certificationMeta.color === '#ffffff' ? 'transparent' : certificationMeta.color}; --certification-icon-border-color: ${certificationMeta.color === '#ffffff' ? 'var(--color-text-muted, #9b9b9b)' : certificationMeta.color}`
							: `--certification-icon-color: transparent; --certification-icon-border-color: var(--color-text-muted, #9b9b9b)`}
					>
						<span class="certification-content">
							<span class="certification-icon" aria-hidden="true"></span>
							<span class="certification-text {certificationMeta?.label ? '' : 'u-not-available'}"
								>{certificationMeta?.label ?? notAvailableText}</span
							>
						</span>
					</dd>
				</div>

				<div class="card-meta-item">
					<dt class="u-sr-only">{labels.genre}</dt>
					<dd class="meta genres">
						<i class="layer group icon" aria-hidden="true"></i>
						<span class={hasGenres ? '' : 'u-not-available'}
							>{hasGenres ? genreText : notAvailableText}</span
						>
					</dd>
				</div>

				<div class="card-meta-item">
					<dt class="u-sr-only">{labels.releaseDate}</dt>
					<dd class="meta date">
						<i class="calendar icon" aria-hidden="true"></i>
						{#if date}
							<time class={cardDate ? '' : 'u-not-available'} datetime={date}>{cardDate}</time>
						{:else}
							<span class="u-not-available">{notAvailableText}</span>
						{/if}
					</dd>
				</div>
			</dl>
		</div>

		<footer class="extra content">
			<span>
				<i class="yellow star icon" aria-hidden="true"></i>
				<span class="u-sr-only">{labels.rating}</span>
				<span class="rating-value {cardRating ? '' : 'u-not-available'}">{cardRating}</span>
				<span class={formats.outOfTen ? '' : 'u-not-available'}>{formats.outOfTen}</span>
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
