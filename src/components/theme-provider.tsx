// NOTE: This file is based on the `next-themes` package, but adapted for use
// inside of the App Router and to avoid needing a client-side context provider.
// This is a server-side only file.
//
// @see https://github.com/pacocoursey/next-themes
'use client';

import * as React from 'react';

const STORAGE_KEY = 'theme';
const THEMES = ['light', 'dark', 'system'];

type Theme = 'light' | 'dark' | 'system';

type ThemeProviderState = {
  theme: string;
  setTheme: (theme: string) => void;
};

const initialState: ThemeProviderState = {
  theme: 'system',
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
  defaultTheme = 'system',
  storageKey = STORAGE_KEY,
  enableSystem = true,
  attribute = 'data-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState(() => {
    if (typeof window === 'undefined') {
      return defaultTheme;
    }
    return localStorage.getItem(storageKey) || defaultTheme;
  });

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(...root.classList);

    let effectiveTheme = theme;
    if (theme === 'system' && enableSystem) {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      effectiveTheme = systemTheme;
    }
    
    root.setAttribute(attribute, effectiveTheme);
    localStorage.setItem(storageKey, theme);
    
  }, [theme, attribute, storageKey, enableSystem]);

  const value = {
    theme,
    setTheme,
  };

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
