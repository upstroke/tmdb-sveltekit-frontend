import { render, screen } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { i18nMockDefault, getI18nLabels } from '$tests/mocks/i18n.mocks.js';

const labels = getI18nLabels();

vi.mock('$lib/stores/i18n', () => i18nMockDefault);

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
		render(DialogMessage, {
			props: {
				message: labels.unknownError
			}
		});

		expect(screen.getByRole('dialog', { name: labels.dialogErrorTitle })).toBeInTheDocument();
		expect(screen.getByText(labels.unknownError)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: labels.dialogOk })).toBeInTheDocument();
	});

	it('verwendet einen explizit gesetzten Titel statt des Standardtitels', () => {
		// Äquivalenzklassenbildung: Ein gesetzter Titel überschreibt den Default-Titel vollständig.
		render(DialogMessage, {
			props: {
				message: labels.contentLoadError,
				title: 'Benutzerdefinierte Meldung'
			}
		});

		expect(screen.getByRole('dialog', { name: 'Benutzerdefinierte Meldung' })).toBeInTheDocument();
		expect(screen.getByText(labels.contentLoadError)).toBeInTheDocument();
	});

	it('öffnet den Dialog clientseitig, wenn eine Meldung vorhanden ist und der Dialog geschlossen ist', () => {
		// Anweisungsüberdeckung: Bei vorhandener Meldung und geschlossenem Dialog wird showModal genau einmal aufgerufen.
		render(DialogMessage, {
			props: {
				message: labels.loadMoreError
			}
		});

		expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
		expect(screen.getByRole('dialog')).toHaveProperty('open', true);
	});
});
