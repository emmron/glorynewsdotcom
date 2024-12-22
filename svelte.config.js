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
					return;
				}

				return { status: 404 };
			},
			entries: ['*'],
			crawl: true,
			concurrency: 1
		},
		paths: {
			base: '',
			relative: true
		},
		trailingSlash: 'always',
		version: {
			name: 'v1',
			pollInterval: 0
		},
		serviceWorker: {
			register: true
		},
		csrf: {
			checkOrigin: true
		}
	}
};

export default config;
