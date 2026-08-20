<script>
	import { deduplicateById } from '$lib/utils/deduplicateById';
	import DialogMessage from '$lib/components/DialogMessage.svelte';
	import DetailsHero from '$lib/components/DetailsHero.svelte';
	import MediaTypeLabel from '$lib/components/MediaTypeLabel.svelte';
	import notAvailable from '$lib/assets/not-available.png';

	/**
	 * Erwartete Props für die Detailseite.
	 *
	 * @param {{
	 *   movie?: {
	 *     imageUrl?: string,
	 *     posterUrl?: string,
	 *     title?: string,
	 *     rating?: number|string,
	 *     mediaType?: 'movie'|'tv'|string,
	 *     genres?: Array<{id: number|string, name: string}>,
	 *     overview?: string,
	 *     homepage?: string,
	 *     trailerUrl?: string,
	 *     releaseDate?: string,
	 *     productionCompanies?: Array<{id: number|string, name: string}>,
	 *     runtime?: number|null,
	 *     cast?: Array<{creditId?: number|string, id?: number|string, name: string, character?: string}>,
	 *     crew?: Array<{creditId?: number|string, id?: number|string, name: string, job?: string}>
	 *   } | null,
	 *   error?: string | null
	 * }} data - Geladene Film-Daten.
	 */
	let { data } = $props();

	let movie = $derived(data.movie ?? null);
	let error = $derived(data.error ?? null);

	let backdrop = $derived(movie?.imageUrl || notAvailable);
	let posterUrl = $derived(movie?.posterUrl || notAvailable);
	let title = $derived(movie?.title?.trim() || 'N/A');
	let rating = $derived(movie?.rating ?? null);
	let mediaType = $derived(movie?.mediaType ?? 'movie');
	let genres = $derived(deduplicateById(movie?.genres ?? []));
	let overview = $derived(movie?.overview ?? '');
	let homepage = $derived(movie?.homepage ?? '');
	let trailerUrl = $derived(movie?.trailerUrl ?? '');
	let releaseDate = $derived(movie?.releaseDate ?? '');
	let productionCompanies = $derived(deduplicateById(movie?.productionCompanies ?? []));
	let runtime = $derived(movie?.runtime ?? null);
	let cast = $derived(deduplicateById(movie?.cast ?? []));
</script>

<svelte:head>
	<title>
		{title !== 'N/A' ? `${title} — Details` : 'Film Details'}
	</title>
</svelte:head>

{#if error}
	<DialogMessage message={error} />

{:else if movie}
	<DetailsHero
		title={title}
		backdrop={backdrop}
		posterUrl={posterUrl}
		productionCompanies={productionCompanies}
		emptyLabel="N/A"
	/>

	<main class="ui text container details-view">
		<header class="details-header">
			<dl class="details-meta movie-meta">
				<div>
					<dt class="u-sr-only">Medientyp</dt>
					<dd><MediaTypeLabel mediaType={mediaType} /></dd>
				</div>
				<div>
					<dt class="u-sr-only">Bewertung</dt>
					<dd>
						<span class="ui label">
							<i class="yellow star icon" aria-hidden="true"></i>
							{#if rating !== null && rating !== undefined}
								<b class="rating-value">{rating}</b> von 10
							{:else}
								Nicht verfügbar
							{/if}
						</span>
					</dd>
				</div>
			</dl>

			<section aria-labelledby="genres-heading">
				<h2 id="genres-heading" class="sr-only">Genres</h2>
				{#if genres.length}
					<ul class="ui celled horizontal list genres">
						{#each genres as genre (`movie-genre-${genre.id ?? genre.name}`)}
							<li class="item">{genre.name}</li>
						{/each}
					</ul>
				{:else}
					<p class="genres-empty">Keine Genres verfügbar.</p>
				{/if}
			</section>
		</header>

		<section class="segment" aria-labelledby="details-heading">
			<h2 id="details-heading" class="sr-only">Weitere Informationen</h2>

			<section aria-labelledby="overview-heading">
			<h2 id="overview-heading" class="ui medium header">Handlung</h2>

			<p class="overview">
				{overview || 'N/A'}
			</p>
		</section>

			<section aria-labelledby="homepage-heading">
			<h2 id="homepage-heading" class="ui medium header">Homepage</h2>
			<p>
				{#if homepage}
					<a class="home-link" href={homepage} target="_blank" rel="noopener noreferrer">
						{homepage}
					</a>
				{:else}
					N/A
				{/if}
			</p>
		</section>

			<section aria-labelledby="trailer-heading">
			<h2 id="trailer-heading" class="ui medium header">Trailer</h2>
			<p>
				{#if trailerUrl}
					<a class="ui red button" href={trailerUrl} target="_blank" rel="noopener noreferrer">
						<i class="youtube icon" aria-hidden="true"></i>
						Trailer ansehen
					</a>
				{:else}
					N/A
				{/if}
			</p>
		</section>

			<section aria-labelledby="release-heading">
			<h2 id="release-heading" class="ui medium header">Erstausstrahlung</h2>
			<p><time datetime={releaseDate || undefined}>{releaseDate || 'N/A'}</time></p>
		</section>

			<section aria-labelledby="production-heading">
			<h2 id="production-heading" class="ui medium header">Produktion</h2>
			{#if productionCompanies.length}
				<ul class="production-list">
					{#each productionCompanies as company (`movie-production-company-${company.id ?? company.name}`)}
						<li>{company.name}</li>
					{/each}
				</ul>
			{:else}
				<p>N/A</p>
			{/if}
		</section>

			{#if runtime}

				<section aria-labelledby="runtime-heading">
					<h2 id="runtime-heading" class="ui medium header">Laufzeit</h2>

					<p class="small">
						<span>{runtime} Minuten</span>
					</p>
				</section>
			{/if}
		</section>

		<div class="u-spacer"></div>

		<section aria-labelledby="cast-heading">
			<header>
				<h2 id="cast-heading" class="ui medium dividing header">Cast</h2>
			</header>

			{#if cast.length}
				<ul class="ui relaxed divided list">
					{#each cast as person (`movie-cast-${person.creditId ?? person.id}`)}
						<li class="item">
							<article>
								<dl>
									<div>
										<dt class="u-sr-only">Darsteller</dt>
										<dd class="header"><strong>{person.name || 'N/A'}</strong></dd>
									</div>

									<div>
										<dt class="u-sr-only">Rolle</dt>
										<dd class="description">
											{person.character || 'Keine Rollenangabe verfügbar.'}
										</dd>
									</div>
								</dl>
							</article>
						</li>
					{/each}
				</ul>
			{:else}
				<p>Keine Cast-Daten verfügbar.</p>
			{/if}
		</section>
	</main>
{/if}
