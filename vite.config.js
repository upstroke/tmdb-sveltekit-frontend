import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-auto';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
			// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
			// See https://svelte.dev/docs/kit/adapters for more information about adapters.
			adapter: adapter()
		})
	],
	test: {
		globals: true,
		// Tests in components/, utils/, stores/ und routes/
		include: [
			'src/lib/components/**/*.{test,spec}.js',
			'src/lib/utils/**/*.{test,spec}.js',
			'src/lib/stores/**/*.{test,spec}.js',
			'src/routes/**/*.{test,spec}.js'
		],
		// E2E-Tests ausschließen
		exclude: [
			'**/node_modules/**',
			'**/dist/**',
			'**/e2e/**',
			'**/*.e2e.spec.js'
		],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			include: ['src/**/*.{js,svelte}'],
			exclude: [
				'node_modules',
				'src/lib/test-utils/**',
				'**/*.spec.js',
				'**/*.test.js'
			]
		}
	}
});