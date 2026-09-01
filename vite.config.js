import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const testsDir = fileURLToPath(new URL('./tests', import.meta.url));

export default defineConfig({
	plugins: [sveltekit(), svelteTesting()],
	resolve: {
		alias: {
			$tests: testsDir,
			'$lib/components/CardFeatured.svelte': fileURLToPath(
				new URL('./tests/unit/routes/_mock-card-featured.svelte', import.meta.url)
			),
			'$lib/components/CardDefault.svelte': fileURLToPath(
				new URL('./tests/unit/routes/_mock-card-default.svelte', import.meta.url)
			),
			'$lib/components/LoadMore.svelte': fileURLToPath(
				new URL('./tests/unit/routes/_mock-load-more.svelte', import.meta.url)
			),
			'$lib/components/DialogMessage.svelte': fileURLToPath(
				new URL('./tests/unit/routes/_mock-dialog-message.svelte', import.meta.url)
			)
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
