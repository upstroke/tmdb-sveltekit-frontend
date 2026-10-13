<script>
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import MediaTypeLabel from '$lib/components/MediaTypeLabel.svelte';
	import notAvailable from '$lib/assets/not-available.png';
	import { DEFAULT_LOCALE } from '$lib/i18n/config';
	import { i18n } from '$lib/stores/i18n';
	import { getCertificationMeta } from '$lib/utils/certificationMeta';
	import { formatDate } from '$lib/utils/formatDate';

	/**
	 * Renders a default card for movies and TV shows, including image,
	 * metadata, details link, and loading state.
	 *
	 * @component
	 * @prop {number|string} id - Unique TMDB ID of the media item.
	 * @prop {'movie'|'tv'} mediaType - Media type and target route of the card.
	 * @prop {string} title - Title of the movie or TV show.
	 * @prop {string} [date=''] - Release or air date.
	 * @prop {number} [rating=0] - Rating; positive values are shown with one decimal place.
	 * @prop {string|number} [certification=''] - Age rating, e.g. FSK or US rating.
	 * @prop {Array<{name: string}>} [genres=[]] - Genres, displayed joined by slashes.
	 * @prop {string} [imageUrl=''] - Poster URL; a placeholder is used if empty.
	 * @prop {string} [scrollId=''] - Optional HTML id for the card.
	 * @prop {boolean} [isLoading=false] - Shows the loading state of the card.
	 *
	 * @example
	 * <CardDefault id={123} mediaType="movie" title="Inception" />
	 */

	const { labels, formats, fallbacks } = $derived($i18n);
	let activeRegion = $derived(
		(page.url.searchParams.get('locale') ?? DEFAULT_LOCALE).split('-')[1] ?? 'US'
	);

	/** @type {import('../types/components.js').CardDefaultProps} */
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
	let hasValidCard = $derived(Boolean(id) && Boolean(normalizedType));
	let detailsHref = $derived.by(() => {
		if (!hasValidCard) {
			return undefined;
		}

		let href;
		if (normalizedType === 'movie') {
			href = resolve('/movies/[id]', { id: String(id) });
		} else {
			href = resolve('/tv-shows/[id]', { id: String(id) });
		}

		const url = new URL(href, page.url.origin);
		url.searchParams.set('locale', page.url.searchParams.get('locale') ?? DEFAULT_LOCALE);
		return `${url.pathname}${url.search}${url.hash}`;
	});

	let genreText = $derived((genres ?? []).map((genre) => genre.name).join(' / '));
	let notAvailableText = $derived(fallbacks.notAvailable);
	let cardImageUrl = $derived(imageUrl || notAvailable);
	let cardTitle = $derived(title?.trim() || notAvailableText);
	let cardDate = $derived(
		date?.trim() ? formatDate(date, page.url.searchParams.get('locale') ?? DEFAULT_LOCALE) : ''
	);
	let cardRating = $derived(typeof rating === 'number' && rating > 0 ? rating.toFixed(1) : null);
	let certificationMeta = $derived(getCertificationMeta(certification, activeRegion));
	let hasGenres = $derived(Boolean(genreText));
	let imageLoaded = $state(false);
	let imageErrored = $state(false);
	let imageKey = $derived(cardImageUrl);

	/**
	 * Resets the image state whenever the current image source changes.
	 *
	 * This allows loading and error states to be cleanly rebuilt for a new poster.
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
							const img = /** @type {HTMLImageElement} */ (event.currentTarget);
							if (img.complete && img.naturalWidth > 0) {
								requestAnimationFrame(() => {
									imageLoaded = true;
								});
							} else {
								imageLoaded = true;
							}
						}}
						onerror={(event) => {
							const img = /** @type {HTMLImageElement} */ (event.currentTarget);
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
							? `--certification-icon-color: ${certificationMeta.color === '#ffffff' ? 'transparent' : certificationMeta.color}; --certification-icon-border-color: ${certificationMeta.color === '#ffffff' ? '#999' : certificationMeta.color}`
							: `--certification-icon-color: #dedede; --certification-icon-border-color: #dedede`}
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
