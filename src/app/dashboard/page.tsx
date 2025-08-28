'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'bndy-ui/auth';
import { BndyLoadingScreen } from 'bndy-ui';
import { MainLayout } from '../../components/layout/MainLayout';
import { FaPlus, FaCalendar, FaUsers } from 'react-icons/fa';

export default function DashboardPage() {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, isLoading, router]);

  if (isLoading) {
    return <BndyLoadingScreen />;
  }

  if (!currentUser) {
    return <BndyLoadingScreen />;
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'manage-profile':
        router.push('/my-profile');
        break;
      case 'create-event':
        // TODO: Navigate to create event page
        break;
      case 'view-calendar':
        // TODO: Navigate to calendar page
        break;
      default:
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  return (
    <MainLayout>
      <div 
        data-testid="dashboard-page"
        className="p-4 sm:p-6 text-slate-900 dark:text-white"
      >
        {/* Welcome Header */}
        <div className="mb-6">
          <h1 
            data-testid="welcome-title"
            className="text-2xl sm:text-3xl font-bold mb-2"
          >
            {currentUser.displayName 
              ? `Welcome back, ${currentUser.displayName}!` 
              : 'Welcome to your dashboard!'
            }
          </h1>
          
          <p 
            data-testid="current-date"
            className="text-slate-600 dark:text-slate-400"
          >
            {currentDate}
          </p>
        </div>

        {/* Dashboard Grid */}
        <div 
          data-testid="dashboard-grid"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <section 
              data-testid="quick-actions"
              className="bg-card text-card-foreground rounded-lg p-6 border border-border transition-colors duration-300"
            >
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              
              <div 
                data-testid="quick-actions-grid"
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                <button
                  data-testid="quick-action-create-event"
                  className="min-h-[44px] touch-target p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
                  onClick={() => handleQuickAction('create-event')}
                  onKeyDown={(e) => handleKeyDown(e, () => handleQuickAction('create-event'))}
                  tabIndex={0}
                  aria-label="Create new event"
                >
                  <FaPlus className="h-4 w-4" />
                  <span>Create Event</span>
                </button>

                <button
                  data-testid="quick-action-view-calendar"
                  className="min-h-[44px] touch-target p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
                  onClick={() => handleQuickAction('view-calendar')}
                  onKeyDown={(e) => handleKeyDown(e, () => handleQuickAction('view-calendar'))}
                  tabIndex={0}
                  aria-label="View calendar"
                >
                  <FaCalendar className="h-4 w-4" />
                  <span>View Calendar</span>
                </button>

                <button
                  data-testid="quick-action-manage-profile"
                  className="min-h-[44px] touch-target p-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center space-x-2"
                  onClick={() => handleQuickAction('manage-profile')}
                  onKeyDown={(e) => handleKeyDown(e, () => handleQuickAction('manage-profile'))}
                  tabIndex={0}
                  aria-label="Manage your profile"
                >
                  <FaUsers className="h-4 w-4" />
                  <span>Manage Profile</span>
                </button>
              </div>
            </section>

            {/* Recent Activity */}
            <section 
              data-testid="recent-activity"
              className="bg-card text-card-foreground rounded-lg p-6 border border-border transition-colors duration-300"
            >
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              
              <div 
                data-testid="activity-container"
                className="space-y-3"
              >
                <div className="text-center py-8">
                  <div className="text-slate-400 dark:text-slate-500 mb-2">
                    <FaUsers className="h-12 w-12 mx-auto opacity-50" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    No recent activity to display. Start by creating your first event or connecting with other artists!
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-6">
            {/* Stats Overview */}
            <section 
              data-testid="stats-overview"
              className="bg-card text-card-foreground rounded-lg p-6 border border-border transition-colors duration-300"
            >
              <h2 className="text-xl font-semibold mb-4">Overview</h2>
              
              <div 
                data-testid="stats-grid"
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                <div 
                  data-testid="stat-events"
                  className="text-center p-4 bg-muted text-muted-foreground rounded-lg transition-colors duration-300"
                >
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-sm">Events</div>
                </div>

                <div 
                  data-testid="stat-connections"
                  className="text-center p-4 bg-muted text-muted-foreground rounded-lg transition-colors duration-300"
                >
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm">Connections</div>
                </div>

                <div 
                  data-testid="stat-bookings"
                  className="text-center p-4 bg-muted text-muted-foreground rounded-lg transition-colors duration-300"
                >
                  <div className="text-2xl font-bold text-orange-600">0</div>
                  <div className="text-sm">Bookings</div>
                </div>
              </div>
            </section>

            {/* Empty State Message */}
            <div className="bg-secondary text-secondary-foreground rounded-lg p-6 text-center border border-border transition-colors duration-300">
              <h3 className="text-lg font-semibold mb-2">Your dashboard is ready!</h3>
              <p className="text-sm opacity-75 mb-4">
                Complete your profile and start connecting with the music community.
              </p>
              <button
                onClick={() => handleQuickAction('manage-profile')}
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                Complete Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}