import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			runtime: 'nodejs22.x',
			regions: ['syd1'],
			split: false,
		}),
		alias: {
			$lib: 'src/lib'
		}
	},
	preprocess: vitePreprocess()
};

export default config;
