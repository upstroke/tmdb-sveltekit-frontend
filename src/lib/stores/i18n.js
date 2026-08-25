import { derived } from 'svelte/store';
import { getLocaleText } from '$lib/i18n/resolver';
import { locale } from '$lib/stores/locale';

/**
 * Liefert die übersetzten UI-Texte für die aktuell ausgewählte Locale.
 *
 * Der Store wird automatisch aktualisiert, sobald sich der zugrunde liegende
 * `locale`-Store ändert.
 *
 * @type {import('svelte/store').Readable<Object>}
 */
export const i18n = derived(locale, ($locale) => getLocaleText($locale));
