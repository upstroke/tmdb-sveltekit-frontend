import { randomBytes } from 'crypto';

/**
 * SvelteKit server hook.
 *
 * Runs on every incoming request before the response is sent to the client.
 * Currently used to set security-related HTTP response headers.
 *
 * @type {import('@sveltejs/kit').Handle}
 */
export async function handle({ event, resolve }) {
	// Generate a unique nonce for each request.
	// The nonce is included in the CSP header and injected into every <script> tag
	// so that only SvelteKit-managed inline scripts are allowed to execute.
	const nonce = randomBytes(16).toString('base64');

	const response = await resolve(event, {
		// Inject the nonce attribute into all <script> tags rendered by SvelteKit.
		// This is required for the script-src nonce directive to work correctly.
		transformPageChunk: ({ html }) => html.replace(/<script/g, `<script nonce="${nonce}"`)
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
