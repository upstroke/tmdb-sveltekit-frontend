<script>
	import { i18n } from '$lib/stores/i18n';

	const { labels } = $derived($i18n);

	/**
	 * Renders a compact label for the media type.
	 *
	 * Movies are displayed as a blue label and TV shows as a teal label.
	 * For unknown or missing media types, no label is rendered.
	 *
	 * @component
	 * @prop {'movie'|'tv'|string|null|undefined} mediaType - Media type from which text and color variant are derived.
	 * @prop {string} [class=''] - Additional CSS classes for the label.
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
		font-size: 0.9rem;
		color: white;
	}

	.ui.label.blue {
		background-color: var(--mediatype-label-blue) !important;
		border-color: var(--mediatype-label-blue) !important;
		color: white;
	}
	.ui.label.teal {
		background-color: var(--mediatype-label-teal) !important;
		border-color: var(--mediatype-label-teal) !important;
		color: white;
	}
</style>
