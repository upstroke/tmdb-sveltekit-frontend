<script>
	import { deduplicateById } from '$lib/utils/deduplicateById';
	import DialogMessage from '$lib/components/DialogMessage.svelte';
	import DetailsHero from '$lib/components/DetailsHero.svelte';
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
		titlePrefix="Poster"
		emptyLabel="N/A"
	/>

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

<style lang="scss">
	main.ui.text.container.details-view {
		width: unset !important;
		max-width: 95% !important;
		margin-left: auto;
		margin-right: auto;

		@media (min-width: 768px) {
			max-width: 80% !important;
		}

		@media (min-width: 992px) {
			max-width: 75% !important;
		}
	}

	.ui.masthead.segment {
		padding: 0;
		margin-top: 39px;
		margin-bottom: -39px;
		position: relative;
		text-shadow: 0 2px 2px rgba(0, 0, 0, 0.6);
		font-size: 3.5em;
		font-weight: normal;
		line-height: 1;

		.masthead-image {
			img {
				min-width: 100%;
				height: 100%;
				max-height: 1000px;
				object-fit: cover;
				opacity: 0.5;
				max-width: 100vw;
			}
		}

		.poster {
			width: 100%;
			position: absolute;
			bottom: 130%;
			right: 0;
			left: 0;

			> img {
				width: 15vw;
				min-width: 160px;
				box-shadow: 1px 0 5px 2px rgba(0, 0, 0, 0.4);
				border: 2px solid white;
			}
		}

		.ui.text.container {
			position: absolute;
			bottom: 5%;
			left: 0;
			right: 0;
			width: 100vw;
		}

		ul.ui.inverted {
			list-style: none;
			margin: 20px 0 0;
			font-size: 80%;

			> li {
				display: inline-block;
				margin-right: 1rem;
			}

			> li.item::before {
				padding-right: 1rem;
				content: '•';
				color: white;
			}

			> li:first-child::before {
				display: none;
			}
		}
	}
</style>
