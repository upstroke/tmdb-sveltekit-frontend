import { defineConfig } from '@playwright/test';

export default defineConfig({
	reporter: process.env.CI ? 'github' : [['list', { printSteps: true }]],

	// Reduce output verbosity
	forbidOnly: true,
	quiet: false,

	// Sequential execution (no parallel workers)
	workers: 1,

	testDir: './tests/acceptance',
	timeout: 30 * 1000,

	use: {
		baseURL: 'http://127.0.0.1:4173',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		headless: true
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

	webServer: {
		command: 'npm run dev:acceptance',
		port: 4173,
		reuseExistingServer: !process.env.CI,
		timeout: 60 * 1000
	}
});
