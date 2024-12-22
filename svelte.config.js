import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			edge: true, // Enable edge functions for better performance
			split: true // Split the app into smaller chunks
		}),
		prerender: {
			handleHttpError: ({ path, referrer, message }) => {
				// Handle more error cases
				if (path.startsWith('/images/') || path.startsWith('/assets/')) {
					return;
				}

				if (path === '/404' || path === '/500') {
					return;
				}

				console.error(`Prerender error: ${message}`);
				return { status: 404 };
			},
			entries: ['*'],
			crawl: true,
			concurrency: 4 // Increase concurrency for faster builds
		},
		paths: {
			base: process.env.BASE_PATH || '', // Support configurable base path
			relative: true
		},
		version: {
			name: process.env.VERSION || 'v1',
			pollInterval: 60000 // Check for updates every minute
		},
		serviceWorker: {
			register: true,
			files: (filepath) => !/\.DS_Store/.test(filepath) // Exclude system files
		},
		csrf: {
			checkOrigin: true
		},
		csp: {
			mode: 'auto',
			directives: {
				'script-src': ['self']
			}
		},
		alias: {
			$components: 'src/components',
			$lib: 'src/lib'
		}
	}
};

export default config;
