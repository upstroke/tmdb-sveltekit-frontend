<script>
	import { browser } from '$app/environment';
	import { i18n } from '$lib/stores/i18n';

	const { messages } = $derived($i18n);

	/**
	 * Renders a reusable native dialog for error messages.
	 *
	 * The dialog opens automatically on the client side as soon as a message
	 * is present, and optionally displays a customized heading.
	 *
	 * @example
	 * <DialogMessage message="An error occurred while loading." />
	 *
	 * @type {{
	 *   message: string,
	 *   title?: string
	 * }}
	 */
	let { message, title = messages.dialogErrorTitle } = $props();

	/** @type {HTMLDialogElement | undefined} */
	let dialog = $state();

	/**
	 * Opens the native dialog automatically as soon as a message is present in the browser.
	 *
	 * The effect only runs on the client and avoids reopening an already open dialog.
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
