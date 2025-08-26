import { vi } from 'vitest';
import type { AuthContextType } from 'bndy-ui/auth';

export const createMockAuthContext = (overrides?: Partial<AuthContextType>): AuthContextType => {
  return {
    currentUser: null,
    isLoading: false,
    error: null,
    signInWithGoogle: vi.fn(),
    signInWithFacebook: vi.fn(),
    signInWithApple: vi.fn(),
    signInWithPhone: vi.fn(),
    confirmPhoneCode: vi.fn(),
    signInWithEmail: vi.fn(),
    createUserWithEmail: vi.fn(),
    signOut: vi.fn(),
    clearError: vi.fn(),
    ...overrides
  };
};

export const createMockUser = (overrides?: Record<string, unknown>) => {
  return {
    uid: '123',
    email: 'test@example.com',
    emailVerified: false,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: vi.fn(),
    getIdToken: vi.fn(),
    getIdTokenResult: vi.fn(),
    reload: vi.fn(),
    toJSON: vi.fn(),
    phoneNumber: null,
    photoURL: null,
    displayName: null,
    providerId: 'firebase',
    ...overrides
  };
};