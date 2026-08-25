<script>
	import { i18n } from '$lib/stores/i18n';

	const { labels } = $derived($i18n);

	/**
	 * Rendert ein kompaktes Label für den Medientyp.
	 *
	 * Filme werden als blaues Label und TV-Serien als türkises Label dargestellt.
	 * Für unbekannte oder fehlende Medientypen wird kein Label gerendert.
	 *
	 * @component
	 * @prop {'movie'|'tv'|string|null|undefined} mediaType - Medientyp, aus dem Text und Farbvariante abgeleitet werden.
	 * @prop {string} [class=''] - Zusätzliche CSS-Klassen für das Label.
	 *
	 * @example
	 * <MediaTypeLabel mediaType="movie" class="featured-card-type" />
	 */
	let { mediaType, class: className = '' } = $props();

	let normalizedType = $derived(mediaType === 'movie' ? 'movie' : mediaType === 'tv' ? 'tv' : null);

	let labelClass = $derived(
		normalizedType === 'movie' ? 'blue' : normalizedType === 'tv' ? 'teal' : ''
	);

	let labelText = $derived(
		normalizedType === 'movie' ? labels.movie : normalizedType === 'tv' ? labels.tvShow : ''
	);
</script>

{#if normalizedType}
	<span class={`ui label ${labelClass} ${className}`}>
		{labelText}
	</span>
{/if}

<style lang="scss">
	.ui.label.blue,
	.ui.label.teal {
		z-index: 1;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
	}
</style>
