import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			edge: false,
			split: false
		}),
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
	}
};

export default config;
