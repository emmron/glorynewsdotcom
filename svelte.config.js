import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			// if true, will create a Netlify Edge Function rather
			// than using standard Node-based functions
			edge: false,

			// if true, will split your app into multiple functions
			// instead of creating a single one for the entire app
			split: false
		}),
		// Configure prerendering for SPA-style routing and Netlify Forms support
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
			},
			// Enable prerendering for Netlify Forms support
			entries: ['*']
		},
		// Ensure homepage is properly rendered
		paths: {
			base: ''
		}
	}
};

export default config;
