import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const testsDir = fileURLToPath(new URL('./tests', import.meta.url));
const srcDir = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
	plugins: [sveltekit(), svelteTesting()],
	resolve: {
		alias: {
			$tests: testsDir,
			$routes: `${srcDir}/routes`,
			$lib: `${srcDir}/lib`, // optional, falls SvelteKit es nicht automatisch setzt
			$css: `${srcDir}/css`
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
