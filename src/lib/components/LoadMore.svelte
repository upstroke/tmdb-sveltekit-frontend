<script>
	let { hasMore = false, loading = false, onload = null } = $props();
</script>

{#if hasMore}
	<div class="load-more">
		<button
			class="ui primary button"
			class:loading
			type="button"
			onclick={() => onload?.()}
			disabled={loading}
		>
			Weitere Ergebnisse
		</button>
	</div>
{/if}
