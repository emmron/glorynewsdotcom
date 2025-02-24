import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		adapter: adapter({
			runtime: 'nodejs18.x',
			regions: ['iad1'],
			split: true,
		}),
		alias: {
			$lib: 'src/lib'
		}
	},
	preprocess: vitePreprocess()
};

export default config;
