<!-- src/routes/tv-shows/[id]/+page.svelte -->

<script>
	import { deduplicateById } from '$lib/utils/deduplicateById';

	/**
	 * Erwartete Props für die Detailseite.
	 *
	 * @param {{
	 *   tvShow?: {
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
	 * }} data - Geladene TV-Show-Daten.
	 */
	let { data } = $props();

	let tvShow = $derived(data.tvShow ?? null);
	let error = $derived(data.error ?? null);

	let backdrop = $derived(tvShow?.imageUrl ?? '');
	let posterUrl = $derived(tvShow?.posterUrl ?? '');
	let title = $derived(tvShow?.title ?? '');
	let rating = $derived(tvShow?.rating ?? '');
	let mediaType = $derived(tvShow?.mediaType ?? 'tv');
	let genres = $derived(deduplicateById(tvShow?.genres ?? []));
	let overview = $derived(tvShow?.overview ?? '');
	let homepage = $derived(tvShow?.homepage ?? '');
	let trailerUrl = $derived(tvShow?.trailerUrl ?? '');
	let releaseDate = $derived(tvShow?.releaseDate ?? '');
	let productionCompanies = $derived(deduplicateById(tvShow?.productionCompanies ?? []));
	let runtime = $derived(tvShow?.runtime ?? null);
	let cast = $derived(deduplicateById(tvShow?.cast ?? []));
	let crew = $derived(deduplicateById(tvShow?.crew ?? []));
</script>


<svelte:head>
	<title>
		{title ? `${title} — Details` : 'TV-Show Details'}
	</title>
</svelte:head>

{#if error}
	<main class="ui text container details-view">
		<div class="ui negative message">
			<div class="header">Fehler beim Laden</div>
			<p>{error}</p>
		</div>
	</main>
{:else if tvShow}
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
					{#each productionCompanies as company (`tv-header-company-${company.id ?? company.name}`)}
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
				{#each genres as genre (`tv-genre-${genre.id ?? genre.name}`)}
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
					{#each productionCompanies as company (`tv-production-company-${company.id ?? company.name}`)}
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
							{#each cast as person (`tv-cast-${person.creditId ?? person.id}`)}
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
							{#each crew as person (`tv-crew-${person.creditId ?? person.id}`)}
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
		<p>TV-Show konnte nicht geladen werden.</p>
	</main>
{/if}
