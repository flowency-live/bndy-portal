'use client';

import React, { useState } from 'react';
import { FaMusic, FaMicrophone, FaGuitar, FaKeyboard, FaDrum, FaTimes, FaPlus, FaChevronDown } from 'react-icons/fa';

interface InstrumentSelectorProps {
  selectedInstruments: string[];
  onInstrumentChange: (instruments: string[]) => void;
  className?: string;
  maxSelections?: number;
  required?: boolean;
  error?: string;
}

interface InstrumentCategory {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  instruments: string[];
  gradient: string;
}

const instrumentCategories: InstrumentCategory[] = [
  {
    id: 'vocals',
    title: 'Vocals',
    icon: FaMicrophone,
    gradient: 'from-pink-500 to-pink-600',
    instruments: ['Lead Vocals', 'Backing Vocals', 'Harmony Vocals']
  },
  {
    id: 'guitar',
    title: 'Guitar',
    icon: FaGuitar,
    gradient: 'from-orange-500 to-orange-600',
    instruments: ['Electric Guitar', 'Acoustic Guitar', 'Bass Guitar', 'Classical Guitar']
  },
  {
    id: 'piano',
    title: 'Piano/Keys',
    icon: FaKeyboard,
    gradient: 'from-blue-500 to-blue-600',
    instruments: ['Piano', 'Keyboard', 'Synthesizer', 'Organ']
  },
  {
    id: 'drums',
    title: 'Drums',
    icon: FaDrum,
    gradient: 'from-red-500 to-red-600',
    instruments: ['Drum Kit', 'Percussion', 'Electronic Drums', 'Cajon']
  },
  {
    id: 'other',
    title: 'Other',
    icon: FaMusic,
    gradient: 'from-purple-500 to-purple-600',
    instruments: []
  }
];

export const InstrumentSelector: React.FC<InstrumentSelectorProps> = ({
  selectedInstruments,
  onInstrumentChange,
  className = '',
  maxSelections,
  required = false,
  error
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [customInstrument, setCustomInstrument] = useState('');

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const toggleInstrument = (instrument: string) => {
    if (selectedInstruments.includes(instrument)) {
      // Remove instrument
      onInstrumentChange(selectedInstruments.filter(item => item !== instrument));
    } else {
      // Check max selections limit
      if (maxSelections && selectedInstruments.length >= maxSelections) {
        return;
      }
      // Add instrument
      onInstrumentChange([...selectedInstruments, instrument]);
    }
  };

  const addCustomInstrument = () => {
    const trimmed = customInstrument.trim();
    if (trimmed && !selectedInstruments.includes(trimmed)) {
      if (maxSelections && selectedInstruments.length >= maxSelections) {
        return;
      }
      onInstrumentChange([...selectedInstruments, trimmed]);
      setCustomInstrument('');
    }
  };

  const removeInstrument = (instrument: string) => {
    onInstrumentChange(selectedInstruments.filter(item => item !== instrument));
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  const getRemainingSelections = () => {
    if (!maxSelections) return null;
    const remaining = maxSelections - selectedInstruments.length;
    if (remaining <= 0) return null;
    return remaining === 1 ? '1 selection remaining' : `${remaining} selections remaining`;
  };

  const createInstrumentId = (instrument: string) => {
    return instrument.toLowerCase().replace(/[^a-z0-9]/g, '-');
  };

  return (
    <div 
      data-testid="instrument-selector"
      className={`space-y-6 text-slate-900 dark:text-white ${className}`}
    >
      <fieldset>
        <legend className="sr-only">Instruments & Vocals</legend>
        
        {/* Header */}
        <div className="mb-4">
          <h3 
            data-testid="instrument-selector-title"
            className="text-lg sm:text-xl font-semibold mb-1"
          >
            Instruments & Vocals {required && <span className="text-red-500">*</span>}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Select the instruments you play and vocal abilities you have
          </p>
          {getRemainingSelections() && (
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
              {getRemainingSelections()}
            </p>
          )}
        </div>

        {/* Selected Instruments Tags */}
        {selectedInstruments.length > 0 && (
          <div 
            data-testid="selected-instruments-tags"
            className="flex flex-wrap gap-2 mb-6"
          >
            {selectedInstruments.map((instrument) => (
              <div
                key={instrument}
                data-testid={`tag-${createInstrumentId(instrument)}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200"
              >
                <span>{instrument}</span>
                <button
                  data-testid={`remove-${createInstrumentId(instrument)}`}
                  onClick={() => removeInstrument(instrument)}
                  className="ml-2 p-0.5 hover:bg-orange-200 dark:hover:bg-orange-800 rounded-full transition-colors"
                  aria-label={`Remove ${instrument}`}
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Instrument Categories */}
        <div className="space-y-3">
          {instrumentCategories.map((category) => {
            const Icon = category.icon;
            const isExpanded = expandedCategories[category.id];

            return (
              <div key={category.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                {/* Category Header */}
                <button
                  data-testid={`category-${category.id}`}
                  role="button"
                  aria-expanded={isExpanded}
                  tabIndex={0}
                  onClick={() => toggleCategory(category.id)}
                  onKeyDown={(e) => handleKeyDown(e, () => toggleCategory(category.id))}
                  className="w-full min-h-[44px] touch-target p-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${category.gradient}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium">{category.title}</span>
                  </div>
                  <div
                    data-testid={`expand-${category.id}`}
                    data-expanded={isExpanded}
                    className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  >
                    <FaChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                </button>

                {/* Category Content */}
                {isExpanded && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-600">
                    {category.id === 'other' ? (
                      /* Custom Instrument Input */
                      <div className="flex space-x-2">
                        <input
                          data-testid="custom-instrument-input"
                          type="text"
                          value={customInstrument}
                          onChange={(e) => setCustomInstrument(e.target.value)}
                          placeholder="Enter instrument name..."
                          className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-slate-800 dark:text-white"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addCustomInstrument();
                            }
                          }}
                        />
                        <button
                          data-testid="add-custom-instrument"
                          onClick={addCustomInstrument}
                          disabled={!customInstrument.trim()}
                          className="px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <FaPlus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      /* Predefined Instruments */
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {category.instruments.map((instrument) => {
                          const isSelected = selectedInstruments.includes(instrument);
                          const instrumentId = createInstrumentId(instrument);
                          
                          return (
                            <button
                              key={instrument}
                              data-testid={`instrument-${instrumentId}`}
                              role="checkbox"
                              aria-checked={isSelected}
                              tabIndex={0}
                              onClick={() => toggleInstrument(instrument)}
                              onKeyDown={(e) => handleKeyDown(e, () => toggleInstrument(instrument))}
                              disabled={!isSelected && maxSelections && selectedInstruments.length >= maxSelections}
                              className={`
                                px-3 py-2 text-left rounded-md border transition-all duration-200
                                ${isSelected
                                  ? 'bg-orange-100 dark:bg-orange-900 border-orange-500 text-orange-800 dark:text-orange-200'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950'
                                }
                                disabled:opacity-50 disabled:cursor-not-allowed
                                focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1
                              `}
                            >
                              {instrument}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </fieldset>

      {error && (
        <div 
          data-testid="instrument-error"
          role="alert"
          className="text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </div>
      )}
    </div>
  );
};