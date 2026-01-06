import { type StateCreator } from 'zustand';
import type { Language, Theme } from '../../types';
import { useStore, type StoreState } from '../index';

type ThemeSliceState = {
	theme: Theme;
	language: Language;
};

type ThemeSliceAction = {
	setTheme: (theme: Theme) => void;
	setLanguage: (language: Language) => void;
};

export function applyTheme(theme: Theme) {
	const root = document.documentElement;
	root.classList.remove('light', 'dark');
	if (theme === 'system') {
		const systemDark = globalThis.window.matchMedia(
			'(prefers-color-scheme: dark)',
		).matches;
		root.classList.add(systemDark ? 'dark' : 'light');
	} else {
		root.classList.add(theme);
	}
}

export type ThemeSlice = ThemeSliceState & ThemeSliceAction;

export const createThemeSlice: StateCreator<StoreState, [], [], ThemeSlice> = (
	set,
) => ({
	theme: 'system',
	language: 'en',
	setTheme: (t) => {
		set({ theme: t });
		applyTheme(t);
	},
	setLanguage: (l) => {
		set({ language: l });
	},
});

// Apply theme immediately on first import in the browser
if (typeof globalThis.window !== 'undefined') {
	try {
		const t = useStore.getState().theme || 'system';
		applyTheme(t);
	} catch {
		console.error('there was an error apply the theme ');
	}
}
