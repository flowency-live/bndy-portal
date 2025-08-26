import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ProfileTab } from '../ProfileTab';
import { createMockUser } from '../../../__mocks__/auth';

// Mock bndy-ui auth
const mockUseAuth = vi.fn();
vi.mock('bndy-ui/auth', () => ({
  useAuth: () => mockUseAuth()
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, className, ...props }: any) => (
    <img src={src} alt={alt} className={className} {...props} />
  )
}));

// Mock React Icons
vi.mock('react-icons/fa', () => ({
  FaCheckCircle: ({ size, className }: any) => (
    <div data-testid="check-circle" data-size={size} className={className}>✓</div>
  ),
  FaExclamationTriangle: ({ size, className }: any) => (
    <div data-testid="alert-circle" data-size={size} className={className}>!</div>
  )
}));

describe('ProfileTab', () => {
  const defaultProps = {
    verificationSent: false,
    sendingVerification: false,
    handleSendVerification: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication State', () => {
    it('should return null when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        currentUser: null
      });

      const { container } = render(<ProfileTab {...defaultProps} />);
      expect(container.firstChild).toBeNull();
    });

    it('should render profile when user is authenticated', () => {
      const mockUser = createMockUser({
        displayName: 'John Doe',
        email: 'john@example.com',
        emailVerified: true,
        photoURL: 'https://example.com/photo.jpg'
      });

      mockUseAuth.mockReturnValue({
        currentUser: mockUser
      });

      render(<ProfileTab {...defaultProps} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  describe('Profile Display', () => {
    it('should display user profile photo when available', () => {
      const mockUser = createMockUser({
        displayName: 'John Doe',
        email: 'john@example.com',
        photoURL: 'https://example.com/photo.jpg'
      });

      mockUseAuth.mockReturnValue({
        currentUser: mockUser
      });

      render(<ProfileTab {...defaultProps} />);
      
      const profileImage = screen.getByRole('img');
      expect(profileImage).toHaveAttribute('src', 'https://example.com/photo.jpg');
      expect(profileImage).toHaveAttribute('alt', 'John Doe');
    });

    it('should display initial letter when no photo is available', () => {
      const mockUser = createMockUser({
        displayName: 'John Doe',
        email: 'john@example.com',
        photoURL: null
      });

      mockUseAuth.mockReturnValue({
        currentUser: mockUser
      });

      render(<ProfileTab {...defaultProps} />);
      
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('should display "U" when no display name or photo is available', () => {
      const mockUser = createMockUser({
        displayName: null,
        email: 'john@example.com',
        photoURL: null
      });

      mockUseAuth.mockReturnValue({
        currentUser: mockUser
      });

      render(<ProfileTab {...defaultProps} />);
      
      expect(screen.getByText('U')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
    });
  });

  describe('Email Verification', () => {
    it('should show verified status for verified emails', () => {
      const mockUser = createMockUser({
        displayName: 'John Doe',
        email: 'john@example.com',
        emailVerified: true
      });

      mockUseAuth.mockReturnValue({
        currentUser: mockUser
      });

      render(<ProfileTab {...defaultProps} />);
      
      expect(screen.getByText('Verified')).toBeInTheDocument();
      expect(screen.getByTestId('check-circle')).toBeInTheDocument();
      expect(screen.queryByText('Send verification email')).not.toBeInTheDocument();
    });

    it('should show not verified status for unverified emails', () => {
      const mockUser = createMockUser({
        displayName: 'John Doe',
        email: 'john@example.com',
        emailVerified: false
      });

      mockUseAuth.mockReturnValue({
        currentUser: mockUser
      });

      render(<ProfileTab {...defaultProps} />);
      
      expect(screen.getByText('Not verified')).toBeInTheDocument();
      expect(screen.getByTestId('alert-circle')).toBeInTheDocument();
      expect(screen.getByText('Send verification email')).toBeInTheDocument();
    });

    it('should call handleSendVerification when verification button is clicked', async () => {
      const mockUser = createMockUser({
        displayName: 'John Doe',
        email: 'john@example.com',
        emailVerified: false
      });

      const mockHandleSendVerification = vi.fn();
      mockUseAuth.mockReturnValue({
        currentUser: mockUser
      });

      render(<ProfileTab {...defaultProps} handleSendVerification={mockHandleSendVerification} />);
      
      const verificationButton = screen.getByText('Send verification email');
      fireEvent.click(verificationButton);

      expect(mockHandleSendVerification).toHaveBeenCalledTimes(1);
    });

    it('should show sending state when verification is being sent', () => {
      const mockUser = createMockUser({
        displayName: 'John Doe',
        email: 'john@example.com',
        emailVerified: false
      });

      mockUseAuth.mockReturnValue({
        currentUser: mockUser
      });

      render(<ProfileTab {...defaultProps} sendingVerification={true} />);
      
      expect(screen.getByText('Sending...')).toBeInTheDocument();
    });

    it('should show sent state when verification has been sent', () => {
      const mockUser = createMockUser({
        displayName: 'John Doe',
        email: 'john@example.com',
        emailVerified: false
      });

      mockUseAuth.mockReturnValue({
        currentUser: mockUser
      });

      render(<ProfileTab {...defaultProps} verificationSent={true} />);
      
      expect(screen.getByText('Verification email sent!')).toBeInTheDocument();
    });

    it('should disable verification button when sending or already sent', () => {
      const mockUser = createMockUser({
        displayName: 'John Doe',
        email: 'john@example.com',
        emailVerified: false
      });

      mockUseAuth.mockReturnValue({
        currentUser: mockUser
      });

      const { rerender } = render(<ProfileTab {...defaultProps} sendingVerification={true} />);
      
      expect(screen.getByRole('button')).toBeDisabled();

      rerender(<ProfileTab {...defaultProps} verificationSent={true} />);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Account Details', () => {
    it('should display user ID in monospace font', () => {
      const mockUser = createMockUser({
        uid: 'test-user-id-123',
        displayName: 'John Doe',
        email: 'john@example.com'
      });

      mockUseAuth.mockReturnValue({
        currentUser: mockUser
      });

      render(<ProfileTab {...defaultProps} />);
      
      expect(screen.getByText('User ID')).toBeInTheDocument();
      expect(screen.getByText('test-user-id-123')).toBeInTheDocument();
      expect(screen.getByText('test-user-id-123')).toHaveClass('font-mono');
    });

    it('should display account creation time when available', () => {
      const mockUser = createMockUser({
        displayName: 'John Doe',
        email: 'john@example.com',
        metadata: {
          creationTime: 'Wed, 25 Dec 2024 12:00:00 GMT',
          lastSignInTime: 'Wed, 25 Dec 2024 13:00:00 GMT'
        }
      });

      mockUseAuth.mockReturnValue({
        currentUser: mockUser
      });

      render(<ProfileTab {...defaultProps} />);
      
      expect(screen.getByText('Account Created')).toBeInTheDocument();
      expect(screen.getByText('Last Sign In')).toBeInTheDocument();
      // Should display formatted dates
      expect(screen.getAllByText((content) => content.includes('25'))).toHaveLength(2);
    });

    it('should display Unknown when metadata is not available', () => {
      const mockUser = createMockUser({
        displayName: 'John Doe',
        email: 'john@example.com',
        metadata: {}
      });

      mockUseAuth.mockReturnValue({
        currentUser: mockUser
      });

      render(<ProfileTab {...defaultProps} />);
      
      expect(screen.getAllByText('Unknown')).toHaveLength(2);
    });

    it('should display authentication providers', () => {
      const mockUser = createMockUser({
        displayName: 'John Doe',
        email: 'john@example.com',
        providerData: [
          { providerId: 'google.com' },
          { providerId: 'password' }
        ]
      });

      mockUseAuth.mockReturnValue({
        currentUser: mockUser
      });

      render(<ProfileTab {...defaultProps} />);
      
      expect(screen.getByText('Authentication Providers')).toBeInTheDocument();
      expect(screen.getByText('google.com, password')).toBeInTheDocument();
    });

    it('should display None when no providers are available', () => {
      const mockUser = createMockUser({
        displayName: 'John Doe',
        email: 'john@example.com',
        providerData: []
      });

      mockUseAuth.mockReturnValue({
        currentUser: mockUser
      });

      render(<ProfileTab {...defaultProps} />);
      
      expect(screen.getByText('None')).toBeInTheDocument();
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should have responsive layout classes', () => {
      const mockUser = createMockUser({
        displayName: 'John Doe',
        email: 'john@example.com'
      });

      mockUseAuth.mockReturnValue({
        currentUser: mockUser
      });

      const { container } = render(<ProfileTab {...defaultProps} />);
      
      // Check for responsive classes
      expect(container.querySelector('.sm\\:flex-row')).toBeInTheDocument();
      expect(container.querySelector('.sm\\:items-center')).toBeInTheDocument();
    });

    it('should have proper spacing and layout structure', () => {
      const mockUser = createMockUser({
        displayName: 'John Doe',
        email: 'john@example.com'
      });

      mockUseAuth.mockReturnValue({
        currentUser: mockUser
      });

      const { container } = render(<ProfileTab {...defaultProps} />);
      
      // Check for proper spacing classes
      expect(container.querySelector('.space-y-6')).toBeInTheDocument();
      expect(container.querySelector('.space-y-4')).toBeInTheDocument();
    });
  });

  describe('Bndy Dark Theme Integration', () => {
    it('should use bndy dark theme colors', () => {
      const mockUser = createMockUser({
        displayName: 'John Doe',
        email: 'john@example.com'
      });

      mockUseAuth.mockReturnValue({
        currentUser: mockUser
      });

      const { container } = render(<ProfileTab {...defaultProps} />);
      
      // Should use slate-800 background consistent with bndy dark theme
      expect(container.querySelector('.bg-slate-800')).toBeInTheDocument();
      expect(container.querySelector('.border-slate-700')).toBeInTheDocument();
    });
  });
});