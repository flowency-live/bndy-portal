import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import MyProfilePage from '../page';
import { ThemeProvider } from '../../../context/ThemeContext';

// Mock bndy-ui auth
const mockUseAuth = vi.fn();
vi.mock('bndy-ui/auth', () => ({
  useAuth: () => mockUseAuth()
}));

// Mock bndy-ui components
vi.mock('bndy-ui', () => ({
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
  usePathname: () => '/my-profile'
}));

// Mock MainLayout
vi.mock('../../../components/layout/MainLayout', () => ({
  MainLayout: ({ children }: any) => (
    <div data-testid="main-layout">{children}</div>
  )
}));

// Mock RoleSelector
vi.mock('../../../components/profile/RoleSelector', () => ({
  RoleSelector: ({ selectedRoles, onRoleChange, error }: any) => (
    <div data-testid="role-selector">
      <span>Current roles: {selectedRoles.join(', ') || 'None'}</span>
      {error && <div data-testid="role-error">{error}</div>}
      <button onClick={() => onRoleChange(['artist'])} data-testid="select-artist">Select Artist</button>
    </div>
  )
}));

// Mock InstrumentSelector
vi.mock('../../../components/profile/InstrumentSelector', () => ({
  InstrumentSelector: ({ selectedInstruments, onInstrumentChange, error }: any) => (
    <div data-testid="instrument-selector">
      <span>Current instruments: {selectedInstruments.join(', ') || 'None'}</span>
      {error && <div data-testid="instrument-error">{error}</div>}
      <button onClick={() => onInstrumentChange(['guitar'])} data-testid="select-guitar">Select Guitar</button>
    </div>
  )
}));

// Mock icons
vi.mock('react-icons/fa', () => ({
  FaUser: ({ className, ...props }: any) => (
    <div data-testid="user-icon" className={className} {...props}>👤</div>
  ),
  FaCamera: ({ className, ...props }: any) => (
    <div data-testid="camera-icon" className={className} {...props}>📷</div>
  ),
  FaMapMarkerAlt: ({ className, ...props }: any) => (
    <div data-testid="location-icon" className={className} {...props}>📍</div>
  ),
  FaSave: ({ className, ...props }: any) => (
    <div data-testid="save-icon" className={className} {...props}>💾</div>
  ),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('MyProfilePage', () => {
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

  describe('Authentication States', () => {
    it('should redirect to login when not authenticated', async () => {
      mockUseAuth.mockReturnValue({
        currentUser: null,
        isLoading: false
      });

      render(
        <TestWrapper>
          <MyProfilePage />
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
          <MyProfilePage />
        </TestWrapper>
      );

      expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
    });

    it('should render profile for authenticated users', () => {
      render(
        <TestWrapper>
          <MyProfilePage />
        </TestWrapper>
      );

      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
      expect(screen.getByTestId('my-profile-page')).toBeInTheDocument();
    });
  });

  describe('Profile Header', () => {
    it('should display profile heading', () => {
      render(
        <TestWrapper>
          <MyProfilePage />
        </TestWrapper>
      );

      expect(screen.getByText('My Profile')).toBeInTheDocument();
      expect(screen.getByText(/Complete your profile to connect/)).toBeInTheDocument();
    });

    it('should show user avatar or fallback', () => {
      render(
        <TestWrapper>
          <MyProfilePage />
        </TestWrapper>
      );

      // Should have an avatar section
      expect(screen.getByTestId('user-avatar-section')).toBeInTheDocument();
    });

    it('should handle user without photo', () => {
      mockUseAuth.mockReturnValue({
        currentUser: {
          uid: 'test-user-id',
          email: 'test@example.com',
          displayName: 'Test User',
          photoURL: null
        },
        isLoading: false
      });

      render(
        <TestWrapper>
          <MyProfilePage />
        </TestWrapper>
      );

      expect(screen.getByTestId('fallback-avatar')).toBeInTheDocument();
    });
  });

  describe('Basic Information Form', () => {
    it('should render display name field', () => {
      render(
        <TestWrapper>
          <MyProfilePage />
        </TestWrapper>
      );

      const displayNameInput = screen.getByTestId('display-name-input');
      expect(displayNameInput).toBeInTheDocument();
      expect(screen.getByText('Display Name')).toBeInTheDocument();
      expect(screen.getAllByText('*').length).toBeGreaterThan(0); // Required indicators
    });

    it('should render hometown field', () => {
      render(
        <TestWrapper>
          <MyProfilePage />
        </TestWrapper>
      );

      const hometownInput = screen.getByTestId('hometown-input');
      expect(hometownInput).toBeInTheDocument();
      expect(screen.getByText('Hometown')).toBeInTheDocument();
    });

    it('should pre-populate display name from auth', () => {
      render(
        <TestWrapper>
          <MyProfilePage />
        </TestWrapper>
      );

      const displayNameInput = screen.getByTestId('display-name-input') as HTMLInputElement;
      expect(displayNameInput.value).toBe('Test User');
    });

    it('should allow editing display name', () => {
      render(
        <TestWrapper>
          <MyProfilePage />
        </TestWrapper>
      );

      const displayNameInput = screen.getByTestId('display-name-input');
      fireEvent.change(displayNameInput, { target: { value: 'New Display Name' } });
      
      expect((displayNameInput as HTMLInputElement).value).toBe('New Display Name');
    });

    it('should allow editing hometown', () => {
      render(
        <TestWrapper>
          <MyProfilePage />
        </TestWrapper>
      );

      const hometownInput = screen.getByTestId('hometown-input');
      fireEvent.change(hometownInput, { target: { value: 'New York' } });
      
      expect((hometownInput as HTMLInputElement).value).toBe('New York');
    });
  });

  describe('Role Selection', () => {
    it('should render role selector component', () => {
      render(
        <TestWrapper>
          <MyProfilePage />
        </TestWrapper>
      );

      expect(screen.getByTestId('role-selector')).toBeInTheDocument();
    });

    it('should show role selection heading', () => {
      render(
        <TestWrapper>
          <MyProfilePage />
        </TestWrapper>
      );

      expect(screen.getByText('Your Role')).toBeInTheDocument();
      expect(screen.getByText(/What describes you best?/)).toBeInTheDocument();
    });

    it('should handle role changes', () => {
      render(
        <TestWrapper>
          <MyProfilePage />
        </TestWrapper>
      );

      const selectArtistButton = screen.getByTestId('select-artist');
      fireEvent.click(selectArtistButton);

      expect(screen.getByText('Current roles: artist')).toBeInTheDocument();
    });
  });

  describe('Instrument Selection', () => {
    it('should render instrument selector when artist role is selected', () => {
      render(
        <TestWrapper>
          <MyProfilePage />
        </TestWrapper>
      );

      // First select artist role
      const selectArtistButton = screen.getByTestId('select-artist');
      fireEvent.click(selectArtistButton);

      expect(screen.getByTestId('instrument-selector')).toBeInTheDocument();
    });

    it('should hide instrument selector for non-artist roles', () => {
      render(
        <TestWrapper>
          <MyProfilePage />
        </TestWrapper>
      );

      // Should not show instruments initially (no artist role selected)
      expect(screen.queryByText(/What instruments/)).not.toBeInTheDocument();
    });

    it('should handle instrument changes', () => {
      render(
        <TestWrapper>
          <MyProfilePage />
        </TestWrapper>
      );

      // First select artist role
      const selectArtistButton = screen.getByTestId('select-artist');
      fireEvent.click(selectArtistButton);

      // Then select instrument
      const selectGuitarButton = screen.getByTestId('select-guitar');
      fireEvent.click(selectGuitarButton);

      expect(screen.getByText('Current instruments: guitar')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for required fields', async () => {
      render(
        <TestWrapper>
          <MyProfilePage />
        </TestWrapper>
      );

      // Clear display name (required field)
      const displayNameInput = screen.getByTestId('display-name-input');
      fireEvent.change(displayNameInput, { target: { value: '' } });

      // Try to save
      const saveButton = screen.getByTestId('save-profile-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Display name is required')).toBeInTheDocument();
      });
    });

    it('should show validation error for missing hometown', async () => {
      render(
        <TestWrapper>
          <MyProfilePage />
        </TestWrapper>
      );

      // Clear hometown (required field)
      const hometownInput = screen.getByTestId('hometown-input');
      fireEvent.change(hometownInput, { target: { value: '' } });

      // Try to save
      const saveButton = screen.getByTestId('save-profile-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Hometown is required')).toBeInTheDocument();
      });
    });

    it('should show validation error when no role is selected', async () => {
      render(
        <TestWrapper>
          <MyProfilePage />
        </TestWrapper>
      );

      // Try to save without selecting role
      const saveButton = screen.getByTestId('save-profile-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByTestId('role-error')).toBeInTheDocument();
      });
    });

    it('should validate that artist has selected instruments', async () => {
      render(
        <TestWrapper>
          <MyProfilePage />
        </TestWrapper>
      );

      // Fill required fields
      const displayNameInput = screen.getByTestId('display-name-input');
      const hometownInput = screen.getByTestId('hometown-input');
      
      fireEvent.change(displayNameInput, { target: { value: 'Test User' } });
      fireEvent.change(hometownInput, { target: { value: 'Test City' } });

      // Select artist role
      const selectArtistButton = screen.getByTestId('select-artist');
      fireEvent.click(selectArtistButton);

      // Try to save without selecting instruments
      const saveButton = screen.getByTestId('save-profile-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByTestId('instrument-error')).toBeInTheDocument();
      });
    });
  });

  describe('Save Functionality', () => {
    it('should render save button', () => {
      render(
        <TestWrapper>
          <MyProfilePage />
        </TestWrapper>
      );

      const saveButton = screen.getByTestId('save-profile-button');
      expect(saveButton).toBeInTheDocument();
      expect(saveButton).toHaveTextContent('Save Profile');
    });

    it('should show loading state during save', async () => {
      render(
        <TestWrapper>
          <MyProfilePage />
        </TestWrapper>
      );

      // Fill all required fields first
      const displayNameInput = screen.getByTestId('display-name-input');
      const hometownInput = screen.getByTestId('hometown-input');
      
      fireEvent.change(displayNameInput, { target: { value: 'Test User' } });
      fireEvent.change(hometownInput, { target: { value: 'Test City' } });

      // Select role
      const selectArtistButton = screen.getByTestId('select-artist');
      fireEvent.click(selectArtistButton);

      // Select instrument
      const selectGuitarButton = screen.getByTestId('select-guitar');
      fireEvent.click(selectGuitarButton);

      const saveButton = screen.getByTestId('save-profile-button');
      fireEvent.click(saveButton);

      // Should show loading state temporarily
      await waitFor(() => {
        expect(saveButton).toBeDisabled();
      });
    });

    it('should navigate to dashboard after successful save', async () => {
      render(
        <TestWrapper>
          <MyProfilePage />
        </TestWrapper>
      );

      // Fill all required fields
      const displayNameInput = screen.getByTestId('display-name-input');
      const hometownInput = screen.getByTestId('hometown-input');
      
      fireEvent.change(displayNameInput, { target: { value: 'Test User' } });
      fireEvent.change(hometownInput, { target: { value: 'Test City' } });

      // Select role
      const selectArtistButton = screen.getByTestId('select-artist');
      fireEvent.click(selectArtistButton);

      // Select instrument
      const selectGuitarButton = screen.getByTestId('select-guitar');
      fireEvent.click(selectGuitarButton);

      // Save
      const saveButton = screen.getByTestId('save-profile-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      }, { timeout: 2000 });
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should have mobile-optimized layout', () => {
      render(
        <TestWrapper>
          <MyProfilePage />
        </TestWrapper>
      );

      const profilePage = screen.getByTestId('my-profile-page');
      expect(profilePage).toHaveClass('p-4', 'sm:p-6');
    });

    it('should have touch-friendly save button', () => {
      render(
        <TestWrapper>
          <MyProfilePage />
        </TestWrapper>
      );

      const saveButton = screen.getByTestId('save-profile-button');
      expect(saveButton).toHaveClass('min-h-[44px]', 'touch-target');
    });

    it('should have responsive text sizing', () => {
      render(
        <TestWrapper>
          <MyProfilePage />
        </TestWrapper>
      );

      const pageTitle = screen.getByTestId('profile-title');
      expect(pageTitle).toHaveClass('text-2xl', 'sm:text-3xl');
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(
        <TestWrapper>
          <MyProfilePage />
        </TestWrapper>
      );

      const displayNameInput = screen.getByTestId('display-name-input');
      expect(displayNameInput).toHaveAttribute('aria-label', expect.stringContaining('Display Name'));
    });

    it('should show validation errors with proper ARIA', async () => {
      render(
        <TestWrapper>
          <MyProfilePage />
        </TestWrapper>
      );

      // Clear required field
      const displayNameInput = screen.getByTestId('display-name-input');
      fireEvent.change(displayNameInput, { target: { value: '' } });

      // Try to save
      const saveButton = screen.getByTestId('save-profile-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        const errorMessage = screen.getByText('Display name is required');
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });

    it('should support keyboard navigation', () => {
      render(
        <TestWrapper>
          <MyProfilePage />
        </TestWrapper>
      );

      const saveButton = screen.getByTestId('save-profile-button');
      expect(saveButton).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Theme Integration', () => {
    it('should apply theme-aware colors', () => {
      render(
        <TestWrapper>
          <MyProfilePage />
        </TestWrapper>
      );

      const profilePage = screen.getByTestId('my-profile-page');
      expect(profilePage).toHaveClass('text-slate-900', 'dark:text-white');
    });

    it('should have proper background for form sections', () => {
      render(
        <TestWrapper>
          <MyProfilePage />
        </TestWrapper>
      );

      const basicInfoSection = screen.getByTestId('basic-info-section');
      expect(basicInfoSection).toHaveClass('bg-profile-bg', 'text-profile-text', 'border-profile-border');
    });
  });
});