import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		env: {
			dir: process.cwd()
		},
		prerender: {
			handleHttpError: ({ path, referrer, message }) => {
				if (path.startsWith('/images/')) {
					return;
				}
				if (path === '/404') {
					throw message;
				}
				return { statusCode: 404, redirect: '/404' };
			},
			entries: ['*']
		},
		paths: {
			base: ''
		}
	},
	preprocess: vitePreprocess()
};

export default config;
