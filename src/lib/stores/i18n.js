import { derived } from 'svelte/store';
import { getLocaleText } from '$lib/i18n/resolver';
import { locale } from '$lib/stores/locale';

export const i18n = derived(locale, ($locale) => getLocaleText($locale));
