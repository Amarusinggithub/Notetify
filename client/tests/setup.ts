import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Polyfill ResizeObserver for JSDOM environment used by Vitest
class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
}
global.ResizeObserver = ResizeObserver;

// Mock matchMedia for theme-slice.ts
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation((query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
});

// Mock js-cookie to prevent CSRF token checks from making real requests
vi.mock('js-cookie', () => ({
	default: {
		get: vi.fn(() => 'mocked-csrf-token'),
		set: vi.fn(),
		remove: vi.fn(),
	},
}));
