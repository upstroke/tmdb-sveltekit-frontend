<script>
	/**
	 * Gemeinsamer Hero für Detailseiten.
	 *
	 * @param {string} title - Titel des Mediums.
	 * @param {string} backdrop - Hintergrundbild.
	 * @param {string} posterUrl - Posterbild.
	 * @param {Array<{id?: number|string, name: string}>} productionCompanies - Produktionsfirmen.
	 * @param {string} titlePrefix - Text für die Bild-alt-Attribute.
	 * @param {string} emptyLabel - Fallback-Text für fehlende Produktionsfirmen.
	 */
	let {
		title,
		backdrop,
		posterUrl,
		productionCompanies = [],
		titlePrefix = 'Poster',
		emptyLabel = 'N/A'
	} = $props();

	let companyNamesText = $derived(
		productionCompanies.length ? productionCompanies.map((company) => company.name).join(' • ') : emptyLabel
	);
</script>

<div class="ui inverted vertical center aligned masthead segment">
	<div class="masthead-image">
		<img src={backdrop} alt={title} />
	</div>

	<div class="ui text container">
		<div class="poster">
			<img src={posterUrl} alt={`${title} ${titlePrefix}`} />
		</div>

		<h1 class="ui inverted header">
			{title}
		</h1>

		{#if productionCompanies.length}
			<ul class="ui inverted production-companies" title={companyNamesText}>
				{#each productionCompanies as company (`header-company-${company.id ?? company.name}`)}
					<li class="item">
						{company.name}
					</li>
				{/each}
			</ul>
		{:else}
			<ul class="ui inverted production-companies" title={emptyLabel}>
				<li class="item">{emptyLabel}</li>
			</ul>
		{/if}
	</div>
</div>

<style lang="scss">
	.ui.masthead.segment {
		padding: 39px 0 0;
		position: relative;
		text-shadow: 0 2px 2px rgba(0, 0, 0, 0.6);
		font-size: 3.5em;
		font-weight: normal;
		line-height: 1;
		margin-bottom: -3rem;

		.masthead-image {
			min-height: 61vw;

			img {
				height: 63vw;
				max-width: 100%;
				object-fit: cover;
				object-position: center top;
				opacity: 0.5;
			}
		}

		h1.ui.header {
			margin: 0;
		}

		.ui.text.container {
			position: relative;
			width: unset;
			max-width: 100%;
			padding-bottom: 0.5rem;
			margin: -6rem auto -3.5rem;
		}

		@media (min-width: 768px) {
			.ui.text.container {
				max-width: 85%;
				padding-bottom: 3.5rem;
				margin: -9rem auto -3.5rem;
			}
		}

		@media (min-width: 992px) {
			.ui.text.container {
				max-width: 60%;
			}
		}

		.poster {
			position: absolute;
			left: 50%;
			transform: translate(-50%, 0);
			bottom: 125%;
			margin: 0;
			width: 160px;

			> img {
				min-width: 160px;
				width: 100%;
				box-shadow: 1px 0 5px 2px rgba(0, 0, 0, 0.4);
				border: 2px solid white;
			}
		}

		@media (min-width: 768px) {
			.poster {
				bottom: 150%;
			}
		}

		ul.ui.inverted.production-companies {
			list-style: none;
			margin: 20px 0 0 0;
			padding: 0;
			font-size: 80%;
			display: flex;
			justify-content: space-evenly;
			gap: 1rem;

			@media (min-width: 768px) {
				justify-content: center;

				> li:first-child {
					margin-left: -.75rem;
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
	}
</style>
