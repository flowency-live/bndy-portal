import React from 'react';
import { vi } from 'vitest';

// Mock authentication hooks and components from bndy-ui
export const useAuth = vi.fn(() => ({
  currentUser: null,
  isLoading: false,
  error: null,
  signInWithEmail: vi.fn(),
  signInWithGoogle: vi.fn(),
  signInWithPhone: vi.fn(),
  createUserWithEmail: vi.fn(),
  signOut: vi.fn(),
  clearError: vi.fn()
}));

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return <>{children}</>;
};

export const RequireAuth: React.FC<AuthProviderProps> = ({ children }) => {
  return <>{children}</>;
};

// Mock Firebase utilities
export const initFirebase = vi.fn(() => ({
  auth: {},
  firestore: {}
}));

// Mock BndyLogo component
export const BndyLogo: React.FC<{ className?: string; color?: string }> = ({ className }) => (
  <div className={className} data-testid="bndy-logo">BNDY Logo</div>
);
