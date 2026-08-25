<script>
	import { i18n } from '$lib/stores/i18n';

	const { labels } = $derived($i18n);

	/**
	 * Erwartete Props für das Medientyp-Label.
	 *
	 * @param {'movie'|'tv'|string|null|undefined} mediaType - Medientyp zur Ableitung von Labeltext und Farbvariante.
	 * @param {string} [class=''] - Zusätzliche CSS-Klassen für das Label.
	 */

	/**
	 * Erwartete Props für das kompakte Medientyp-Label.
	 *
	 * @param {'movie'|'tv'|string} mediaType - Medientyp, der angezeigt werden soll.
	 * @param {string} [className=''] - Zusätzliche CSS-Klassen für das Label.
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
