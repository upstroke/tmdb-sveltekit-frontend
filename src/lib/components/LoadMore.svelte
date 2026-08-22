<script>
	import { i18n } from '$lib/stores/i18n';

	/**
	 * Erwartete Props für den "Mehr laden"-Button.
	 *
	 * @param {boolean} [hasMore=false] - Gibt an, ob weitere Ergebnisse vorhanden sind.
	 * @param {boolean} [loading=false] - Gibt an, ob gerade geladen wird.
	 * @param {Function|null} [onload=null] - Callback, das beim Klick aufgerufen wird.
	 */

	let { hasMore = false, loading = false, onload = null } = $props();

	const { messages: texts } = $derived($i18n);
</script>

{#if hasMore}
	<div class="load-more" aria-live="polite">
		<button
			class="ui primary button"
			class:loading
			type="button"
			onclick={() => onload?.()}
			disabled={loading}
			aria-busy={loading}
		>
			{loading ? texts.loadMoreLoading : texts.loadMore}
		</button>
	</div>
{/if}

<style lang="scss">
	.load-more {
		display: flex;
		justify-content: center;
		margin-top: 2rem;

		.button.loading {
			pointer-events: none;
		}
	}
</style>
