'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from 'bndy-ui/auth';
import { useTheme } from '../../context/ThemeContext';
import { FaHome, FaUser, FaCalendar, FaMusic, FaSignOutAlt, FaTimes } from 'react-icons/fa';
import { Button } from 'bndy-ui';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'My Dashboard', href: '/dashboard', icon: <FaHome size={20} /> },
  { id: 'profile', label: 'My Profile', href: '/my-profile', icon: <FaUser size={20} /> },
  { id: 'calendar', label: 'My Calendar', href: '/calendar', icon: <FaCalendar size={20} /> },
  { id: 'artists', label: 'My Artists', href: '/artists', icon: <FaMusic size={20} /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, signOut } = useAuth();
  const { theme, isDark } = useTheme();
  
  // Update sidebar styling when theme changes
  useEffect(() => {
    // The dark mode classes are applied automatically through Tailwind's dark mode
    // This effect ensures the component re-renders when theme changes
  }, [theme, isDark]);

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getInitials = (input: string) => {
    if (!input) return '';
    
    if (input.includes('@')) {
      // It's an email
      return input.slice(0, 2).toUpperCase();
    }
    
    // It's a name
    return input
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  return (
    <>
      {/* Mobile Overlay - this is the fix for mobile navigation */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <nav
        data-testid="sidebar"
        data-open={isOpen}
        data-theme={theme}
        aria-label="Main navigation"
        className={`fixed md:sticky top-16 md:top-0 left-0 z-50 h-[calc(100vh-4rem)] md:h-auto 
     w-64 flex flex-col ${isDark ? 'bg-slate-900' : 'bg-white'} border-r ${isDark ? 'border-slate-700' :
     'border-slate-200'} transform transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' :
     '-translate-x-full'} md:translate-x-0`}
   
      >
        {/* Mobile close button */}
        <button
          data-testid="close-sidebar"
          onClick={onClose}
          className={`md:hidden absolute top-4 right-4 p-2 ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'} min-h-[44px] touch-target`}
          aria-label="Close navigation menu"
        >
          <FaTimes size={24} />
        </button>
        
        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto pt-16 md:pt-4 px-3">
          <nav data-testid="sidebar-nav">
            <ul className="space-y-2 md:space-y-3">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      data-testid={`nav-item-${item.id}`}
                      className={`flex items-center px-3 py-2 rounded-md transition-colors duration-300 ${
                        isActive
                          ? `${isDark ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-900'}`
                          : `${isDark ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
                      }`}
                      onClick={onClose}
                    >
                      <span className="mr-3">{item.icon}</span>
                      <span className="font-medium text-sm md:text-base">{item.label}</span>
                      {isActive && (
                        <span className="ml-auto w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-orange-500" aria-hidden="true" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
        
        {/* Footer area with user profile and sign out */}
        <div className="mt-auto">
          <div className={`p-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'} transition-colors duration-300`}>
            {/* User profile */}
            <div className={`flex items-center space-x-3 p-3 mb-3 ${isDark ? 'bg-slate-800/50' : 'bg-slate-100/80'} rounded-lg border ${isDark ? 'border-slate-600/30' : 'border-slate-300/30'} shadow-inner`}>
              {currentUser?.photoURL ? (
                <Image
                  data-testid="user-avatar"
                  src={currentUser.photoURL}
                  alt="User avatar"
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div
                  data-testid="fallback-avatar"
                  className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-medium text-lg shadow-sm"
                >
                  {getInitials(currentUser?.displayName || currentUser?.email || '')}
                </div>
              )}
              <div className="flex-1 min-w-0">
                {currentUser?.displayName && (
                  <p className={`font-medium text-base truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{currentUser.displayName}</p>
                )}
                {currentUser?.email && (
                  <p className={`text-sm truncate ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>{currentUser.email}</p>
                )}
              </div>
            </div>
            
            {/* Sign out button */}
            <button
              data-testid="logout-button"
              onClick={handleSignOut}
              className="w-full flex items-center justify-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white border border-orange-600 rounded-md transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              style={{ backgroundColor: '#f97316', color: '#ffffff' }}
            >
              <FaSignOutAlt size={16} className="mr-2" style={{ color: '#ffffff' }} />
              <span style={{ color: '#ffffff' }}>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};