import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
	viteConfig,
	defineConfig({
		test: {
			globals: true,
			environment: 'jsdom',
			setupFiles: ['./tests/setup.ts'],
			include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
			css: false,
			clearMocks: true,
			restoreMocks: true,
		},
	})
);
