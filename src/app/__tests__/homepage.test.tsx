import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import Home from '../page';
import { ThemeProvider } from '../../context/ThemeContext';

// Mock bndy-ui auth
const mockUseAuth = vi.fn();
vi.mock('bndy-ui/auth', () => ({
  useAuth: () => mockUseAuth()
}));

// Mock bndy-ui components
vi.mock('bndy-ui', () => ({
  BndyLogo: ({ className, color, holeColor, ...props }: any) => (
    <div 
      data-testid="bndy-logo" 
      className={className} 
      data-color={color} 
      data-hole-color={holeColor} 
      {...props}
    >
      BNDY Logo
    </div>
  )
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/'
}));

// Mock icons
vi.mock('react-icons/fa', () => ({
  FaMusic: ({ className, ...props }: any) => (
    <div data-testid="music-icon" className={className} {...props}>🎵</div>
  ),
  FaCalendar: ({ className, ...props }: any) => (
    <div data-testid="calendar-icon" className={className} {...props}>📅</div>
  ),
  FaUsers: ({ className, ...props }: any) => (
    <div data-testid="users-icon" className={className} {...props}>👥</div>
  ),
  FaMapMarkerAlt: ({ className, ...props }: any) => (
    <div data-testid="location-icon" className={className} {...props}>📍</div>
  ),
  FaStar: ({ className, ...props }: any) => (
    <div data-testid="star-icon" className={className} {...props}>⭐</div>
  ),
  FaBuilding: ({ className, ...props }: any) => (
    <div data-testid="building-icon" className={className} {...props}>🏢</div>
  ),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('Homepage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default unauthenticated state
    mockUseAuth.mockReturnValue({
      currentUser: null,
      isLoading: false
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Brand Identity', () => {
    it('should display the main brand strapline "Keeping LIVE Music ALIVE"', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      expect(screen.getByText('Keeping')).toBeInTheDocument();
      expect(screen.getByText('LIVE')).toBeInTheDocument();
      expect(screen.getByText('Music')).toBeInTheDocument();
      expect(screen.getByText('ALIVE')).toBeInTheDocument();
    });

    it('should display the community tagline', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      expect(screen.getByText(/A community-driven platform connecting people to grassroots live music events/)).toBeInTheDocument();
    });

    it('should show the BNDY logo prominently', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      expect(screen.getByTestId('bndy-logo')).toBeInTheDocument();
    });

    it('should have proper brand color styling', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      const liveText = screen.getByText('LIVE');
      const aliveText = screen.getByText('ALIVE');
      
      expect(liveText).toHaveClass('text-cyan-500');
      expect(aliveText).toHaveClass('text-orange-500');
    });
  });

  describe('Persona Selection', () => {
    it('should render persona toggle buttons', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      expect(screen.getByTestId('persona-artist')).toBeInTheDocument();
      expect(screen.getByTestId('persona-venue')).toBeInTheDocument();
      expect(screen.getByTestId('persona-agent')).toBeInTheDocument();
    });

    it('should show artist persona as default active', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      const artistButton = screen.getByTestId('persona-artist');
      expect(artistButton).toHaveClass('bg-orange-500');
    });

    it('should switch persona when clicked', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      const venueButton = screen.getByTestId('persona-venue');
      fireEvent.click(venueButton);

      expect(venueButton).toHaveClass('bg-blue-500');
      expect(screen.getByTestId('persona-artist')).not.toHaveClass('bg-orange-500');
    });

    it('should show persona-specific tagline', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      // Default artist tagline
      expect(screen.getByText(/Showcase your talent and connect with venues/)).toBeInTheDocument();

      // Switch to venue
      const venueButton = screen.getByTestId('persona-venue');
      fireEvent.click(venueButton);

      expect(screen.getByText(/Book the perfect acts for your space/)).toBeInTheDocument();
    });
  });

  describe('Authentication Actions', () => {
    it('should show sign up and login buttons when unauthenticated', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      expect(screen.getByTestId('cta-signup')).toBeInTheDocument();
      expect(screen.getByTestId('cta-login')).toBeInTheDocument();
    });

    it('should navigate to auth page for signup', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      const signupButton = screen.getByTestId('cta-signup');
      expect(signupButton).toHaveAttribute('href', '/auth?mode=signup');
    });

    it('should navigate to auth page for login', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      const loginButton = screen.getByTestId('cta-login');
      expect(loginButton).toHaveAttribute('href', '/auth?mode=signin');
    });

    it('should show dashboard link when authenticated', () => {
      mockUseAuth.mockReturnValue({
        currentUser: { uid: 'test', email: 'test@example.com' },
        isLoading: false
      });

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      expect(screen.getByTestId('go-to-dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('go-to-dashboard')).toHaveAttribute('href', '/dashboard');
    });
  });

  describe('Feature Sections', () => {
    it('should render current features section', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      expect(screen.getByTestId('current-features')).toBeInTheDocument();
      expect(screen.getByText('Current')).toBeInTheDocument();
      expect(screen.getByText('Features')).toBeInTheDocument();
    });

    it('should render coming soon features section', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      expect(screen.getByTestId('coming-soon-features')).toBeInTheDocument();
      expect(screen.getByText('Coming Soon')).toBeInTheDocument();
    });

    it('should show persona-specific features', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      // Artist features by default
      expect(screen.getByText(/Profile Creation/)).toBeInTheDocument();
      expect(screen.getByText(/Music Management/)).toBeInTheDocument();

      // Switch to venue
      const venueButton = screen.getByTestId('persona-venue');
      fireEvent.click(venueButton);

      expect(screen.getByText(/Event Management/)).toBeInTheDocument();
      expect(screen.getByText(/Venue Promotion/)).toBeInTheDocument();
    });
  });

  describe('Community Focus Section', () => {
    it('should render community benefits', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      expect(screen.getByText('Built For Musicians')).toBeInTheDocument();
      expect(screen.getByText('Supporting Grassroots')).toBeInTheDocument();
      expect(screen.getByText('By Musicians, For Musicians')).toBeInTheDocument();
    });

    it('should have proper icons for each benefit', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      expect(screen.getAllByTestId('building-icon')).toHaveLength(2); // One in features, one in community
      expect(screen.getAllByTestId('star-icon')).toHaveLength(2); // One in coming soon features, one in community
      expect(screen.getAllByTestId('users-icon')).toHaveLength(3); // Two in features/coming soon, one in community
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should have mobile-optimized layout', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      const homepage = screen.getByTestId('homepage');
      expect(homepage).toHaveClass('min-h-screen', 'bg-slate-900');
    });

    it('should have touch-friendly CTA buttons', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      const signupButton = screen.getByTestId('cta-signup');
      const loginButton = screen.getByTestId('cta-login');

      expect(signupButton).toHaveClass('min-h-[44px]', 'touch-target');
      expect(loginButton).toHaveClass('min-h-[44px]', 'touch-target');
    });

    it('should have responsive text sizing', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      const mainHeading = screen.getByTestId('main-heading');
      expect(mainHeading).toHaveClass('text-2xl', 'sm:text-3xl', 'md:text-4xl');
    });

    it('should have responsive logo sizing', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      const logo = screen.getByTestId('bndy-logo');
      expect(logo).toHaveClass('w-32', 'sm:w-48', 'md:w-64');
    });

    it('should stack persona buttons on mobile', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      const personaContainer = screen.getByTestId('persona-toggles');
      expect(personaContainer).toHaveClass('flex', 'flex-wrap', 'justify-center', 'gap-3');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toBeInTheDocument();
    });

    it('should have accessible CTA buttons', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      const signupButton = screen.getByTestId('cta-signup');
      expect(signupButton).toHaveAttribute('aria-label', expect.stringContaining('Sign up'));
    });

    it('should have keyboard navigation support', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      const personaButtons = [
        screen.getByTestId('persona-artist'),
        screen.getByTestId('persona-venue'),
        screen.getByTestId('persona-agent')
      ];

      personaButtons.forEach(button => {
        expect(button).toHaveAttribute('tabIndex', '0');
      });
    });

    it('should have proper ARIA labels for persona buttons', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      const artistButton = screen.getByTestId('persona-artist');
      expect(artistButton).toHaveAttribute('aria-label', expect.stringContaining('Artist'));
      expect(artistButton).toHaveAttribute('role', 'button');
    });
  });

  describe('SEO and Performance', () => {
    it('should have proper semantic HTML structure', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getAllByRole('region')).toHaveLength(5); // Hero, Features, Community, Coming Soon, CTA
    });

    it('should load critical content immediately', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      // Key content should be immediately visible
      expect(screen.getByTestId('bndy-logo')).toBeInTheDocument();
      expect(screen.getByText('Keeping')).toBeInTheDocument();
      expect(screen.getByTestId('cta-signup')).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('should apply theme-aware colors', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      const homepage = screen.getByTestId('homepage');
      expect(homepage).toHaveClass('bg-slate-900', 'text-white');
    });

    it('should have proper contrast ratios', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      const signupButton = screen.getByTestId('cta-signup');
      expect(signupButton).toHaveClass('bg-orange-500', 'text-white');
    });
  });
});