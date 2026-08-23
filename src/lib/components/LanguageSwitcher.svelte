<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import uiText from '$lib/i18n/ui.json';
	import { i18n } from '$lib/stores/i18n';
	import { locale } from '$lib/stores/locale';
	import { resolveLocale } from '$lib/i18n/helpers';

	const { labels } = $derived($i18n);
	let selectedLocale = $state(resolveLocale(page.url.searchParams.get('locale')));

	const locales = Object.values(uiText.locales).map(({ languageCode, languageShortCode }) => ({
		value: languageCode,
		label: languageShortCode
	}));

	/**
	 * Aktualisiert die aktive Sprache, speichert sie im Locale-Store und lädt die aktuelle Route mit Locale-Parameter neu.
	 *
	 * @param {Event & { currentTarget: HTMLSelectElement }} event - Change-Event des Sprach-Selects.
	 * @returns {Promise<void>} Wird abgeschlossen, sobald die Navigation mit aktualisierter Locale beendet ist.
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
			<option class={locale.label ? '' : 'u-not-available'} value={locale.value}
				>{locale.label}</option
			>
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
	}

	select:hover {
		background: rgba(255, 255, 255, 0.15);
	}

	option {
		background: #202020;
		color: #fff;
	}
</style>
