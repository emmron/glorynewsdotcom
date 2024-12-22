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
		// Add fallback for SPA-style routing
		prerender: {
			handleHttpError: ({ path, referrer, message }) => {
				// Ignore static assets
				if (path.startsWith('/images/')) {
					return;
				}

				// Otherwise return 404 page
				if (path === '/404') {
					throw message;
				}
				return { statusCode: 404, redirect: '/404' };
			}
		}
	}
};

export default config;
