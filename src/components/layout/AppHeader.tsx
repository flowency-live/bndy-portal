'use client';

import React from 'react';
import Link from 'next/link';
import { BndyLogo } from 'bndy-ui';
import { useAuth } from 'bndy-ui/auth';
import { useTheme } from '../../context/ThemeContext';
import { FaMoon, FaBell, FaBars, FaMusic, FaHome } from 'react-icons/fa';
import { SunIcon } from '@heroicons/react/24/solid';

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
        className={`${isDark ? 'bg-slate-900' : 'bg-white'} border-b ${isDark ? 'border-slate-700' : 'border-slate-200'} py-4 w-full`}
      >
        <div data-testid="header-content" className="max-w-screen-2xl mx-auto flex justify-between items-center px-6">
          <div className="flex items-center">
            <BndyLogo 
              className="h-12 w-12" 
              color="#f97316" 
              holeColor={isDark ? '#0f172a' : '#ffffff'} 
            />
          </div>
          <div className="flex items-center space-x-2">
            {/* Sign In Button */}
            <Link
              href="/auth"
              data-testid="sign-in-button"
              className="min-h-[44px] px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md transition-colors touch-target flex items-center"
            >
              Sign In
            </Link>
            
            {/* Theme toggle */}
            <button
              data-testid="theme-toggle"
              onClick={toggleTheme}
              onKeyDown={(e) => handleKeyDown(e, toggleTheme)}
              aria-label="Toggle theme"
              className={`min-h-[44px] p-2 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} rounded-md transition-colors touch-target`}
            >
              {isDark ? <SunIcon className="w-5 h-5" /> : <FaMoon size={20} />}
            </button>
          </div>
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
        className={`${isDark ? 'bg-slate-900' : 'bg-white'} border-b ${isDark ? 'border-slate-700' : 'border-slate-200'} py-4 w-full`}
      >
        <div data-testid="header-content" className="max-w-screen-2xl mx-auto flex justify-between items-center px-6">
          <div className="flex items-center">
            <BndyLogo 
              className="h-12 w-12" 
              color="#f97316" 
              holeColor={isDark ? '#0f172a' : '#ffffff'} 
            />
          </div>
          <div className="flex items-center space-x-2">
            {/* Sign In Button (loading state) */}
            <Link
              href="/auth"
              data-testid="sign-in-button"
              className="min-h-[44px] px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md transition-colors touch-target flex items-center opacity-75"
            >
              Sign In
            </Link>
            
            {/* Theme toggle */}
            <button
              data-testid="theme-toggle"
              onClick={toggleTheme}
              onKeyDown={(e) => handleKeyDown(e, toggleTheme)}
              aria-label="Toggle theme"
              className={`min-h-[44px] p-2 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} rounded-md transition-colors touch-target`}
            >
              {isDark ? <SunIcon className="w-5 h-5" /> : <FaMoon size={20} />}
            </button>
          </div>
        </div>
      </header>
    );
  }

  // Full authenticated header
  return (
    <header
      data-testid="app-header"
      className={`fixed top-0 left-0 right-0 z-40 h-16 ${isDark ? 'bg-slate-900' : 'bg-white'} border-b ${isDark ? 'border-slate-700' : 'border-slate-200'} flex items-center px-4 md:px-6`}
    >
      {/* Mobile menu button */}
      <button
        data-testid="hamburger-menu"
        onClick={onToggleSidebar}
        className={`md:hidden p-2 ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'} min-h-[44px] touch-target mr-4`}
        aria-label="Open navigation menu"
      >
        <FaBars size={24} />
      </button>

      {/* BNDY Logo with dashboard link */}
      <Link href="/dashboard" className="flex items-center mr-4">
        <BndyLogo 
          className="h-10 w-auto" 
          color="#f97316" 
          holeColor={isDark ? '#0f172a' : '#ffffff'} 
        />
      </Link>

      {/* Title separator */}
      <div className="flex-1 flex items-center">
        <span className={`${isDark ? 'text-slate-500' : 'text-slate-400'} font-medium`}>|</span>
        <span className={`ml-3 ${isDark ? 'text-slate-200' : 'text-slate-800'} font-medium`}>User Dashboard</span>
      </div>

      {/* Right section: Actions */}
      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            data-testid="notification-bell"
            onClick={onNotificationClick}
            onKeyDown={(e) => handleKeyDown(e, onNotificationClick || (() => {}))}
            aria-label="View notifications"
            className={`p-2 ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'} focus:outline-none focus:ring-2 focus:ring-inset ${isDark ? 'focus:ring-white' : 'focus:ring-slate-800'} touch-target relative`}
          >
            <FaBell size={22} />
            {hasNotifications && (
              <div 
                data-testid="notification-indicator"
                className={`absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 ${isDark ? 'border-slate-900' : 'border-white'}`}
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
          className={`min-h-[44px] p-2 ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'} rounded-md transition-colors touch-target`}
        >
          {isDark ? <SunIcon className="w-5 h-5" /> : <FaMoon size={20} />}
        </button>
      </div>
    </header>
  );
};