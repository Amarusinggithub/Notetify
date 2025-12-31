import { useStore, type StoreState } from 'stores';
import { type StateCreator } from 'zustand';

export type Theme = 'dark' | 'light' | 'system';

type ThemeSliceState = {
  theme: Theme;
};

type ThemeSliceAction = {
  setTheme: (theme: Theme) => void;
};

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  if (theme === 'system') {
    const systemDark = globalThis.window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.add(systemDark ? 'dark' : 'light');
  } else {
    root.classList.add(theme);
  }
}

export type ThemeSlice = ThemeSliceState & ThemeSliceAction;


export const createThemeSlice : StateCreator<StoreState,[],[],ThemeSlice> = (set, get) => ({
      theme: 'system',
      setTheme: (t) => {
        set({ theme: t });
        applyTheme(t);
      },
    });
  


// Apply theme immediately on first import in the browser
if (typeof globalThis.window !== 'undefined') {
  try {
    const t = (useStore.getState().theme ) || 'system';
    applyTheme(t);
  } catch {}
}
