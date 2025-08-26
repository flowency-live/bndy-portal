import { vi } from 'vitest';

export const createMockFirebaseUser = (overrides = {}) => ({
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  phoneNumber: '+1234567890',
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    creationTime: '2023-01-01T00:00:00.000Z',
    lastSignInTime: '2023-01-01T00:00:00.000Z'
  },
  providerData: [],
  refreshToken: 'mock-refresh-token',
  tenantId: null,
  delete: vi.fn(),
  getIdToken: vi.fn(() => Promise.resolve('mock-id-token')),
  getIdTokenResult: vi.fn(() => Promise.resolve({
    claims: {},
    token: 'mock-id-token',
    authTime: '2023-01-01T00:00:00.000Z',
    issuedAtTime: '2023-01-01T00:00:00.000Z',
    expirationTime: '2023-01-01T01:00:00.000Z',
    signInProvider: 'password',
    signInSecondFactor: null
  })),
  reload: vi.fn(),
  toJSON: vi.fn(() => ({})),
  photoURL: null,
  providerId: 'firebase',
  ...overrides
});

export const createMockAuthContext = (overrides = {}) => ({
  currentUser: null,
  isLoading: false,
  error: null,
  signInWithEmail: vi.fn(),
  signInWithGoogle: vi.fn(),
  signInWithPhone: vi.fn(),
  createUserWithEmail: vi.fn(),
  signOut: vi.fn(),
  clearError: vi.fn(),
  ...overrides
});