export function formatDateGerman(dateString) {
	if (!dateString) return '';

	const date = new Date(dateString);
	if (Number.isNaN(date.getTime())) return dateString;

	return new Intl.DateTimeFormat('de-DE').format(date);
}
