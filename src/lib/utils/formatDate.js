/**
 * Prüft, ob ein Wert ausschließlich aus Ziffern besteht und optional eine feste Länge hat.
 *
 * @param {string} value - Zu prüfender String.
 * @param {number} [expectedLength] - Erwartete Länge.
 * @returns {boolean} `true`, wenn der Wert nur aus Ziffern besteht und die Länge passt.
 */
function isDigits(value, expectedLength) {
	if (typeof value !== 'string' || value.length === 0) {
		return false;
	}

	if (expectedLength !== undefined && value.length !== expectedLength) {
		return false;
	}

	return [...value].every((char) => char >= '0' && char <= '9');
}

/**
 * Zerlegt einen ISO-Datumsstring in Datums- und optionalen Zeitanteil.
 *
 * Akzeptiert nur vollständige ISO-Daten im Format `YYYY-MM-DD` mit optionalem
 * Zeitanteil. Unvollständige Werte wie `YYYY` oder `YYYY-MM` werden verworfen.
 *
 * @param {string} dateString - Zu prüfender String.
 * @returns {{year: number, month: number, day: number, timePart: string | undefined} | null}
 */
function parseIsoDateParts(dateString) {
	if (!dateString.includes('-')) {
		return null;
	}

	const [datePart, timePart] = dateString.split('T');
	const dateSegments = datePart.split('-');

	if (dateSegments.length !== 3) {
		return null;
	}

	const [year, month, day] = dateSegments;

	if (!isDigits(year, 4) || !isDigits(month, 2) || !isDigits(day, 2)) {
		return null;
	}

	const yearNum = Number(year);
	const monthNum = Number(month);
	const dayNum = Number(day);

	if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) {
		return null;
	}

	return {
		year: yearNum,
		month: monthNum,
		day: dayNum,
		timePart
	};
}

/**
 * Prüft, ob ein optionaler ISO-Zeitanteil gültig aufgebaut ist.
 *
 * Unterstützt Formate wie `HH:mm`, `HH:mm:ss`, `HH:mm:ss.SSS`, jeweils optional
 * mit `Z` oder Offset wie `+02:00`.
 *
 * @param {string | undefined} timePart - Zeitanteil des ISO-Strings.
 * @returns {boolean} `true`, wenn der Zeitanteil gültig ist.
 */
function isValidTimePart(timePart) {
	if (!timePart) {
		return true;
	}

	const normalizedTime = timePart.endsWith('Z') ? timePart.slice(0, -1) : timePart;

	let timeWithoutZone = normalizedTime;
	const plusIndex = normalizedTime.indexOf('+');
	if (plusIndex > -1) {
		timeWithoutZone = normalizedTime.slice(0, plusIndex);
	} else {
		const lastMinusIndex = normalizedTime.lastIndexOf('-');
		if (lastMinusIndex > 1) {
			timeWithoutZone = normalizedTime.slice(0, lastMinusIndex);
		}
	}

	const timeSegments = timeWithoutZone.split(':');
	if (timeSegments.length < 2 || timeSegments.length > 3) {
		return false;
	}

	const [hours, minutes, secondsWithMs] = timeSegments;
	const seconds = secondsWithMs?.split('.')[0];

	if (!isDigits(hours, 2) || !isDigits(minutes, 2) || (seconds !== undefined && !isDigits(seconds, 2))) {
		return false;
	}

	const hoursNum = Number(hours);
	const minutesNum = Number(minutes);
	const secondsNum = seconds !== undefined ? Number(seconds) : 0;

	return (
		hoursNum >= 0 &&
		hoursNum <= 23 &&
		minutesNum >= 0 &&
		minutesNum <= 59 &&
		secondsNum >= 0 &&
		secondsNum <= 59
	);
}

/**
 * Prüft, ob ein geparstes Date-Objekt exakt zum ursprünglichen Kalenderdatum passt.
 *
 * Verhindert das automatische Überrollen ungültiger Datumswerte, z. B.
 * `2024-02-30` zu `2024-03-01`.
 *
 * @param {Date} date - Geparstes Date-Objekt.
 * @param {{year: number, month: number, day: number}} parts - Ursprüngliche ISO-Bestandteile.
 * @returns {boolean} `true`, wenn Datum und ISO-Bestandteile übereinstimmen.
 */
function isSameCalendarDate(date, parts) {
	return (
		date.getFullYear() === parts.year &&
		date.getMonth() + 1 === parts.month &&
		date.getDate() === parts.day
	);
}

/**
 * Prüft, ob ein String ein striktes ISO-8601-Datum mit optionaler Zeitzone ist,
 * und liefert dafür ein gültiges Date-Objekt zurück.
 *
 * Akzeptierte Formate sind vollständige ISO-Daten wie `YYYY-MM-DD` sowie
 * ISO-Datumszeiten wie `YYYY-MM-DDTHH:mm:ss`, `YYYY-MM-DDTHH:mm:ssZ` oder
 * `YYYY-MM-DDTHH:mm:ss+02:00`. Unvollständige ISO-Werte wie `YYYY` oder
 * `YYYY-MM` sowie ungültige Kalender- oder Zeitwerte werden abgelehnt.
 *
 * @param {string} dateString - Zu prüfender String.
 * @returns {Date | null} Gültiges Date-Objekt oder `null`.
 */
function parseStrictIsoDate(dateString) {
	const parts = parseIsoDateParts(dateString);
	if (!parts) {
		return null;
	}

	if (!isValidTimePart(parts.timePart)) {
		return null;
	}

	const date = new Date(dateString);
	if (Number.isNaN(date.getTime())) {
		return null;
	}

	if (!isSameCalendarDate(date, parts)) {
		return null;
	}

	return date;
}

/**
 * Formatiert einen Datumsstring abhängig von der angegebenen Locale.
 *
 * Die Funktion wandelt einen Datumswert in ein `Date`-Objekt um und gibt ihn
 * mit `Intl.DateTimeFormat` formatiert zurück. Die Locale wird standardmäßig
 * aus der Umgebungsvariable `VITE_DATE_LOCALE` gelesen.
 *
 * Für den Parameter `locale` werden gültige BCP-47-Sprachcodes erwartet,
 * zum Beispiel `de-DE` für Deutsch oder `en-US` für Englisch (USA).
 * Bei `dateString = '2024-01-15'` ergibt `de-DE` die Ausgabe `15.1.2024`,
 * während `en-US` die Ausgabe `1/15/2024` liefert.
 *
 * Vollständige ISO-Daten wie `2024-01-15` oder `2024-01-15T10:00:00Z`
 * werden formatiert. Ungültige oder unvollständige Werte wie `2024`,
 * `2024-01`, `2024-02-30` oder `2024-01-15T25:00:00` werden unverändert
 * als Fallback zurückgegeben.
 *
 * @param {string} dateString - Datumsstring im ISO- oder anderweitig parsebaren Format.
 * @param {string} [locale=import.meta.env.VITE_DATE_LOCALE ?? 'de-DE'] - BCP-47-Locale für die Ausgabe, z. B. `de-DE` oder `en-US`.
 * @returns {string} Formatierter Datumsstring, Originalwert bei ungültigem oder unvollständigem Datum oder leerer String.
 */
export function formatDate(dateString, locale = import.meta.env.VITE_DATE_LOCALE ?? 'de-DE') {
	if (!dateString) return '';

	const isoDate = parseStrictIsoDate(dateString);
	if (isoDate) {
		return new Intl.DateTimeFormat(locale).format(isoDate);
	}

	const fallbackDate = new Date(dateString);
	if (Number.isNaN(fallbackDate.getTime())) return dateString;

	return new Intl.DateTimeFormat(locale).format(fallbackDate);
}
