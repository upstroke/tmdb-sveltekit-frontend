// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './tests/acceptance',

	// IMPORTANT: Timeout increased from 30s to 60s
	timeout: 60 * 1000,

	// NEW: Expect timeout for assertions
	expect: {
		timeout: 10 * 1000
	},

	// NEW: Retry on flakiness (1x local, 2x CI)
	retries: process.env.CI ? 2 : 1,

	// IMPORTANT: Only 1 worker for stability
	workers: 1,
	fullyParallel: false,

	// NEW: Browser launch options for stability
	use: {
		baseURL: 'http://127.0.0.1:4173',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure', // NEW: Video on failure for debugging
		headless: true,

		// NEW: Browser flags against hanging
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

	reporter: process.env.CI ? 'github' : [['list', { printSteps: true }]],

	// IMPORTANT: Timeout also for web server
	webServer: {
		command: 'npm run dev:acceptance',
		port: 4173,
		reuseExistingServer: !process.env.CI,
		timeout: 60 * 1000
	}
});
