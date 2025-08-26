'use client';

import React from 'react';
import { BndyLogo } from 'bndy-ui';
import { useAuth } from 'bndy-ui/auth';
import { useTheme } from '../../context/ThemeContext';
import { FaSun, FaMoon, FaBell, FaBars, FaMusic, FaHome } from 'react-icons/fa';

interface AppHeaderProps {
  onToggleSidebar: () => void;
  context?: 'dashboard' | 'backstage';
  artistName?: string;
  hasNotifications?: boolean;
  onNotificationClick?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ 
  onToggleSidebar,
  context = 'dashboard',
  artistName,
  hasNotifications = false,
  onNotificationClick
}) => {
  const { currentUser, isLoading } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  // Pre-auth state (minimal header)
  if (!currentUser && !isLoading) {
    return (
      <header 
        role="banner"
        data-testid="app-header" 
        className="bg-slate-800 border-b border-slate-700 mobile-edge mobile-safe-padding py-3"
      >
        <div data-testid="header-content" className="flex items-center justify-between">
          <BndyLogo 
            className="w-8 h-8" 
            color="#f97316" 
            holeColor={isDark ? '#1e293b' : '#f8fafc'} 
          />
          
          {/* Theme toggle always visible */}
          <button
            data-testid="theme-toggle"
            onClick={toggleTheme}
            onKeyDown={(e) => handleKeyDown(e, toggleTheme)}
            aria-label="Toggle theme"
            className="min-h-[44px] p-2 text-slate-400 hover:text-white rounded-md transition-colors touch-target"
          >
            {isDark ? <FaSun size={20} /> : <FaMoon size={20} />}
          </button>
        </div>
      </header>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <header 
        role="banner"
        data-testid="app-header" 
        className="bg-slate-800 border-b border-slate-700 mobile-edge mobile-safe-padding py-3"
      >
        <div data-testid="header-content" className="flex items-center justify-between">
          <BndyLogo 
            className="w-8 h-8" 
            color="#f97316" 
            holeColor={isDark ? '#1e293b' : '#f8fafc'} 
          />
          
          <button
            data-testid="theme-toggle"
            onClick={toggleTheme}
            onKeyDown={(e) => handleKeyDown(e, toggleTheme)}
            aria-label="Toggle theme"
            className="min-h-[44px] p-2 text-slate-400 hover:text-white rounded-md transition-colors touch-target"
          >
            {isDark ? <FaSun size={20} /> : <FaMoon size={20} />}
          </button>
        </div>
      </header>
    );
  }

  // Full authenticated header
  return (
    <header 
      role="banner"
      data-testid="app-header" 
      className="bg-slate-800 border-b border-slate-700 mobile-edge mobile-safe-padding py-3"
    >
      <div data-testid="header-content" className="flex items-center justify-between">
        {/* Left section: Logo + Context */}
        <div className="flex items-center space-x-4">
          <BndyLogo 
            className="w-8 h-8" 
            color="#f97316" 
            holeColor={isDark ? '#1e293b' : '#f8fafc'} 
          />
          
          {/* Desktop Context Display */}
          <div data-testid="context-desktop" className="hidden md:flex items-center text-slate-300">
            {context === 'backstage' && artistName ? (
              <>
                <span className="text-orange-500 font-medium">Backstage</span>
                <span className="mx-2 text-slate-500">|</span>
                <span>{artistName}</span>
              </>
            ) : (
              <span>Dashboard</span>
            )}
          </div>

          {/* Mobile Context Pills */}
          <div 
            data-testid="context-pill-mobile"
            className="md:hidden flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-orange-600/20 to-orange-500/10 border border-orange-500/30 animate-pulse"
          >
            {context === 'backstage' ? (
              <>
                <FaMusic size={14} className="text-orange-500 mr-2" />
                <span className="text-orange-300 text-sm font-medium">Backstage</span>
              </>
            ) : (
              <>
                <FaHome size={14} className="text-orange-500 mr-2" />
                <span className="text-orange-300 text-sm font-medium">Dashboard</span>
              </>
            )}
          </div>
        </div>

        {/* Right section: Actions */}
        <div className="flex items-center space-x-2">
          {/* Notification Bell */}
          <div className="relative">
            <button
              data-testid="notification-bell"
              onClick={onNotificationClick}
              onKeyDown={(e) => handleKeyDown(e, onNotificationClick || (() => {}))}
              aria-label="View notifications"
              className="min-h-[44px] p-2 text-slate-400 hover:text-white rounded-md transition-colors touch-target relative"
            >
              <FaBell size={20} />
              {hasNotifications && (
                <div 
                  data-testid="notification-indicator"
                  className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-800"
                />
              )}
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            data-testid="theme-toggle"
            onClick={toggleTheme}
            onKeyDown={(e) => handleKeyDown(e, toggleTheme)}
            aria-label="Toggle theme"
            className="min-h-[44px] p-2 text-slate-400 hover:text-white rounded-md transition-colors touch-target"
          >
            {isDark ? <FaSun size={20} /> : <FaMoon size={20} />}
          </button>

          {/* Mobile Hamburger Menu */}
          <button
            data-testid="hamburger-menu"
            onClick={onToggleSidebar}
            onKeyDown={(e) => handleKeyDown(e, onToggleSidebar)}
            aria-label="Toggle navigation menu"
            className="md:hidden min-h-[44px] p-2 text-slate-400 hover:text-white rounded-md transition-colors touch-target"
          >
            <FaBars size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};