'use client';

import React from 'react';
import { FaMusic, FaBuilding, FaHandshake, FaCheck } from 'react-icons/fa';

export type UserRole = 'artist' | 'venue' | 'agent';

interface RoleSelectorProps {
  selectedRoles: UserRole[];
  onRoleChange: (roles: UserRole[]) => void;
  required?: boolean;
  error?: string;
  className?: string;
}

interface RoleOption {
  id: UserRole;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

const roleOptions: RoleOption[] = [
  {
    id: 'artist',
    title: 'Artist',
    description: 'Create and manage your music, setlists, and performances',
    icon: FaMusic,
    gradient: 'from-purple-500 to-purple-600'
  },
  {
    id: 'venue',
    title: 'Venue',
    description: 'Host events and manage bookings for your space',
    icon: FaBuilding,
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    id: 'agent',
    title: 'Agent',
    description: 'Represent artists and manage bookings on their behalf',
    icon: FaHandshake,
    gradient: 'from-green-500 to-green-600'
  }
];

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRoles,
  onRoleChange,
  required = false,
  error,
  className = ''
}) => {
  const handleRoleToggle = (roleId: UserRole) => {
    const isSelected = selectedRoles.includes(roleId);
    
    if (isSelected) {
      // Don't allow deselecting if it's the only selected role
      if (selectedRoles.length === 1) {
        return;
      }
      // Remove the role
      onRoleChange(selectedRoles.filter(role => role !== roleId));
    } else {
      // Add the role
      onRoleChange([...selectedRoles, roleId]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, roleId: UserRole) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRoleToggle(roleId);
    }
  };

  return (
    <div 
      data-testid="role-selector"
      data-error={!!error}
      className={`space-y-4 ${className}`}
    >
      <fieldset>
        <legend className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Select your role(s) {required && <span className="text-red-500">*</span>}
        </legend>
        
        <div 
          data-testid="role-options-container"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {roleOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedRoles.includes(option.id);
            
            return (
              <div
                key={option.id}
                data-testid={`role-${option.id}`}
                role="checkbox"
                aria-checked={isSelected}
                aria-label={`${option.title}: ${option.description}`}
                tabIndex={0}
                className={`
                  relative min-h-[80px] touch-target p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                  bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700
                  hover:border-orange-300 hover:bg-orange-25 hover:shadow-md
                  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                  ${isSelected 
                    ? 'ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-950 border-orange-500' 
                    : ''
                  }
                `}
                onClick={() => handleRoleToggle(option.id)}
                onKeyDown={(e) => handleKeyDown(e, option.id)}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div 
                    data-testid={`check-${option.id}`}
                    className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center"
                  >
                    <FaCheck className="text-white text-xs" />
                  </div>
                )}

                {/* Icon */}
                <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${option.gradient} mb-3`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>

                {/* Content */}
                <div>
                  <h3 
                    data-testid={`role-title-${option.id}`}
                    className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-1"
                  >
                    {option.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {option.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </fieldset>

      {error && (
        <div 
          data-testid="role-error"
          role="alert"
          className="text-sm text-red-600 dark:text-red-400 flex items-start"
        >
          {error}
        </div>
      )}
    </div>
  );
};