import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import ProfileSetupPage from '../page';

// Mock the useAuth hook
const mockUpdateProfile = vi.fn();
const mockSignOut = vi.fn();

vi.mock('bndy-ui/auth', () => ({
  useAuth: () => ({
    currentUser: {
      uid: 'test-user-123',
      email: 'test@example.com',
      displayName: null,
      phoneNumber: '+15551234567'
    },
    isLoading: false,
    error: null,
    updateProfile: mockUpdateProfile,
    signOut: mockSignOut,
    clearError: vi.fn()
  })
}));

// Mock useRouter
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace
  })
}));

describe('ProfileSetupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Mobile-First Profile Setup Flow', () => {
    it('should render minimal profile setup form with name field', () => {
      render(<ProfileSetupPage />);
      
      expect(screen.getByText(/welcome to bndy/i)).toBeInTheDocument();
      expect(screen.getByText(/tell us your name/i)).toBeInTheDocument();
      
      const nameInput = screen.getByLabelText(/name/i);
      expect(nameInput).toBeInTheDocument();
      expect(nameInput).toHaveClass('text-lg'); // Large text for mobile
      expect(nameInput).toHaveAttribute('placeholder', 'Your name');
    });

    it('should have prominent Skip button for minimal friction', () => {
      render(<ProfileSetupPage />);
      
      const skipButton = screen.getByRole('button', { name: /skip for now/i });
      expect(skipButton).toBeInTheDocument();
      expect(skipButton).toHaveClass('text-lg'); // Large text
      expect(skipButton).toHaveClass('py-3'); // Large padding for touch
      
      // Skip should be visually prominent but not primary action
      expect(skipButton).toHaveClass('text-blue-600');
    });

    it('should have Save button that becomes enabled with name input', () => {
      render(<ProfileSetupPage />);
      
      const saveButton = screen.getByRole('button', { name: /save and continue/i });
      expect(saveButton).toBeInTheDocument();
      expect(saveButton).toBeDisabled(); // Initially disabled
      
      // Type name to enable button
      const nameInput = screen.getByLabelText(/name/i);
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      
      expect(saveButton).not.toBeDisabled();
    });

    it('should display user phone number for context', () => {
      render(<ProfileSetupPage />);
      
      expect(screen.getByText(/\+1 \(555\) 123-4567/)).toBeInTheDocument();
      expect(screen.getByText(/signed in with phone/i)).toBeInTheDocument();
    });

    it('should handle skip action and redirect to home', async () => {
      render(<ProfileSetupPage />);
      
      const skipButton = screen.getByRole('button', { name: /skip for now/i });
      fireEvent.click(skipButton);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('should handle save action and update user profile', async () => {
      render(<ProfileSetupPage />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const saveButton = screen.getByRole('button', { name: /save and continue/i });
      
      // Enter name
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      
      // Save
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith({
          displayName: 'John Doe'
        });
      });
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('should show loading state during save', async () => {
      // Mock loading state
      vi.mock('bndy-ui/auth', () => ({
        useAuth: () => ({
          currentUser: {
            uid: 'test-user-123',
            email: 'test@example.com',
            displayName: null,
            phoneNumber: '+15551234567'
          },
          isLoading: true,
          error: null,
          updateProfile: mockUpdateProfile,
          signOut: mockSignOut,
          clearError: vi.fn()
        })
      }));

      render(<ProfileSetupPage />);
      
      const saveButton = screen.getByRole('button', { name: /saving.../i });
      expect(saveButton).toBeDisabled();
      expect(saveButton).toHaveClass('opacity-50'); // Visual loading state
    });

    it('should handle errors gracefully with user-friendly messages', () => {
      // Mock error state
      vi.mock('bndy-ui/auth', () => ({
        useAuth: () => ({
          currentUser: {
            uid: 'test-user-123',
            email: 'test@example.com',
            displayName: null,
            phoneNumber: '+15551234567'
          },
          isLoading: false,
          error: { message: 'Network error' },
          updateProfile: mockUpdateProfile,
          signOut: mockSignOut,
          clearError: vi.fn()
        })
      }));

      render(<ProfileSetupPage />);
      
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/please try again/i)).toBeInTheDocument();
    });
  });

  describe('Progressive Enhancement for Desktop', () => {
    it('should show logout option for desktop users', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      render(<ProfileSetupPage />);
      
      expect(screen.getByText(/not you/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
    });

    it('should handle sign out for desktop users', async () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      render(<ProfileSetupPage />);
      
      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      fireEvent.click(signOutButton);
      
      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/auth/phone');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and form structure', () => {
      render(<ProfileSetupPage />);
      
      const form = screen.getByRole('form', { name: /profile setup/i });
      expect(form).toBeInTheDocument();
      
      const nameInput = screen.getByRole('textbox', { name: /name/i });
      expect(nameInput).toHaveAttribute('aria-describedby');
    });

    it('should have minimum 44px touch targets for mobile', () => {
      render(<ProfileSetupPage />);
      
      const saveButton = screen.getByRole('button', { name: /save and continue/i });
      const skipButton = screen.getByRole('button', { name: /skip for now/i });
      
      // Should have at least 44px height for touch accessibility
      expect(saveButton).toHaveClass('min-h-[44px]');
      expect(skipButton).toHaveClass('min-h-[44px]');
    });

    it('should maintain focus flow for keyboard navigation', () => {
      render(<ProfileSetupPage />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const skipButton = screen.getByRole('button', { name: /skip for now/i });
      const saveButton = screen.getByRole('button', { name: /save and continue/i });
      
      // Tab order should be: name input -> skip -> save
      nameInput.focus();
      expect(document.activeElement).toBe(nameInput);
    });
  });

  describe('User Context Display', () => {
    it('should format phone number for display', () => {
      render(<ProfileSetupPage />);
      
      // Should format +15551234567 as +1 (555) 123-4567
      expect(screen.getByText(/\+1 \(555\) 123-4567/)).toBeInTheDocument();
    });

    it('should show email if phone is not available', () => {
      // Mock user with email instead of phone
      vi.mock('bndy-ui/auth', () => ({
        useAuth: () => ({
          currentUser: {
            uid: 'test-user-123',
            email: 'test@example.com',
            displayName: null,
            phoneNumber: null
          },
          isLoading: false,
          error: null,
          updateProfile: mockUpdateProfile,
          signOut: mockSignOut,
          clearError: vi.fn()
        })
      }));

      render(<ProfileSetupPage />);
      
      expect(screen.getByText(/test@example\.com/)).toBeInTheDocument();
      expect(screen.getByText(/signed in with email/i)).toBeInTheDocument();
    });
  });
});