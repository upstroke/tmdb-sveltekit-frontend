/**
 * Entfernt das HTTP- oder HTTPS-Protokoll aus einer Homepage-URL für die kompakte Anzeige.
 *
 * @param {string} [url=''] - Vollständige oder bereits gekürzte URL.
 * @returns {string} URL ohne führendes Protokoll.
 */
export function formatHomepageLabel(url = '') {
	return url.replace(/^https?:\/\//, '');
}
