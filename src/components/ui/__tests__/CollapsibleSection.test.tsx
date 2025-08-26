import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CollapsibleSection } from '../CollapsibleSection';
import { ThemeProvider } from '../../../context/ThemeContext';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, animate, initial, exit, transition, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock icons
vi.mock('react-icons/fa', () => ({
  FaChevronDown: ({ className, ...props }: any) => (
    <div data-testid="chevron-icon" className={className} {...props}>▼</div>
  ),
  FaUser: ({ className, ...props }: any) => (
    <div data-testid="user-icon" className={className} {...props}>👤</div>
  ),
  FaMusic: ({ className, ...props }: any) => (
    <div data-testid="music-icon" className={className} {...props}>🎵</div>
  ),
  FaCamera: ({ className, ...props }: any) => (
    <div data-testid="camera-icon" className={className} {...props}>📷</div>
  ),
  FaShare: ({ className, ...props }: any) => (
    <div data-testid="share-icon" className={className} {...props}>🔗</div>
  ),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('CollapsibleSection', () => {
  const mockOnToggle = vi.fn();
  
  const defaultProps = {
    id: 'test-section',
    title: 'Test Section',
    description: 'Test description',
    icon: <div data-testid="test-icon">Icon</div>,
    gradientFrom: 'orange-500',
    gradientTo: 'orange-600',
    isExpanded: false,
    onToggle: mockOnToggle,
    children: <div data-testid="test-content">Test Content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Structure', () => {
    it('should render with proper structure', () => {
      render(
        <TestWrapper>
          <CollapsibleSection {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByTestId('collapsible-section-test-section')).toBeInTheDocument();
      expect(screen.getByText('Test Section')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('should apply mobile-first responsive classes', () => {
      render(
        <TestWrapper>
          <CollapsibleSection {...defaultProps} />
        </TestWrapper>
      );

      const section = screen.getByTestId('collapsible-section-test-section');
      expect(section).toHaveClass('rounded-lg', 'shadow-xl', 'overflow-hidden');
    });

    it('should apply gradient background to header', () => {
      render(
        <TestWrapper>
          <CollapsibleSection {...defaultProps} />
        </TestWrapper>
      );

      const header = screen.getByTestId('collapsible-header-test-section');
      expect(header).toHaveClass('bg-gradient-to-r');
    });

    it('should apply custom className if provided', () => {
      render(
        <TestWrapper>
          <CollapsibleSection {...defaultProps} className="custom-class" />
        </TestWrapper>
      );

      const section = screen.getByTestId('collapsible-section-test-section');
      expect(section).toHaveClass('custom-class');
    });
  });

  describe('Expand/Collapse Functionality', () => {
    it('should not show content when collapsed', () => {
      render(
        <TestWrapper>
          <CollapsibleSection {...defaultProps} isExpanded={false} />
        </TestWrapper>
      );

      expect(screen.queryByTestId('test-content')).not.toBeInTheDocument();
    });

    it('should show content when expanded', () => {
      render(
        <TestWrapper>
          <CollapsibleSection {...defaultProps} isExpanded={true} />
        </TestWrapper>
      );

      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    it('should call onToggle when header is clicked', () => {
      render(
        <TestWrapper>
          <CollapsibleSection {...defaultProps} />
        </TestWrapper>
      );

      const header = screen.getByTestId('collapsible-header-test-section');
      fireEvent.click(header);

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it('should rotate chevron icon when expanded', () => {
      const { rerender } = render(
        <TestWrapper>
          <CollapsibleSection {...defaultProps} isExpanded={false} />
        </TestWrapper>
      );

      const chevron = screen.getByTestId('chevron-wrapper-test-section');
      expect(chevron).toHaveAttribute('data-expanded', 'false');

      rerender(
        <TestWrapper>
          <CollapsibleSection {...defaultProps} isExpanded={true} />
        </TestWrapper>
      );

      expect(chevron).toHaveAttribute('data-expanded', 'true');
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should have touch-friendly header area', () => {
      render(
        <TestWrapper>
          <CollapsibleSection {...defaultProps} />
        </TestWrapper>
      );

      const header = screen.getByTestId('collapsible-header-test-section');
      expect(header).toHaveClass('p-4', 'sm:p-6');
    });

    it('should have proper icon sizing', () => {
      render(
        <TestWrapper>
          <CollapsibleSection {...defaultProps} />
        </TestWrapper>
      );

      const iconWrapper = screen.getByTestId('icon-wrapper-test-section');
      expect(iconWrapper).toHaveClass('p-2', 'sm:p-3');
    });

    it('should have responsive text sizing', () => {
      render(
        <TestWrapper>
          <CollapsibleSection {...defaultProps} />
        </TestWrapper>
      );

      const title = screen.getByTestId('section-title-test-section');
      expect(title).toHaveClass('text-lg', 'sm:text-xl');
      
      const description = screen.getByTestId('section-description-test-section');
      expect(description).toHaveClass('text-xs', 'sm:text-sm');
    });

    it('should have cursor pointer on header', () => {
      render(
        <TestWrapper>
          <CollapsibleSection {...defaultProps} />
        </TestWrapper>
      );

      const header = screen.getByTestId('collapsible-header-test-section');
      expect(header).toHaveClass('cursor-pointer');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should be keyboard accessible with Enter key', () => {
      render(
        <TestWrapper>
          <CollapsibleSection {...defaultProps} />
        </TestWrapper>
      );

      const header = screen.getByTestId('collapsible-header-test-section');
      fireEvent.keyDown(header, { key: 'Enter', code: 'Enter' });

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it('should be keyboard accessible with Space key', () => {
      render(
        <TestWrapper>
          <CollapsibleSection {...defaultProps} />
        </TestWrapper>
      );

      const header = screen.getByTestId('collapsible-header-test-section');
      fireEvent.keyDown(header, { key: ' ', code: 'Space' });

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it('should have proper tabIndex for keyboard navigation', () => {
      render(
        <TestWrapper>
          <CollapsibleSection {...defaultProps} />
        </TestWrapper>
      );

      const header = screen.getByTestId('collapsible-header-test-section');
      expect(header).toHaveAttribute('tabIndex', '0');
    });

    it('should have proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <CollapsibleSection {...defaultProps} isExpanded={false} />
        </TestWrapper>
      );

      const header = screen.getByTestId('collapsible-header-test-section');
      expect(header).toHaveAttribute('aria-expanded', 'false');
      expect(header).toHaveAttribute('aria-controls', 'content-test-section');
      expect(header).toHaveAttribute('role', 'button');
    });
  });

  describe('Theme Integration', () => {
    it('should apply theme-aware colors', () => {
      render(
        <TestWrapper>
          <CollapsibleSection {...defaultProps} />
        </TestWrapper>
      );

      const section = screen.getByTestId('collapsible-section-test-section');
      expect(section).toHaveClass('bg-gradient-to-br');
      expect(section).toHaveClass('from-slate-50', 'to-white');
      expect(section).toHaveClass('dark:from-slate-900', 'dark:to-slate-800');
    });

    it('should apply theme-aware text colors', () => {
      render(
        <TestWrapper>
          <CollapsibleSection {...defaultProps} />
        </TestWrapper>
      );

      const title = screen.getByTestId('section-title-test-section');
      expect(title).toHaveClass('text-slate-900', 'dark:text-slate-100');
      
      const description = screen.getByTestId('section-description-test-section');
      expect(description).toHaveClass('text-slate-500', 'dark:text-slate-400');
    });
  });

  describe('Gradient Customization', () => {
    it('should apply custom gradient colors', () => {
      render(
        <TestWrapper>
          <CollapsibleSection 
            {...defaultProps} 
            gradientFrom="blue-500"
            gradientTo="blue-600"
          />
        </TestWrapper>
      );

      const iconWrapper = screen.getByTestId('icon-wrapper-test-section');
      expect(iconWrapper).toHaveClass('bg-gradient-to-br');
      expect(iconWrapper).toHaveAttribute('data-gradient-from', 'blue-500');
      expect(iconWrapper).toHaveAttribute('data-gradient-to', 'blue-600');
    });

    it('should support different gradient directions', () => {
      render(
        <TestWrapper>
          <CollapsibleSection 
            {...defaultProps}
            gradientFrom="green-500"
            gradientTo="green-600"
          />
        </TestWrapper>
      );

      const iconWrapper = screen.getByTestId('icon-wrapper-test-section');
      expect(iconWrapper).toHaveClass('bg-gradient-to-br');
    });
  });

  describe('Accessibility', () => {
    it('should support screen readers', () => {
      render(
        <TestWrapper>
          <CollapsibleSection {...defaultProps} isExpanded={true} />
        </TestWrapper>
      );

      const content = screen.getByTestId('collapsible-content-test-section');
      expect(content).toHaveAttribute('id', 'content-test-section');
      expect(content).toHaveAttribute('aria-labelledby', 'header-test-section');
    });

    it('should have proper focus management', () => {
      render(
        <TestWrapper>
          <CollapsibleSection {...defaultProps} />
        </TestWrapper>
      );

      const header = screen.getByTestId('collapsible-header-test-section');
      header.focus();
      expect(document.activeElement).toBe(header);
    });

    it('should announce expansion state to screen readers', () => {
      const { rerender } = render(
        <TestWrapper>
          <CollapsibleSection {...defaultProps} isExpanded={false} />
        </TestWrapper>
      );

      const header = screen.getByTestId('collapsible-header-test-section');
      expect(header).toHaveAttribute('aria-expanded', 'false');

      rerender(
        <TestWrapper>
          <CollapsibleSection {...defaultProps} isExpanded={true} />
        </TestWrapper>
      );

      expect(header).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Hover Effects', () => {
    it('should apply hover effects to header', () => {
      render(
        <TestWrapper>
          <CollapsibleSection {...defaultProps} />
        </TestWrapper>
      );

      const header = screen.getByTestId('collapsible-header-test-section');
      expect(header).toHaveClass('hover:opacity-90', 'transition-all');
    });
  });

  describe('Content Animation', () => {
    it('should have smooth content transitions', () => {
      render(
        <TestWrapper>
          <CollapsibleSection {...defaultProps} isExpanded={true} />
        </TestWrapper>
      );

      const content = screen.getByTestId('collapsible-content-test-section');
      expect(content).toHaveClass('overflow-hidden');
    });

    it('should properly handle content overflow', () => {
      render(
        <TestWrapper>
          <CollapsibleSection {...defaultProps} isExpanded={true}>
            <div style={{ height: '1000px' }}>Large content</div>
          </CollapsibleSection>
        </TestWrapper>
      );

      const section = screen.getByTestId('collapsible-section-test-section');
      expect(section).toHaveClass('overflow-hidden');
    });
  });
});