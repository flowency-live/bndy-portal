'use client';

import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';

interface CollapsibleSectionProps {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  gradientFrom: string;
  gradientTo: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  id,
  title,
  description,
  icon,
  gradientFrom,
  gradientTo,
  isExpanded,
  onToggle,
  children,
  className = ''
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  // Generate dynamic gradient classes
  const headerGradientClass = `bg-gradient-to-r from-${gradientFrom}/5 to-${gradientTo}/5 hover:from-${gradientFrom}/10 hover:to-${gradientTo}/10`;
  const iconGradientClass = `bg-gradient-to-br from-${gradientFrom} to-${gradientTo}`;

  return (
    <div 
      data-testid={`collapsible-section-${id}`}
      className={`rounded-lg shadow-xl overflow-hidden bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-0 ${className}`}
    >
      {/* Header */}
      <div 
        data-testid={`collapsible-header-${id}`}
        id={`header-${id}`}
        className={`p-4 sm:p-6 cursor-pointer hover:opacity-90 transition-all duration-200 ${headerGradientClass} border-b border-${gradientFrom}/20`}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        role="button"
        aria-expanded={isExpanded}
        aria-controls={`content-${id}`}
        tabIndex={0}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div 
              data-testid={`icon-wrapper-${id}`}
              data-gradient-from={gradientFrom}
              data-gradient-to={gradientTo}
              className={`p-2 sm:p-3 rounded-xl mr-3 sm:mr-4 shadow-lg ${iconGradientClass}`}
            >
              {icon}
            </div>
            <div>
              <h3 
                data-testid={`section-title-${id}`}
                className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100"
              >
                {title}
              </h3>
              <p 
                data-testid={`section-description-${id}`}
                className="text-xs sm:text-sm text-slate-500 dark:text-slate-400"
              >
                {description}
              </p>
            </div>
          </div>
          <motion.div 
            data-testid={`chevron-wrapper-${id}`}
            data-expanded={isExpanded}
            className="text-slate-400 dark:text-slate-500"
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <FaChevronDown size={20} />
          </motion.div>
        </div>
      </div>
      
      {/* Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            data-testid={`collapsible-content-${id}`}
            id={`content-${id}`}
            aria-labelledby={`header-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};