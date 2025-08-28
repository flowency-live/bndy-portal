import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import DashboardPage from '../page';
import { ThemeProvider } from '../../../context/ThemeContext';

// Mock bndy-ui auth
const mockUseAuth = vi.fn();
vi.mock('bndy-ui/auth', () => ({
  useAuth: () => mockUseAuth()
}));

// Mock bndy-ui components
vi.mock('bndy-ui', () => ({
  BndyLoadingScreen: () => <div data-testid="loading-screen">Loading...</div>
}));

// Mock Next.js navigation
const mockPush = vi.fn();
const mockRouter = {
  push: mockPush,
  replace: vi.fn(),
  prefetch: vi.fn(),
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/dashboard'
}));

// Mock MainLayout
vi.mock('../../../components/layout/MainLayout', () => ({
  MainLayout: ({ children }: any) => (
    <div data-testid="main-layout">{children}</div>
  )
}));

// Mock icons
vi.mock('react-icons/fa', () => ({
  FaHome: ({ className, ...props }: any) => (
    <div data-testid="home-icon" className={className} {...props}>🏠</div>
  ),
  FaPlus: ({ className, ...props }: any) => (
    <div data-testid="plus-icon" className={className} {...props}>+</div>
  ),
  FaCalendar: ({ className, ...props }: any) => (
    <div data-testid="calendar-icon" className={className} {...props}>📅</div>
  ),
  FaMusic: ({ className, ...props }: any) => (
    <div data-testid="music-icon" className={className} {...props}>🎵</div>
  ),
  FaUsers: ({ className, ...props }: any) => (
    <div data-testid="users-icon" className={className} {...props}>👥</div>
  ),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default authenticated user
    mockUseAuth.mockReturnValue({
      currentUser: {
        uid: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg'
      },
      isLoading: false
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Authentication States', () => {
    it('should redirect to login when not authenticated', async () => {
      mockUseAuth.mockReturnValue({
        currentUser: null,
        isLoading: false
      });

      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('should show loading screen while auth is loading', () => {
      mockUseAuth.mockReturnValue({
        currentUser: null,
        isLoading: true
      });

      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
    });

    it('should render dashboard for authenticated users', () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });
  });

  describe('Dashboard Structure', () => {
    it('should display welcome message with user name', () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      expect(screen.getByText('Welcome back, Test User!')).toBeInTheDocument();
    });

    it('should display welcome message with fallback when no display name', () => {
      mockUseAuth.mockReturnValue({
        currentUser: {
          uid: 'test-user-id',
          email: 'test@example.com',
          displayName: null,
          photoURL: null
        },
        isLoading: false
      });

      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      expect(screen.getByText('Welcome to your dashboard!')).toBeInTheDocument();
    });

    it('should show current date and time', () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      expect(screen.getByTestId('current-date')).toBeInTheDocument();
    });

    it('should display empty state message', () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      expect(screen.getByText(/Your dashboard is ready/)).toBeInTheDocument();
    });
  });

  describe('Quick Actions', () => {
    it('should render quick action buttons', () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });

    it('should show Create Event quick action', () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      const createEventButton = screen.getByTestId('quick-action-create-event');
      expect(createEventButton).toBeInTheDocument();
      expect(createEventButton).toHaveTextContent('Create Event');
    });

    it('should show View Calendar quick action', () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      const viewCalendarButton = screen.getByTestId('quick-action-view-calendar');
      expect(viewCalendarButton).toBeInTheDocument();
      expect(viewCalendarButton).toHaveTextContent('View Calendar');
    });

    it('should show Manage Profile quick action', () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      const manageProfileButton = screen.getByTestId('quick-action-manage-profile');
      expect(manageProfileButton).toBeInTheDocument();
      expect(manageProfileButton).toHaveTextContent('Manage Profile');
    });

    it('should navigate to profile when Manage Profile is clicked', () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      const manageProfileButton = screen.getByTestId('quick-action-manage-profile');
      fireEvent.click(manageProfileButton);

      expect(mockPush).toHaveBeenCalledWith('/my-profile');
    });

    it('should have touch-friendly quick action buttons', () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      const quickActions = screen.getAllByTestId(/^quick-action-/);
      
      quickActions.forEach(action => {
        expect(action).toHaveClass('min-h-[44px]', 'touch-target');
      });
    });
  });

  describe('Recent Activity Section', () => {
    it('should render recent activity section', () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      expect(screen.getByTestId('recent-activity')).toBeInTheDocument();
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });

    it('should show empty state when no recent activity', () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      expect(screen.getByText(/No recent activity/)).toBeInTheDocument();
    });

    it('should have proper structure for future activity items', () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      const activityContainer = screen.getByTestId('activity-container');
      expect(activityContainer).toBeInTheDocument();
      expect(activityContainer).toHaveClass('space-y-3');
    });
  });

  describe('Stats Overview', () => {
    it('should render stats overview section', () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      expect(screen.getByTestId('stats-overview')).toBeInTheDocument();
      expect(screen.getByText('Overview')).toBeInTheDocument();
    });

    it('should show placeholder stats', () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      expect(screen.getByTestId('stat-events')).toBeInTheDocument();
      expect(screen.getByTestId('stat-connections')).toBeInTheDocument();
      expect(screen.getByTestId('stat-bookings')).toBeInTheDocument();
    });

    it('should display zero values for new users', () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      const eventsStat = screen.getByTestId('stat-events');
      const connectionsStat = screen.getByTestId('stat-connections');
      const bookingsStat = screen.getByTestId('stat-bookings');

      expect(eventsStat).toHaveTextContent('0');
      expect(connectionsStat).toHaveTextContent('0');
      expect(bookingsStat).toHaveTextContent('0');
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should have mobile-optimized layout', () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      const dashboardPage = screen.getByTestId('dashboard-page');
      expect(dashboardPage).toHaveClass('p-4', 'sm:p-6');
    });

    it('should have responsive grid for quick actions', () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      const quickActionsGrid = screen.getByTestId('quick-actions-grid');
      expect(quickActionsGrid).toHaveClass('grid', 'grid-cols-1', 'sm:grid-cols-3', 'gap-4');
    });

    it('should have responsive stats grid', () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      const statsGrid = screen.getByTestId('stats-grid');
      expect(statsGrid).toHaveClass('grid', 'grid-cols-1', 'sm:grid-cols-3', 'gap-4');
    });

    it('should have responsive text sizing', () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      const welcomeTitle = screen.getByTestId('welcome-title');
      expect(welcomeTitle).toHaveClass('text-2xl', 'sm:text-3xl');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      // Main heading should be h1
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toBeInTheDocument();

      // Section headings should be h2
      const sectionHeadings = screen.getAllByRole('heading', { level: 2 });
      expect(sectionHeadings.length).toBeGreaterThan(0);
    });

    it('should have proper ARIA labels for quick actions', () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      const createEventButton = screen.getByTestId('quick-action-create-event');
      expect(createEventButton).toHaveAttribute('aria-label', expect.stringContaining('Create'));
    });

    it('should support keyboard navigation for quick actions', () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      const quickActions = screen.getAllByTestId(/^quick-action-/);
      
      quickActions.forEach(action => {
        expect(action).toHaveAttribute('tabIndex', '0');
      });
    });

    it('should provide proper focus management', () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      const manageProfileButton = screen.getByTestId('quick-action-manage-profile');
      manageProfileButton.focus();
      expect(document.activeElement).toBe(manageProfileButton);
    });
  });

  describe('Theme Integration', () => {
    it('should apply theme-aware colors', () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      const dashboardPage = screen.getByTestId('dashboard-page');
      expect(dashboardPage).toHaveClass('text-slate-900', 'dark:text-white');
    });

    it('should have proper background colors for sections', () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      const quickActionsSection = screen.getByTestId('quick-actions');
      expect(quickActionsSection).toHaveClass('bg-card', 'text-card-foreground', 'border-border');
    });
  });

  describe('Future Extensibility', () => {
    it('should have proper structure for adding content sections', () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      const contentGrid = screen.getByTestId('dashboard-grid');
      expect(contentGrid).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-3', 'gap-6');
    });

    it('should have sidebar space for future navigation additions', () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      // MainLayout includes sidebar, so dashboard should work with it
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });
  });
});