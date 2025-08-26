'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Feature color categories matching bndy-backstage
const FEATURE_COLORS = {
  profile: {
    light: { bg: '#eff6ff', hover: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
    dark: { bg: '#1e3a8a', hover: '#1e40af', text: '#dbeafe', border: '#3b82f6' }
  },
  music: {
    light: { bg: '#faf5ff', hover: '#f3e8ff', text: '#7c2d92', border: '#a855f7' },
    dark: { bg: '#581c87', hover: '#7c2d92', text: '#f3e8ff', border: '#a855f7' }
  },
  calendar: {
    light: { bg: '#f0fdf4', hover: '#dcfce7', text: '#15803d', border: '#22c55e' },
    dark: { bg: '#14532d', hover: '#15803d', text: '#dcfce7', border: '#22c55e' }
  },
  media: {
    light: { bg: '#fef3c7', hover: '#fde68a', text: '#b45309', border: '#f59e0b' },
    dark: { bg: '#78350f', hover: '#b45309', text: '#fde68a', border: '#f59e0b' }
  },
  social: {
    light: { bg: '#fce7f3', hover: '#fbcfe8', text: '#be185d', border: '#ec4899' },
    dark: { bg: '#831843', hover: '#be185d', text: '#fbcfe8', border: '#ec4899' }
  },
  members: {
    light: { bg: '#e0f2fe', hover: '#bae6fd', text: '#0369a1', border: '#0ea5e9' },
    dark: { bg: '#0c4a6e', hover: '#0369a1', text: '#bae6fd', border: '#0ea5e9' }
  },
  settings: {
    light: { bg: '#f1f5f9', hover: '#e2e8f0', text: '#475569', border: '#64748b' },
    dark: { bg: '#334155', hover: '#475569', text: '#e2e8f0', border: '#64748b' }
  }
};

// Base theme colors
const THEME_COLORS = {
  light: {
    background: '#ffffff',
    foreground: '#09090b',
    card: '#ffffff',
    cardForeground: '#09090b',
    popover: '#ffffff',
    popoverForeground: '#09090b',
    primary: '#f97316',
    primaryForeground: '#fafaf9',
    secondary: '#f1f5f9',
    secondaryForeground: '#0f172a',
    muted: '#f1f5f9',
    mutedForeground: '#64748b',
    accent: '#f1f5f9',
    accentForeground: '#0f172a',
    destructive: '#ef4444',
    destructiveForeground: '#fafaf9',
    border: '#e2e8f0',
    input: '#e2e8f0',
    ring: '#f97316',
  },
  dark: {
    background: '#0f172a',
    foreground: '#f8fafc',
    card: '#1e293b',
    cardForeground: '#f8fafc',
    popover: '#1e293b',
    popoverForeground: '#f8fafc',
    primary: '#f97316',
    primaryForeground: '#0f172a',
    secondary: '#1e293b',
    secondaryForeground: '#f8fafc',
    muted: '#1e293b',
    mutedForeground: '#94a3b8',
    accent: '#1e293b',
    accentForeground: '#f8fafc',
    destructive: '#ef4444',
    destructiveForeground: '#f8fafc',
    border: '#334155',
    input: '#334155',
    ring: '#f97316',
  }
};

// Apply CSS variables to document root
const applyCSSVariables = (theme: Theme) => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    const colors = THEME_COLORS[theme];
    
    // Apply base theme colors
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
    });
    
    // Apply feature colors
    Object.entries(FEATURE_COLORS).forEach(([feature, colorSet]) => {
      const colors = colorSet[theme];
      Object.entries(colors).forEach(([property, value]) => {
        root.style.setProperty(`--${feature}-${property}`, value);
      });
    });
    
    // Apply mobile edge-to-edge variables
    root.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top, 0px)');
    root.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom, 0px)');
    root.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left, 0px)');
    root.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right, 0px)');
    
    // Apply mobile viewport variables for edge-to-edge design
    root.style.setProperty('--viewport-height', '100dvh');
    root.style.setProperty('--content-height', 'calc(100dvh - var(--safe-area-inset-top) - var(--safe-area-inset-bottom))');
  }
};

// Get theme from localStorage with error handling
const getStoredTheme = (): Theme => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('bndy-theme');
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    }
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error);
  }
  return 'light';
};

// Save theme to localStorage with error handling
const saveTheme = (theme: Theme) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bndy-theme', theme);
    }
  } catch (error) {
    console.warn('Failed to save theme to localStorage:', error);
  }
};

// Apply theme to document element
const applyThemeToDocument = (theme: Theme) => {
  if (typeof document !== 'undefined') {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    applyCSSVariables(theme);
  }
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme());

  useEffect(() => {
    // Apply theme on mount and when theme changes
    applyThemeToDocument(theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    saveTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};