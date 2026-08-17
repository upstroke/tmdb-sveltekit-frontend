<script>
	import { deduplicateById } from '$lib/utils/deduplicateById';
	import DialogMessage from '$lib/components/DialogMessage.svelte';
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
	<div class="ui inverted vertical center aligned masthead segment">
		<div class="masthead-image">
			<img src={backdrop} alt={title} />
		</div>

		<div class="ui text container">
			<div class="poster">
				<img src={posterUrl} alt={`${title} Poster`} />
			</div>

			<h1 class="ui inverted header">
				{title}
			</h1>

			{#if productionCompanies.length}
				<ul class="ui inverted">
					{#each productionCompanies as company (`movie-header-company-${company.id ?? company.name}`)}
						<li class="item">
							{company.name}
						</li>
					{/each}
				</ul>
			{:else}
				<ul class="ui inverted">
					<li class="item">N/A</li>
				</ul>
			{/if}
		</div>
	</div>

	<main class="ui text container details-view">
		<p class="ui top left attached">
			<span class="ui label blue">
				{mediaType}
			</span>

			<span class="ui label">
				<i class="yellow star icon"></i>
				{rating !== null && rating !== undefined ? rating : 'N/A'}
			</span>
		</p>

		{#if genres.length}
			<p class="ui celled horizontal list genres">
				{#each genres as genre (`movie-genre-${genre.id ?? genre.name}`)}
					<span class="item">
						{genre.name}
					</span>
				{/each}
			</p>
		{:else}
			<p class="ui celled horizontal list genres">
				<span class="item">N/A</span>
			</p>
		{/if}

		<div class="segment">
			<h2 class="ui medium header">Handlung:</h2>

			<p class="overview">
				{overview || 'N/A'}
			</p>

			<h2 class="ui medium header">Homepage:</h2>
			<p>
				{#if homepage}
					<a class="home-link" href={homepage} target="_blank" rel="noopener noreferrer">
						{homepage}
					</a>
				{:else}
					N/A
				{/if}
			</p>

			<h2 class="ui medium header">Trailer:</h2>
			<p>
				{#if trailerUrl}
					<a class="ui red button" href={trailerUrl} target="_blank" rel="noopener noreferrer">
						<i class="youtube icon"></i>
						Trailer ansehen
					</a>
				{:else}
					N/A
				{/if}
			</p>

			<h2 class="ui medium header">Erstausstrahlung:</h2>
			<p>{releaseDate || 'N/A'}</p>

			<h2 class="ui medium header">Produktion:</h2>
			{#if productionCompanies.length}
				<ul>
					{#each productionCompanies as company (`movie-production-company-${company.id ?? company.name}`)}
						<li>{company.name}</li>
					{/each}
				</ul>
			{:else}
				<p>N/A</p>
			{/if}

			{#if runtime}
				<div class="hidden spacer"></div>

				<section>
					<h2 class="ui medium header">Laufzeit:</h2>

					<p class="small">
						<span>
							{runtime} Minuten
						</span>
					</p>
				</section>
			{/if}
		</div>

		<div class="hidden spacer"></div>
		<div class="hidden spacer"></div>

		<section>
			<div class="content">
				<div class="summary">
					<h2 class="ui medium dividing header">Cast</h2>

					{#if cast.length}
						<div class="ui relaxed divided list">
							{#each cast as person (`movie-cast-${person.creditId ?? person.id}`)}
								<div class="item">
									<div class="content">
										<div class="header">
											{person.name || 'N/A'}
										</div>

										{#if person.character}
											<div class="description">
												{person.character}
											</div>
										{:else}
											<div class="description">N/A</div>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<p>N/A</p>
					{/if}
				</div>
			</div>
		</section>
	</main>
{/if}
