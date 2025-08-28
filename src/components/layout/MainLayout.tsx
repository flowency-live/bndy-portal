'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { useAuth } from 'bndy-ui/auth';
import { useRouter } from 'next/navigation';
import { BndyLoadingScreen, ThinFooter } from 'bndy-ui';
import { ErrorBoundary } from '../ErrorBoundary';
import { AppHeader } from './AppHeader';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  let currentUser = null;
  let isLoading = false;
  
  try {
    const auth = useAuth();
    currentUser = auth.currentUser;
    isLoading = auth.isLoading;
  } catch (error) {
    console.error('Auth error in MainLayout:', error);
    isLoading = false;
    currentUser = null;
  }
  
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, isLoading, router]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [sidebarOpen]);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  // Show loading screen while auth is loading
  if (isLoading) {
    return <BndyLoadingScreen />;
  }

  // Don't render layout for unauthenticated users
  if (!currentUser) {
    return null;
  }

  return (
    <ErrorBoundary>
      <div 
        data-testid="main-layout" 
        className="min-h-screen flex flex-col bg-[var(--theme-background)] text-[var(--theme-foreground)] safe-top"
      >
        {/* Header - Full width */}
        <AppHeader onToggleSidebar={handleToggleSidebar} />
        
        <div className="flex flex-1 pt-16">
          {/* Sidebar */}
          <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />

          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div
              data-testid="sidebar-overlay"
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={handleCloseSidebar}
            />
          )}

          {/* Main content area */}
          <div className="flex-1 flex flex-col">

          {/* Main content */}
          <main 
            role="main" 
            className="flex-1 mobile-safe-padding py-4 overflow-auto"
          >
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
          </div>
        </div>
        
        {/* Footer - Full width at bottom */}
        <ThinFooter badgePath="/assets/images/BndyBeatBadge.png" />
      </div>
    </ErrorBoundary>
  );
};