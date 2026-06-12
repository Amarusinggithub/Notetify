import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		visualizer({ open: false, gzipSize: true, filename: 'dist/stats.html' }),
	],
	assetsInclude: ['**/*.lottie'],
	optimizeDeps: {
		entries: ['./index.html', './src/**/*.{ts,tsx}'],
	},
	server: {
		host: true,
		port: 5173,
		allowedHosts: ['bingolaptop.taila14742.ts.net'],
		warmup: {
			clientFiles: [
				'./src/features/landing/pages/landing.tsx',
				'./src/features/auth/pages/login.tsx',
				'./src/features/auth/pages/signup.tsx',
			],
		},
		watch: {
			usePolling: true,
			interval: 300,
		},
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@app': path.resolve(__dirname, './src/app'),
			'@features': path.resolve(__dirname, './src/features'),
			'@shared': path.resolve(__dirname, './src/shared'),
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
				manualChunks: (id) => {
					if (id.includes('@tiptap')) return 'tiptap-vendor';
					if (id.includes('@tiptap/')) return 'tiptap';
					if (id.includes('@radix-ui/')) return 'radix';
					if (id.includes('katex')) return 'katex';
				},
			},
		},
	},
});
