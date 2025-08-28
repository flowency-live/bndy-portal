import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import LoginPage from '../page';

// Mock Next.js navigation
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: mockReplace,
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    toString: () => ''
  })
}));

describe('Login Page (Redirect)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect to auth page with signin mode', () => {
    render(<LoginPage />);
    
    expect(mockReplace).toHaveBeenCalledWith('/auth?mode=signin');
  });

  it('should show loading state while redirecting', () => {
    render(<LoginPage />);
    
    expect(screen.getByText('Redirecting to login...')).toBeInTheDocument();
  });

  it('should have proper loading spinner', () => {
    render(<LoginPage />);
    
    const loadingSpinner = screen.getByText('Redirecting to login...').previousElementSibling;
    expect(loadingSpinner).toHaveClass('animate-spin', 'rounded-full');
  });

  it('should redirect with auth mode signin', () => {
    render(<LoginPage />);
    
    expect(mockReplace).toHaveBeenCalledWith('/auth?mode=signin');
  });

  it('should have mobile-optimized layout', () => {
    render(<LoginPage />);
    
    const container = screen.getByText('Redirecting to login...').parentElement?.parentElement;
    expect(container).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center', 'bg-slate-900');
  });
});