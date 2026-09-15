import { cleanup } from '@testing-library/svelte';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ui = JSON.parse(readFileSync(path.resolve(process.cwd(), 'src/lib/i18n/ui.json'), 'utf8'));

/**
 * Returns the UI texts for tests in a Node-compatible way.
 *
 * The helper reads `ui.json` directly from the file system so test code
 * can access locale texts without relying on the app resolver or browser-side
 * JSON imports. Unknown locales fall back to `en-US`.
 *
 * @param {string} [locale='en-US'] - Locale whose UI texts should be returned.
 * @returns {{
 *   languageCode?: string,
 *   labels: Record<string, string>,
 *   messages: Record<string, string>,
 *   titles: Record<string, string>,
 *   buttons: Record<string, string>,
 *   formats: Record<string, string>,
 *   fallbacks: Record<string, string>
 * }} Locale-specific UI text set for tests.
 */
export function getTestLocaleText(locale = 'en-US') {
	return ui.locales[locale] ?? ui.locales['en-US'];
}


/**
 * Cleanup function for afterEach
 *
 * Executes all necessary cleanup operations:
 * - @testing-library/svelte: cleanup()
 */
export const cleanupAll = () => {
	cleanup();
};

/**
 * Reset function for beforeEach
 *
 * Executes all necessary reset operations:
 * - vitest: clearAllMocks()
 */
export const resetAll = () => {
	vi.clearAllMocks();
};
