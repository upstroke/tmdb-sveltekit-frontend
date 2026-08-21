<script>
	/**
	 * Erwartete Props für das Medientyp-Label.
	 *
	 * @param {'movie'|'tv'|string|null|undefined} mediaType - Medientyp zur Ableitung von Labeltext und Farbvariante.
	 * @param {string} [class=''] - Zusätzliche CSS-Klassen für das Label.
	 */

	let { mediaType, class: className = '' } = $props();

	let normalizedType = $derived(mediaType === 'movie' ? 'movie' : mediaType === 'tv' ? 'tv' : null);
	let labelClass = $derived(normalizedType === 'movie' ? 'blue' : normalizedType === 'tv' ? 'teal' : '');
</script>

{#if normalizedType}
	<span class={`ui label ${labelClass} ${className}`}>
		{normalizedType}
	</span>
{/if}

<style lang="scss">
	.ui.label.blue,
	.ui.label.teal {
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
	}
</style>
