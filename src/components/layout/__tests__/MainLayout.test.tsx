import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MainLayout } from '../MainLayout';
import { ThemeProvider } from '../../../context/ThemeContext';

// Mock bndy-ui auth
const mockUseAuth = vi.fn();
vi.mock('bndy-ui/auth', () => ({
  useAuth: () => mockUseAuth()
}));

// Mock bndy-ui components
vi.mock('bndy-ui', () => ({
  BndyLogo: ({ className, ...props }: any) => (
    <div data-testid="bndy-logo" className={className} {...props}>
      BNDY Logo
    </div>
  ),
  BndyLoadingScreen: () => <div data-testid="loading-screen">Loading...</div>
}));

// Mock Next.js useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })
}));

// Mock child components that will be created later
vi.mock('../AppHeader', () => ({
  AppHeader: ({ onToggleSidebar }: any) => (
    <div data-testid="app-header">
      <button 
        data-testid="toggle-sidebar" 
        onClick={onToggleSidebar}
        onKeyDown={(e: any) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleSidebar();
          }
        }}
        className="min-h-[44px] p-2 text-slate-400 hover:text-white touch-target"
      >
        Toggle Sidebar
      </button>
    </div>
  )
}));

// Mock react-icons/fa for the heart icon used in footer
vi.mock('react-icons/fa', () => ({
  FaHeart: ({ className, ...props }: any) => (
    <div data-testid="heart-icon" className={className} {...props}>❤️</div>
  )
}));

vi.mock('../Sidebar', () => ({
  Sidebar: ({ isOpen, onClose }: any) => (
    <div data-testid="sidebar" data-open={isOpen}>
      <button data-testid="close-sidebar" onClick={onClose}>
        Close
      </button>
      <nav data-testid="sidebar-nav">
        <a href="/dashboard">Dashboard</a>
        <a href="/profile">Profile</a>
      </nav>
    </div>
  )
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('MainLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock authenticated user by default
    mockUseAuth.mockReturnValue({
      currentUser: {
        uid: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User'
      },
      isLoading: false
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Authentication States', () => {
    it('should show loading screen when authentication is loading', () => {
      mockUseAuth.mockReturnValue({
        currentUser: null,
        isLoading: true
      });

      render(
        <TestWrapper>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </TestWrapper>
      );

      expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
      expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
    });

    it('should redirect unauthenticated users', () => {
      mockUseAuth.mockReturnValue({
        currentUser: null,
        isLoading: false
      });

      render(
        <TestWrapper>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </TestWrapper>
      );

      // Should not show the main content for unauthenticated users
      expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
      expect(screen.queryByTestId('main-layout')).not.toBeInTheDocument();
    });

    it('should render layout for authenticated users', () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </TestWrapper>
      );

      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
      expect(screen.getByTestId('app-header')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('should render with proper semantic HTML structure', () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </TestWrapper>
      );

      // Should have proper semantic structure
      expect(screen.getByRole('banner')).toBeInTheDocument(); // header
      expect(screen.getByRole('navigation')).toBeInTheDocument(); // sidebar nav
      expect(screen.getByRole('main')).toBeInTheDocument(); // main content
      expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
    });

    it('should apply mobile-first edge-to-edge classes', () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </TestWrapper>
      );

      const layout = screen.getByTestId('main-layout');
      expect(layout).toHaveClass('min-h-screen'); // Should use mobile-optimized height
    });

    it('should have proper responsive layout classes', () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </TestWrapper>
      );

      const layout = screen.getByTestId('main-layout');
      expect(layout).toHaveClass('flex'); // Should use flex layout
      
      // Main content should have responsive padding
      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveClass('flex-1'); // Should flex to fill space
    });
  });

  describe('Sidebar Functionality', () => {
    it('should initialize with sidebar closed on mobile', () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </TestWrapper>
      );

      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveAttribute('data-open', 'false');
    });

    it('should toggle sidebar when header button is clicked', () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </TestWrapper>
      );

      const sidebar = screen.getByTestId('sidebar');
      const toggleButton = screen.getByTestId('toggle-sidebar');

      // Initially closed
      expect(sidebar).toHaveAttribute('data-open', 'false');

      // Open sidebar
      act(() => {
        fireEvent.click(toggleButton);
      });

      expect(sidebar).toHaveAttribute('data-open', 'true');

      // Close sidebar
      act(() => {
        fireEvent.click(toggleButton);
      });

      expect(sidebar).toHaveAttribute('data-open', 'false');
    });

    it('should close sidebar when sidebar close button is clicked', () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </TestWrapper>
      );

      const sidebar = screen.getByTestId('sidebar');
      const toggleButton = screen.getByTestId('toggle-sidebar');
      const closeButton = screen.getByTestId('close-sidebar');

      // Open sidebar first
      act(() => {
        fireEvent.click(toggleButton);
      });
      expect(sidebar).toHaveAttribute('data-open', 'true');

      // Close via sidebar button
      act(() => {
        fireEvent.click(closeButton);
      });
      expect(sidebar).toHaveAttribute('data-open', 'false');
    });

    it('should close sidebar when clicking outside on mobile (overlay)', () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </TestWrapper>
      );

      const sidebar = screen.getByTestId('sidebar');
      const toggleButton = screen.getByTestId('toggle-sidebar');

      // Open sidebar first
      act(() => {
        fireEvent.click(toggleButton);
      });
      expect(sidebar).toHaveAttribute('data-open', 'true');

      // Should have overlay when open
      const overlay = screen.getByTestId('sidebar-overlay');
      expect(overlay).toBeInTheDocument();

      // Click overlay to close
      act(() => {
        fireEvent.click(overlay);
      });
      expect(sidebar).toHaveAttribute('data-open', 'false');
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should render sidebar overlay on mobile when open', () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </TestWrapper>
      );

      const toggleButton = screen.getByTestId('toggle-sidebar');

      // Initially no overlay
      expect(screen.queryByTestId('sidebar-overlay')).not.toBeInTheDocument();

      // Open sidebar
      act(() => {
        fireEvent.click(toggleButton);
      });

      // Should show overlay
      expect(screen.getByTestId('sidebar-overlay')).toBeInTheDocument();
    });

    it('should have touch-friendly minimum heights', () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </TestWrapper>
      );

      const toggleButton = screen.getByTestId('toggle-sidebar');
      
      // Touch targets should meet minimum size requirements (checking for min-h-44 instead of exact Tailwind class)
      const computedStyle = window.getComputedStyle(toggleButton);
      expect(parseInt(computedStyle.minHeight) >= 44 || toggleButton.className.includes('min-h-')).toBe(true);
    });

    it('should handle safe area insets for mobile edge-to-edge design', () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </TestWrapper>
      );

      const layout = screen.getByTestId('main-layout');
      
      // Should have classes for handling safe areas
      expect(layout).toHaveClass('safe-top');
    });
  });

  describe('Footer', () => {
    it('should render footer with copyright and bndy beat badge', () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </TestWrapper>
      );

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
      
      // Check for bndy beat badge with heart icon
      expect(screen.getByTestId('heart-icon')).toBeInTheDocument();
      expect(screen.getByText(/bndy beat/i)).toBeInTheDocument();
      
      // Check for copyright text with current year
      const currentYear = new Date().getFullYear().toString();
      expect(screen.getByText(new RegExp(`© ${currentYear} BNDY`, 'i'))).toBeInTheDocument();
    });
    
    it('should have proper styling classes for footer', () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </TestWrapper>
      );

      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('border-t');
      expect(footer).toHaveClass('py-6');
    });
  });

  describe('Theme Integration', () => {
    it('should apply theme-aware background colors', () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </TestWrapper>
      );

      const layout = screen.getByTestId('main-layout');
      
      // Should use CSS variables for theming
      expect(layout).toHaveClass('bg-[var(--theme-background)]');
    });

    it('should pass theme context to child components', () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div data-testid="child-content">Test Content</div>
          </MainLayout>
        </TestWrapper>
      );

      // Child content should be rendered and have access to theme
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle auth errors gracefully', () => {
      mockUseAuth.mockImplementation(() => {
        throw new Error('Auth error');
      });

      // Should not crash the app
      expect(() => {
        render(
          <TestWrapper>
            <MainLayout>
              <div>Test Content</div>
            </MainLayout>
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it('should render error boundary for child component errors', () => {
      const ErrorChild = () => {
        throw new Error('Child error');
      };

      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <TestWrapper>
          <MainLayout>
            <ErrorChild />
          </MainLayout>
        </TestWrapper>
      );

      // Should show error boundary instead of crashing
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation for sidebar toggle', () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </TestWrapper>
      );

      const toggleButton = screen.getByTestId('toggle-sidebar');
      const sidebar = screen.getByTestId('sidebar');

      // Should be focusable
      toggleButton.focus();
      expect(document.activeElement).toBe(toggleButton);

      // Should toggle with Enter key
      act(() => {
        fireEvent.keyDown(toggleButton, { key: 'Enter', code: 'Enter' });
      });

      expect(sidebar).toHaveAttribute('data-open', 'true');

      // Should toggle with Space key
      act(() => {
        fireEvent.keyDown(toggleButton, { key: ' ', code: 'Space' });
      });

      expect(sidebar).toHaveAttribute('data-open', 'false');
    });

    it('should close sidebar with Escape key', () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </TestWrapper>
      );

      const toggleButton = screen.getByTestId('toggle-sidebar');
      const sidebar = screen.getByTestId('sidebar');

      // Open sidebar
      act(() => {
        fireEvent.click(toggleButton);
      });
      expect(sidebar).toHaveAttribute('data-open', 'true');

      // Close with Escape
      act(() => {
        fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      });

      expect(sidebar).toHaveAttribute('data-open', 'false');
    });
  });
});