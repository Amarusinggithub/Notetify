import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Theme = 'dark' | 'light' | 'system';

type ThemeState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  if (theme === 'system') {
    const systemDark = globalThis.window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.add(systemDark ? 'dark' : 'light');
  } else {
    root.classList.add(theme);
  }
}

export const useTheme = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      setTheme: (t) => {
        set({ theme: t });
        applyTheme(t);
      },
    }),
    {
      name: 'vite-ui-theme',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // After hydration, ensure DOM reflects persisted theme
        const t = state?.theme ?? 'system';
        applyTheme(t);
      },
      partialize: (s) => ({ theme: s.theme }),
    },
  ),
);

// Apply theme immediately on first import in the browser
if (typeof globalThis.window !== 'undefined') {
  try {
    const t = (useTheme.getState().theme ) || 'system';
    applyTheme(t);
  } catch {}
}
