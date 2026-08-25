<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { i18n } from '$lib/stores/i18n';
	import { locale } from '$lib/stores/locale';
	import { getSupportedLocales, resolveLocale } from '$lib/i18n/helpers';

	/**
	 * Stellt die Sprachauswahl im Header bereit und synchronisiert die Auswahl
	 * mit URL, Locale-Store und laufender Route.
	 *
	 * @component
	 * @example
	 * <LanguageSwitcher />
	 */

	const { labels } = $derived($i18n);
	let selectedLocale = $state(resolveLocale(page.url.searchParams.get('locale')));

	const locales = getSupportedLocales().map((languageCode) => ({
		value: languageCode,
		label: languageCode.split('-')[0].toUpperCase()
	}));

	/**
	 * Reagiert auf eine geänderte Sprachwahl und aktualisiert Store sowie URL.
	 *
	 * Die aktuelle Seite bleibt dabei erhalten und wird mit der neuen Locale
	 * ohne Scroll- oder Fokusverlust neu geladen.
	 *
	 * @param {Event & { currentTarget: HTMLSelectElement }} event - Änderungsereignis des Select-Felds.
	 * @returns {Promise<void>} Wird aufgelöst, sobald die Navigation abgeschlossen ist.
	 */
	async function handleChange(event) {
		const nextLocale = resolveLocale(event.currentTarget.value);
		selectedLocale = nextLocale;
		locale.set(nextLocale);

		const nextUrl = new URL(page.url);
		nextUrl.searchParams.set('locale', nextLocale);

		await goto(`${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`, {
			invalidateAll: true,
			replaceState: true,
			keepFocus: true,
			noScroll: true
		});
	}
</script>

<div class="language-switcher">
	<label for="language-select" class="u-sr-only">{labels.languageSelect}</label>
	<select
		id="language-select"
		bind:value={selectedLocale}
		aria-label={labels.languageSelect}
		onchange={handleChange}
	>
		{#each locales as locale (locale.value)}
			<option value={locale.value}>{locale.label}</option>
		{/each}
	</select>
</div>

<style lang="scss">
	.language-switcher {
		display: flex;
		align-items: center;
		margin-left: 1.5rem;
	}

	select {
		padding: 0.5rem;
		border: 0;
		border-radius: 4px;
		background: transparent;
		color: #fff;
		cursor: pointer;
		outline: none;
		box-shadow: none;
	}

	select:focus,
	select:focus-visible {
		border: 0;
		box-shadow: none;
	}

	select:focus-visible {
		outline: 2px solid #2185d0;
		outline-offset: 3px;
	}

	select:hover {
		background: rgba(255, 255, 255, 0.15);
	}

	option {
		background: #202020;
		color: #fff;
	}
</style>
