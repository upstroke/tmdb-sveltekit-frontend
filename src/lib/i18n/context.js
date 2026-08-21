import { getContext, setContext } from 'svelte';
import { DEFAULT_LOCALE } from '$lib/i18n/config';
import { getLocaleText } from '$lib/i18n/resolver';

export const I18N_CONTEXT = Symbol('i18n');

export function setI18nContext(locale = DEFAULT_LOCALE) {
	const i18n = getLocaleText(locale);
	setContext(I18N_CONTEXT, i18n);
	return i18n;
}

export function getI18nContext() {
	const context = getContext(I18N_CONTEXT);

	if (!context) {
		throw new Error('I18N context is not set');
	}

	return context;
}
