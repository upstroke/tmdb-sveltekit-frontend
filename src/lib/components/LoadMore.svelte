<script>
	import { i18n } from '$lib/stores/i18n';

	/**
	 * Renders a button for loading more entries.
	 *
	 * The component only shows the button if more results are available.
	 * While loading, the button is disabled and the appropriate loading message is displayed.
	 *
	 * @component
	 * @prop {boolean} [hasMore=false] - Indicates whether more entries are available.
	 * @prop {boolean} [loading=false] - Indicates whether more entries are currently being loaded.
	 * @prop {(() => void | Promise<void>) | null} [onload=null] - Callback for loading more entries.
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
