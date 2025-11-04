import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		global: {}
	},
	server: {
		fs: {
			allow: ['.']
		}
	}
});
