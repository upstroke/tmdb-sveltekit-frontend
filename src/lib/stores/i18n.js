import { derived } from 'svelte/store';
import { getLocaleText } from '$lib/i18n/resolver';
import { locale } from '$lib/stores/locale';

/**
 * Returns the translated UI texts for the currently selected locale.
 *
 * The store is automatically updated as soon as the underlying
 * `locale` store changes.
 *
 * @type {import('svelte/store').Readable<Object>}
 */
export const i18n = derived(locale, ($locale) => getLocaleText($locale));
