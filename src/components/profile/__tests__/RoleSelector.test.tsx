import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { RoleSelector } from '../RoleSelector';
import { ThemeProvider } from '../../../context/ThemeContext';

// Mock icons
vi.mock('react-icons/fa', () => ({
  FaMusic: ({ className, ...props }: any) => (
    <div data-testid="music-icon" className={className} {...props}>🎵</div>
  ),
  FaBuilding: ({ className, ...props }: any) => (
    <div data-testid="building-icon" className={className} {...props}>🏢</div>
  ),
  FaHandshake: ({ className, ...props }: any) => (
    <div data-testid="handshake-icon" className={className} {...props}>🤝</div>
  ),
  FaCheck: ({ className, ...props }: any) => (
    <div data-testid="check-icon" className={className} {...props}>✓</div>
  ),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

export type UserRole = 'artist' | 'venue' | 'agent';

interface RoleSelectorProps {
  selectedRoles: UserRole[];
  onRoleChange: (roles: UserRole[]) => void;
  required?: boolean;
  error?: string;
  className?: string;
}

describe('RoleSelector', () => {
  const mockOnRoleChange = vi.fn();
  
  const defaultProps: RoleSelectorProps = {
    selectedRoles: [],
    onRoleChange: mockOnRoleChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render all role options', () => {
      render(
        <TestWrapper>
          <RoleSelector {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByTestId('role-artist')).toBeInTheDocument();
      expect(screen.getByTestId('role-venue')).toBeInTheDocument();
      expect(screen.getByTestId('role-agent')).toBeInTheDocument();
      
      expect(screen.getByText('Artist')).toBeInTheDocument();
      expect(screen.getByText('Venue')).toBeInTheDocument();
      expect(screen.getByText('Agent')).toBeInTheDocument();
    });

    it('should show role descriptions', () => {
      render(
        <TestWrapper>
          <RoleSelector {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText(/Create and manage your music/)).toBeInTheDocument();
      expect(screen.getByText(/Host events and manage bookings/)).toBeInTheDocument();
      expect(screen.getByText(/Represent artists and manage bookings/)).toBeInTheDocument();
    });

    it('should display proper icons for each role', () => {
      render(
        <TestWrapper>
          <RoleSelector {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByTestId('music-icon')).toBeInTheDocument();
      expect(screen.getByTestId('building-icon')).toBeInTheDocument();
      expect(screen.getByTestId('handshake-icon')).toBeInTheDocument();
    });

    it('should apply custom className if provided', () => {
      render(
        <TestWrapper>
          <RoleSelector {...defaultProps} className="custom-class" />
        </TestWrapper>
      );

      const container = screen.getByTestId('role-selector');
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('Role Selection Behavior', () => {
    it('should allow selecting a single role', () => {
      render(
        <TestWrapper>
          <RoleSelector {...defaultProps} />
        </TestWrapper>
      );

      const artistRole = screen.getByTestId('role-artist');
      fireEvent.click(artistRole);

      expect(mockOnRoleChange).toHaveBeenCalledWith(['artist']);
    });

    it('should allow selecting multiple roles', () => {
      const { rerender } = render(
        <TestWrapper>
          <RoleSelector {...defaultProps} />
        </TestWrapper>
      );

      const artistRole = screen.getByTestId('role-artist');
      fireEvent.click(artistRole);

      expect(mockOnRoleChange).toHaveBeenCalledWith(['artist']);

      // Reset mock for next assertion
      mockOnRoleChange.mockClear();
      
      // Simulate parent component updating selectedRoles prop
      rerender(
        <TestWrapper>
          <RoleSelector {...defaultProps} selectedRoles={['artist']} />
        </TestWrapper>
      );

      const venueRole = screen.getByTestId('role-venue');
      fireEvent.click(venueRole);

      expect(mockOnRoleChange).toHaveBeenCalledWith(['artist', 'venue']);
    });

    it('should allow deselecting roles when multiple are selected', () => {
      render(
        <TestWrapper>
          <RoleSelector {...defaultProps} selectedRoles={['artist', 'venue']} />
        </TestWrapper>
      );

      const artistRole = screen.getByTestId('role-artist');
      fireEvent.click(artistRole);

      expect(mockOnRoleChange).toHaveBeenCalledWith(['venue']);
    });

    it('should prevent deselecting the last role', () => {
      render(
        <TestWrapper>
          <RoleSelector {...defaultProps} selectedRoles={['artist']} />
        </TestWrapper>
      );

      const artistRole = screen.getByTestId('role-artist');
      fireEvent.click(artistRole);

      // Should not call onRoleChange as it would result in empty selection
      expect(mockOnRoleChange).not.toHaveBeenCalled();
    });

    it('should show visual selection state', () => {
      render(
        <TestWrapper>
          <RoleSelector {...defaultProps} selectedRoles={['artist', 'venue']} />
        </TestWrapper>
      );

      const artistRole = screen.getByTestId('role-artist');
      const venueRole = screen.getByTestId('role-venue');
      const agentRole = screen.getByTestId('role-agent');

      expect(artistRole).toHaveClass('ring-orange-500', 'bg-orange-50');
      expect(venueRole).toHaveClass('ring-orange-500', 'bg-orange-50');
      expect(agentRole).not.toHaveClass('ring-orange-500');
    });

    it('should show check icons for selected roles', () => {
      render(
        <TestWrapper>
          <RoleSelector {...defaultProps} selectedRoles={['artist']} />
        </TestWrapper>
      );

      const artistCheckIcon = screen.getByTestId('check-artist');
      expect(artistCheckIcon).toBeInTheDocument();
      
      expect(screen.queryByTestId('check-venue')).not.toBeInTheDocument();
      expect(screen.queryByTestId('check-agent')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard selection with Enter', () => {
      render(
        <TestWrapper>
          <RoleSelector {...defaultProps} />
        </TestWrapper>
      );

      const artistRole = screen.getByTestId('role-artist');
      fireEvent.keyDown(artistRole, { key: 'Enter', code: 'Enter' });

      expect(mockOnRoleChange).toHaveBeenCalledWith(['artist']);
    });

    it('should support keyboard selection with Space', () => {
      render(
        <TestWrapper>
          <RoleSelector {...defaultProps} />
        </TestWrapper>
      );

      const venueRole = screen.getByTestId('role-venue');
      fireEvent.keyDown(venueRole, { key: ' ', code: 'Space' });

      expect(mockOnRoleChange).toHaveBeenCalledWith(['venue']);
    });

    it('should have proper tabIndex for keyboard navigation', () => {
      render(
        <TestWrapper>
          <RoleSelector {...defaultProps} />
        </TestWrapper>
      );

      const artistRole = screen.getByTestId('role-artist');
      const venueRole = screen.getByTestId('role-venue');
      const agentRole = screen.getByTestId('role-agent');

      expect(artistRole).toHaveAttribute('tabIndex', '0');
      expect(venueRole).toHaveAttribute('tabIndex', '0');
      expect(agentRole).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <TestWrapper>
          <RoleSelector {...defaultProps} />
        </TestWrapper>
      );

      const artistRole = screen.getByTestId('role-artist');
      expect(artistRole).toHaveAttribute('role', 'checkbox');
      expect(artistRole).toHaveAttribute('aria-checked', 'false');
      expect(artistRole).toHaveAttribute('aria-label', expect.stringContaining('Artist'));
    });

    it('should update aria-checked when roles are selected', () => {
      render(
        <TestWrapper>
          <RoleSelector {...defaultProps} selectedRoles={['artist']} />
        </TestWrapper>
      );

      const artistRole = screen.getByTestId('role-artist');
      const venueRole = screen.getByTestId('role-venue');

      expect(artistRole).toHaveAttribute('aria-checked', 'true');
      expect(venueRole).toHaveAttribute('aria-checked', 'false');
    });

    it('should have fieldset with legend for screen readers', () => {
      render(
        <TestWrapper>
          <RoleSelector {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(screen.getByText('Select your role(s)')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when provided', () => {
      render(
        <TestWrapper>
          <RoleSelector {...defaultProps} error="Please select at least one role" />
        </TestWrapper>
      );

      const errorMessage = screen.getByTestId('role-error');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent('Please select at least one role');
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });

    it('should apply error styling when error is present', () => {
      render(
        <TestWrapper>
          <RoleSelector {...defaultProps} error="Error message" />
        </TestWrapper>
      );

      const container = screen.getByTestId('role-selector');
      expect(container).toHaveAttribute('data-error', 'true');
    });

    it('should show required indicator when required is true', () => {
      render(
        <TestWrapper>
          <RoleSelector {...defaultProps} required={true} />
        </TestWrapper>
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should have touch-friendly sizing', () => {
      render(
        <TestWrapper>
          <RoleSelector {...defaultProps} />
        </TestWrapper>
      );

      const roles = [
        screen.getByTestId('role-artist'),
        screen.getByTestId('role-venue'),
        screen.getByTestId('role-agent')
      ];

      roles.forEach(role => {
        expect(role).toHaveClass('min-h-[80px]', 'touch-target');
      });
    });

    it('should have responsive layout classes', () => {
      render(
        <TestWrapper>
          <RoleSelector {...defaultProps} />
        </TestWrapper>
      );

      const container = screen.getByTestId('role-options-container');
      expect(container).toHaveClass('grid', 'grid-cols-1', 'sm:grid-cols-3', 'gap-4');
    });

    it('should have responsive text sizing', () => {
      render(
        <TestWrapper>
          <RoleSelector {...defaultProps} />
        </TestWrapper>
      );

      const artistTitle = screen.getByTestId('role-title-artist');
      expect(artistTitle).toHaveClass('text-lg', 'sm:text-xl');
    });
  });

  describe('Theme Integration', () => {
    it('should apply theme-aware colors', () => {
      render(
        <TestWrapper>
          <RoleSelector {...defaultProps} />
        </TestWrapper>
      );

      const artistRole = screen.getByTestId('role-artist');
      expect(artistRole).toHaveClass('bg-white', 'dark:bg-slate-800');
      expect(artistRole).toHaveClass('border-slate-200', 'dark:border-slate-700');
    });

    it('should have proper hover effects', () => {
      render(
        <TestWrapper>
          <RoleSelector {...defaultProps} />
        </TestWrapper>
      );

      const venueRole = screen.getByTestId('role-venue');
      expect(venueRole).toHaveClass('hover:border-orange-300', 'hover:bg-orange-25');
    });
  });
});