'use client';

import * as React from 'react';

const STORAGE_KEY = 'theme';

type ThemeProviderState = {
  theme: string;
  setTheme: (theme: string) => void;
};

const initialState: ThemeProviderState = {
  theme: 'the-verdant-grove',
  setTheme: () => null,
};

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState);

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
  enableSystem?: boolean;
  attribute?: string;
};

export function ThemeProvider({
  children,
  defaultTheme = 'the-verdant-grove',
  storageKey = STORAGE_KEY,
  enableSystem = true,
  attribute = 'data-theme',
  ...props
}: ThemeProviderProps) {
  // Always initialize with defaultTheme to guarantee identical SSR and initial client hydration
  const [theme, setTheme] = React.useState<string>(defaultTheme);

  // Sync from localStorage after client mounts to prevent hydration mismatches
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      const validThemes = ['the-verdant-grove', 'the-ember-hearth', 'the-abyssal-tide', 'system', 'light', 'dark'];
      if (stored && validThemes.includes(stored)) {
        setTheme(stored);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [storageKey]);

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(...root.classList);

    let effectiveTheme = theme;
    if (theme === 'system' && enableSystem) {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      effectiveTheme = systemTheme;
    }
    
    root.setAttribute(attribute, effectiveTheme);
    try {
      localStorage.setItem(storageKey, theme);
    } catch {
      // Ignore localStorage errors
    }
  }, [theme, attribute, storageKey, enableSystem]);

  const value = React.useMemo(() => ({
    theme,
    setTheme,
  }), [theme]);

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
