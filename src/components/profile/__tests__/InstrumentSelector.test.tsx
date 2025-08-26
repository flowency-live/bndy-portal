import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { InstrumentSelector } from '../InstrumentSelector';
import { ThemeProvider } from '../../../context/ThemeContext';

// Mock icons
vi.mock('react-icons/fa', () => ({
  FaMusic: ({ className, ...props }: any) => (
    <div data-testid="music-icon" className={className} {...props}>🎵</div>
  ),
  FaMicrophone: ({ className, ...props }: any) => (
    <div data-testid="microphone-icon" className={className} {...props}>🎤</div>
  ),
  FaGuitar: ({ className, ...props }: any) => (
    <div data-testid="guitar-icon" className={className} {...props}>🎸</div>
  ),
  FaKeyboard: ({ className, ...props }: any) => (
    <div data-testid="keyboard-icon" className={className} {...props}>⌨️</div>
  ),
  FaDrum: ({ className, ...props }: any) => (
    <div data-testid="drum-icon" className={className} {...props}>🥁</div>
  ),
  FaTimes: ({ className, ...props }: any) => (
    <div data-testid="times-icon" className={className} {...props}>✗</div>
  ),
  FaPlus: ({ className, ...props }: any) => (
    <div data-testid="plus-icon" className={className} {...props}>+</div>
  ),
  FaChevronDown: ({ className, ...props }: any) => (
    <div data-testid="chevron-down-icon" className={className} {...props}>▼</div>
  ),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

interface InstrumentSelectorProps {
  selectedInstruments: string[];
  onInstrumentChange: (instruments: string[]) => void;
  className?: string;
  maxSelections?: number;
  required?: boolean;
  error?: string;
}

describe('InstrumentSelector', () => {
  const mockOnInstrumentChange = vi.fn();
  
  const defaultProps: InstrumentSelectorProps = {
    selectedInstruments: [],
    onInstrumentChange: mockOnInstrumentChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render common instrument categories', () => {
      render(
        <TestWrapper>
          <InstrumentSelector {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Vocals')).toBeInTheDocument();
      expect(screen.getByText('Guitar')).toBeInTheDocument();
      expect(screen.getByText('Piano/Keys')).toBeInTheDocument();
      expect(screen.getByText('Drums')).toBeInTheDocument();
      expect(screen.getByText('Other')).toBeInTheDocument();
    });

    it('should show subcategory options when category is expanded', () => {
      render(
        <TestWrapper>
          <InstrumentSelector {...defaultProps} />
        </TestWrapper>
      );

      // Expand Guitar category
      const guitarCategory = screen.getByTestId('category-guitar');
      fireEvent.click(guitarCategory);

      expect(screen.getByText('Electric Guitar')).toBeInTheDocument();
      expect(screen.getByText('Acoustic Guitar')).toBeInTheDocument();
      expect(screen.getByText('Bass Guitar')).toBeInTheDocument();
    });

    it('should display component title and description', () => {
      render(
        <TestWrapper>
          <InstrumentSelector {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Instruments & Vocals')).toBeInTheDocument();
      expect(screen.getByText(/Select the instruments you play/)).toBeInTheDocument();
    });

    it('should apply custom className if provided', () => {
      render(
        <TestWrapper>
          <InstrumentSelector {...defaultProps} className="custom-class" />
        </TestWrapper>
      );

      const container = screen.getByTestId('instrument-selector');
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('Instrument Selection', () => {
    it('should allow selecting instruments', () => {
      render(
        <TestWrapper>
          <InstrumentSelector {...defaultProps} />
        </TestWrapper>
      );

      // Expand vocals category and select an option
      const vocalsCategory = screen.getByTestId('category-vocals');
      fireEvent.click(vocalsCategory);

      const leadVocals = screen.getByTestId('instrument-lead-vocals');
      fireEvent.click(leadVocals);

      expect(mockOnInstrumentChange).toHaveBeenCalledWith(['Lead Vocals']);
    });

    it('should allow selecting multiple instruments', () => {
      render(
        <TestWrapper>
          <InstrumentSelector {...defaultProps} selectedInstruments={['Lead Vocals']} />
        </TestWrapper>
      );

      // Expand guitar category and select an option
      const guitarCategory = screen.getByTestId('category-guitar');
      fireEvent.click(guitarCategory);

      const electricGuitar = screen.getByTestId('instrument-electric-guitar');
      fireEvent.click(electricGuitar);

      expect(mockOnInstrumentChange).toHaveBeenCalledWith(['Lead Vocals', 'Electric Guitar']);
    });

    it('should allow deselecting instruments', () => {
      render(
        <TestWrapper>
          <InstrumentSelector {...defaultProps} selectedInstruments={['Lead Vocals', 'Electric Guitar']} />
        </TestWrapper>
      );

      // Find and click remove button for Lead Vocals
      const removeButton = screen.getByTestId('remove-lead-vocals');
      fireEvent.click(removeButton);

      expect(mockOnInstrumentChange).toHaveBeenCalledWith(['Electric Guitar']);
    });

    it('should show selected instruments as tags', () => {
      render(
        <TestWrapper>
          <InstrumentSelector {...defaultProps} selectedInstruments={['Lead Vocals', 'Electric Guitar']} />
        </TestWrapper>
      );

      expect(screen.getByTestId('tag-lead-vocals')).toBeInTheDocument();
      expect(screen.getByTestId('tag-electric-guitar')).toBeInTheDocument();
    });

    it('should respect maximum selections limit', () => {
      render(
        <TestWrapper>
          <InstrumentSelector {...defaultProps} selectedInstruments={['Lead Vocals', 'Electric Guitar']} maxSelections={2} />
        </TestWrapper>
      );

      // Try to add a third instrument
      const guitarCategory = screen.getByTestId('category-guitar');
      fireEvent.click(guitarCategory);

      const bassGuitar = screen.getByTestId('instrument-bass-guitar');
      fireEvent.click(bassGuitar);

      // Should not call onChange as limit is reached
      expect(mockOnInstrumentChange).not.toHaveBeenCalled();
    });

    it('should show limit warning when approaching max selections', () => {
      render(
        <TestWrapper>
          <InstrumentSelector {...defaultProps} selectedInstruments={['Lead Vocals', 'Electric Guitar']} maxSelections={3} />
        </TestWrapper>
      );

      expect(screen.getByText('1 selection remaining')).toBeInTheDocument();
    });
  });

  describe('Category Expansion', () => {
    it('should start with all categories collapsed', () => {
      render(
        <TestWrapper>
          <InstrumentSelector {...defaultProps} />
        </TestWrapper>
      );

      // Guitar subcategories should not be visible initially
      expect(screen.queryByText('Electric Guitar')).not.toBeInTheDocument();
      expect(screen.queryByText('Acoustic Guitar')).not.toBeInTheDocument();
    });

    it('should expand category when clicked', () => {
      render(
        <TestWrapper>
          <InstrumentSelector {...defaultProps} />
        </TestWrapper>
      );

      const drumsCategory = screen.getByTestId('category-drums');
      fireEvent.click(drumsCategory);

      expect(screen.getByText('Drum Kit')).toBeInTheDocument();
      expect(screen.getByText('Percussion')).toBeInTheDocument();
    });

    it('should collapse category when clicked again', () => {
      render(
        <TestWrapper>
          <InstrumentSelector {...defaultProps} />
        </TestWrapper>
      );

      const pianoCategory = screen.getByTestId('category-piano');
      
      // Expand
      fireEvent.click(pianoCategory);
      expect(screen.getByText('Piano')).toBeInTheDocument();

      // Collapse
      fireEvent.click(pianoCategory);
      expect(screen.queryByText('Piano')).not.toBeInTheDocument();
    });

    it('should show expansion indicator', () => {
      render(
        <TestWrapper>
          <InstrumentSelector {...defaultProps} />
        </TestWrapper>
      );

      const guitarCategory = screen.getByTestId('category-guitar');
      const expandIcon = screen.getByTestId('expand-guitar');

      expect(expandIcon).toHaveAttribute('data-expanded', 'false');

      fireEvent.click(guitarCategory);
      expect(expandIcon).toHaveAttribute('data-expanded', 'true');
    });
  });

  describe('Custom Instrument Input', () => {
    it('should show custom input when Other category is expanded', () => {
      render(
        <TestWrapper>
          <InstrumentSelector {...defaultProps} />
        </TestWrapper>
      );

      const otherCategory = screen.getByTestId('category-other');
      fireEvent.click(otherCategory);

      expect(screen.getByTestId('custom-instrument-input')).toBeInTheDocument();
      expect(screen.getByTestId('add-custom-instrument')).toBeInTheDocument();
    });

    it('should add custom instrument when form is submitted', () => {
      render(
        <TestWrapper>
          <InstrumentSelector {...defaultProps} />
        </TestWrapper>
      );

      const otherCategory = screen.getByTestId('category-other');
      fireEvent.click(otherCategory);

      const customInput = screen.getByTestId('custom-instrument-input') as HTMLInputElement;
      const addButton = screen.getByTestId('add-custom-instrument');

      fireEvent.change(customInput, { target: { value: 'Harmonica' } });
      fireEvent.click(addButton);

      expect(mockOnInstrumentChange).toHaveBeenCalledWith(['Harmonica']);
    });

    it('should clear custom input after adding', () => {
      render(
        <TestWrapper>
          <InstrumentSelector {...defaultProps} />
        </TestWrapper>
      );

      const otherCategory = screen.getByTestId('category-other');
      fireEvent.click(otherCategory);

      const customInput = screen.getByTestId('custom-instrument-input') as HTMLInputElement;
      const addButton = screen.getByTestId('add-custom-instrument');

      fireEvent.change(customInput, { target: { value: 'Harmonica' } });
      fireEvent.click(addButton);

      expect(customInput.value).toBe('');
    });

    it('should prevent adding duplicate custom instruments', () => {
      render(
        <TestWrapper>
          <InstrumentSelector {...defaultProps} selectedInstruments={['Harmonica']} />
        </TestWrapper>
      );

      const otherCategory = screen.getByTestId('category-other');
      fireEvent.click(otherCategory);

      const customInput = screen.getByTestId('custom-instrument-input');
      const addButton = screen.getByTestId('add-custom-instrument');

      fireEvent.change(customInput, { target: { value: 'Harmonica' } });
      fireEvent.click(addButton);

      // Should not call onChange as instrument already exists
      expect(mockOnInstrumentChange).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support Enter key for category expansion', () => {
      render(
        <TestWrapper>
          <InstrumentSelector {...defaultProps} />
        </TestWrapper>
      );

      const guitarCategory = screen.getByTestId('category-guitar');
      fireEvent.keyDown(guitarCategory, { key: 'Enter', code: 'Enter' });

      expect(screen.getByText('Electric Guitar')).toBeInTheDocument();
    });

    it('should support Space key for instrument selection', () => {
      render(
        <TestWrapper>
          <InstrumentSelector {...defaultProps} />
        </TestWrapper>
      );

      const vocalsCategory = screen.getByTestId('category-vocals');
      fireEvent.click(vocalsCategory);

      const leadVocals = screen.getByTestId('instrument-lead-vocals');
      fireEvent.keyDown(leadVocals, { key: ' ', code: 'Space' });

      expect(mockOnInstrumentChange).toHaveBeenCalledWith(['Lead Vocals']);
    });

    it('should have proper tabIndex for keyboard navigation', () => {
      render(
        <TestWrapper>
          <InstrumentSelector {...defaultProps} />
        </TestWrapper>
      );

      const categories = [
        screen.getByTestId('category-vocals'),
        screen.getByTestId('category-guitar'),
        screen.getByTestId('category-piano'),
        screen.getByTestId('category-drums'),
        screen.getByTestId('category-other')
      ];

      categories.forEach(category => {
        expect(category).toHaveAttribute('tabIndex', '0');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for categories', () => {
      render(
        <TestWrapper>
          <InstrumentSelector {...defaultProps} />
        </TestWrapper>
      );

      const guitarCategory = screen.getByTestId('category-guitar');
      expect(guitarCategory).toHaveAttribute('aria-expanded', 'false');
      expect(guitarCategory).toHaveAttribute('role', 'button');
    });

    it('should update ARIA states when categories expand', () => {
      render(
        <TestWrapper>
          <InstrumentSelector {...defaultProps} />
        </TestWrapper>
      );

      const drumsCategory = screen.getByTestId('category-drums');
      fireEvent.click(drumsCategory);

      expect(drumsCategory).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have proper ARIA labels for instruments', () => {
      render(
        <TestWrapper>
          <InstrumentSelector {...defaultProps} />
        </TestWrapper>
      );

      const vocalsCategory = screen.getByTestId('category-vocals');
      fireEvent.click(vocalsCategory);

      const leadVocals = screen.getByTestId('instrument-lead-vocals');
      expect(leadVocals).toHaveAttribute('role', 'checkbox');
      expect(leadVocals).toHaveAttribute('aria-checked', 'false');
    });

    it('should have fieldset with legend for screen readers', () => {
      render(
        <TestWrapper>
          <InstrumentSelector {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(screen.getByText('Instruments & Vocals')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when provided', () => {
      render(
        <TestWrapper>
          <InstrumentSelector {...defaultProps} error="Please select at least one instrument" />
        </TestWrapper>
      );

      const errorMessage = screen.getByTestId('instrument-error');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent('Please select at least one instrument');
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });

    it('should show required indicator when required is true', () => {
      render(
        <TestWrapper>
          <InstrumentSelector {...defaultProps} required={true} />
        </TestWrapper>
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should have touch-friendly sizing for categories', () => {
      render(
        <TestWrapper>
          <InstrumentSelector {...defaultProps} />
        </TestWrapper>
      );

      const guitarCategory = screen.getByTestId('category-guitar');
      expect(guitarCategory).toHaveClass('min-h-[44px]', 'touch-target');
    });

    it('should have responsive layout for selected tags', () => {
      render(
        <TestWrapper>
          <InstrumentSelector {...defaultProps} selectedInstruments={['Lead Vocals', 'Electric Guitar']} />
        </TestWrapper>
      );

      const tagsContainer = screen.getByTestId('selected-instruments-tags');
      expect(tagsContainer).toHaveClass('flex', 'flex-wrap', 'gap-2');
    });

    it('should have mobile-optimized text sizes', () => {
      render(
        <TestWrapper>
          <InstrumentSelector {...defaultProps} />
        </TestWrapper>
      );

      const title = screen.getByTestId('instrument-selector-title');
      expect(title).toHaveClass('text-lg', 'sm:text-xl');
    });
  });

  describe('Theme Integration', () => {
    it('should apply theme-aware colors', () => {
      render(
        <TestWrapper>
          <InstrumentSelector {...defaultProps} />
        </TestWrapper>
      );

      const container = screen.getByTestId('instrument-selector');
      expect(container).toHaveClass('text-slate-900', 'dark:text-white');
    });

    it('should have proper hover effects on categories', () => {
      render(
        <TestWrapper>
          <InstrumentSelector {...defaultProps} />
        </TestWrapper>
      );

      const guitarCategory = screen.getByTestId('category-guitar');
      expect(guitarCategory).toHaveClass('hover:bg-slate-50', 'dark:hover:bg-slate-700');
    });
  });
});