import adapter from '@sveltejs/adapter-auto';

const config = {
	kit: {
		adapter: adapter()
	},
	compilerOptions: {
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	}
};

export default config;
