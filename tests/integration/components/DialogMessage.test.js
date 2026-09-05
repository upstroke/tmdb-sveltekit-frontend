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

	it('renders the message with the default title and the confirm button', () => {
		// Equivalence class testing: without an explicit title, the component uses the default title from the i18n store.
		render(DialogMessage, {
			props: {
				message: labels.unknownError // ← From ui.json!
			}
		});

		expect(screen.getByRole('dialog', { name: labels.dialogErrorTitle })).toBeInTheDocument();
		expect(screen.getByText(labels.unknownError)).toBeInTheDocument(); // ← From ui.json!
		expect(screen.getByRole('button', { name: labels.dialogOk })).toBeInTheDocument();
	});

	it('uses an explicitly set title instead of the default title', () => {
		// Equivalence class testing: a provided title completely overrides the default title.
		render(DialogMessage, {
			props: {
				message: labels.contentLoadError, // ← From ui.json!
				title: 'Custom Message'
			}
		});

		expect(screen.getByRole('dialog', { name: 'Custom Message' })).toBeInTheDocument();
		expect(screen.getByText(labels.contentLoadError)).toBeInTheDocument(); // ← From ui.json!
	});

	it('opens the dialog client-side when a message is present and the dialog is closed', () => {
		// Statement coverage: with an existing message and a closed dialog, showModal is called exactly once.
		render(DialogMessage, {
			props: {
				message: labels.loadMoreError // ← From ui.json!
			}
		});

		expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
		expect(screen.getByRole('dialog')).toHaveProperty('open', true);
	});
});
