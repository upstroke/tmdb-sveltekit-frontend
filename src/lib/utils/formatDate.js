/**
 * Checks whether a value consists exclusively of digits and optionally has a fixed length.
 *
 * @param {string} value - String to check.
 * @param {number} [expectedLength] - Expected length.
 * @returns {boolean} `true` if the value consists only of digits and the length matches.
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
 * Splits an ISO date string into date and optional time components.
 *
 * Only accepts complete ISO dates in the format `YYYY-MM-DD` with optional
 * time component. Incomplete values like `YYYY` or `YYYY-MM` are discarded.
 *
 * @param {string} dateString - String to check.
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
 * Checks whether an optional ISO time component has a valid structure.
 *
 * Supports formats like `HH:mm`, `HH:mm:ss`, `HH:mm:ss.SSS`, each optionally
 * with `Z` or offset like `+02:00`.
 *
 * @param {string | undefined} timePart - Time component of the ISO string.
 * @returns {boolean} `true` if the time component is valid.
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

	if (
		!isDigits(hours, 2) ||
		!isDigits(minutes, 2) ||
		(seconds !== undefined && !isDigits(seconds, 2))
	) {
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
 * Checks whether a parsed Date object exactly matches the original calendar date.
 *
 * Prevents automatic rolling of invalid date values, e.g.
 * `2024-02-30` to `2024-03-01`.
 *
 * @param {Date} date - Parsed Date object.
 * @param {{year: number, month: number, day: number}} parts - Original ISO components.
 * @returns {boolean} `true` if date and ISO components match.
 */
function isSameCalendarDate(date, parts) {
	return (
		date.getFullYear() === parts.year &&
		date.getMonth() + 1 === parts.month &&
		date.getDate() === parts.day
	);
}

/**
 * Checks whether a string is a strict ISO 8601 date with optional timezone,
 * and returns a valid Date object for it.
 *
 * Accepted formats are complete ISO dates like `YYYY-MM-DD` as well as
 * ISO date-times like `YYYY-MM-DDTHH:mm:ss`, `YYYY-MM-DDTHH:mm:ssZ`, or
 * `YYYY-MM-DDTHH:mm:ss+02:00`. Incomplete ISO values like `YYYY` or
 * `YYYY-MM` as well as invalid calendar or time values are rejected.
 *
 * @param {string} dateString - String to check.
 * @returns {Date | null} Valid Date object or `null`.
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
 * Formats a date string depending on the specified locale.
 *
 * The function converts a date value to a `Date` object and returns it
 * formatted using `Intl.DateTimeFormat`. The locale is by default read
 * from the environment variable `VITE_DEFAULT_LOCALE`.
 *
 * Valid BCP 47 language codes are expected for the `locale` parameter,
 * for example `de-DE` for German or `en-US` for English (USA).
 * For `dateString = '2024-01-15'`, `de-DE` yields the output `15.1.2024`,
 * while `en-US` yields the output `1/15/2024`.
 *
 * Complete ISO dates like `2024-01-15` or `2024-01-15T10:00:00Z`
 * are formatted. Invalid or incomplete values like `2024`,
 * `2024-01`, `2024-02-30`, or `2024-01-15T25:00:00` are returned
 * unchanged as fallback.
 *
 * @param {string} dateString - Date string in ISO or otherwise parseable format.
 * @param {string} [locale=import.meta.env.VITE_DEFAULT_LOCALE ?? 'de-DE'] - BCP 47 locale for output, e.g. `de-DE` or `en-US`.
 * @returns {string} Formatted date string, original value for invalid or incomplete date, or empty string.
 */
export function formatDate(dateString, locale = import.meta.env.VITE_DEFAULT_LOCALE ?? 'de-DE') {
	if (!dateString) return '';

	const isoDate = parseStrictIsoDate(dateString);
	if (isoDate) {
		return new Intl.DateTimeFormat(locale).format(isoDate);
	}

	const fallbackDate = new Date(dateString);
	if (Number.isNaN(fallbackDate.getTime())) return dateString;

	return new Intl.DateTimeFormat(locale).format(fallbackDate);
}
