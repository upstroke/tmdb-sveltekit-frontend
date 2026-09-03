import adapter from '@sveltejs/adapter-auto';

const config = {
	kit: {
		adapter: adapter(),
		alias: {
			'$lib': 'src/lib',
			'$lib/*': 'src/lib/*',
			'$routes': 'src/routes',
			'$tests': 'tests',
			'$tests/*': 'tests/*'
		}
	},
	compilerOptions: {
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	}
};

export default config;
