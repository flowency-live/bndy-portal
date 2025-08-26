import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Sidebar } from '../Sidebar';
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

// Mock Next.js navigation
const mockPush = vi.fn();
const mockPathname = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => mockPathname()
}));

// Mock icons
vi.mock('react-icons/fa', () => ({
  FaHome: ({ className, ...props }: any) => (
    <div data-testid="home-icon" className={className} {...props}>🏠</div>
  ),
  FaUser: ({ className, ...props }: any) => (
    <div data-testid="user-icon" className={className} {...props}>👤</div>
  ),
  FaCog: ({ className, ...props }: any) => (
    <div data-testid="settings-icon" className={className} {...props}>⚙️</div>
  ),
  FaSignOutAlt: ({ className, ...props }: any) => (
    <div data-testid="logout-icon" className={className} {...props}>🚪</div>
  ),
  FaMusic: ({ className, ...props }: any) => (
    <div data-testid="music-icon" className={className} {...props}>🎵</div>
  ),
  FaTimes: ({ className, ...props }: any) => (
    <div data-testid="times-icon" className={className} {...props}>✕</div>
  )
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('Sidebar', () => {
  const mockOnClose = vi.fn();

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
      isLoading: false,
      signOut: vi.fn()
    });

    // Default path
    mockPathname.mockReturnValue('/dashboard');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Structure', () => {
    it('should render with proper semantic structure', () => {
      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('bndy-logo')).toBeInTheDocument();
    });

    it('should apply mobile-first responsive classes', () => {
      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveClass('fixed', 'md:relative');
      expect(sidebar).toHaveClass('transform', 'transition-transform');
    });

    it('should use bndy brand colors for logo', () => {
      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      const logo = screen.getByTestId('bndy-logo');
      expect(logo).toHaveAttribute('data-color', '#f97316'); // Orange-500
      expect(logo).toHaveAttribute('data-hole-color'); // Should have hole color for dark theme
    });
  });

  describe('Sidebar State Management', () => {
    it('should show sidebar when open', () => {
      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveAttribute('data-open', 'true');
      expect(sidebar).toHaveClass('translate-x-0');
    });

    it('should hide sidebar when closed', () => {
      render(
        <TestWrapper>
          <Sidebar isOpen={false} onClose={mockOnClose} />
        </TestWrapper>
      );

      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveAttribute('data-open', 'false');
      expect(sidebar).toHaveClass('-translate-x-full');
    });

    it('should always be visible on desktop regardless of state', () => {
      render(
        <TestWrapper>
          <Sidebar isOpen={false} onClose={mockOnClose} />
        </TestWrapper>
      );

      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveClass('md:translate-x-0');
    });
  });

  describe('Navigation Items', () => {
    it('should render all main navigation items', () => {
      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('My Profile')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('My Artists')).toBeInTheDocument();
    });

    it('should highlight active navigation item', () => {
      mockPathname.mockReturnValue('/dashboard');

      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      const dashboardItem = screen.getByTestId('nav-item-dashboard');
      expect(dashboardItem).toHaveClass('bg-orange-500/10', 'border-orange-500/30');
      expect(dashboardItem).toHaveClass('text-orange-300');
    });

    it('should not highlight inactive navigation items', () => {
      mockPathname.mockReturnValue('/dashboard');

      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      const profileItem = screen.getByTestId('nav-item-profile');
      expect(profileItem).not.toHaveClass('bg-orange-500/10');
      expect(profileItem).toHaveClass('text-slate-300');
    });

    it('should navigate when navigation item is clicked', () => {
      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      const profileItem = screen.getByTestId('nav-item-profile');
      
      act(() => {
        fireEvent.click(profileItem);
      });

      expect(mockPush).toHaveBeenCalledWith('/profile');
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should show proper icons for each navigation item', () => {
      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      expect(screen.getByTestId('home-icon')).toBeInTheDocument();
      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
      expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
      expect(screen.getByTestId('music-icon')).toBeInTheDocument();
    });
  });

  describe('Mobile Close Button', () => {
    it('should show close button on mobile', () => {
      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      const closeButton = screen.getByTestId('close-sidebar');
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveClass('md:hidden'); // Hidden on desktop
    });

    it('should call onClose when close button is clicked', () => {
      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      const closeButton = screen.getByTestId('close-sidebar');
      
      act(() => {
        fireEvent.click(closeButton);
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should have proper touch target size', () => {
      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      const closeButton = screen.getByTestId('close-sidebar');
      expect(closeButton).toHaveClass('min-h-[44px]');
      expect(closeButton).toHaveClass('touch-target');
    });
  });

  describe('User Profile Section', () => {
    it('should show user profile information', () => {
      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('should show user avatar if available', () => {
      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      const avatar = screen.getByTestId('user-avatar');
      expect(avatar).toBeInTheDocument();
      // Next.js optimizes images, so check if the original URL is included
      expect(avatar.getAttribute('src')).toContain('https%3A%2F%2Fexample.com%2Fphoto.jpg');
    });

    it('should show fallback avatar when no photo available', () => {
      mockUseAuth.mockReturnValue({
        currentUser: {
          uid: 'test-user-id',
          email: 'test@example.com',
          displayName: 'Test User',
          photoURL: null
        },
        isLoading: false,
        signOut: vi.fn()
      });

      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      const fallbackAvatar = screen.getByTestId('fallback-avatar');
      expect(fallbackAvatar).toBeInTheDocument();
      expect(fallbackAvatar).toHaveTextContent('TU'); // First letters of name
    });

    it('should handle missing display name gracefully', () => {
      mockUseAuth.mockReturnValue({
        currentUser: {
          uid: 'test-user-id',
          email: 'test@example.com',
          displayName: null,
          photoURL: null
        },
        isLoading: false,
        signOut: vi.fn()
      });

      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      const fallbackAvatar = screen.getByTestId('fallback-avatar');
      expect(fallbackAvatar).toHaveTextContent('TE'); // First letters of email
    });
  });

  describe('Logout Functionality', () => {
    it('should show logout button', () => {
      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
      expect(screen.getByTestId('logout-icon')).toBeInTheDocument();
    });

    it('should handle logout when button is clicked', async () => {
      const mockSignOut = vi.fn().mockResolvedValue(undefined);
      mockUseAuth.mockReturnValue({
        currentUser: {
          uid: 'test-user-id',
          email: 'test@example.com',
          displayName: 'Test User'
        },
        isLoading: false,
        signOut: mockSignOut
      });

      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      const logoutButton = screen.getByTestId('logout-button');
      
      await act(async () => {
        fireEvent.click(logoutButton);
      });

      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });

    it('should handle logout errors gracefully', async () => {
      const mockSignOut = vi.fn().mockRejectedValue(new Error('Logout failed'));
      mockUseAuth.mockReturnValue({
        currentUser: {
          uid: 'test-user-id',
          email: 'test@example.com',
          displayName: 'Test User'
        },
        isLoading: false,
        signOut: mockSignOut
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      const logoutButton = screen.getByTestId('logout-button');
      
      await act(async () => {
        fireEvent.click(logoutButton);
      });

      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith('Error signing out:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation for all interactive elements', () => {
      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      const closeButton = screen.getByTestId('close-sidebar');
      const navItems = screen.getAllByTestId(/^nav-item-/);
      const logoutButton = screen.getByTestId('logout-button');

      // All should be focusable
      expect(closeButton.tabIndex).toBe(0);
      navItems.forEach(item => {
        expect(item.tabIndex).toBe(0);
      });
      expect(logoutButton.tabIndex).toBe(0);
    });

    it('should handle Enter key for navigation items', () => {
      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      const profileItem = screen.getByTestId('nav-item-profile');
      
      act(() => {
        fireEvent.keyDown(profileItem, { key: 'Enter', code: 'Enter' });
      });

      expect(mockPush).toHaveBeenCalledWith('/profile');
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should handle Space key for navigation items', () => {
      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      const settingsItem = screen.getByTestId('nav-item-settings');
      
      act(() => {
        fireEvent.keyDown(settingsItem, { key: ' ', code: 'Space' });
      });

      expect(mockPush).toHaveBeenCalledWith('/settings');
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Close navigation menu')).toBeInTheDocument();
      expect(screen.getByLabelText('Sign out')).toBeInTheDocument();
    });

    it('should provide proper focus management', () => {
      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      const interactiveElements = [
        screen.getByTestId('close-sidebar'),
        ...screen.getAllByTestId(/^nav-item-/),
        screen.getByTestId('logout-button')
      ];
      
      interactiveElements.forEach(element => {
        element.focus();
        expect(document.activeElement).toBe(element);
      });
    });

    it('should have semantic navigation structure', () => {
      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Main navigation');
    });
  });

  describe('Theme Integration', () => {
    it('should adapt to theme changes', () => {
      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      const sidebar = screen.getByTestId('sidebar');
      
      // Should use theme-aware classes
      expect(sidebar).toHaveClass('bg-slate-800');
      expect(sidebar).toHaveClass('border-slate-700');
    });

    it('should provide proper contrast in both themes', () => {
      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      const logo = screen.getByTestId('bndy-logo');
      expect(logo).toHaveAttribute('data-hole-color'); // Should adapt to theme
    });
  });

  describe('Responsive Behavior', () => {
    it('should handle mobile sidebar animations', () => {
      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveClass('transition-transform', 'duration-300', 'ease-in-out');
    });

    it('should maintain proper z-index for mobile overlay', () => {
      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveClass('z-50');
    });

    it('should have touch-friendly spacing and targets', () => {
      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      const navItems = screen.getAllByTestId(/^nav-item-/);
      navItems.forEach(item => {
        expect(item).toHaveClass('touch-target');
      });
    });
  });
});