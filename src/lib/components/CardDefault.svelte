<script>
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import MediaTypeLabel from '$lib/components/MediaTypeLabel.svelte';
	import notAvailable from '$lib/assets/not-available.png';
	import { i18n } from '$lib/stores/i18n';
	import { getCertificationMeta } from '$lib/utils/certificationMeta';
	import { formatDate } from '$lib/utils/formatDate';

	/**
	 * Rendert eine Standardkarte für Filme und TV-Serien inklusive Bild,
	 * Metadaten, Detail-Link und Ladezustand.
	 *
	 * @component
	 * @prop {number|string} id - Eindeutige TMDB-ID des Mediums.
	 * @prop {'movie'|'tv'} mediaType - Medientyp und Zielroute der Karte.
	 * @prop {string} title - Titel des Films oder der Serie.
	 * @prop {string} [date=''] - Veröffentlichungs- oder Ausstrahlungsdatum.
	 * @prop {number} [rating=0] - Bewertung; positive Werte werden mit einer Dezimalstelle angezeigt.
	 * @prop {string|number} [certification=''] - Altersfreigabe, z. B. FSK- oder US-Rating.
	 * @prop {Array<{name: string}>} [genres=[]] - Genres, die mit Schrägstrich verbunden angezeigt werden.
	 * @prop {string} [imageUrl=''] - URL des Posters; bei leerem Wert wird ein Platzhalter verwendet.
	 * @prop {string} [scrollId=''] - Optionale HTML-ID für die Karte.
	 * @prop {boolean} [isLoading=false] - Zeigt den Ladezustand der Karte an.
	 *
	 * @example
	 * <CardDefault id={123} mediaType="movie" title="Inception" />
	 */

	const { labels, formats, fallbacks } = $derived($i18n);
	let activeRegion = $derived(
		(page.url.searchParams.get('locale') ?? 'de-DE').split('-')[1] ?? 'DE'
	);

	let {
		id,
		mediaType,
		title,
		date = '',
		rating = 0,
		certification = '',
		genres = [],
		imageUrl = '',
		scrollId = '',
		isLoading = false
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
	let cardDate = $derived(
		date?.trim() ? formatDate(date, page.url.searchParams.get('locale') ?? 'de-DE') : ''
	);
	let cardRating = $derived(typeof rating === 'number' && rating > 0 ? rating.toFixed(1) : null);
	let certificationMeta = $derived(getCertificationMeta(certification, activeRegion));
	let hasGenres = $derived(Boolean(genreText));
	let imageLoaded = $state(false);
	let imageErrored = $state(false);
	let imageKey = $derived(cardImageUrl);

	/**
	 * Setzt den Bildstatus zurück, sobald sich die aktuelle Bildquelle ändert.
	 *
	 * Dadurch können Lade- und Fehlerzustand für ein neues Poster sauber neu
	 * aufgebaut werden.
	 *
	 * @returns {void}
	 */
	$effect(() => {
		imageKey;
		imageLoaded = false;
		imageErrored = false;
	});
</script>

{#if detailsHref}
	<a
		id={scrollId || undefined}
		class="ui card default-card {isLoading ? 'is-loading' : ''} {imageLoaded
			? 'image-loaded'
			: ''} {imageErrored ? 'image-error' : ''}"
		href={detailsHref}
	>
		<figure class="image">
			<div
				class="image-stage {(!imageLoaded || isLoading) && !imageErrored
					? 'is-loading'
					: ''} {imageLoaded && !imageErrored ? 'is-ready' : ''}"
				style="--image-delay: var(--stagger-delay, 0ms)"
			>
				{#if !imageErrored}
					<img
						src={cardImageUrl}
						alt={`Poster von ${cardTitle}`}
						onload={(event) => {
							const img = event.currentTarget;
							if (img.complete && img.naturalWidth > 0) {
								requestAnimationFrame(() => {
									imageLoaded = true;
								});
							} else {
								imageLoaded = true;
							}
						}}
						onerror={(event) => {
							const img = event.currentTarget;
							img.style.display = 'none';
							imageErrored = true;
							imageLoaded = false;
						}}
					/>
				{/if}
			</div>

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
				{#if cardRating !== null}
					<b class="rating-value">{cardRating}</b>
					<span class={formats.outOfTen ? '' : 'u-not-available'}>{formats.outOfTen}</span>
				{:else}
					<span class="u-not-available">{notAvailableText}</span>
				{/if}
			</span>
		</footer>
	</a>
{/if}

<style lang="scss">
	@use '../../css/mixins' as mixins;

	@keyframes shimmer {
		0% {
			transform: translateX(-120%);
		}

		100% {
			transform: translateX(120%);
		}
	}

	.default-card {
		position: relative;
		overflow: hidden;
		transition:
			transform 180ms ease,
			box-shadow 180ms ease;

		&:hover {
			transform: translateY(-2px);
		}

		.image-stage {
			position: relative;
			display: block;
			aspect-ratio: 2 / 3;
			overflow: hidden;
			background: linear-gradient(
				90deg,
				color-mix(in oklch, var(--color-surface-offset) 72%, white) 0%,
				color-mix(in oklch, var(--color-surface-offset) 88%, white) 38%,
				color-mix(in oklch, var(--color-surface-dynamic) 72%, white) 50%,
				color-mix(in oklch, var(--color-surface-offset) 88%, white) 62%,
				color-mix(in oklch, var(--color-surface-offset) 72%, white) 100%
			);
			background-size: 220% 100%;

			&::before {
				content: '';
				position: absolute;
				inset: 0;
				background: linear-gradient(
					90deg,
					transparent 0%,
					color-mix(in oklch, white 62%, transparent) 48%,
					transparent 100%
				);
				animation: shimmer 1.5s ease-in-out infinite;
				animation-delay: var(--image-delay, 0ms);
				pointer-events: none;
			}

			img {
				display: block;
				width: 100%;
				height: 100%;
				object-fit: cover;
				opacity: 0;
				transition: opacity 180ms ease;
			}

			&.is-ready {
				background: none;

				&::before {
					display: none;
				}

				img {
					opacity: 1;
				}
			}
		}
	}
</style>
