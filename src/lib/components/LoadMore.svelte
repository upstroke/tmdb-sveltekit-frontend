<script>
	import { i18n } from '$lib/stores/i18n';

	/**
	 * Renders a button for loading more entries.
	 *
	 * The button is disabled when loading or when no more results are available.
	 * While loading, the appropriate loading message is displayed.
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

<div class="load-more" aria-live="polite">
	{#if loading}
		<button
			class="ui primary button loading"
			type="button"
			onclick={() => onload?.()}
			disabled={true}
			aria-busy={true}
		>
			{texts.loadMoreLoading}
		</button>
	{:else}
		<button
			class="ui primary button"
			type="button"
			onclick={() => onload?.()}
			disabled={!hasMore}
			aria-busy={false}
		>
			{texts.loadMore}
		</button>
	{/if}
</div>

<style lang="scss">
	.load-more {
		display: flex;
		justify-content: center;
		margin-top: 2rem;

		.ui.primary.button {
			background: var(--mediatype-label-blue);
		}

		.button.loading {
			pointer-events: none;
		}
	}
</style>
