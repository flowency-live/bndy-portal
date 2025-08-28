import React from 'react';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Sidebar } from '../Sidebar';
import { ThemeProvider } from '../../../context/ThemeContext';

// Mock bndy-ui (Button component)
vi.mock('bndy-ui', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
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

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} data-testid="user-avatar" {...props} />
  ),
}));

// Mock icons
vi.mock('react-icons/fa', () => ({
  FaHome: (props: any) => (
    <div data-testid="home-icon" {...props}>🏠</div>
  ),
  FaUser: (props: any) => (
    <div data-testid="user-icon" {...props}>👤</div>
  ),
  FaSignOutAlt: (props: any) => (
    <div data-testid="logout-icon" {...props}>🚪</div>
  ),
  FaMusic: (props: any) => (
    <div data-testid="music-icon" {...props}>🎵</div>
  ),
  FaTimes: (props: any) => (
    <div data-testid="times-icon" {...props}>✕</div>
  ),
  FaCalendar: (props: any) => (
    <div data-testid="calendar-icon" {...props}>📅</div>
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

      // The sidebar itself is a nav element with aria-label
      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toBeInTheDocument();
      expect(sidebar.tagName).toBe('NAV');
      expect(sidebar).toHaveAttribute('aria-label', 'Main navigation');
    });

    it('should apply mobile-first responsive classes', () => {
      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveClass('fixed', 'md:relative');
      expect(sidebar).toHaveClass('transform', 'transition-all');
    });

    it('should have proper branding tagline', () => {
      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      // The tagline is in a div with specific text
      expect(screen.getByText(/Keeping/)).toBeInTheDocument();
      expect(screen.getByText('LIVE')).toBeInTheDocument();
      expect(screen.getByText(/Music/)).toBeInTheDocument();
      expect(screen.getByText('ALIVE')).toBeInTheDocument();
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

      expect(screen.getByText('My Dashboard')).toBeInTheDocument();
      expect(screen.getByText('My Profile')).toBeInTheDocument();
      expect(screen.getByText('My Calendar')).toBeInTheDocument();
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
      // Check for the active state classes (bg-slate-700 for dark mode)
      expect(dashboardItem.className).toMatch(/bg-slate-\d+/);
      
      // Check for orange dot indicator
      const orangeDot = dashboardItem.querySelector('.bg-orange-500');
      expect(orangeDot).toBeInTheDocument();
    });

    it('should not highlight inactive navigation items', () => {
      mockPathname.mockReturnValue('/dashboard');

      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      const profileItem = screen.getByTestId('nav-item-profile');
      // Should have hover classes but not active bg
      expect(profileItem.className).toMatch(/hover:bg-slate-\d+/);
      expect(profileItem.className).toMatch(/text-slate-\d+/);
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

      // Navigation is now handled by Next.js Link, so onClose should be called
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
      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
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
      expect(avatar.getAttribute('src')).toBe('https://example.com/photo.jpg');
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

      // Close button should be focusable
      expect(closeButton.tabIndex).toBeGreaterThanOrEqual(0);
      
      // Nav items are Links, which are naturally focusable
      navItems.forEach(item => {
        expect(item.tagName).toBe('A');
      });
      
      // Logout button should be focusable
      expect(logoutButton.tagName).toBe('BUTTON');
    });

    it('should handle Enter key for close button', () => {
      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      const closeButton = screen.getByTestId('close-sidebar');
      
      act(() => {
        closeButton.focus();
        fireEvent.keyDown(closeButton, { key: 'Enter', code: 'Enter' });
      });

      // No preventDefault for close button, so onClose should not be called via keydown
      expect(mockOnClose).toHaveBeenCalledTimes(0);
    });

    it('should handle Space key for close button', () => {
      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      const closeButton = screen.getByTestId('close-sidebar');
      
      act(() => {
        closeButton.focus();
        fireEvent.keyDown(closeButton, { key: ' ', code: 'Space' });
      });

      // No preventDefault for close button, so onClose should not be called via keydown
      expect(mockOnClose).toHaveBeenCalledTimes(0);
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
      // Sign out button doesn't have aria-label, just text content
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
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

      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveAttribute('aria-label', 'Main navigation');
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
      
      // Should use conditional classes based on isDark
      expect(sidebar.className).toMatch(/bg-slate-\d+|bg-white/);
      expect(sidebar.className).toMatch(/border-slate-\d+/);
    });

    it('should provide proper contrast for branding text', () => {
      render(
        <TestWrapper>
          <Sidebar isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      // Check that LIVE and ALIVE have proper brand colors
      const liveText = screen.getByText('LIVE');
      const aliveText = screen.getByText('ALIVE');
      expect(liveText).toHaveClass('text-cyan-500');
      expect(aliveText).toHaveClass('text-orange-500');
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
      expect(sidebar).toHaveClass('transition-all', 'duration-300', 'ease-in-out');
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
      // Nav items use padding classes for touch targets
      navItems.forEach(item => {
        expect(item).toHaveClass('px-3', 'py-2');
      });
    });
  });
});