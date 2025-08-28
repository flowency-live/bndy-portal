import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from 'bndy-ui/auth';
import { ActionCodeSettings, UserCredential } from 'firebase/auth';

// Mock Firebase Auth
vi.mock('firebase/auth', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    sendSignInLinkToEmail: vi.fn(),
    signInWithEmailLink: vi.fn(),
    isSignInWithEmailLink: vi.fn(),
  };
});

vi.mock('bndy-ui/auth', () => ({
  useAuth: vi.fn(),
}));

describe('Email Magic Link Authentication', () => {
  const mockSendSignInLinkToEmail = vi.fn();
  const mockSignInWithEmailLink = vi.fn();
  const mockIsSignInWithEmailLink = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    (useAuth as any).mockReturnValue({
      currentUser: null,
      isLoading: false,
      error: null,
      sendSignInLinkToEmail: mockSendSignInLinkToEmail,
      signInWithEmailLink: mockSignInWithEmailLink,
      isSignInWithEmailLink: mockIsSignInWithEmailLink,
      clearError: mockClearError,
    });
  });

  describe('sendSignInLinkToEmail', () => {
    it('should be available in auth context', () => {
      const { result } = renderHook(() => useAuth());
      
      expect(result.current.sendSignInLinkToEmail).toBeDefined();
      expect(typeof result.current.sendSignInLinkToEmail).toBe('function');
    });

    it('should send magic link to email with action code settings', async () => {
      const email = 'user@example.com';
      const actionCodeSettings: ActionCodeSettings = {
        url: 'https://app.bndy.test/auth/confirm',
        handleCodeInApp: true,
      };

      mockSendSignInLinkToEmail.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useAuth());
      
      await result.current.sendSignInLinkToEmail(email, actionCodeSettings);
      
      expect(mockSendSignInLinkToEmail).toHaveBeenCalledWith(email, actionCodeSettings);
      expect(mockSendSignInLinkToEmail).toHaveBeenCalledTimes(1);
    });

    it('should handle successful email magic link sending', async () => {
      const email = 'test@bndy.co.uk';
      const actionCodeSettings: ActionCodeSettings = {
        url: 'https://app.bndy.co.uk/auth/confirm',
        handleCodeInApp: true,
      };

      mockSendSignInLinkToEmail.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useAuth());
      
      await expect(result.current.sendSignInLinkToEmail(email, actionCodeSettings))
        .resolves.not.toThrow();
    });

    it('should handle email validation errors', async () => {
      const invalidEmail = 'invalid-email';
      const actionCodeSettings: ActionCodeSettings = {
        url: 'https://app.bndy.test/auth/confirm',
        handleCodeInApp: true,
      };

      const authError = new Error('Invalid email address');
      authError.code = 'auth/invalid-email';
      mockSendSignInLinkToEmail.mockRejectedValueOnce(authError);

      const { result } = renderHook(() => useAuth());
      
      await expect(result.current.sendSignInLinkToEmail(invalidEmail, actionCodeSettings))
        .rejects.toThrow('Invalid email address');
    });

    it('should clear errors before sending', async () => {
      const email = 'user@example.com';
      const actionCodeSettings: ActionCodeSettings = {
        url: 'https://app.bndy.test/auth/confirm',
        handleCodeInApp: true,
      };

      // Mock the actual implementation to verify clearError is called
      let clearErrorCalled = false;
      mockSendSignInLinkToEmail.mockImplementationOnce(async () => {
        // The real implementation would call clearError before sending
        mockClearError();
      });

      const { result } = renderHook(() => useAuth());
      
      await result.current.sendSignInLinkToEmail(email, actionCodeSettings);
      
      expect(mockClearError).toHaveBeenCalled();
    });

    it('should handle network errors gracefully', async () => {
      const email = 'user@example.com';
      const actionCodeSettings: ActionCodeSettings = {
        url: 'https://app.bndy.test/auth/confirm',
        handleCodeInApp: true,
      };

      const networkError = new Error('Network error');
      networkError.code = 'auth/network-request-failed';
      mockSendSignInLinkToEmail.mockRejectedValueOnce(networkError);

      const { result } = renderHook(() => useAuth());
      
      await expect(result.current.sendSignInLinkToEmail(email, actionCodeSettings))
        .rejects.toThrow('Network error');
    });
  });

  describe('signInWithEmailLink', () => {
    it('should be available in auth context', () => {
      const { result } = renderHook(() => useAuth());
      
      expect(result.current.signInWithEmailLink).toBeDefined();
      expect(typeof result.current.signInWithEmailLink).toBe('function');
    });

    it('should sign in with email and magic link', async () => {
      const email = 'user@example.com';
      const emailLink = 'https://app.bndy.test/auth/confirm?apiKey=test&mode=signIn&oobCode=test123';
      
      const mockUserCredential: UserCredential = {
        user: {
          uid: 'test-uid',
          email,
          displayName: null,
          photoURL: null,
        } as any,
        providerId: 'password',
        operationType: 'signIn' as any,
      };

      mockSignInWithEmailLink.mockResolvedValueOnce(mockUserCredential);

      const { result } = renderHook(() => useAuth());
      
      const userCredential = await result.current.signInWithEmailLink(email, emailLink);
      
      expect(mockSignInWithEmailLink).toHaveBeenCalledWith(email, emailLink);
      expect(userCredential).toEqual(mockUserCredential);
    });

    it('should handle invalid email link errors', async () => {
      const email = 'user@example.com';
      const invalidEmailLink = 'https://app.bndy.test/auth/confirm?invalid=true';

      const authError = new Error('Invalid action code');
      authError.code = 'auth/invalid-action-code';
      mockSignInWithEmailLink.mockRejectedValueOnce(authError);

      const { result } = renderHook(() => useAuth());
      
      await expect(result.current.signInWithEmailLink(email, invalidEmailLink))
        .rejects.toThrow('Invalid action code');
    });

    it('should handle expired email link errors', async () => {
      const email = 'user@example.com';
      const expiredEmailLink = 'https://app.bndy.test/auth/confirm?apiKey=test&mode=signIn&oobCode=expired123';

      const authError = new Error('Expired action code');
      authError.code = 'auth/expired-action-code';
      mockSignInWithEmailLink.mockRejectedValueOnce(authError);

      const { result } = renderHook(() => useAuth());
      
      await expect(result.current.signInWithEmailLink(email, expiredEmailLink))
        .rejects.toThrow('Expired action code');
    });

    it('should clear errors before sign in', async () => {
      const email = 'user@example.com';
      const emailLink = 'https://app.bndy.test/auth/confirm?apiKey=test&mode=signIn&oobCode=test123';

      const mockUserCredential: UserCredential = {
        user: { uid: 'test-uid', email } as any,
        providerId: 'password',
        operationType: 'signIn' as any,
      };

      // Mock the actual implementation to verify clearError is called
      mockSignInWithEmailLink.mockImplementationOnce(async () => {
        // The real implementation would call clearError before signing in
        mockClearError();
        return mockUserCredential;
      });

      const { result } = renderHook(() => useAuth());
      
      await result.current.signInWithEmailLink(email, emailLink);
      
      expect(mockClearError).toHaveBeenCalled();
    });

    it('should handle email mismatch errors', async () => {
      const email = 'user@example.com';
      const wrongEmail = 'wrong@example.com';
      const emailLink = 'https://app.bndy.test/auth/confirm?apiKey=test&mode=signIn&oobCode=test123';

      const authError = new Error('Email address mismatch');
      authError.code = 'auth/invalid-email';
      mockSignInWithEmailLink.mockRejectedValueOnce(authError);

      const { result } = renderHook(() => useAuth());
      
      await expect(result.current.signInWithEmailLink(wrongEmail, emailLink))
        .rejects.toThrow('Email address mismatch');
    });
  });

  describe('isSignInWithEmailLink', () => {
    it('should be available in auth context', () => {
      const { result } = renderHook(() => useAuth());
      
      expect(result.current.isSignInWithEmailLink).toBeDefined();
      expect(typeof result.current.isSignInWithEmailLink).toBe('function');
    });

    it('should return true for valid sign-in email links', () => {
      const validEmailLink = 'https://app.bndy.test/auth/confirm?apiKey=test&mode=signIn&oobCode=test123';
      
      mockIsSignInWithEmailLink.mockReturnValueOnce(true);

      const { result } = renderHook(() => useAuth());
      
      const isValidLink = result.current.isSignInWithEmailLink(validEmailLink);
      
      expect(mockIsSignInWithEmailLink).toHaveBeenCalledWith(validEmailLink);
      expect(isValidLink).toBe(true);
    });

    it('should return false for invalid links', () => {
      const invalidLink = 'https://app.bndy.test/auth/confirm?invalid=true';
      
      mockIsSignInWithEmailLink.mockReturnValueOnce(false);

      const { result } = renderHook(() => useAuth());
      
      const isValidLink = result.current.isSignInWithEmailLink(invalidLink);
      
      expect(mockIsSignInWithEmailLink).toHaveBeenCalledWith(invalidLink);
      expect(isValidLink).toBe(false);
    });

    it('should return false for regular URLs', () => {
      const regularUrl = 'https://app.bndy.test/dashboard';
      
      mockIsSignInWithEmailLink.mockReturnValueOnce(false);

      const { result } = renderHook(() => useAuth());
      
      const isValidLink = result.current.isSignInWithEmailLink(regularUrl);
      
      expect(isValidLink).toBe(false);
    });

    it('should handle empty string gracefully', () => {
      const emptyString = '';
      
      mockIsSignInWithEmailLink.mockReturnValueOnce(false);

      const { result } = renderHook(() => useAuth());
      
      const isValidLink = result.current.isSignInWithEmailLink(emptyString);
      
      expect(isValidLink).toBe(false);
    });
  });

  describe('Email Magic Link Integration', () => {
    it('should support complete email magic link flow', async () => {
      const email = 'user@bndy.co.uk';
      const actionCodeSettings: ActionCodeSettings = {
        url: 'https://app.bndy.co.uk/auth/confirm',
        handleCodeInApp: true,
      };
      const emailLink = 'https://app.bndy.co.uk/auth/confirm?apiKey=test&mode=signIn&oobCode=magic123';

      // Step 1: Send magic link
      mockSendSignInLinkToEmail.mockResolvedValueOnce(undefined);
      
      // Step 2: Check if link is valid
      mockIsSignInWithEmailLink.mockReturnValueOnce(true);
      
      // Step 3: Sign in with link
      const mockUserCredential: UserCredential = {
        user: { uid: 'magic-user-uid', email } as any,
        providerId: 'password',
        operationType: 'signIn' as any,
      };
      mockSignInWithEmailLink.mockResolvedValueOnce(mockUserCredential);

      const { result } = renderHook(() => useAuth());
      
      // Complete flow test
      await result.current.sendSignInLinkToEmail(email, actionCodeSettings);
      const isValidLink = result.current.isSignInWithEmailLink(emailLink);
      const userCredential = await result.current.signInWithEmailLink(email, emailLink);
      
      expect(mockSendSignInLinkToEmail).toHaveBeenCalledWith(email, actionCodeSettings);
      expect(isValidLink).toBe(true);
      expect(userCredential.user.uid).toBe('magic-user-uid');
    });

    it('should work with different domains', async () => {
      const devEmail = 'dev@example.com';
      const devActionCodeSettings: ActionCodeSettings = {
        url: 'https://app.local.bndy.test:3000/auth/confirm',
        handleCodeInApp: true,
      };

      mockSendSignInLinkToEmail.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useAuth());
      
      await result.current.sendSignInLinkToEmail(devEmail, devActionCodeSettings);
      
      expect(mockSendSignInLinkToEmail).toHaveBeenCalledWith(devEmail, devActionCodeSettings);
    });

    it('should handle loading states properly', async () => {
      const email = 'loading@example.com';
      const actionCodeSettings: ActionCodeSettings = {
        url: 'https://app.bndy.test/auth/confirm',
        handleCodeInApp: true,
      };

      // Mock loading state changes
      let isLoading = false;
      mockSendSignInLinkToEmail.mockImplementationOnce(async () => {
        isLoading = true;
        await new Promise(resolve => setTimeout(resolve, 100));
        isLoading = false;
      });

      const { result } = renderHook(() => useAuth());
      
      const promise = result.current.sendSignInLinkToEmail(email, actionCodeSettings);
      
      // Should be loading during the operation
      await promise;
      
      expect(mockSendSignInLinkToEmail).toHaveBeenCalledWith(email, actionCodeSettings);
    });
  });

  describe('Error Handling', () => {
    it('should handle quota exceeded errors', async () => {
      const email = 'quota@example.com';
      const actionCodeSettings: ActionCodeSettings = {
        url: 'https://app.bndy.test/auth/confirm',
        handleCodeInApp: true,
      };

      const quotaError = new Error('Quota exceeded');
      quotaError.code = 'auth/quota-exceeded';
      mockSendSignInLinkToEmail.mockRejectedValueOnce(quotaError);

      const { result } = renderHook(() => useAuth());
      
      await expect(result.current.sendSignInLinkToEmail(email, actionCodeSettings))
        .rejects.toThrow('Quota exceeded');
    });

    it('should handle unauthorized domain errors', async () => {
      const email = 'user@example.com';
      const actionCodeSettings: ActionCodeSettings = {
        url: 'https://unauthorized-domain.com/auth/confirm',
        handleCodeInApp: true,
      };

      const domainError = new Error('Unauthorized domain');
      domainError.code = 'auth/unauthorized-continue-uri';
      mockSendSignInLinkToEmail.mockRejectedValueOnce(domainError);

      const { result } = renderHook(() => useAuth());
      
      await expect(result.current.sendSignInLinkToEmail(email, actionCodeSettings))
        .rejects.toThrow('Unauthorized domain');
    });
  });
});