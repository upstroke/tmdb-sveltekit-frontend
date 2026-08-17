<!-- src/routes/movies/[id]/+page.svelte -->

<script>
	import { deduplicateById } from '$lib/utils/deduplicateById';

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

	let backdrop = $derived(movie?.imageUrl ?? '');
	let posterUrl = $derived(movie?.posterUrl ?? '');
	let title = $derived(movie?.title ?? '');
	let rating = $derived(movie?.rating ?? '');
	let mediaType = $derived(movie?.mediaType ?? 'movie');
	let genres = $derived(deduplicateById(movie?.genres ?? []));
	let overview = $derived(movie?.overview ?? '');
	let homepage = $derived(movie?.homepage ?? '');
	let trailerUrl = $derived(movie?.trailerUrl ?? '');
	let releaseDate = $derived(movie?.releaseDate ?? '');
	let productionCompanies = $derived(deduplicateById(movie?.productionCompanies ?? []));
	let runtime = $derived(movie?.runtime ?? null);
	let cast = $derived(deduplicateById(movie?.cast ?? []));
	let crew = $derived(deduplicateById(movie?.crew ?? []));
</script>

<svelte:head>
	<title>
		{title ? `${title} — Details` : 'Film Details'}
	</title>
</svelte:head>

{#if error}
	<main class="ui text container details-view">
		<div class="ui negative message">
			<div class="header">Fehler beim Laden</div>
			<p>{error}</p>
		</div>
	</main>
{:else if movie}
	<div class="ui inverted vertical center aligned masthead segment">
		{#if backdrop}
			<div class="masthead-image">
				<img src={backdrop} alt={title} />
			</div>
		{/if}

		<div class="ui text container">
			<h1 class="ui inverted header">
				{title}

				{#if posterUrl}
					<div class="poster">
						<img src={posterUrl} alt={`${title} Poster`} />
					</div>
				{/if}
			</h1>

			{#if productionCompanies.length}
				<ul class="ui inverted">
					{#each productionCompanies as company (`movie-header-company-${company.id ?? company.name}`)}
						<li class="item">
							{company.name}
						</li>
					{/each}
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
				{rating}
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
		{/if}

		<div class="segment">
			<h2 class="ui medium header">Handlung:</h2>

			<p class="overview">
				{overview}
			</p>

			{#if homepage}
				<h2 class="ui medium header">Homepage:</h2>

				<p>
					<a class="home-link" href={homepage} target="_blank" rel="noopener noreferrer">
						{homepage}
					</a>
				</p>
			{/if}

			{#if trailerUrl}
				<h2 class="ui medium header">Trailer:</h2>

				<p>
					<a class="ui red button" href={trailerUrl} target="_blank" rel="noopener noreferrer">
						<i class="youtube icon"></i>
						Trailer ansehen
					</a>
				</p>
			{/if}

			{#if releaseDate}
				<h2 class="ui medium header">Erstausstrahlung:</h2>

				<p>{releaseDate}</p>
			{/if}

			{#if productionCompanies.length}
				<h2 class="ui medium header">Produktion:</h2>

				<ul>
					{#each productionCompanies as company (`movie-production-company-${company.id ?? company.name}`)}
						<li>{company.name}</li>
					{/each}
				</ul>
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
											{person.name}
										</div>

										{#if person.character}
											<div class="description">
												{person.character}
											</div>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<p>Keine Cast-Daten vorhanden.</p>
					{/if}
				</div>

				<div class="summary">
					<div class="hidden spacer"></div>
					<h2 class="ui medium dividing header">Crew</h2>

					{#if crew.length}
						<div class="ui relaxed divided list">
							{#each crew as person (`movie-crew-${person.creditId ?? person.id}`)}
								<div class="item">
									<div class="content">
										<div class="header">
											{person.name}
										</div>

										{#if person.job}
											<div class="description">
												{person.job}
											</div>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<p>Keine Crew-Daten vorhanden.</p>
					{/if}
				</div>
			</div>
		</section>
	</main>
{:else}
	<main class="ui text container details-view">
		<p>Film konnte nicht geladen werden.</p>
	</main>
{/if}
