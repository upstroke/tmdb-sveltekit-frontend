<script>
	import { page } from '$app/state';
	import { deduplicateById } from '$lib/utils/deduplicateById';
	import { formatHomepageLabel } from '$lib/utils/formatHomepageLabel';
	import DialogMessage from '$lib/components/DialogMessage.svelte';
	import DetailsHero from '$lib/components/DetailsHero.svelte';
	import MediaTypeLabel from '$lib/components/MediaTypeLabel.svelte';
	import notAvailable from '$lib/assets/not-available.png';
	import { i18n } from '$lib/stores/i18n';
	import { getCertificationMeta } from '$lib/utils/certificationMeta';
	import { formatDate } from '$lib/utils/formatDate.js';

	let { data } = $props();

	const { buttons, fallbacks, formats, labels, messages, titles } = $derived($i18n);

	let tvShow = $derived(data.tvShow ?? null);
	let error = $derived(data.error ?? null);
	let activeRegion = $derived(
		(page.url.searchParams.get('locale') ?? 'de-DE').split('-')[1] ?? 'DE'
	);
	let certificationMeta = $derived(getCertificationMeta(tvShow?.certification, activeRegion));
	let certificationStyle = $derived.by(() =>
		certificationMeta
			? `--certification-icon-color: ${certificationMeta.color === '#ffffff' ? 'transparent' : certificationMeta.color}; --certification-icon-border-color: ${certificationMeta.color === '#ffffff' ? '#999' : certificationMeta.color}`
			: `--certification-icon-color: #dedede; --certification-icon-border-color: #dedede`
	);

	let backdrop = $derived(tvShow?.imageUrl || notAvailable);
	let posterUrl = $derived(tvShow?.posterUrl || tvShow?.imageUrl || notAvailable);
	let title = $derived(tvShow?.title?.trim() || fallbacks.notAvailable);
	let rating = $derived(tvShow?.rating ?? null);
	let mediaType = $derived(tvShow?.mediaType ?? 'tv');
	let genres = $derived(deduplicateById(tvShow?.genres ?? []));
	let overview = $derived(tvShow?.overview ?? '');
	let homepage = $derived(tvShow?.homepage ?? '');
	let trailerUrls = $derived(tvShow?.trailerUrls ?? []);
	let releaseDate = $derived(tvShow?.releaseDate ?? '');
	let formattedReleaseDate = $derived(
		releaseDate.trim()
			? formatDate(releaseDate, page.url.searchParams.get('locale') ?? 'de-DE')
			: ''
	);
	let streamingProviders = $derived(data.providers ?? null);
	let productionCompanies = $derived(deduplicateById(tvShow?.productionCompanies ?? []));
	let runtime = $derived(tvShow?.runtime ?? null);
	let castMembers = $derived(deduplicateById(tvShow?.cast ?? []));
	let crew = $derived(deduplicateById(tvShow?.crew ?? []));
</script>

<svelte:head>
	<title>
		{title !== fallbacks.notAvailable
			? `${title} — ${formats.detailsSuffix} TMDB`
			: `${titles.tvShowDetails} TMDB`}
	</title>
</svelte:head>

{#if error}
	<DialogMessage message={error} />
{:else if tvShow}
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

				<div class="details-meta-item">
					<dt class="u-sr-only">{labels.certification}</dt>
					<dd class="meta certification" style={certificationStyle}>
						<span class="certification-content">
							<span class="certification-icon" aria-hidden="true"></span>
							<span class={certificationMeta?.label ? '' : 'u-not-available'}>
								{certificationMeta?.label ?? fallbacks.notAvailable}
							</span>
						</span>
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
						{#each genres as genre (`tv-genre-${genre.id ?? genre.name}`)}
							<li class="item {genre.name ? '' : 'u-not-available'}">{genre.name}</li>
						{/each}
					</ul>
				{:else}
					<p class="genres-empty {messages.noGenres ? '' : 'u-not-available'}">
						{messages.noGenres}
					</p>
				{/if}
			</section>
		</header>

		<section aria-labelledby="overview-heading">
			<h3
				id="overview-heading"
				class="ui medium dividing header {labels.overview ? '' : 'u-not-available'}"
			>
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
			{#if trailerUrls.length}
				<ul class="ui list trailer-list">
					{#each trailerUrls as trailer, index (`tvshow-trailer-${index}`)}
						<li>
							<a
								class="ui red button {buttons.watchTrailer ? '' : 'u-not-available'}"
								href={trailer.url}
								target="_blank"
								rel="noopener noreferrer"
							>
								<i class="youtube icon" aria-hidden="true"></i>
								{buttons.watchTrailer.replace('{index}', String(index + 1))}
							</a>
						</li>
					{/each}
				</ul>
			{:else}
				<span class="u-not-available">{fallbacks.notAvailable}</span>
			{/if}
		</section>

		<section aria-labelledby="release-heading">
			<h3
				id="release-heading"
				class="ui medium dividing header {labels.firstAirDate ? '' : 'u-not-available'}"
			>
				{labels.firstAirDate}
			</h3>
			<p>
				<time
					class={formattedReleaseDate ? '' : 'u-not-available'}
					datetime={releaseDate || undefined}>{formattedReleaseDate || fallbacks.notAvailable}</time
				>
			</p>
		</section>

		<section aria-labelledby="watch-providers-heading">
			<h3 id="watch-providers-heading" class="ui medium dividing header">
				{labels.streamingProviders}
				<small class="justwatch-attribution"
					>{labels.streamingDataProvidedBy} <strong>&copy;JustWatch</strong></small
				>
			</h3>
			{#if streamingProviders}
				{#await streamingProviders}
					<p>{messages.loadMoreLoading}</p>
				{:then providers}
					{#if providers?.providers?.length}
						<ul class="ui relaxed divided list providers-list">
							{#each providers.providers as provider (`tv-provider-${provider.providerId}-${provider.type}`)}
								<li>
									<div style="display:flex;align-items:center;gap:0.75rem">
										{#if provider.logoPath}
											<img
												src={`https://image.tmdb.org/t/p/w92${provider.logoPath}`}
												alt=""
												width="40"
												height="40"
												style="border-radius:0.25rem;background:#f0f0f0"
											/>
										{/if}
										<div>
											{#if provider.link}
												<a
													href={provider.link}
													target="_blank"
													rel="noopener noreferrer"
													class="home-link"
												>
													<strong>{provider.providerName}</strong>
												</a>
											{:else}
												<strong>{provider.providerName}</strong>
											{/if}
											<span>
												— {labels[
													`providerType${provider.type.charAt(0).toUpperCase() + provider.type.slice(1)}`
												]}</span
											>
										</div>
									</div>
								</li>
							{/each}
						</ul>
					{:else}
						<p class="u-not-available">{fallbacks.notAvailable}</p>
					{/if}
				{:catch}
					<p class="u-not-available">{fallbacks.notAvailable}</p>
				{/await}
			{:else}
				<p class="u-not-available">{fallbacks.notAvailable}</p>
			{/if}
		</section>

		<section aria-labelledby="production-heading">
			<h3
				id="production-heading"
				class="ui medium dividing header {labels.production ? '' : 'u-not-available'}"
			>
				{labels.production}
			</h3>
			{#if productionCompanies.length}
				<ul class="ui relaxed divided list">
					{#each productionCompanies as company (`tv-production-company-${company.id ?? company.name}`)}
						<li>
							<strong>{company.name}</strong>
						</li>
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
				{#if runtime !== null && runtime !== undefined}
					<span>{runtime} min</span>
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
					{#each castMembers as member (`tv-cast-${member.creditId ?? member.id ?? member.name}`)}
						<li>
							<strong>{member.name}</strong>
							{#if member.character}
								<span> — {member.character}</span>
							{/if}
						</li>
					{/each}
				</ul>
			{:else}
				<p class="u-not-available">{fallbacks.notAvailable}</p>
			{/if}
		</section>

		<section aria-labelledby="crew-heading">
			<h3
				id="cast-heading"
				class="ui medium dividing header {labels.crewt ? '' : 'u-not-available'}"
			>
				{labels.crew}
			</h3>
			{#if crew.length}
				<ul class="ui relaxed divided list">
					{#each crew as member (`tv-crew-${member.creditId ?? member.id ?? member.name}`)}
						<li>
							<strong>{member.name}</strong>
							{#if member.job}
								<span> — {member.job}</span>
							{/if}
						</li>
					{/each}
				</ul>
			{:else}
				<p class="u-not-available">{fallbacks.notAvailable}</p>
			{/if}
		</section>
	</main>
{/if}

<style>
	.ui.list.trailer-list {
		list-style-type: none;
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		margin: 0;

		& > li {
			padding: 0;

			&::before {
				display: none;
			}
		}
	}
</style>
