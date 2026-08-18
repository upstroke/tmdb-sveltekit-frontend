import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-auto';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Erzwingt den Runes-Modus im Projekt.
				// Dateien aus node_modules sind davon ausgenommen.
				// Der Hinweis kann voraussichtlich mit Svelte 6 entfallen.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// adapter-auto wählt automatisch einen passenden Adapter
			// für unterstützte Zielumgebungen aus.
			// Wenn du später gezielt auf eine bestimmte Plattform deployen willst,
			// kannst du hier auf einen konkreten Adapter wechseln.
			adapter: adapter()
		})
	],
	test: {
		// Stellt Vitest-Globale wie describe, it und expect
		// ohne zusätzliche Imports bereit.
		globals: true,

		// jsdom simuliert eine Browser-Umgebung.
		// Das ist wichtig für Svelte-Komponenten sowie für Tests,
		// die mit DOM, Events oder Rendering arbeiten.
		environment: 'jsdom',

		// Lädt eine zentrale Setup-Datei vor den Tests.
		// Dort werden zusätzliche Matcher und Test-Helfer registriert.
		setupFiles: ['./vitest.setup.js'],

		// Hier werden nur die Tests eingebunden,
		// die bewusst für Vitest vorgesehen sind.
		// So bleibt die Trennung zu Playwright sauber.
		include: [
			'tests/components/**/*.test.js',
			'tests/integration/**/*.test.js',
			'tests/unit/**/*.test.js'
		],

		// Diese Pfade werden von Vitest ignoriert.
		// Besonders wichtig: Acceptance-Tests laufen separat mit Playwright
		// und dürfen hier nicht mit eingesammelt werden.
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
			// Nutzt die V8-Coverage-Engine.
			provider: 'v8',

			// Erstellt Coverage-Ausgaben für Konsole, JSON und HTML-Report.
			reporter: ['text', 'json', 'html'],

			// Enthält die von Vitest erzeugten Coverage-Berichte.
			reportsDirectory: './coverage',

			// Gemessen wird der eigentliche Anwendungs-Code unter src.
			include: ['src/**/*.{js,svelte}'],

			// Testdateien und Hilfsdateien sollen nicht
			// in die Coverage-Berechnung einfließen.
			exclude: [
				'node_modules',
				'src/lib/test-utils/**',
				'**/*.spec.js',
				'**/*.test.js'
			]
		}
	}
});
