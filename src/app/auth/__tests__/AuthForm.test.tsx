import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuthForm, AuthFormData } from '../components/AuthForm';

// Mock dependencies  
const mockOnSubmit = vi.fn();
const mockOnSocialAuth = vi.fn();

vi.mock('bndy-ui', () => ({
  BndyLogo: ({ className }: { className?: string }) => (
    <div data-testid="bndy-logo" className={className}>BNDY Logo</div>
  ),
}));

describe('AuthForm - New Unified Design', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onSocialAuth: mockOnSocialAuth,
    'data-testid': 'auth-form' as const,
  };

  describe('Tab Interface', () => {
    it('should display Sign In and Register tabs', () => {
      render(<AuthForm {...defaultProps} />);
      
      expect(screen.getByRole('tab', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /register/i })).toBeInTheDocument();
    });

    it('should switch between Sign In and Register modes', async () => {
      const user = userEvent.setup();
      render(<AuthForm {...defaultProps} />);
      
      // Initially should be in register mode (default)
      expect(screen.getByText(/create your account/i)).toBeInTheDocument();
      expect(screen.getByText(/join us and get started/i)).toBeInTheDocument();
      
      // Switch to Sign In mode
      const signInTab = screen.getByRole('tab', { name: /sign in/i });
      await user.click(signInTab);
      
      // Should now show Sign In content
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
    });

    it('should highlight active tab correctly', () => {
      render(<AuthForm {...defaultProps} initialMode="register" />);
      
      const registerTab = screen.getByRole('tab', { name: /register/i });
      const signInTab = screen.getByRole('tab', { name: /sign in/i });
      
      expect(registerTab).toHaveAttribute('aria-selected', 'true');
      expect(signInTab).toHaveAttribute('aria-selected', 'false');
    });

    it('should show correct heading based on active tab', async () => {
      const user = userEvent.setup();
      render(<AuthForm {...defaultProps} />);
      
      // Default is register mode
      expect(screen.getByText(/create your account/i)).toBeInTheDocument();
      
      // Switch to login
      const loginTab = screen.getByRole('tab', { name: /sign in/i });
      await user.click(loginTab);
      
      // Wait for the state to update and check tab selection
      await waitFor(() => {
        expect(loginTab).toHaveAttribute('aria-selected', 'true');
      });
      
      // Check the heading changed
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    });
  });

  describe('Input Method Toggle', () => {
    it('should display Email and Phone toggle buttons', () => {
      render(<AuthForm {...defaultProps} />);
      
      expect(screen.getByTestId('auth-form-method-toggle-email')).toBeInTheDocument();
      expect(screen.getByTestId('auth-form-method-toggle-phone')).toBeInTheDocument();
    });

    it('should switch between Email and Phone input methods', async () => {
      const user = userEvent.setup();
      render(<AuthForm {...defaultProps} />);
      
      // Initially should show email input (default)
      expect(screen.getByTestId('auth-form-email-input')).toBeInTheDocument();
      
      // Switch to phone method
      const phoneToggle = screen.getByTestId('auth-form-method-toggle-phone');
      await user.click(phoneToggle);
      
      // Should now show phone input
      expect(screen.getByTestId('auth-form-phone-input')).toBeInTheDocument();
    });
  });

  describe('Social Authentication', () => {
    it('should display all social login options', () => {
      render(<AuthForm {...defaultProps} />);
      
      expect(screen.getByTestId('auth-form-social-grid-google')).toBeInTheDocument();
      expect(screen.getByTestId('auth-form-social-grid-facebook')).toBeInTheDocument();
      expect(screen.getByTestId('auth-form-social-grid-apple')).toBeInTheDocument();
    });

    it('should call onSocialAuth when social button is clicked', async () => {
      const user = userEvent.setup();
      render(<AuthForm {...defaultProps} />);
      
      const googleButton = screen.getByTestId('auth-form-social-grid-google');
      await user.click(googleButton);
      
      expect(mockOnSocialAuth).toHaveBeenCalledWith('google');
    });
  });

  describe('Form Fields', () => {
    it('should display name fields in register mode', () => {
      render(<AuthForm {...defaultProps} initialMode="register" />);
      
      expect(screen.getByTestId('auth-form-first-name-input')).toBeInTheDocument();
      expect(screen.getByTestId('auth-form-last-name-input')).toBeInTheDocument();
    });

    it('should not display name fields in login mode', async () => {
      const user = userEvent.setup();
      render(<AuthForm {...defaultProps} initialMode="login" />);
      
      expect(screen.queryByTestId('auth-form-first-name-input')).not.toBeInTheDocument();
      expect(screen.queryByTestId('auth-form-last-name-input')).not.toBeInTheDocument();
    });

    it('should display remember me checkbox in login mode', () => {
      render(<AuthForm {...defaultProps} initialMode="login" />);
      
      expect(screen.getByTestId('auth-form-remember-me')).toBeInTheDocument();
    });

    it('should display terms checkbox in register mode', () => {
      render(<AuthForm {...defaultProps} initialMode="register" />);
      
      expect(screen.getByTestId('auth-form-accept-terms')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should submit registration form with correct data', async () => {
      const user = userEvent.setup();
      render(<AuthForm {...defaultProps} initialMode="register" />);
      
      // Fill in form fields
      await user.type(screen.getByTestId('auth-form-first-name-input'), 'John');
      await user.type(screen.getByTestId('auth-form-last-name-input'), 'Doe');
      await user.type(screen.getByTestId('auth-form-email-input'), 'john@example.com');
      await user.type(screen.getByTestId('auth-form-password-input'), 'password123');
      await user.click(screen.getByTestId('auth-form-accept-terms'));
      
      // Submit form
      await user.click(screen.getByTestId('auth-form-submit'));
      
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'register',
          method: 'email',
          email: 'john@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          acceptTerms: true,
        })
      );
    });

    it('should submit login form with correct data', async () => {
      const user = userEvent.setup();
      render(<AuthForm {...defaultProps} initialMode="login" />);
      
      // Fill in form fields
      await user.type(screen.getByTestId('auth-form-email-input'), 'test@example.com');
      await user.type(screen.getByTestId('auth-form-password-input'), 'password123');
      
      // Submit form
      await user.click(screen.getByTestId('auth-form-submit'));
      
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'login',
          method: 'email',
          email: 'test@example.com',
          password: 'password123',
        })
      );
    });

    it('should not submit form with empty fields', async () => {
      const user = userEvent.setup();
      render(<AuthForm {...defaultProps} initialMode="login" />);
      
      // Try to submit without filling fields
      await user.click(screen.getByTestId('auth-form-submit'));
      
      // Should not call onSubmit with empty data
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show forgot password form', async () => {
      const user = userEvent.setup();
      render(<AuthForm {...defaultProps} initialMode="login" />);
      
      // Click forgot password link
      await user.click(screen.getByTestId('auth-form-forgot-password'));
      
      // Should show forgot password form
      expect(screen.getByTestId('auth-form-forgot-password-header')).toBeInTheDocument();
      expect(screen.getByTestId('auth-form-forgot-email-input')).toBeInTheDocument();
      expect(screen.getByTestId('auth-form-reset-button')).toBeInTheDocument();
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should use 3-column grid for social buttons', () => {
      render(<AuthForm {...defaultProps} />);
      
      const socialGrid = screen.getByTestId('auth-form-social-grid');
      expect(socialGrid).toHaveClass('grid-cols-3');
    });

    it('should maintain touch-friendly button sizes (48px minimum)', () => {
      render(<AuthForm {...defaultProps} />);
      
      const signInTab = screen.getByRole('tab', { name: /sign in/i });
      expect(signInTab).toHaveClass('min-h-[48px]');
    });

    it('should use full-width inputs on mobile', () => {
      render(<AuthForm {...defaultProps} />);
      
      const emailInput = screen.getByTestId('auth-form-email-input');
      expect(emailInput).toHaveClass('w-full');
    });
  });

  describe('BNDY Branding', () => {
    it('should display BNDY logo', () => {
      render(<AuthForm {...defaultProps} />);
      
      expect(screen.getByTestId('bndy-logo')).toBeInTheDocument();
    });

    it('should use BNDY color scheme with gradient background', () => {
      render(<AuthForm {...defaultProps} />);
      
      const submitButton = screen.getByTestId('auth-form-submit');
      expect(submitButton).toHaveClass('!bg-gradient-to-r', '!from-orange-500', '!to-orange-600');
    });

    it('should display BNDY tagline', () => {
      render(<AuthForm {...defaultProps} />);
      
      // Check for branding section
      expect(screen.getByTestId('auth-form-branding')).toBeInTheDocument();
      
      // Check the key parts of the tagline are present
      expect(screen.getByText('Keeping')).toBeInTheDocument();
      expect(screen.getByText('ALIVE')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading state when isLoading prop is true', () => {
      render(<AuthForm {...defaultProps} isLoading={true} />);
      
      const submitButton = screen.getByTestId('auth-form-submit');
      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/please wait/i)).toBeInTheDocument();
    });

    it('should disable form during submission', () => {
      render(<AuthForm {...defaultProps} isLoading={true} />);
      
      const emailInput = screen.getByTestId('auth-form-email-input');
      const passwordInput = screen.getByTestId('auth-form-password-input');
      const submitButton = screen.getByTestId('auth-form-submit');
      
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should display authentication errors', () => {
      render(<AuthForm {...defaultProps} error="Invalid credentials" />);
      
      expect(screen.getByTestId('auth-form-error')).toBeInTheDocument();
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });

    it('should not submit form with invalid data', async () => {
      const user = userEvent.setup();
      render(<AuthForm {...defaultProps} />);
      
      // Try to submit invalid email
      await user.type(screen.getByTestId('auth-form-email-input'), 'invalid-email');
      await user.click(screen.getByTestId('auth-form-submit'));
      
      // Should not call onSubmit with invalid data
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<AuthForm {...defaultProps} />);
      
      const googleButton = screen.getByTestId('auth-form-social-grid-google');
      expect(googleButton).toHaveAttribute('aria-label', expect.stringMatching(/sign.*google/i));
      
      const signInTab = screen.getByRole('tab', { name: /sign in/i });
      expect(signInTab).toHaveAttribute('role', 'tab');
      expect(signInTab).toHaveAttribute('aria-selected');
    });

    it('should support keyboard navigation', async () => {
      render(<AuthForm {...defaultProps} />);
      
      const signInTab = screen.getByRole('tab', { name: /sign in/i });
      const registerTab = screen.getByRole('tab', { name: /register/i });
      
      // Tab navigation should work
      signInTab.focus();
      expect(signInTab).toHaveFocus();
      
      // Enter key should switch tabs
      fireEvent.keyDown(signInTab, { key: 'Enter' });
      expect(signInTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should have accessible form structure', () => {
      render(<AuthForm {...defaultProps} />);
      
      // Form should have proper structure
      const form = screen.getByTestId('auth-form-form');
      expect(form).toBeInTheDocument();
      
      const emailInput = screen.getByTestId('auth-form-email-input');
      expect(emailInput).toHaveAttribute('id');
    });
  });
});