<script>
	import { i18n } from '$lib/stores/i18n';

	/**
	 * Rendert eine Schaltfläche zum Nachladen weiterer Einträge.
	 *
	 * Die Komponente zeigt den Button nur an, wenn weitere Ergebnisse verfügbar
	 * sind. Während des Ladens wird der Button deaktiviert und der passende
	 * Ladehinweis angezeigt.
	 *
	 * @component
	 * @prop {boolean} [hasMore=false] - Gibt an, ob weitere Einträge verfügbar sind.
	 * @prop {boolean} [loading=false] - Gibt an, ob aktuell weitere Einträge geladen werden.
	 * @prop {(() => void | Promise<void>) | null} [onload=null] - Callback zum Laden weiterer Einträge.
	 *
	 * @example
	 * <LoadMore hasMore={true} loading={false} onload={loadNextPage} />
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
