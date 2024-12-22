import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		global: {}
	},
	server: {
		fs: {
			allow: ['.']
		}
	},
	optimizeDeps: {
		exclude: ['@sveltejs/kit']
	}
});
