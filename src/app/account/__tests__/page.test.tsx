import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import AccountPage from '../page';
import { useRouter } from 'next/navigation';
import { createMockUser } from '../../__mocks__/auth';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn()
}));

// Mock bndy-ui components and auth
vi.mock('bndy-ui', () => ({
  BndyLogo: ({ className, ...props }: any) => (
    <div data-testid="bndy-logo" className={className} {...props}>
      BNDY Logo
    </div>
  )
}));

// Mock bndy-ui/auth
const mockUseAuth = vi.fn();
vi.mock('bndy-ui/auth', () => ({
  AuthProvider: ({ children, ...props }: any) => children,
  useAuth: () => mockUseAuth()
}));

// Mock ProfileTab component
vi.mock('../components/ProfileTab', () => ({
  ProfileTab: ({ verificationSent, sendingVerification, handleSendVerification }: any) => (
    <div data-testid="profile-tab">
      <div>Jason Jones</div>
      <div>jason@flowency.co.uk</div>
      <div>Profile Tab Content</div>
      {!verificationSent && !sendingVerification && (
        <button onClick={handleSendVerification}>Send verification</button>
      )}
    </div>
  )
}));

const mockPush = vi.fn();
const mockRouter = {
  push: mockPush,
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
};

// useAuth is already mocked above

describe('AccountPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
  });

  it('should redirect unauthenticated users to login', async () => {
    // Mock useAuth to return unauthenticated state
    mockUseAuth.mockReturnValue({
      currentUser: null,
      isLoading: false,
      signOut: vi.fn(),
      signInWithEmail: vi.fn(),
      signInWithGoogle: vi.fn(),
      createUserWithEmail: vi.fn()
    });

    render(<AccountPage />);

    // Should show loading state first, then redirect
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('should show loading state while authentication loads', async () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      isLoading: true,
      signOut: vi.fn(),
      signInWithEmail: vi.fn(),
      signInWithGoogle: vi.fn(),
      createUserWithEmail: vi.fn()
    });

    render(<AccountPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display user profile for authenticated users', async () => {
    const mockUser = createMockUser({
      displayName: 'Jason Jones',
      email: 'jason@flowency.co.uk',
      photoURL: 'https://example.com/photo.jpg',
      emailVerified: true
    });

    mockUseAuth.mockReturnValue({
      currentUser: mockUser,
      isLoading: false,
      signOut: vi.fn(),
      signInWithEmail: vi.fn(),
      signInWithGoogle: vi.fn(),
      createUserWithEmail: vi.fn()
    });

    render(<AccountPage />);

    // Should show user profile in header and tabbed interface
    expect(screen.getByText('Jason Jones')).toBeInTheDocument();
    expect(screen.getByText('jason@flowency.co.uk')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByTestId('profile-tab')).toBeInTheDocument();
  });

  it('should display tabbed interface with profile tab active by default', async () => {
    const mockUser = createMockUser({
      email: 'jason@flowency.co.uk',
      emailVerified: false
    });

    mockUseAuth.mockReturnValue({
      currentUser: mockUser,
      isLoading: false,
      signOut: vi.fn(),
      signInWithEmail: vi.fn(),
      signInWithGoogle: vi.fn(),
      createUserWithEmail: vi.fn()
    });

    render(<AccountPage />);

    // Should show tab navigation
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
    
    // Profile tab should be active by default
    const profileTab = screen.getByRole('button', { name: 'Profile' });
    expect(profileTab).toHaveClass('border-orange-500', 'text-orange-500');
  });

  it('should have sign out functionality', async () => {
    const mockUser = createMockUser();
    const mockSignOut = vi.fn();

    mockUseAuth.mockReturnValue({
      currentUser: mockUser,
      isLoading: false,
      signOut: mockSignOut,
      signInWithEmail: vi.fn(),
      signInWithGoogle: vi.fn(),
      createUserWithEmail: vi.fn()
    });

    render(<AccountPage />);

    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    expect(signOutButton).toBeInTheDocument();
  });

  it('should allow switching between tabs', async () => {
    const mockUser = createMockUser();

    mockUseAuth.mockReturnValue({
      currentUser: mockUser,
      isLoading: false,
      signOut: vi.fn(),
      signInWithEmail: vi.fn(),
      signInWithGoogle: vi.fn(),
      createUserWithEmail: vi.fn()
    });

    render(<AccountPage />);

    // Initially shows profile tab
    expect(screen.getByTestId('profile-tab')).toBeInTheDocument();

    // Click on Settings tab
    const settingsTab = screen.getByRole('button', { name: 'Settings' });
    fireEvent.click(settingsTab);
    
    expect(screen.getByText('Settings tab coming soon...')).toBeInTheDocument();
    expect(screen.queryByTestId('profile-tab')).not.toBeInTheDocument();

    // Click on Security tab
    const securityTab = screen.getByRole('button', { name: 'Security' });
    fireEvent.click(securityTab);
    
    expect(screen.getByText('Security tab coming soon...')).toBeInTheDocument();
    expect(screen.queryByText('Settings tab coming soon...')).not.toBeInTheDocument();
  });

  it('should be mobile responsive with proper touch targets', async () => {
    const mockUser = createMockUser();

    mockUseAuth.mockReturnValue({
      currentUser: mockUser,
      isLoading: false,
      signOut: vi.fn(),
      signInWithEmail: vi.fn(),
      signInWithGoogle: vi.fn(),
      createUserWithEmail: vi.fn()
    });

    render(<AccountPage />);

    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    
    // Check for mobile-friendly styling (min-h-[44px] for touch targets)
    expect(signOutButton).toHaveClass('min-h-[44px]');
  });
});