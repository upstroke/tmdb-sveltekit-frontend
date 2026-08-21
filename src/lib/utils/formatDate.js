/**
 * Formatiert einen Datumsstring abhängig von der angegebenen Locale.
 *
 * Die Funktion wandelt einen Datumswert in ein `Date`-Objekt um und gibt ihn
 * mit `Intl.DateTimeFormat` formatiert zurück. Die Locale wird standardmäßig
 * aus der Umgebungsvariable `VITE_DATE_LOCALE` gelesen.
 *
 * @param {string} dateString - Datumsstring im ISO- oder anderweitig parsebaren Format.
 * @param {string} [locale=import.meta.env.VITE_DATE_LOCALE ?? 'de-DE'] - Locale für die Ausgabe.
 * @returns {string} Formatierter Datumsstring, Originalwert bei ungültigem Datum oder leerer String.
 */
export function formatDate(dateString, locale = import.meta.env.VITE_DATE_LOCALE ?? 'de-DE') {
	if (!dateString) return '';

	const date = new Date(dateString);
	if (Number.isNaN(date.getTime())) return dateString;

	return new Intl.DateTimeFormat(locale).format(date);
}
