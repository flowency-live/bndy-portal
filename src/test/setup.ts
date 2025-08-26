import { expect, afterEach, vi } from 'vitest';
import { cleanup, configure } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with React Testing Library matchers
expect.extend(matchers);

// Configure testing library
configure({
  testIdAttribute: 'data-testid'
});

// Mock bndy-ui modules
vi.mock('bndy-ui/auth', () => ({
  useAuth: vi.fn(() => ({
    currentUser: null,
    isLoading: false,
    error: null,
    signInWithEmail: vi.fn(),
    signInWithGoogle: vi.fn(),
    signInWithPhone: vi.fn(),
    createUserWithEmail: vi.fn(),
    signOut: vi.fn(),
    clearError: vi.fn(),
    updateProfile: vi.fn()
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  initFirebase: vi.fn(() => ({
    auth: {},
    firestore: {}
  }))
}));

vi.mock('bndy-ui', () => ({
  BndyLogo: ({ className }: { className?: string }) => {
    const React = require('react');
    return React.createElement('div', { 
      className, 
      'data-testid': 'bndy-logo' 
    }, 'BNDY Logo');
  }
}));

vi.mock('firebase/auth', () => ({
  connectAuthEmulator: vi.fn()
}));

vi.mock('firebase/firestore', () => ({
  connectFirestoreEmulator: vi.fn()
}));

// Mock Next.js font imports
vi.mock('next/font/google', () => ({
  Inter: vi.fn(() => ({
    variable: '--font-inter',
    className: 'font-inter'
  }))
}));

// Cleanup after each test
afterEach(() => {
  cleanup();
});
