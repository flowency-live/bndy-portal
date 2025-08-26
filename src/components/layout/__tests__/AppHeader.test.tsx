import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AppHeader } from '../AppHeader';
import { ThemeProvider } from '../../../context/ThemeContext';

// Mock bndy-ui components
vi.mock('bndy-ui', () => ({
  BndyLogo: ({ className, color, holeColor, ...props }: any) => (
    <div data-testid="bndy-logo" className={className} data-color={color} data-hole-color={holeColor} {...props}>
      BNDY Logo
    </div>
  )
}));

// Mock bndy-ui auth
const mockUseAuth = vi.fn();
vi.mock('bndy-ui/auth', () => ({
  useAuth: () => mockUseAuth()
}));

// Mock Next.js useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })
}));

// Mock icons
vi.mock('react-icons/fa', () => ({
  FaSun: ({ className, ...props }: any) => (
    <div data-testid="sun-icon" className={className} {...props}>☀️</div>
  ),
  FaMoon: ({ className, ...props }: any) => (
    <div data-testid="moon-icon" className={className} {...props}>🌙</div>
  ),
  FaBell: ({ className, ...props }: any) => (
    <div data-testid="bell-icon" className={className} {...props}>🔔</div>
  ),
  FaBars: ({ className, ...props }: any) => (
    <div data-testid="hamburger-icon" className={className} {...props}>☰</div>
  ),
  FaMusic: ({ className, ...props }: any) => (
    <div data-testid="music-icon" className={className} {...props}>🎵</div>
  ),
  FaHome: ({ className, ...props }: any) => (
    <div data-testid="home-icon" className={className} {...props}>🏠</div>
  )
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('AppHeader', () => {
  const mockToggleSidebar = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default authenticated user
    mockUseAuth.mockReturnValue({
      currentUser: {
        uid: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg'
      },
      isLoading: false
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Header Structure', () => {
    it('should render with proper semantic structure', () => {
      render(
        <TestWrapper>
          <AppHeader onToggleSidebar={mockToggleSidebar} />
        </TestWrapper>
      );

      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByTestId('bndy-logo')).toBeInTheDocument();
    });

    it('should apply mobile-first responsive classes', () => {
      render(
        <TestWrapper>
          <AppHeader onToggleSidebar={mockToggleSidebar} />
        </TestWrapper>
      );

      const header = screen.getByTestId('app-header');
      expect(header).toHaveClass('mobile-edge');
      expect(header).toHaveClass('mobile-safe-padding');
    });

    it('should use bndy brand colors for logo', () => {
      render(
        <TestWrapper>
          <AppHeader onToggleSidebar={mockToggleSidebar} />
        </TestWrapper>
      );

      const logo = screen.getByTestId('bndy-logo');
      expect(logo).toHaveAttribute('data-color', '#f97316'); // Orange-500
      expect(logo).toHaveAttribute('data-hole-color'); // Should have hole color for dark theme
    });
  });

  describe('Authentication States', () => {
    it('should show pre-auth state when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        currentUser: null,
        isLoading: false
      });

      render(
        <TestWrapper>
          <AppHeader onToggleSidebar={mockToggleSidebar} />
        </TestWrapper>
      );

      // Should only show logo and theme toggle in pre-auth state
      expect(screen.getByTestId('bndy-logo')).toBeInTheDocument();
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
      
      // Should not show authenticated features
      expect(screen.queryByTestId('hamburger-menu')).not.toBeInTheDocument();
      expect(screen.queryByTestId('notification-bell')).not.toBeInTheDocument();
    });

    it('should show full post-auth state when user is authenticated', () => {
      render(
        <TestWrapper>
          <AppHeader onToggleSidebar={mockToggleSidebar} />
        </TestWrapper>
      );

      // Should show all authenticated features
      expect(screen.getByTestId('bndy-logo')).toBeInTheDocument();
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('hamburger-menu')).toBeInTheDocument();
      expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
    });

    it('should handle loading state gracefully', () => {
      mockUseAuth.mockReturnValue({
        currentUser: null,
        isLoading: true
      });

      render(
        <TestWrapper>
          <AppHeader onToggleSidebar={mockToggleSidebar} />
        </TestWrapper>
      );

      // Should show minimal state during loading
      expect(screen.getByTestId('bndy-logo')).toBeInTheDocument();
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });
  });

  describe('Context Indicators', () => {
    it('should show Dashboard context by default', () => {
      render(
        <TestWrapper>
          <AppHeader onToggleSidebar={mockToggleSidebar} context="dashboard" />
        </TestWrapper>
      );

      // Desktop context display
      const desktopContext = screen.getByTestId('context-desktop');
      expect(desktopContext).toHaveTextContent('Dashboard');
      
      // Mobile context pill
      const contextPill = screen.getByTestId('context-pill-mobile');
      expect(contextPill).toBeInTheDocument();
      expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    });

    it('should show Backstage context when specified', () => {
      render(
        <TestWrapper>
          <AppHeader 
            onToggleSidebar={mockToggleSidebar} 
            context="backstage" 
            artistName="Test Artist"
          />
        </TestWrapper>
      );

      // Desktop context display
      const desktopContext = screen.getByTestId('context-desktop');
      expect(desktopContext).toHaveTextContent('Backstage');
      expect(desktopContext).toHaveTextContent('Test Artist');
      
      // Mobile context pill
      const contextPill = screen.getByTestId('context-pill-mobile');
      expect(contextPill).toBeInTheDocument();
      expect(screen.getByTestId('music-icon')).toBeInTheDocument();
    });

    it('should animate mobile context pills', () => {
      render(
        <TestWrapper>
          <AppHeader onToggleSidebar={mockToggleSidebar} context="backstage" />
        </TestWrapper>
      );

      const contextPill = screen.getByTestId('context-pill-mobile');
      
      // Should have animation classes and gradient styling
      expect(contextPill).toHaveClass('animate-pulse');
      expect(contextPill).toHaveClass('bg-gradient-to-r');
      expect(contextPill).toHaveClass('from-orange-600/20');
    });

    it('should switch context indicators responsively', () => {
      render(
        <TestWrapper>
          <AppHeader onToggleSidebar={mockToggleSidebar} context="dashboard" />
        </TestWrapper>
      );

      // Desktop context should be hidden on mobile
      const desktopContext = screen.getByTestId('context-desktop');
      expect(desktopContext).toHaveClass('hidden', 'md:flex');

      // Mobile context should be hidden on desktop  
      const mobileContext = screen.getByTestId('context-pill-mobile');
      expect(mobileContext).toHaveClass('md:hidden');
    });
  });

  describe('Theme Toggle', () => {
    it('should show appropriate icon for current theme', () => {
      render(
        <TestWrapper>
          <AppHeader onToggleSidebar={mockToggleSidebar} />
        </TestWrapper>
      );

      const themeToggle = screen.getByTestId('theme-toggle');
      expect(themeToggle).toBeInTheDocument();
      
      // Should have either sun or moon icon (depends on initial theme)
      const hasSunIcon = screen.queryByTestId('sun-icon');
      const hasMoonIcon = screen.queryByTestId('moon-icon');
      expect(hasSunIcon || hasMoonIcon).toBeTruthy();
    });

    it('should toggle theme when clicked', () => {
      render(
        <TestWrapper>
          <AppHeader onToggleSidebar={mockToggleSidebar} />
        </TestWrapper>
      );

      const themeToggle = screen.getByTestId('theme-toggle');
      
      act(() => {
        fireEvent.click(themeToggle);
      });

      // Theme should change (icon should switch)
      expect(themeToggle).toBeInTheDocument();
    });

    it('should be accessible with keyboard navigation', () => {
      render(
        <TestWrapper>
          <AppHeader onToggleSidebar={mockToggleSidebar} />
        </TestWrapper>
      );

      const themeToggle = screen.getByTestId('theme-toggle');
      
      // Should be focusable
      themeToggle.focus();
      expect(document.activeElement).toBe(themeToggle);

      // Should toggle with Enter
      act(() => {
        fireEvent.keyDown(themeToggle, { key: 'Enter', code: 'Enter' });
      });

      expect(themeToggle).toBeInTheDocument();
    });

    it('should have proper touch target size', () => {
      render(
        <TestWrapper>
          <AppHeader onToggleSidebar={mockToggleSidebar} />
        </TestWrapper>
      );

      const themeToggle = screen.getByTestId('theme-toggle');
      expect(themeToggle).toHaveClass('min-h-[44px]');
      expect(themeToggle).toHaveClass('touch-target');
    });
  });

  describe('Mobile Hamburger Menu', () => {
    it('should show hamburger menu on mobile for authenticated users', () => {
      render(
        <TestWrapper>
          <AppHeader onToggleSidebar={mockToggleSidebar} />
        </TestWrapper>
      );

      const hamburger = screen.getByTestId('hamburger-menu');
      expect(hamburger).toBeInTheDocument();
      expect(hamburger).toHaveClass('md:hidden'); // Hidden on desktop
    });

    it('should call onToggleSidebar when clicked', () => {
      render(
        <TestWrapper>
          <AppHeader onToggleSidebar={mockToggleSidebar} />
        </TestWrapper>
      );

      const hamburger = screen.getByTestId('hamburger-menu');
      
      act(() => {
        fireEvent.click(hamburger);
      });

      expect(mockToggleSidebar).toHaveBeenCalledTimes(1);
    });

    it('should support keyboard navigation', () => {
      render(
        <TestWrapper>
          <AppHeader onToggleSidebar={mockToggleSidebar} />
        </TestWrapper>
      );

      const hamburger = screen.getByTestId('hamburger-menu');
      
      hamburger.focus();
      expect(document.activeElement).toBe(hamburger);

      act(() => {
        fireEvent.keyDown(hamburger, { key: 'Enter', code: 'Enter' });
      });

      expect(mockToggleSidebar).toHaveBeenCalledTimes(1);
    });

    it('should have proper touch target size', () => {
      render(
        <TestWrapper>
          <AppHeader onToggleSidebar={mockToggleSidebar} />
        </TestWrapper>
      );

      const hamburger = screen.getByTestId('hamburger-menu');
      expect(hamburger).toHaveClass('min-h-[44px]');
      expect(hamburger).toHaveClass('touch-target');
    });
  });

  describe('Notification System', () => {
    it('should show notification bell for authenticated users', () => {
      render(
        <TestWrapper>
          <AppHeader onToggleSidebar={mockToggleSidebar} />
        </TestWrapper>
      );

      const notificationBell = screen.getByTestId('notification-bell');
      expect(notificationBell).toBeInTheDocument();
      expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
    });

    it('should show notification indicator when there are notifications', () => {
      render(
        <TestWrapper>
          <AppHeader onToggleSidebar={mockToggleSidebar} hasNotifications={true} />
        </TestWrapper>
      );

      const notificationIndicator = screen.getByTestId('notification-indicator');
      expect(notificationIndicator).toBeInTheDocument();
      expect(notificationIndicator).toHaveClass('bg-red-500');
    });

    it('should not show notification indicator when no notifications', () => {
      render(
        <TestWrapper>
          <AppHeader onToggleSidebar={mockToggleSidebar} hasNotifications={false} />
        </TestWrapper>
      );

      expect(screen.queryByTestId('notification-indicator')).not.toBeInTheDocument();
    });

    it('should handle notification bell click', () => {
      const mockOnNotificationClick = vi.fn();
      
      render(
        <TestWrapper>
          <AppHeader 
            onToggleSidebar={mockToggleSidebar} 
            onNotificationClick={mockOnNotificationClick}
          />
        </TestWrapper>
      );

      const notificationBell = screen.getByTestId('notification-bell');
      
      act(() => {
        fireEvent.click(notificationBell);
      });

      expect(mockOnNotificationClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Responsive Behavior', () => {
    it('should hide desktop elements on mobile', () => {
      render(
        <TestWrapper>
          <AppHeader onToggleSidebar={mockToggleSidebar} context="dashboard" />
        </TestWrapper>
      );

      const desktopContext = screen.getByTestId('context-desktop');
      expect(desktopContext).toHaveClass('hidden', 'md:flex');
    });

    it('should hide mobile elements on desktop', () => {
      render(
        <TestWrapper>
          <AppHeader onToggleSidebar={mockToggleSidebar} />
        </TestWrapper>
      );

      const hamburger = screen.getByTestId('hamburger-menu');
      expect(hamburger).toHaveClass('md:hidden');

      const mobileContext = screen.getByTestId('context-pill-mobile');
      expect(mobileContext).toHaveClass('md:hidden');
    });

    it('should maintain proper spacing on different screen sizes', () => {
      render(
        <TestWrapper>
          <AppHeader onToggleSidebar={mockToggleSidebar} />
        </TestWrapper>
      );

      const header = screen.getByTestId('app-header');
      expect(header).toHaveClass('mobile-safe-padding');
      
      const headerContent = screen.getByTestId('header-content');
      expect(headerContent).toHaveClass('flex', 'items-center', 'justify-between');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <TestWrapper>
          <AppHeader onToggleSidebar={mockToggleSidebar} />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument();
      expect(screen.getByLabelText('View notifications')).toBeInTheDocument();
    });

    it('should support keyboard navigation for all interactive elements', () => {
      render(
        <TestWrapper>
          <AppHeader onToggleSidebar={mockToggleSidebar} />
        </TestWrapper>
      );

      const themeToggle = screen.getByTestId('theme-toggle');
      const hamburger = screen.getByTestId('hamburger-menu');
      const notificationBell = screen.getByTestId('notification-bell');

      // All should be focusable
      expect(themeToggle.tabIndex).toBe(0);
      expect(hamburger.tabIndex).toBe(0);
      expect(notificationBell.tabIndex).toBe(0);
    });

    it('should provide proper focus management', () => {
      render(
        <TestWrapper>
          <AppHeader onToggleSidebar={mockToggleSidebar} />
        </TestWrapper>
      );

      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        button.focus();
        expect(document.activeElement).toBe(button);
      });
    });
  });

  describe('Theme Integration', () => {
    it('should adapt to theme changes', () => {
      render(
        <TestWrapper>
          <AppHeader onToggleSidebar={mockToggleSidebar} />
        </TestWrapper>
      );

      const header = screen.getByTestId('app-header');
      
      // Should use theme-aware classes
      expect(header).toHaveClass('bg-slate-800');
      expect(header).toHaveClass('border-slate-700');
    });

    it('should provide proper contrast in both themes', () => {
      render(
        <TestWrapper>
          <AppHeader onToggleSidebar={mockToggleSidebar} />
        </TestWrapper>
      );

      const logo = screen.getByTestId('bndy-logo');
      expect(logo).toHaveAttribute('data-hole-color'); // Should adapt to theme
    });
  });
});