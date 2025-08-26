import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThemeProvider, useTheme } from '../ThemeContext';

// Mock localStorage for theme persistence testing
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Test component to access theme context
const TestComponent: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  
  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <div data-testid="is-dark">{isDark ? 'dark' : 'light'}</div>
      <button data-testid="toggle-theme" onClick={toggleTheme}>
        Toggle Theme
      </button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock document.documentElement.classList for DOM manipulation
    Object.defineProperty(document.documentElement, 'classList', {
      value: {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Theme Initialization', () => {
    it('should initialize with light theme by default', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('light');
    });

    it('should initialize with saved theme from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('dark');
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('dark');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('bndy-theme');
    });

    it('should apply dark class to document.documentElement on dark theme initialization', () => {
      localStorageMock.getItem.mockReturnValue('dark');
      const addClassMock = vi.fn();
      Object.defineProperty(document.documentElement, 'classList', {
        value: { add: addClassMock, remove: vi.fn(), contains: vi.fn() },
        writable: true,
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(addClassMock).toHaveBeenCalledWith('dark');
    });

    it('should remove dark class from document.documentElement on light theme initialization', () => {
      localStorageMock.getItem.mockReturnValue('light');
      const removeClassMock = vi.fn();
      Object.defineProperty(document.documentElement, 'classList', {
        value: { add: vi.fn(), remove: removeClassMock, contains: vi.fn() },
        writable: true,
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(removeClassMock).toHaveBeenCalledWith('dark');
    });
  });

  describe('Theme Switching', () => {
    it('should toggle from light to dark theme', () => {
      localStorageMock.getItem.mockReturnValue(null); // Start with default light
      const addClassMock = vi.fn();
      const removeClassMock = vi.fn();
      Object.defineProperty(document.documentElement, 'classList', {
        value: { add: addClassMock, remove: removeClassMock, contains: vi.fn() },
        writable: true,
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Initially light
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      
      // Toggle to dark
      act(() => {
        fireEvent.click(screen.getByTestId('toggle-theme'));
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('dark');
      expect(addClassMock).toHaveBeenCalledWith('dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('bndy-theme', 'dark');
    });

    it('should toggle from dark to light theme', () => {
      localStorageMock.getItem.mockReturnValue('dark'); // Start with dark
      const addClassMock = vi.fn();
      const removeClassMock = vi.fn();
      Object.defineProperty(document.documentElement, 'classList', {
        value: { add: addClassMock, remove: removeClassMock, contains: vi.fn() },
        writable: true,
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Initially dark
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      
      // Toggle to light
      act(() => {
        fireEvent.click(screen.getByTestId('toggle-theme'));
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('light');
      expect(removeClassMock).toHaveBeenCalledWith('dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('bndy-theme', 'light');
    });
  });

  describe('Theme Persistence', () => {
    it('should save theme changes to localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      act(() => {
        fireEvent.click(screen.getByTestId('toggle-theme'));
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('bndy-theme', 'dark');
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      // Should not throw and should fallback to light theme
      expect(() => {
        render(
          <ThemeProvider>
            <TestComponent />
          </ThemeProvider>
        );
      }).not.toThrow();

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });

    it('should handle invalid localStorage values gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid-theme');

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Should fallback to light theme for invalid values
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });
  });

  describe('Hook Usage', () => {
    it('should throw error when useTheme is used outside ThemeProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useTheme must be used within a ThemeProvider');
      
      consoleSpy.mockRestore();
    });
  });

  describe('CSS Variables Application', () => {
    it('should apply CSS variables to document root', () => {
      const setPropertyMock = vi.fn();
      Object.defineProperty(document.documentElement, 'style', {
        value: { setProperty: setPropertyMock },
        writable: true,
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Should set CSS variables for theme colors
      expect(setPropertyMock).toHaveBeenCalledWith('--theme-background', expect.any(String));
      expect(setPropertyMock).toHaveBeenCalledWith('--theme-foreground', expect.any(String));
    });

    it('should update CSS variables when theme changes', () => {
      const setPropertyMock = vi.fn();
      Object.defineProperty(document.documentElement, 'style', {
        value: { setProperty: setPropertyMock },
        writable: true,
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      setPropertyMock.mockClear();

      act(() => {
        fireEvent.click(screen.getByTestId('toggle-theme'));
      });

      // Should update CSS variables for new theme
      expect(setPropertyMock).toHaveBeenCalledWith('--theme-background', expect.any(String));
      expect(setPropertyMock).toHaveBeenCalledWith('--theme-foreground', expect.any(String));
    });
  });

  describe('Mobile Edge-to-Edge Support', () => {
    it('should set mobile viewport CSS variables', () => {
      const setPropertyMock = vi.fn();
      Object.defineProperty(document.documentElement, 'style', {
        value: { setProperty: setPropertyMock },
        writable: true,
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Should set mobile-specific CSS variables for edge-to-edge design
      expect(setPropertyMock).toHaveBeenCalledWith('--safe-area-inset-top', expect.any(String));
      expect(setPropertyMock).toHaveBeenCalledWith('--safe-area-inset-bottom', expect.any(String));
    });
  });

  describe('Feature Color Categories', () => {
    it('should apply feature-specific color variables', () => {
      const setPropertyMock = vi.fn();
      Object.defineProperty(document.documentElement, 'style', {
        value: { setProperty: setPropertyMock },
        writable: true,
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Should set feature category colors matching bndy-backstage
      expect(setPropertyMock).toHaveBeenCalledWith('--profile-bg', expect.any(String));
      expect(setPropertyMock).toHaveBeenCalledWith('--music-bg', expect.any(String));
      expect(setPropertyMock).toHaveBeenCalledWith('--calendar-bg', expect.any(String));
    });
  });
});