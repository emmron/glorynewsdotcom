import { defineConfig } from 'vite';

export default defineConfig({
	define: {
		global: {}
	},
	server: {
		fs: {
			allow: ['.']
		}
	}
});
