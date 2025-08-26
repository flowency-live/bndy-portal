import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import Home from "@/app/page";

// Simple test without external dependencies for now
describe("Home", () => {
  it("should render welcome heading", () => {
    // Mock the useAuth hook to avoid bndy-ui dependency issues in tests
    const mockUseAuth = vi.fn(() => ({
      currentUser: null,
      isLoading: false
    }));
    
    vi.doMock("bndy-ui/auth", () => ({
      useAuth: mockUseAuth,
      AuthProvider: ({ children }: { children: React.ReactNode }) => children
    }));

    render(<Home />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /welcome to bndy portal/i
    );
  });
});