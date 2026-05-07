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
			},
		},
		envDir: path.resolve(__dirname, '../'),
		envPrefix: 'VITE_',
		test: {
			globals: true,
			environment: 'jsdom',
			setupFiles: ['./tests/setup.ts'],
			include: ['tests/**/*.{test,spec}.{js,ts,jsx,tsx}'],
		},
	})
);
