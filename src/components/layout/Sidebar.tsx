'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { BndyLogo } from 'bndy-ui';
import { useAuth } from 'bndy-ui/auth';
import { useTheme } from '../../context/ThemeContext';
import { FaHome, FaUser, FaCog, FaSignOutAlt, FaMusic, FaTimes } from 'react-icons/fa';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: FaHome },
  { id: 'profile', label: 'My Profile', path: '/profile', icon: FaUser },
  { id: 'artists', label: 'My Artists', path: '/artists', icon: FaMusic },
  { id: 'settings', label: 'Settings', path: '/settings', icon: FaCog },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, signOut } = useAuth();
  const { isDark } = useTheme();

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

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <aside
      data-testid="sidebar"
      data-open={isOpen}
      className={`
        fixed top-0 left-0 z-50 w-64 h-full bg-slate-800 border-r border-slate-700 
        transform transition-transform duration-300 ease-in-out
        md:relative md:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      <div className="p-4 h-full flex flex-col">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <BndyLogo 
              className="w-8 h-8" 
              color="#f97316" 
              holeColor={isDark ? '#1e293b' : '#f8fafc'} 
            />
            <span className="text-lg font-semibold text-white">BNDY</span>
          </div>
          <button
            data-testid="close-sidebar"
            onClick={onClose}
            onKeyDown={(e) => handleKeyDown(e, onClose)}
            aria-label="Close navigation menu"
            className="min-h-[44px] p-2 text-slate-400 hover:text-white md:hidden touch-target rounded-md transition-colors"
            tabIndex={0}
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* User Profile Section */}
        {currentUser && (
          <div className="mb-6 p-3 bg-slate-700/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="relative">
                {currentUser.photoURL ? (
                  <Image
                    data-testid="user-avatar"
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User avatar'}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div 
                    data-testid="fallback-avatar"
                    className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                  >
                    {getInitials(currentUser.displayName, currentUser.email || '')}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {currentUser.displayName || 'User'}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {currentUser.email}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation Section */}
        <nav 
          data-testid="sidebar-nav" 
          role="navigation" 
          aria-label="Main navigation"
          className="flex-1 space-y-1"
        >
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                data-testid={`nav-item-${item.id}`}
                onClick={() => handleNavigation(item.path)}
                onKeyDown={(e) => handleKeyDown(e, () => handleNavigation(item.path))}
                className={`
                  w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-all touch-target
                  ${isActive 
                    ? 'bg-orange-500/10 border border-orange-500/30 text-orange-300' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }
                `}
                tabIndex={0}
              >
                <Icon size={18} className={isActive ? 'text-orange-500' : 'text-slate-400'} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="pt-4 border-t border-slate-700">
          <button
            data-testid="logout-button"
            onClick={handleLogout}
            onKeyDown={(e) => handleKeyDown(e, handleLogout)}
            aria-label="Sign out"
            className="w-full flex items-center space-x-3 px-3 py-2 text-slate-300 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors touch-target"
            tabIndex={0}
          >
            <FaSignOutAlt size={18} className="text-slate-400" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};