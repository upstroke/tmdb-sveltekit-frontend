<script>
	import { browser } from '$app/environment';
	import { i18n } from '$lib/stores/i18n';

	const { messages } = $derived($i18n);

	/**
	 * Wiederverwendbarer nativer Dialog für Fehlermeldungen.
	 *
	 * @param {string} message - Der anzuzeigende Text.
	 * @param {string} [title='Fehler beim Laden'] - Die Überschrift des Dialogs.
	 */
	let { message, title = messages.dialogErrorTitle } = $props();

	let dialog;

	$effect(() => {
		if (!browser || !dialog || !message) {
			return;
		}

		if (!dialog.open) {
			dialog.showModal();
		}
	});
</script>

<dialog
	aria-labelledby="dialog-message-title"
	aria-live="assertive"
	bind:this={dialog}
	class="dialog-message"
>
	<div class="dialog-message-content">
		<strong id="dialog-message-title">{title}</strong>
		<p>{message}</p>

		<form class="dialog-message-actions" method="dialog">
			<button class="ui button primary right floated" type="submit">{messages.dialogOk}</button>
		</form>
	</div>
</dialog>

<style lang="scss">
	.dialog-message {
		border: none;
		border-radius: 1rem;
		padding: 0;
		max-width: min(90vw, 480px);
		box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
	}

	.dialog-message::backdrop {
		background: rgba(0, 0, 0, 0.45);
	}

	.dialog-message-content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.25rem 1.5rem;
		background: #fff;
	}
</style>
