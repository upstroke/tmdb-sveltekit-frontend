<script>
	import { deduplicateById } from '$lib/utils/deduplicateById';
	import { formatHomepageLabel } from '$lib/utils/formatHomepageLabel';
	import DialogMessage from '$lib/components/DialogMessage.svelte';
	import DetailsHero from '$lib/components/DetailsHero.svelte';
	import MediaTypeLabel from '$lib/components/MediaTypeLabel.svelte';
	import notAvailable from '$lib/assets/not-available.png';
	import { i18n } from '$lib/stores/i18n';

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

	const { buttons, fallbacks, formats, labels, messages, titles } = $derived($i18n);

	let movie = $derived(data.movie ?? null);
	let error = $derived(data.error ?? null);

	let backdrop = $derived(movie?.imageUrl || notAvailable);
	let posterUrl = $derived(movie?.posterUrl || movie?.imageUrl || notAvailable);
	let title = $derived(movie?.title?.trim() || fallbacks.notAvailable);
	let rating = $derived(movie?.rating ?? null);
	let mediaType = $derived(movie?.mediaType ?? 'movie');
	let genres = $derived(deduplicateById(movie?.genres ?? []));
	let overview = $derived(movie?.overview ?? '');
	let homepage = $derived(movie?.homepage ?? '');
	let trailerUrl = $derived(movie?.trailerUrl ?? '');
	let releaseDate = $derived(movie?.releaseDate ?? '');
	let productionCompanies = $derived(deduplicateById(movie?.productionCompanies ?? []));
	let runtime = $derived(movie?.runtime ?? null);
	let castMembers = $derived(deduplicateById(movie?.cast ?? []));
	let crew = $derived(deduplicateById(movie?.crew ?? []));
</script>

<svelte:head>
	<title>
		{title !== fallbacks.notAvailable ? `${title} — ${formats.detailsSuffix}` : titles.movieDetails}
	</title>
</svelte:head>

{#if error}
	<DialogMessage message={error} />
{:else if movie}
	<DetailsHero
		{title}
		{backdrop}
		{posterUrl}
		{productionCompanies}
		emptyLabel={fallbacks.notAvailable}
	/>

	<main class="ui text container details-view">
		<header class="details-header">
			<dl class="details-meta">
				<div>
					<dt class="u-sr-only">{labels.mediaType}</dt>
					<dd>
						<MediaTypeLabel {mediaType} />
					</dd>
				</div>
				<div>
					<dt class="u-sr-only">{labels.rating}</dt>
					<dd>
						<span class="ui label">
							<i class="yellow star icon" aria-hidden="true"></i>
							{#if rating !== null && rating !== undefined}
								<b class="rating-value {rating ? '' : 'u-not-available'}">{rating}</b>
								<span class={formats.outOfTen ? '' : 'u-not-available'}>{formats.outOfTen}</span>
							{:else}
								<span class="u-not-available">{fallbacks.notAvailable}</span>
							{/if}
						</span>
					</dd>
				</div>
			</dl>

			<section aria-labelledby="genres-heading">
				<h2 id="genres-heading" class="u-sr-only">{labels.genres}</h2>
				{#if genres.length}
					<ul class="ui celled horizontal list genres">
						{#each genres as genre (`movie-genre-${genre.id ?? genre.name}`)}
							<li class="item {genre.name ? '' : 'u-not-available'}">{genre.name}</li>
						{/each}
					</ul>
				{:else}
					<p class={messages.noGenres ? '' : 'u-not-available'}>{messages.noGenres}</p>
				{/if}
			</section>
		</header>

		<section aria-labelledby="overview-heading">
			<h3 id="overview-heading" class="ui medium header {labels.overview ? '' : 'u-not-available'}">
				{labels.overview}
			</h3>

			<p class="overview {overview ? '' : 'u-not-available'}">
				{overview || fallbacks.notAvailable}
			</p>
		</section>

		<section aria-labelledby="homepage-heading">
			<h3
				id="homepage-heading"
				class="ui medium dividing header {labels.homepage ? '' : 'u-not-available'}"
			>
				{labels.homepage}
			</h3>
			<p>
				{#if homepage}
					<a
						class="home-link {formatHomepageLabel(homepage) ? '' : 'u-not-available'}"
						href={homepage}
						target="_blank"
						rel="noopener noreferrer"
					>
						{formatHomepageLabel(homepage)}
					</a>
				{:else}
					<span class="u-not-available">{fallbacks.notAvailable}</span>
				{/if}
			</p>
		</section>

		<section aria-labelledby="trailer-heading">
			<h3
				id="trailer-heading"
				class="ui medium dividing header {labels.trailer ? '' : 'u-not-available'}"
			>
				{labels.trailer}
			</h3>
			<p>
				{#if trailerUrl}
					<a
						class="ui red button {buttons.watchTrailer ? '' : 'u-not-available'}"
						href={trailerUrl}
						target="_blank"
						rel="noopener noreferrer"
					>
						<i class="youtube icon" aria-hidden="true"></i>
						{buttons.watchTrailer}
					</a>
				{:else}
					<span class="u-not-available">{fallbacks.notAvailable}</span>
				{/if}
			</p>
		</section>

		<section aria-labelledby="release-heading">
			<h3
				id="release-heading"
				class="ui medium dividing header {labels.releaseDate ? '' : 'u-not-available'}"
			>
				{labels.releaseDate}
			</h3>
			<p>
				<time class={releaseDate ? '' : 'u-not-available'} datetime={releaseDate || undefined}
					>{releaseDate || fallbacks.notAvailable}</time
				>
			</p>
		</section>

		<section aria-labelledby="production-heading">
			<h3
				id="production-heading"
				class="ui medium dividing header {labels.productionCompanies ? '' : 'u-not-available'}"
			>
				{labels.productionCompanies}
			</h3>
			{#if productionCompanies.length}
				<ul class="ui list">
					{#each productionCompanies as company (`movie-company-${company.id ?? company.name}`)}
						<li class={company.name ? '' : 'u-not-available'}>{company.name}</li>
					{/each}
				</ul>
			{:else}
				<p class="u-not-available">{fallbacks.notAvailable}</p>
			{/if}
		</section>

		<section aria-labelledby="runtime-heading">
			<h3
				id="runtime-heading"
				class="ui medium dividing header {labels.runtime ? '' : 'u-not-available'}"
			>
				{labels.runtime}
			</h3>
			<p>
				{#if runtime}
					<span class={runtime ? '' : 'u-not-available'}>{runtime}</span>
					<span class={formats.minutes ? '' : 'u-not-available'}>{formats.minutes}</span>
				{:else}
					<span class="u-not-available">{fallbacks.notAvailable}</span>
				{/if}
			</p>
		</section>

		<section aria-labelledby="cast-heading">
			<h3
				id="cast-heading"
				class="ui medium dividing header {labels.cast ? '' : 'u-not-available'}"
			>
				{labels.cast}
			</h3>
			{#if castMembers.length}
				<ul class="ui relaxed divided list">
					{#each castMembers as person (`movie-cast-${person.creditId ?? person.id}`)}
						<li class="item">
							<article>
								<dl>
									<div>
										<dt class="u-sr-only">{labels.actor}</dt>
										<dd class="header">
											<strong class={person.name ? '' : 'u-not-available'}
												>{person.name || fallbacks.notAvailable}</strong
											>
										</dd>
									</div>

									<div>
										<dt class="u-sr-only">{labels.role}</dt>
										<dd class="description {person.character ? '' : 'u-not-available'}">
											{person.character || messages.noRole}
										</dd>
									</div>
								</dl>
							</article>
						</li>
					{/each}
				</ul>
			{:else}
				<p class={messages.noCast ? '' : 'u-not-available'}>{messages.noCast}</p>
			{/if}
		</section>

		<section aria-labelledby="crew-heading">
			<h3
				id="crew-heading"
				class="ui medium dividing header {labels.crew ? '' : 'u-not-available'}"
			>
				{labels.crew}
			</h3>
			{#if crew.length}
				<ul class="ui relaxed divided list">
					{#each crew as person (`movie-crew-${person.creditId ?? person.id}`)}
						<li class="item">
							<article>
								<dl>
									<div>
										<dt class="u-sr-only">{labels.actor}</dt>
										<dd class="header">
											<strong class={person.name ? '' : 'u-not-available'}
												>{person.name || fallbacks.notAvailable}</strong
											>
										</dd>
									</div>

									<div>
										<dt class="u-sr-only">{labels.job}</dt>
										<dd class="description {person.job ? '' : 'u-not-available'}">
											{person.job || messages.noJob}
										</dd>
									</div>
								</dl>
							</article>
						</li>
					{/each}
				</ul>
			{:else}
				<p class={messages.noCrew ? '' : 'u-not-available'}>{messages.noCrew}</p>
			{/if}
		</section>
	</main>
{/if}
