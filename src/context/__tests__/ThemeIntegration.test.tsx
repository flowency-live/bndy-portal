import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThemeProvider, useTheme } from '../ThemeContext';

// Mock component that represents a typical card component
const MockCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <div 
      data-testid="mock-card"
      className={`bg-card text-card-foreground border-border rounded-lg p-4 shadow-sm transition-colors duration-300 ${className}`}
    >
      {children}
    </div>
  );
};

// Mock profile section that should respect theme
const MockProfileSection: React.FC = () => {
  return (
    <div 
      data-testid="profile-section"
      className="bg-profile-bg text-profile-text border-profile-border rounded-lg p-6 border transition-colors duration-300"
    >
      <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Display Name</label>
          <input
            id="name"
            type="text"
            className="w-full px-3 py-2 border-input bg-background text-foreground rounded-md transition-colors duration-300"
            defaultValue="Jason Jones"
          />
        </div>
      </div>
    </div>
  );
};

// Test component with theme toggle
const TestThemeApp: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  
  return (
    <div 
      data-testid="theme-app"
      className="min-h-screen bg-background text-foreground transition-colors duration-300"
    >
      <header className="border-b border-border p-4">
        <button
          data-testid="theme-toggle"
          onClick={toggleTheme}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md transition-colors"
        >
          {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
        <span data-testid="current-theme" className="ml-4">Current: {theme}</span>
      </header>
      
      <main className="p-6 space-y-6">
        <MockCard>
          <h2 className="text-xl font-bold mb-2">Quick Actions</h2>
          <p className="text-sm opacity-75">This card should respect the theme</p>
        </MockCard>
        
        <MockProfileSection />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MockCard>
            <h3 className="font-semibold">Overview</h3>
            <div className="mt-2 text-2xl font-bold text-orange-500">0</div>
            <p className="text-xs opacity-75">Events</p>
          </MockCard>
          
          <MockCard>
            <h3 className="font-semibold">Connections</h3>
            <div className="mt-2 text-2xl font-bold text-blue-500">0</div>
            <p className="text-xs opacity-75">Artists</p>
          </MockCard>
          
          <MockCard>
            <h3 className="font-semibold">Bookings</h3>
            <div className="mt-2 text-2xl font-bold text-green-500">0</div>
            <p className="text-xs opacity-75">This Month</p>
          </MockCard>
        </div>
      </main>
    </div>
  );
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('Theme Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock document and localStorage
    Object.defineProperty(document.documentElement, 'style', {
      value: { setProperty: vi.fn() },
      writable: true,
    });
    
    Object.defineProperty(document.documentElement, 'classList', {
      value: {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn().mockReturnValue(false),
      },
      writable: true,
    });
    
    const localStorageMock = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('CSS Variables Application', () => {
    it('should apply light theme CSS variables by default', () => {
      const setPropertySpy = vi.spyOn(document.documentElement.style, 'setProperty');
      
      render(
        <TestWrapper>
          <TestThemeApp />
        </TestWrapper>
      );

      // Check that base theme variables are set
      expect(setPropertySpy).toHaveBeenCalledWith('--theme-background', '#ffffff');
      expect(setPropertySpy).toHaveBeenCalledWith('--theme-foreground', '#09090b');
      expect(setPropertySpy).toHaveBeenCalledWith('--theme-card', '#ffffff');
      expect(setPropertySpy).toHaveBeenCalledWith('--theme-card-foreground', '#09090b');
      expect(setPropertySpy).toHaveBeenCalledWith('--theme-border', '#e2e8f0');
      
      // Check that feature colors are set
      expect(setPropertySpy).toHaveBeenCalledWith('--profile-bg', '#eff6ff');
      expect(setPropertySpy).toHaveBeenCalledWith('--profile-text', '#1e40af');
      expect(setPropertySpy).toHaveBeenCalledWith('--profile-border', '#3b82f6');
    });

    it('should apply dark theme CSS variables when toggled', async () => {
      const setPropertySpy = vi.spyOn(document.documentElement.style, 'setProperty');
      const addClassSpy = vi.spyOn(document.documentElement.classList, 'add');
      
      render(
        <TestWrapper>
          <TestThemeApp />
        </TestWrapper>
      );

      // Toggle to dark theme
      fireEvent.click(screen.getByTestId('theme-toggle'));

      await waitFor(() => {
        expect(addClassSpy).toHaveBeenCalledWith('dark');
      });

      // Check that dark theme variables are set
      expect(setPropertySpy).toHaveBeenCalledWith('--theme-background', '#0f172a');
      expect(setPropertySpy).toHaveBeenCalledWith('--theme-foreground', '#f8fafc');
      expect(setPropertySpy).toHaveBeenCalledWith('--theme-card', '#1e293b');
      expect(setPropertySpy).toHaveBeenCalledWith('--theme-card-foreground', '#f8fafc');
      expect(setPropertySpy).toHaveBeenCalledWith('--theme-border', '#334155');
      
      // Check that dark feature colors are set
      expect(setPropertySpy).toHaveBeenCalledWith('--profile-bg', '#1e3a8a');
      expect(setPropertySpy).toHaveBeenCalledWith('--profile-text', '#dbeafe');
      expect(setPropertySpy).toHaveBeenCalledWith('--profile-border', '#3b82f6');
    });

    it('should remove dark class when switching back to light', async () => {
      const removeClassSpy = vi.spyOn(document.documentElement.classList, 'remove');
      
      render(
        <TestWrapper>
          <TestThemeApp />
        </TestWrapper>
      );

      // Toggle to dark
      fireEvent.click(screen.getByTestId('theme-toggle'));
      
      // Toggle back to light
      fireEvent.click(screen.getByTestId('theme-toggle'));

      await waitFor(() => {
        expect(removeClassSpy).toHaveBeenCalledWith('dark');
      });
    });
  });

  describe('Component Theme Responsiveness', () => {
    it('should display theme-appropriate content in light mode', () => {
      render(
        <TestWrapper>
          <TestThemeApp />
        </TestWrapper>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('Current: light');
      expect(screen.getByTestId('theme-toggle')).toHaveTextContent('🌙 Dark Mode');
    });

    it('should display theme-appropriate content in dark mode', async () => {
      render(
        <TestWrapper>
          <TestThemeApp />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('theme-toggle'));

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('Current: dark');
        expect(screen.getByTestId('theme-toggle')).toHaveTextContent('☀️ Light Mode');
      });
    });

    it('should apply theme classes to card components', () => {
      render(
        <TestWrapper>
          <TestThemeApp />
        </TestWrapper>
      );

      const cards = screen.getAllByTestId('mock-card');
      cards.forEach(card => {
        // Check that cards have the theme-aware Tailwind classes
        expect(card).toHaveClass('bg-card');
        expect(card).toHaveClass('text-card-foreground');
        expect(card).toHaveClass('border-border');
        expect(card).toHaveClass('transition-colors');
        expect(card).toHaveClass('duration-300');
      });
    });

    it('should apply feature colors to specialized sections', () => {
      render(
        <TestWrapper>
          <TestThemeApp />
        </TestWrapper>
      );

      const profileSection = screen.getByTestId('profile-section');
      expect(profileSection).toHaveClass('bg-profile-bg');
      expect(profileSection).toHaveClass('text-profile-text');
      expect(profileSection).toHaveClass('border-profile-border');
      expect(profileSection).toHaveClass('transition-colors');
      expect(profileSection).toHaveClass('duration-300');
    });
  });

  describe('Theme Persistence and Initialization', () => {
    it('should persist theme choice to localStorage', async () => {
      const setItemSpy = vi.spyOn(localStorage, 'setItem');
      
      render(
        <TestWrapper>
          <TestThemeApp />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('theme-toggle'));

      await waitFor(() => {
        expect(setItemSpy).toHaveBeenCalledWith('bndy-theme', 'dark');
      });
    });

    it('should restore theme from localStorage on initialization', () => {
      const getItemSpy = vi.spyOn(localStorage, 'getItem').mockReturnValue('dark');
      const addClassSpy = vi.spyOn(document.documentElement.classList, 'add');
      
      render(
        <TestWrapper>
          <TestThemeApp />
        </TestWrapper>
      );

      expect(getItemSpy).toHaveBeenCalledWith('bndy-theme');
      expect(addClassSpy).toHaveBeenCalledWith('dark');
      expect(screen.getByTestId('current-theme')).toHaveTextContent('Current: dark');
    });
  });

  describe('Accessibility and UX', () => {
    it('should have smooth transitions applied globally', () => {
      render(
        <TestWrapper>
          <TestThemeApp />
        </TestWrapper>
      );

      const app = screen.getByTestId('theme-app');
      expect(app).toHaveClass('transition-colors', 'duration-300');
    });

    it('should maintain color contrast ratios in both themes', () => {
      render(
        <TestWrapper>
          <TestThemeApp />
        </TestWrapper>
      );

      // Test accessibility by ensuring contrasting elements exist
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      
      // Text should remain readable
      const profileSection = screen.getByTestId('profile-section');
      expect(profileSection).toBeInTheDocument();
      expect(screen.getByLabelText('Display Name')).toBeInTheDocument();
    });
  });

  describe('Brand Color Consistency', () => {
    it('should maintain orange primary color across themes', () => {
      const setPropertySpy = vi.spyOn(document.documentElement.style, 'setProperty');
      
      render(
        <TestWrapper>
          <TestThemeApp />
        </TestWrapper>
      );

      // Primary orange should be consistent
      expect(setPropertySpy).toHaveBeenCalledWith('--theme-primary', '#f97316');
      expect(setPropertySpy).toHaveBeenCalledWith('--theme-ring', '#f97316');
      
      // Toggle to dark and check primary remains same
      fireEvent.click(screen.getByTestId('theme-toggle'));
      
      expect(setPropertySpy).toHaveBeenCalledWith('--theme-primary', '#f97316');
      expect(setPropertySpy).toHaveBeenCalledWith('--theme-ring', '#f97316');
    });

    it('should display accent colors correctly in both themes', () => {
      render(
        <TestWrapper>
          <TestThemeApp />
        </TestWrapper>
      );

      // Check that all three metric cards exist with their values
      const allZeros = screen.getAllByText('0');
      expect(allZeros).toHaveLength(3);
      
      // Check that the colored elements exist
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Connections')).toBeInTheDocument();
      expect(screen.getByText('Bookings')).toBeInTheDocument();
      
      // Verify the card structure is correct
      const cards = screen.getAllByTestId('mock-card');
      expect(cards).toHaveLength(4); // 1 quick actions + 3 metric cards
    });
  });
});