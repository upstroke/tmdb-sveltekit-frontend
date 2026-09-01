import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const testsDir = fileURLToPath(new URL('./tests', import.meta.url));

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: {
			$tests: testsDir
		}
	},
	test: {
		pool: 'threads',
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./vitest.setup.js'],
		include: ['tests/**/*.test.js'],
		exclude: [
			'**/node_modules/**',
			'**/dist/**',
			'**/.svelte-kit/**',
			'**/coverage/**',
			'**/playwright-report/**',
			'**/test-results/**',
			'tests/acceptance/**'
		],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			reportsDirectory: './coverage',
			include: ['src/**/*.{js,svelte}'],
			exclude: ['node_modules', 'src/lib/test-utils/**', '**/*.spec.js', '**/*.test.js']
		}
	}
});
