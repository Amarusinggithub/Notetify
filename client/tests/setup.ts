import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Polyfill ResizeObserver for JSDOM environment used by Vitest
class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
}
// @ts-ignore
global.ResizeObserver = ResizeObserver;

// Mock js-cookie to prevent CSRF token checks from making real requests
vi.mock('js-cookie', () => ({
	default: {
		get: vi.fn(() => 'mocked-csrf-token'),
		set: vi.fn(),
		remove: vi.fn(),
	},
}));
