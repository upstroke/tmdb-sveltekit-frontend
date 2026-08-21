<script>
	import notAvailable from '$lib/assets/not-available.png';
	import { getI18nContext } from '$lib/i18n/context';

	const { fallbacks } = getI18nContext();

	/**
	 * Gemeinsamer Hero für Detailseiten.
	 *
	 * Layout:
	 * - Der Root-Container trägt das Backdrop als flächendeckenden Hintergrund.
	 * - Alle Inhalte liegen in einem vertikalen Flex-Layout und sind am unteren Rand ausgerichtet.
	 * - Die Höhe ergibt sich aus dem Inhalt, optional abgesichert durch eine Mindesthöhe.
	 * - Das Backdrop wächst mit dem Container in Breite und Höhe mit.
	 *
	 * @param {string} title - Titel des Mediums.
	 * @param {string} backdrop - Hintergrundbild.
	 * @param {string} posterUrl - Posterbild.
	 * @param {Array<{id?: number|string, name: string}>} productionCompanies - Produktionsfirmen.
	 * @param {string} emptyLabel - Fallback-Text für fehlende Produktionsfirmen.
	 */
	let {
		title,
		backdrop,
		posterUrl,
		productionCompanies = [],
		emptyLabel = ''
	} = $props();

	let notAvailableText = $derived(fallbacks.notAvailable);
	let fallbackImage = $derived(backdrop || posterUrl || notAvailable);
	let resolvedPosterUrl = $derived(posterUrl || notAvailable);
	let resolvedTitle = $derived(title?.trim() || notAvailableText);
	let resolvedEmptyLabel = $derived(emptyLabel?.trim() || notAvailableText);
</script>

<section class="details-hero" aria-labelledby="details-hero-title" style={`--details-hero-backdrop: url('${fallbackImage}')`}>
	<div class="details-hero-overlay">
		<div class="details-hero-content">
			<div class="details-hero-poster" aria-hidden="true">
				<img src={resolvedPosterUrl} alt="" />
			</div>

			<h1 id="details-hero-title" class="details-hero-title">{resolvedTitle}</h1>

			<section class="details-hero-companies" aria-labelledby="details-hero-companies-heading">
				<h2 id="details-hero-companies-heading" class="u-sr-only">Produktionsfirmen</h2>
				<ul>
					{#if productionCompanies.length}
						{#each productionCompanies as company (`header-company-${company.id ?? company.name}`)}
							<li class="details-hero-company">{company.name}</li>
						{/each}
					{:else}
						<li class="details-hero-company">{resolvedEmptyLabel}</li>
					{/if}
				</ul>
			</section>
		</div>
	</div>
</section>

<style lang="scss">
	@use '../../css/variables';
	@use '../../css/mixins' as *;
	.details-hero {
		position: relative;
		display: flex;
		align-items: stretch;
		width: 100%;
		min-height: clamp(32rem, 61vw, 48rem);
		padding: 0;
		margin-bottom: -3rem;
		background-color: #000;
		background-image:
			linear-gradient(to top, rgba(0, 0, 0, 0.92) 0%, rgba(0, 0, 0, 0.7) 32%, rgba(0, 0, 0, 0.45) 58%, rgba(0, 0, 0, 0.5) 100%),
			var(--details-hero-backdrop);
		background-position: center top;
		background-repeat: no-repeat;
		background-size: cover;
		color: #fff;
		text-shadow: 0 2px 2px rgba(0, 0, 0, 0.6);
		overflow: hidden;
	}

	.details-hero-overlay {
		display: flex;
		align-items: flex-end;
		width: 100%;
		min-height: inherit;
		padding: 2.5rem 1rem 0.5rem;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.1));
	}

	.details-hero-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-end;
		gap: 1rem;
		width: 100%;
		max-width: 60rem;
		margin: 0 auto;
	}

	.details-hero-poster {
		width: clamp(10rem, 22vw, 14rem);
		margin: 0 0 1rem 0;

		img {
			display: block;
			width: 100%;
			height: auto;
			box-shadow: 1px 0 5px 2px rgba(0, 0, 0, 0.4);
			border: 2px solid #fff;
		}
	}

	.details-hero-title {
		margin: 0;
		font-size: clamp(2rem, 5vw, 3.5rem);
		line-height: 1.1;
		text-align: center;
	}

	.details-hero-companies {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.75rem 1rem;
		margin: 0;
		padding: 0 0 1rem 0;
		font-size: clamp(0.95rem, 2vw, 1.125rem);
		text-align: center;

		ul {
			display: flex;
			flex-wrap: inherit;
			justify-content: inherit;
			gap: inherit;
			list-style: none;
			margin: 0;
			padding: 0;
			line-height: 1;
		}
	}

	.details-hero-company {
		white-space: normal;
	}

	@include tablet-up {
		.details-hero {
			min-height: clamp(36rem, 63vw, 52rem);
		}

		.details-hero-overlay {
			padding: 3rem 1.5rem 3.5rem;
		}

		.details-hero-companies {
			gap: 0.75rem;
		}

		.details-hero-company:not(:first-child)::before {
			content: '•';
			margin-right: 0.75rem;
			color: #fff;
		}
	}

	@include computer-up {
		.details-hero-content {
			max-width: 70%;
		}
	}
</style>
