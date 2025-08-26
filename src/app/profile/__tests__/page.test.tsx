import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ProfilePage from '../page';
import { ThemeProvider } from '../../../context/ThemeContext';

// Mock bndy-ui auth
const mockUseAuth = vi.fn();
const mockSignOut = vi.fn();
vi.mock('bndy-ui/auth', () => ({
  useAuth: () => mockUseAuth()
}));

// Mock bndy-ui components
vi.mock('bndy-ui', () => ({
  BndyLogo: ({ className, ...props }: any) => (
    <div data-testid="bndy-logo" className={className} {...props}>BNDY Logo</div>
  ),
  BndyLoadingScreen: () => <div data-testid="loading-screen">Loading...</div>
}));

// Mock Next.js navigation
const mockPush = vi.fn();
const mockRouter = {
  push: mockPush,
  replace: vi.fn(),
  prefetch: vi.fn(),
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/profile'
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, animate, initial, exit, transition, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock icons
vi.mock('react-icons/fa', () => ({
  FaUser: ({ className, ...props }: any) => (
    <div data-testid="user-icon" className={className} {...props}>👤</div>
  ),
  FaEnvelope: ({ className, ...props }: any) => (
    <div data-testid="envelope-icon" className={className} {...props}>✉️</div>
  ),
  FaPhone: ({ className, ...props }: any) => (
    <div data-testid="phone-icon" className={className} {...props}>📞</div>
  ),
  FaMapMarkerAlt: ({ className, ...props }: any) => (
    <div data-testid="location-icon" className={className} {...props}>📍</div>
  ),
  FaLock: ({ className, ...props }: any) => (
    <div data-testid="lock-icon" className={className} {...props}>🔒</div>
  ),
  FaCog: ({ className, ...props }: any) => (
    <div data-testid="cog-icon" className={className} {...props}>⚙️</div>
  ),
  FaBell: ({ className, ...props }: any) => (
    <div data-testid="bell-icon" className={className} {...props}>🔔</div>
  ),
  FaCamera: ({ className, ...props }: any) => (
    <div data-testid="camera-icon" className={className} {...props}>📷</div>
  ),
  FaChevronDown: ({ className, ...props }: any) => (
    <div data-testid="chevron-icon" className={className} {...props}>▼</div>
  ),
  FaCheck: ({ className, ...props }: any) => (
    <div data-testid="check-icon" className={className} {...props}>✓</div>
  ),
  FaTimes: ({ className, ...props }: any) => (
    <div data-testid="times-icon" className={className} {...props}>✗</div>
  ),
}));

// Mock MainLayout
vi.mock('../../../components/layout/MainLayout', () => ({
  MainLayout: ({ children }: any) => (
    <div data-testid="main-layout">{children}</div>
  )
}));

// Mock CollapsibleSection
vi.mock('../../../components/ui/CollapsibleSection', () => ({
  CollapsibleSection: ({ id, title, children, isExpanded, onToggle }: any) => (
    <div data-testid={`section-${id}`}>
      <button data-testid={`toggle-${id}`} onClick={onToggle}>
        {title}
      </button>
      {isExpanded && <div data-testid={`content-${id}`}>{children}</div>}
    </div>
  )
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default authenticated user
    mockUseAuth.mockReturnValue({
      currentUser: {
        uid: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
        emailVerified: true,
        phoneNumber: '+1234567890'
      },
      isLoading: false,
      signOut: mockSignOut
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Authentication States', () => {
    it('should redirect to login when not authenticated', async () => {
      mockUseAuth.mockReturnValue({
        currentUser: null,
        isLoading: false
      });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('should show loading screen while auth is loading', () => {
      mockUseAuth.mockReturnValue({
        currentUser: null,
        isLoading: true
      });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
    });

    it('should render profile page for authenticated users', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
      expect(screen.getByTestId('profile-page')).toBeInTheDocument();
    });
  });

  describe('Profile Header', () => {
    it('should display user avatar', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      const avatar = screen.getByTestId('user-avatar');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src');
    });

    it('should display fallback avatar when no photo', () => {
      mockUseAuth.mockReturnValue({
        currentUser: {
          uid: 'test-user-id',
          email: 'test@example.com',
          displayName: 'Test User',
          photoURL: null,
          emailVerified: true
        },
        isLoading: false
      });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      expect(screen.getByTestId('fallback-avatar')).toBeInTheDocument();
      expect(screen.getByTestId('fallback-avatar')).toHaveTextContent('TU');
    });

    it('should display user name and email', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('should show email verification status', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      expect(screen.getByTestId('email-verified')).toBeInTheDocument();
    });

    it('should show unverified email warning', () => {
      mockUseAuth.mockReturnValue({
        currentUser: {
          uid: 'test-user-id',
          email: 'test@example.com',
          displayName: 'Test User',
          photoURL: null,
          emailVerified: false
        },
        isLoading: false
      });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      expect(screen.getByTestId('email-unverified')).toBeInTheDocument();
    });
  });

  describe('Collapsible Sections', () => {
    it('should render all profile sections', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      expect(screen.getByTestId('section-basic-info')).toBeInTheDocument();
      expect(screen.getByTestId('section-contact-info')).toBeInTheDocument();
      expect(screen.getByTestId('section-security')).toBeInTheDocument();
      expect(screen.getByTestId('section-preferences')).toBeInTheDocument();
    });

    it('should expand basic info section by default', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      expect(screen.getByTestId('content-basic-info')).toBeInTheDocument();
    });

    it('should toggle section expansion on click', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      // Contact info should be collapsed initially
      expect(screen.queryByTestId('content-contact-info')).not.toBeInTheDocument();

      // Click to expand
      const toggleButton = screen.getByTestId('toggle-contact-info');
      fireEvent.click(toggleButton);

      expect(screen.getByTestId('content-contact-info')).toBeInTheDocument();

      // Click to collapse
      fireEvent.click(toggleButton);
      expect(screen.queryByTestId('content-contact-info')).not.toBeInTheDocument();
    });

    it('should allow multiple sections to be expanded', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      // Expand contact info
      fireEvent.click(screen.getByTestId('toggle-contact-info'));
      expect(screen.getByTestId('content-contact-info')).toBeInTheDocument();

      // Expand security (basic info should remain expanded)
      fireEvent.click(screen.getByTestId('toggle-security'));
      expect(screen.getByTestId('content-basic-info')).toBeInTheDocument();
      expect(screen.getByTestId('content-contact-info')).toBeInTheDocument();
      expect(screen.getByTestId('content-security')).toBeInTheDocument();
    });
  });

  describe('Basic Information Section', () => {
    it('should display editable name field', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      const nameInput = screen.getByTestId('name-input') as HTMLInputElement;
      expect(nameInput).toBeInTheDocument();
      expect(nameInput.value).toBe('Test User');
    });

    it('should display editable bio field', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      const bioInput = screen.getByTestId('bio-input');
      expect(bioInput).toBeInTheDocument();
    });

    it('should handle name change', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      const nameInput = screen.getByTestId('name-input') as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: 'New Name' } });

      expect(nameInput.value).toBe('New Name');
    });

    it('should show save button when changes are made', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      // Initially no save button
      expect(screen.queryByTestId('save-basic-info')).not.toBeInTheDocument();

      // Make a change
      const nameInput = screen.getByTestId('name-input');
      fireEvent.change(nameInput, { target: { value: 'New Name' } });

      // Save button should appear
      expect(screen.getByTestId('save-basic-info')).toBeInTheDocument();
    });
  });

  describe('Contact Information Section', () => {
    it('should display email field', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      // Expand contact info section
      fireEvent.click(screen.getByTestId('toggle-contact-info'));

      const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
      expect(emailInput).toBeInTheDocument();
      expect(emailInput.value).toBe('test@example.com');
    });

    it('should display phone field', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      // Expand contact info section
      fireEvent.click(screen.getByTestId('toggle-contact-info'));

      const phoneInput = screen.getByTestId('phone-input') as HTMLInputElement;
      expect(phoneInput).toBeInTheDocument();
      expect(phoneInput.value).toBe('+1234567890');
    });

    it('should handle adding additional email', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      // Expand contact info section
      fireEvent.click(screen.getByTestId('toggle-contact-info'));

      const addEmailButton = screen.getByTestId('add-email-button');
      fireEvent.click(addEmailButton);

      expect(screen.getByTestId('additional-email-input')).toBeInTheDocument();
    });
  });

  describe('Security Section', () => {
    it('should show password change fields', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      // Expand security section
      fireEvent.click(screen.getByTestId('toggle-security'));

      expect(screen.getByTestId('current-password-input')).toBeInTheDocument();
      expect(screen.getByTestId('new-password-input')).toBeInTheDocument();
      expect(screen.getByTestId('confirm-password-input')).toBeInTheDocument();
    });

    it('should validate password requirements', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      // Expand security section
      fireEvent.click(screen.getByTestId('toggle-security'));

      const newPasswordInput = screen.getByTestId('new-password-input');
      fireEvent.change(newPasswordInput, { target: { value: 'short' } });

      expect(screen.getByTestId('password-error')).toBeInTheDocument();
    });

    it('should show two-factor authentication toggle', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      // Expand security section
      fireEvent.click(screen.getByTestId('toggle-security'));

      expect(screen.getByTestId('2fa-toggle')).toBeInTheDocument();
    });
  });

  describe('Preferences Section', () => {
    it('should show notification preferences', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      // Expand preferences section
      fireEvent.click(screen.getByTestId('toggle-preferences'));

      expect(screen.getByTestId('email-notifications-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('push-notifications-toggle')).toBeInTheDocument();
    });

    it('should show theme preference', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      // Expand preferences section
      fireEvent.click(screen.getByTestId('toggle-preferences'));

      expect(screen.getByTestId('theme-selector')).toBeInTheDocument();
    });

    it('should handle preference changes', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      // Expand preferences section
      fireEvent.click(screen.getByTestId('toggle-preferences'));

      const emailToggle = screen.getByTestId('email-notifications-toggle');
      fireEvent.click(emailToggle);

      // Should trigger save button
      expect(screen.getByTestId('save-preferences')).toBeInTheDocument();
    });
  });

  describe('Photo Upload', () => {
    it('should show upload button on avatar hover', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      const avatarContainer = screen.getByTestId('avatar-container');
      fireEvent.mouseEnter(avatarContainer);

      expect(screen.getByTestId('upload-photo-button')).toBeInTheDocument();
    });

    it('should handle photo upload', async () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      const avatarContainer = screen.getByTestId('avatar-container');
      fireEvent.mouseEnter(avatarContainer);

      const fileInput = screen.getByTestId('photo-input') as HTMLInputElement;
      const file = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });
      
      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [file] } });
      });

      expect(screen.getByTestId('upload-progress')).toBeInTheDocument();
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should have mobile-optimized layout', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      const profilePage = screen.getByTestId('profile-page');
      expect(profilePage).toHaveClass('max-w-4xl', 'mx-auto', 'p-4', 'sm:p-6');
    });

    it('should have responsive avatar size', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      const avatarContainer = screen.getByTestId('avatar-container');
      expect(avatarContainer).toHaveClass('w-24', 'h-24', 'sm:w-32', 'sm:h-32');
    });

    it('should have touch-friendly buttons', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      const nameInput = screen.getByTestId('name-input');
      fireEvent.change(nameInput, { target: { value: 'New Name' } });

      const saveButton = screen.getByTestId('save-basic-info');
      expect(saveButton).toHaveClass('min-h-[44px]', 'touch-target');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Display Name')).toBeInTheDocument();
      
      fireEvent.click(screen.getByTestId('toggle-contact-info'));
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      const nameInput = screen.getByTestId('name-input');
      nameInput.focus();
      expect(document.activeElement).toBe(nameInput);

      // Tab to next element
      fireEvent.keyDown(nameInput, { key: 'Tab' });
    });

    it('should announce form errors to screen readers', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      // Expand security section
      fireEvent.click(screen.getByTestId('toggle-security'));

      const newPasswordInput = screen.getByTestId('new-password-input');
      fireEvent.change(newPasswordInput, { target: { value: 'short' } });

      const error = screen.getByTestId('password-error');
      expect(error).toHaveAttribute('role', 'alert');
    });
  });
});