<script>
	import { browser } from '$app/environment';
	import { i18n } from '$lib/stores/i18n';

	const { messages } = $derived($i18n);

	/**
	 * Rendert einen wiederverwendbaren nativen Dialog für Fehlermeldungen.
	 *
	 * Der Dialog öffnet sich clientseitig automatisch, sobald eine Meldung
	 * vorliegt, und zeigt optional eine angepasste Überschrift an.
	 *
	 * @component
	 * @prop {string} message - Der anzuzeigende Meldungstext.
	 * @prop {string} [title=messages.dialogErrorTitle] - Optionale Überschrift des Dialogs.
	 *
	 * @example
	 * <DialogMessage message="Beim Laden ist ein Fehler aufgetreten." />
	 */
	let { message, title = messages.dialogErrorTitle } = $props();

	let dialog;

	/**
	 * Öffnet den nativen Dialog automatisch, sobald im Browser eine Meldung vorliegt.
	 *
	 * Der Effekt reagiert nur clientseitig und vermeidet mehrfaches Öffnen eines
	 * bereits sichtbaren Dialogs.
	 *
	 * @returns {void}
	 */
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
