/**
 * ATKIN Theme Manager
 * Manages light, dark, and system themes with localStorage persistence.
 */

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'atkin_theme_preference';

export const getStoredTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'system';
  const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
  return saved || 'system';
};

export const applyTheme = (mode: ThemeMode) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  
  let resolved: 'light' | 'dark';
  if (mode === 'system') {
    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } else {
    resolved = mode;
  }
  
  root.setAttribute('data-theme', resolved);
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  
  localStorage.setItem(STORAGE_KEY, mode);
};

export const initTheme = () => {
  const current = getStoredTheme();
  applyTheme(current);
  
  if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (getStoredTheme() === 'system') {
        applyTheme('system');
      }
    });
  }
};
