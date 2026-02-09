import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	assetsInclude: ['**/*.lottie'],
	server: {
		host: true,
		port: 5173,
		allowedHosts: ['bingolaptop.taila14742.ts.net'],
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	envDir: path.resolve(__dirname, '../'),
	envPrefix: 'VITE_',
	preview: {
		port: 3000,
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					tiptap: ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/core'],
					liveblocks: ['@liveblocks/react', '@liveblocks/client'],
					radix: [
						'@radix-ui/react-dialog',
						'@radix-ui/react-dropdown-menu' ,
					],
					katex: ['katex'],
				},
			},
		},
	},
});

