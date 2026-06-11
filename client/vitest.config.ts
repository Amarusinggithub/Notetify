import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
	viteConfig,
	defineConfig({
		plugins: [react()],
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
		test: {
			globals: true,
			environment: 'jsdom',
			setupFiles: ['./tests/setup.ts'],
			include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
		},
	})
);
