<script>
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import notAvailable from '$lib/assets/not-available.png';
	import { i18n } from '$lib/stores/i18n';

	const { labels, fallbacks } = $derived($i18n);

	/**
	 * Erwartete Props für die Featured-Karte.
	 *
	 * Die Karte verwendet das Vorschaubild als Hintergrund und legt Poster,
	 * Informationen und Aktionen in einem kontrastreichen Overlay am unteren
	 * Rand ab. Poster und Inhalte stehen auf allen Bildschirmgrößen
	 * nebeneinander; auf kleinen Bildschirmen wird das Poster kompakter dargestellt
	 * und beginnt linksbündig im Root-Container. Das Overlay verwendet dabei
	 * einen einheitlichen Abstand von `1.5rem` auf allen Seiten. Der Medientyp
	 * wird als kompaktes farbiges Badge dargestellt: Filme blau, Serien türkis.
	 *
	 * @param {number|string} id - ID des Mediums.
	 * @param {'movie'|'tv'|string} mediaType - Medientyp der Karte.
	 * @param {string} title - Titel des Mediums.
	 * @param {string} [releaseDate=''] - Veröffentlichungsdatum oder Startdatum.
	 * @param {string} [overview=''] - Kurzbeschreibung des Mediums.
	 * @param {string} [homepage=''] - {labels.officialWebsite} des Mediums.
	 * @param {Array<{id: number|string, name: string}>} [genres=[]] - Liste der Genres.
	 * @param {string} [imageUrl=''] - URL des Vorschaubilds.
	 * @param {string} [posterUrl=''] - Optionale URL des Posterbilds; fällt auf `imageUrl` zurück.
	 */
	let {
		id,
		mediaType,
		title,
		releaseDate = '',
		overview = '',
		homepage = '',
		genres = [],
		imageUrl = '',
		posterUrl = ''
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

	let notAvailableText = $derived(fallbacks.notAvailable);
	let featuredType = $derived(
		normalizedType === 'movie' ? 'movie' : normalizedType === 'tv' ? 'tv' : notAvailableText
	);
	let featuredGenres = $derived(genres?.length ? genres : []);
	let featuredImageUrl = $derived(imageUrl || notAvailable);
	let featuredPosterUrl = $derived(posterUrl || imageUrl || notAvailable);
	let featuredTitle = $derived(title?.trim() || notAvailableText);
	let featuredReleaseDate = $derived(releaseDate?.trim() || '');
	let hasReleaseDate = $derived(Boolean(featuredReleaseDate));
	let featuredOverview = $derived(overview?.trim() || notAvailableText);
	let featuredHomepage = $derived(homepage?.trim() || '');
</script>

<article
	aria-labelledby="featured-card-title"
	class="ui fluid card basic featured-card"
	style={`--featured-card-image: url('${featuredImageUrl}')`}
>
	<div class="featured-card-overlay">
		<div class="featured-card-layout">
			<figure class="featured-card-poster">
				<img alt={`${featuredTitle} Poster`} src={featuredPosterUrl} />
			</figure>

			<div class="featured-card-content">
				<p class={`featured-card-type featured-card-type--${normalizedType ?? 'unknown'}`}>
					{featuredType}
				</p>

				{#if featuredGenres.length || hasReleaseDate}
					<dl class="featured-card-meta">
						{#if featuredGenres.length}
							<div class="featured-card-meta-item">
								<dt class="u-sr-only">Genre</dt>
								<dd class="featured-card-genres">
									<i class="layer group icon" aria-hidden="true"></i>
									<ul>
										{#each featuredGenres as genre, index (`featured-genre-${genre.id ?? genre.name}`)}
											<li>
												{#if index > 0}
													<span class="featured-card-genre-separator" aria-hidden="true">/</span>
												{/if}
												<span>{genre.name}</span>
											</li>
										{/each}
									</ul>
								</dd>
							</div>
						{/if}

						{#if hasReleaseDate}
							<div class="featured-card-meta-item">
								<dt class="u-sr-only">Erscheinungsdatum</dt>
								<dd class="featured-card-date">
									<i class="calendar icon" aria-hidden="true"></i>
									<span>{featuredReleaseDate}</span>
								</dd>
							</div>
						{/if}
					</dl>
				{/if}

				<h2 class="featured-card-title" id="featured-card-title">{featuredTitle}</h2>

				<p class="featured-card-description">{featuredOverview}</p>

				<nav aria-label={`Aktionen für ${featuredTitle}`} class="featured-card-actions">
					{#if detailsHref}
						<a class="ui inverted primary button" href={detailsHref}>{labels.moreInfo}</a>
					{/if}

					{#if featuredHomepage}
						<a
							class="ui inverted button"
							href={featuredHomepage}
							target="_blank"
							rel="noopener noreferrer"
						>
							{labels.officialWebsite}
						</a>
					{/if}
				</nav>
			</div>
		</div>
	</div>
</article>

<style lang="scss">
	.ui.featured-card {
		position: relative;
		display: flex;
		align-items: stretch;
		min-height: clamp(28rem, 42vw, 42rem);
		margin-bottom: 5rem;
		overflow: hidden;
		background-color: #000;
		background-image:
			linear-gradient(
				to top,
				rgba(0, 0, 0, 0.92) 0%,
				rgba(0, 0, 0, 0.7) 42%,
				rgba(0, 0, 0, 0.35) 100%
			),
			var(--featured-card-image);
		background-position: center;
		background-repeat: no-repeat;
		background-size: cover;
		color: #fff;
		text-shadow: 0 2px 2px rgba(0, 0, 0, 0.6);
	}

	.featured-card-overlay {
		display: flex;
		align-items: flex-end;
		width: 100%;
		min-height: inherit;
		padding: 1.5rem;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.1));
	}

	.featured-card-layout {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		gap: 0.5rem;
		width: 100%;
		max-width: 60rem;
		margin: 0 0.5rem 0 0;
	}

	.featured-card-poster {
		flex: 0 0 auto;
		width: clamp(4rem, 12.5vw, 6rem);
		margin: 0 0.5rem 0 0;
		align-self: start;

		img {
			display: block;
			width: 100%;
			height: auto;
			border: 2px solid #fff;
			box-shadow: 1px 0 5px 2px rgba(0, 0, 0, 0.4);
		}
	}

	.featured-card-content {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.75rem;
		width: 100%;
	}

	.featured-card-type,
	.featured-card-genres,
	.featured-card-title,
	.featured-card-date,
	.featured-card-description {
		margin: 0;
		color: #fff;
	}

	.featured-card-type {
		display: inline-block;
		align-self: flex-start;
		padding: 0.2rem 0.25rem;
		border-radius: 0;
		font-size: 0.85rem;
		font-weight: bold;
		text-transform: none;
		line-height: 1;
	}

	.featured-card-type--movie {
		background-color: #2185d0;
	}

	.featured-card-type--tv {
		background-color: #00b5ad;
	}

	.featured-card-genres {
		font-size: 0.95rem;
		font-weight: normal;
		text-transform: none;

		ul {
			display: inline-flex;
			flex-wrap: wrap;
			list-style: none;
			margin: 0;
			padding: 0;
		}

		li {
			display: inline-flex;
			align-items: center;
		}
	}

	.featured-card-genre-separator {
		display: inline-block;
		margin-inline: 0.35rem;
	}

	.featured-card-title {
		font-size: clamp(1.75rem, 4vw, 3rem);
		line-height: 1.1;
	}

	.featured-card-date {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.featured-card-description {
		max-width: 65ch;
		line-height: 1.5;
		margin-bottom: 1rem;
	}

	.featured-card-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	@media (min-width: 768px) {
		.featured-card-overlay {
			padding: 1.5rem;
		}

		.featured-card-layout {
			flex-direction: row;
			align-items: flex-end;
			max-width: 85%;
		}

		.featured-card-poster {
			width: clamp(10rem, 18vw, 14rem);
		}

		.featured-card-content {
			flex: 1 1 auto;
		}
	}

	@media (min-width: 992px) {
		.featured-card-layout {
			max-width: 70%;
		}
	}
</style>
