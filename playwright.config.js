import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './tests/acceptance',

	timeout: 60 * 1000,

	expect: {
		timeout: 10 * 1000
	},

	// Lokal jeden Fehler sofort sichtbar machen.
	retries: process.env.CI ? 2 : 0,

	// IMPORTANT: Only 1 worker for stability
	workers: 1,
	fullyParallel: false,

	use: {
		baseURL: 'http://127.0.0.1:4173',

		// Für diesen einen Diagnose-Lauf deaktivieren.
		trace: 'off',
		screenshot: 'off',
		video: 'off',

		headless: true,

		launchOptions: {
			args: [
				'--disable-gpu',
				'--disable-dev-shm-usage',
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--disable-web-security',
				'--disable-features=IsolateOrigins,site-per-process'
			]
		}
	},

	projects: [
		{
			name: 'chromium',
			use: {
				browserName: 'chromium',
				channel: 'chrome'
			}
		}
	],

	reporter: [['line']],

	webServer: {
		command: 'npm run dev:acceptance',
		port: 4173,

		// Entscheidend: keinen alten lokalen Dev-Server mitnehmen.
		reuseExistingServer: false,

		timeout: 60 * 1000
	}
});
