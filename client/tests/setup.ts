import '@testing-library/jest-dom';

// Polyfill ResizeObserver for JSDOM environment used by Vitest
class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
}
// @ts-ignore
global.ResizeObserver = ResizeObserver;
