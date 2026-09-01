import { render, screen } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import DialogMessage from '$lib/components/DialogMessage.svelte';

describe('DialogMessage', () => {
	beforeEach(() => {
		Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
			configurable: true,
			value: vi.fn(function () {
				this.open = true;
			})
		});
	});
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('rendert die Meldung mit dem Standardtitel und dem Bestätigungsbutton', () => {
		// Äquivalenzklassenbildung: Ohne expliziten Titel nutzt die Komponente den Standardtitel aus dem i18n-Store.
		render(DialogMessage, { props: { message: 'Beim Laden ist ein Fehler aufgetreten.' } });

		expect(screen.getByRole('dialog', { name: 'Fehler beim Laden' })).toBeInTheDocument();
		expect(screen.getByText('Beim Laden ist ein Fehler aufgetreten.')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
	});

	it('verwendet einen explizit gesetzten Titel statt des Standardtitels', () => {
		// Äquivalenzklassenbildung: Ein gesetzter Titel überschreibt den Default-Titel vollständig.
		render(DialogMessage, {
			props: {
				message: 'Etwas ist schiefgelaufen.',
				title: 'Benutzerdefinierte Meldung'
			}
		});

		expect(screen.getByRole('dialog', { name: 'Benutzerdefinierte Meldung' })).toBeInTheDocument();
		expect(screen.getByText('Benutzerdefinierte Meldung')).toBeInTheDocument();
	});

	it('öffnet den Dialog clientseitig, wenn eine Meldung vorhanden ist und der Dialog geschlossen ist', () => {
		// Anweisungsüberdeckung: Bei vorhandener Meldung und geschlossenem Dialog wird showModal genau einmal aufgerufen.
		render(DialogMessage, { props: { message: 'Fehler beim Laden.' } });

		expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
		expect(screen.getByRole('dialog')).toHaveProperty('open', true);
	});
});
