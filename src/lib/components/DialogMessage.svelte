<script>
    import { browser } from '$app/environment';

    /**
     * Wiederverwendbarer nativer Dialog für Fehlermeldungen.
     *
     * @param {string} message - Der anzuzeigende Text.
     * @param {string} [title='Fehler beim Laden'] - Die Überschrift des Dialogs.
     */
    let {
        message,
        title = 'Fehler beim Laden'
    } = $props();

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

<dialog bind:this={dialog} class="dialog-message">
    <div class="dialog-message__content">
        <strong>{title}</strong>
        <p>{message}</p>

        <form method="dialog" class="dialog-message__actions">
            <button class="ui button primary right floated" type="submit">OK</button>
        </form>
    </div>
</dialog>
