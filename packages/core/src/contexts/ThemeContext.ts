/**
 * WheelChair Editor - Theme Context
 * 主题上下文
 */

import { createContext, useContext } from 'react';

export type Theme = 'light' | 'dark' | 'auto';

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ThemeContext.Provider;

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
