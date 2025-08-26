import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { SocialLoginButtons } from '../SocialLoginButtons';
import { useAuth } from 'bndy-ui/auth';

// Mock the auth hook
vi.mock('bndy-ui/auth', () => ({
  useAuth: vi.fn()
}));

// Mock Firebase auth functions
vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: vi.fn(),
  FacebookAuthProvider: vi.fn(),
  OAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  signInWithRedirect: vi.fn(),
  getRedirectResult: vi.fn()
}));

describe('SocialLoginButtons', () => {
  const mockOnError = vi.fn();
  const mockSignInWithGoogle = vi.fn();
  const mockSignInWithFacebook = vi.fn();
  const mockSignInWithApple = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      signInWithGoogle: mockSignInWithGoogle,
      signInWithFacebook: mockSignInWithFacebook,
      signInWithApple: mockSignInWithApple,
      isLoading: false
    });
  });

  describe('Component Rendering', () => {
    it('should render all social login buttons', () => {
      render(<SocialLoginButtons onError={mockOnError} />);
      
      expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue with facebook/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue with apple/i })).toBeInTheDocument();
    });

    it('should display "Or continue with" text', () => {
      render(<SocialLoginButtons onError={mockOnError} />);
      
      expect(screen.getByText(/or continue with/i)).toBeInTheDocument();
    });

    it('should have proper accessibility attributes', () => {
      render(<SocialLoginButtons onError={mockOnError} />);
      
      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      expect(googleButton).toHaveAttribute('aria-label', 'Continue with Google');
      
      const facebookButton = screen.getByRole('button', { name: /continue with facebook/i });
      expect(facebookButton).toHaveAttribute('aria-label', 'Continue with Facebook');
      
      const appleButton = screen.getByRole('button', { name: /continue with apple/i });
      expect(appleButton).toHaveAttribute('aria-label', 'Continue with Apple');
    });

    it('should apply mobile-friendly styling classes', () => {
      render(<SocialLoginButtons onError={mockOnError} />);
      
      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      expect(googleButton).toHaveClass('min-h-[44px]'); // Touch-friendly size
    });
  });

  describe('Google Sign-In', () => {
    it('should call signInWithGoogle when Google button is clicked', async () => {
      mockSignInWithGoogle.mockResolvedValue({ user: { uid: 'test-uid' } });
      const user = userEvent.setup();
      
      render(<SocialLoginButtons onError={mockOnError} />);
      
      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      await user.click(googleButton);
      
      expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
    });

    it('should handle Google sign-in errors', async () => {
      mockSignInWithGoogle.mockRejectedValue(new Error('auth/popup-closed-by-user'));
      const user = userEvent.setup();
      
      render(<SocialLoginButtons onError={mockOnError} />);
      
      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      await user.click(googleButton);
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Sign-in cancelled. Please try again.');
      });
    });

    it('should disable button during sign-in process', async () => {
      mockSignInWithGoogle.mockImplementation(() => new Promise(() => {})); // Never resolves
      const user = userEvent.setup();
      
      render(<SocialLoginButtons onError={mockOnError} />);
      
      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      await user.click(googleButton);
      
      expect(googleButton).toBeDisabled();
    });
  });

  describe('Facebook Sign-In', () => {
    it('should call signInWithFacebook when Facebook button is clicked', async () => {
      mockSignInWithFacebook.mockResolvedValue({ user: { uid: 'test-uid' } });
      const user = userEvent.setup();
      
      render(<SocialLoginButtons onError={mockOnError} />);
      
      const facebookButton = screen.getByRole('button', { name: /continue with facebook/i });
      await user.click(facebookButton);
      
      expect(mockSignInWithFacebook).toHaveBeenCalledTimes(1);
    });

    it('should handle Facebook sign-in errors', async () => {
      mockSignInWithFacebook.mockRejectedValue(new Error('auth/account-exists-with-different-credential'));
      const user = userEvent.setup();
      
      render(<SocialLoginButtons onError={mockOnError} />);
      
      const facebookButton = screen.getByRole('button', { name: /continue with facebook/i });
      await user.click(facebookButton);
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('An account already exists with the same email address but different sign-in credentials.');
      });
    });
  });

  describe('Apple Sign-In', () => {
    it('should call signInWithApple when Apple button is clicked', async () => {
      mockSignInWithApple.mockResolvedValue({ user: { uid: 'test-uid' } });
      const user = userEvent.setup();
      
      render(<SocialLoginButtons onError={mockOnError} />);
      
      const appleButton = screen.getByRole('button', { name: /continue with apple/i });
      await user.click(appleButton);
      
      expect(mockSignInWithApple).toHaveBeenCalledTimes(1);
    });

    it('should handle Apple sign-in errors', async () => {
      mockSignInWithApple.mockRejectedValue(new Error('auth/operation-not-allowed'));
      const user = userEvent.setup();
      
      render(<SocialLoginButtons onError={mockOnError} />);
      
      const appleButton = screen.getByRole('button', { name: /continue with apple/i });
      await user.click(appleButton);
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('This sign-in method is not enabled. Please contact support.');
      });
    });
  });

  describe('Loading State', () => {
    it('should disable all buttons when isLoading is true', () => {
      (useAuth as any).mockReturnValue({
        signInWithGoogle: mockSignInWithGoogle,
        signInWithFacebook: mockSignInWithFacebook,
        signInWithApple: mockSignInWithApple,
        isLoading: true
      });
      
      render(<SocialLoginButtons onError={mockOnError} />);
      
      expect(screen.getByRole('button', { name: /continue with google/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /continue with facebook/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /continue with apple/i })).toBeDisabled();
    });
  });

  describe('Disabled State', () => {
    it('should disable all buttons when disabled prop is true', () => {
      render(<SocialLoginButtons onError={mockOnError} disabled={true} />);
      
      expect(screen.getByRole('button', { name: /continue with google/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /continue with facebook/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /continue with apple/i })).toBeDisabled();
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should have touch-friendly button sizes', () => {
      render(<SocialLoginButtons onError={mockOnError} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('min-h-[44px]');
      });
    });

    it('should have proper spacing between buttons', () => {
      render(<SocialLoginButtons onError={mockOnError} />);
      
      const container = screen.getByTestId('social-login-container');
      expect(container).toHaveClass('space-y-3');
    });
  });

  describe('Error Handling', () => {
    const errorCases = [
      { error: 'auth/popup-closed-by-user', message: 'Sign-in cancelled. Please try again.' },
      { error: 'auth/cancelled-popup-request', message: 'Only one sign-in popup allowed at a time.' },
      { error: 'auth/popup-blocked', message: 'Sign-in popup was blocked. Please allow popups for this site.' },
      { error: 'auth/account-exists-with-different-credential', message: 'An account already exists with the same email address but different sign-in credentials.' },
      { error: 'auth/network-request-failed', message: 'Network error. Please check your connection and try again.' },
      { error: 'auth/too-many-requests', message: 'Too many unsuccessful attempts. Please try again later.' },
      { error: 'auth/user-disabled', message: 'This account has been disabled. Please contact support.' },
      { error: 'auth/operation-not-allowed', message: 'This sign-in method is not enabled. Please contact support.' }
    ];

    errorCases.forEach(({ error, message }) => {
      it(`should handle ${error} error correctly`, async () => {
        mockSignInWithGoogle.mockRejectedValue(new Error(error));
        const user = userEvent.setup();
        
        render(<SocialLoginButtons onError={mockOnError} />);
        
        const googleButton = screen.getByRole('button', { name: /continue with google/i });
        await user.click(googleButton);
        
        await waitFor(() => {
          expect(mockOnError).toHaveBeenCalledWith(message);
        });
      });
    });

    it('should handle unknown errors with generic message', async () => {
      mockSignInWithGoogle.mockRejectedValue(new Error('unknown-error'));
      const user = userEvent.setup();
      
      render(<SocialLoginButtons onError={mockOnError} />);
      
      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      await user.click(googleButton);
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('An unexpected error occurred. Please try again.');
      });
    });
  });
});