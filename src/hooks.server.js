import { randomBytes } from 'crypto';
import { DEFAULT_LOCALE } from '$lib/i18n/config';
import { resolveLocale } from '$lib/i18n/helpers';

const STORAGE_KEY = 'app-locale';

/**
 * Reads the active locale from the request.
 *
 * Priority order:
 * 1. The `locale` URL search parameter (set by the LanguageSwitcher via
 *    goto() with replaceState:true — the cookie may not yet reflect the
 *    new value when the first invalidated server fetch arrives).
 * 2. The `app-locale` session cookie (set by locale.set() in the store).
 * 3. DEFAULT_LOCALE as a safe fallback.
 *
 * @param {import('@sveltejs/kit').RequestEvent} event
 * @returns {string} BCP 47 language tag, e.g. "en-US" or "de-DE".
 */
function getLocaleFromRequest(event) {
	try {
		const urlParam = event.url.searchParams.get('locale');
		if (urlParam) {
			return resolveLocale(urlParam);
		}
		return event.cookies.get(STORAGE_KEY) ?? DEFAULT_LOCALE;
	} catch {
		return DEFAULT_LOCALE;
	}
}

/**
 * SvelteKit server hook.
 *
 * Runs on every incoming request before the response is sent to the client.
 * Used to:
 * - Set security-related HTTP response headers (CSP, etc.)
 * - Inject a per-request nonce into every <script> tag
 * - Replace the %lang% placeholder in app.html with the active locale
 *   so that <html lang="..."> always reflects the user's selected language
 *
 * @type {import('@sveltejs/kit').Handle}
 */
export async function handle({ event, resolve }) {
	// Generate a unique nonce for each request.
	// The nonce is included in the CSP header and injected into every <script> tag
	// so that only SvelteKit-managed inline scripts are allowed to execute.
	const nonce = randomBytes(16).toString('base64');

	// Determine the active locale for this request.
	const locale = getLocaleFromRequest(event);

	const response = await resolve(event, {
		// Inject the nonce attribute into all <script> tags rendered by SvelteKit
		// and replace the %lang% placeholder with the active locale so that
		// <html lang="..."> is always correct for screen readers and search engines.
		transformPageChunk: ({ html }) =>
			html.replace(/<script/g, `<script nonce="${nonce}"`).replace('%lang%', locale)
	});

	// Content Security Policy (CSP)
	// Restricts which resources the browser is allowed to load.
	// Each directive controls a specific resource type.
	response.headers.set(
		'Content-Security-Policy',
		[
			// All resource types not explicitly listed fall back to 'self' (same origin only).
			"default-src 'self'",

			// Scripts: only same-origin scripts and SvelteKit inline scripts with the current nonce.
			// unsafe-inline is intentionally omitted to prevent XSS via injected scripts.
			`script-src 'self' 'nonce-${nonce}'`,

			// Styles: unsafe-inline is required for Fomantic UI component styles.
			"style-src 'self' 'unsafe-inline'",

			// Images: same origin, TMDB poster/backdrop images, and base64 data URIs for placeholders.
			"img-src 'self' https://image.tmdb.org data:",

			// Fetch and WebSocket connections:
			// - same origin for SvelteKit API routes
			// - api.themoviedb.org for TMDB API requests
			// - ws://localhost:* for Vite HMR WebSocket in development
			"connect-src 'self' https://api.themoviedb.org ws://localhost:*",

			// Fonts: same origin only (no external font CDN used).
			"font-src 'self'",

			// Disallow plugins such as Flash or Java applets entirely.
			"object-src 'none'",

			// Prevent this page from being embedded in iframes on other origins (clickjacking defense).
			"frame-ancestors 'none'"
		].join('; ')
	);

	return response;
}
