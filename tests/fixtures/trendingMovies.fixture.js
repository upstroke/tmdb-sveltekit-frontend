import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import LoadMore from '../../src/lib/components/LoadMore.svelte';

describe('LoadMore', () => {
	it('zeigt den Button an und ruft onload beim Klick auf', async () => {
		/**
		 * Use Case:
		 * Der Nutzer befindet sich auf einer Ergebnisliste,
		 * für die weitere Einträge vorhanden sind.
		 *
		 * Erwartung:
		 * - Der "Weitere Ergebnisse"-Button ist sichtbar.
		 * - Der Button ist anklickbar.
		 * - Ein Klick löst den übergebenen onload-Callback aus.
		 */
		const onload = vi.fn();
		const user = userEvent.setup();

		render(LoadMore, {
			props: {
				hasMore: true,
				loading: false,
				onload
			}
		});

		const button = screen.getByRole('button', { name: 'Weitere Ergebnisse' });

		expect(button).toBeInTheDocument();
		expect(button).toBeEnabled();

		await user.click(button);

		expect(onload).toHaveBeenCalledTimes(1);
	});

	it('zeigt keinen Button, wenn keine weiteren Ergebnisse vorhanden sind', () => {
		/**
		 * Negativer Use Case:
		 * Der Nutzer hat bereits alle verfügbaren Ergebnisse geladen.
		 *
		 * Erwartung:
		 * - Es wird kein "Weitere Ergebnisse"-Button gerendert,
		 *   weil kein weiterer Ladevorgang mehr möglich ist.
		 */
		render(LoadMore, {
			props: {
				hasMore: false
			}
		});

		expect(
			screen.queryByRole('button', { name: 'Weitere Ergebnisse' })
		).not.toBeInTheDocument();
	});

	it('deaktiviert den Button während eines laufenden Ladevorgangs', () => {
		/**
		 * Negativer Use Case:
		 * Der Nutzer hat bereits auf "Weitere Ergebnisse" geklickt
		 * und der nächste Ladevorgang läuft noch.
		 *
		 * Erwartung:
		 * - Der Button bleibt sichtbar,
		 * - ist aber deaktiviert,
		 * - damit kein zweiter Request parallel ausgelöst werden kann.
		 */
		render(LoadMore, {
			props: {
				hasMore: true,
				loading: true,
				onload: vi.fn()
			}
		});

		const button = screen.getByRole('button', { name: 'Weitere Ergebnisse' });

		expect(button).toBeInTheDocument();
		expect(button).toBeDisabled();
	});
});
