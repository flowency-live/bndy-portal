'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

const countries: Country[] = [
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', dialCode: '+32', flag: '🇧🇪' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', dialCode: '+43', flag: '🇦🇹' },
  { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', dialCode: '+47', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', dialCode: '+45', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', dialCode: '+358', flag: '🇫🇮' },
  { code: 'IE', name: 'Ireland', dialCode: '+353', flag: '🇮🇪' },
  { code: 'PT', name: 'Portugal', dialCode: '+351', flag: '🇵🇹' },
];

interface PhoneInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  selectedCountry: Country;
  onCountryChange: (country: Country) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  'data-testid'?: string;
}

export function PhoneInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  selectedCountry,
  onCountryChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  className = '',
  'data-testid': testId,
}: PhoneInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const hasValue = value.length > 0;
  const isFloating = isFocused || hasValue;

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.dialCode.includes(searchTerm) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (inputRef.current && isFocused) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
        setSearchTerm('');
      }
    }

    if (isCountryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCountryDropdownOpen]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleCountrySelect = (country: Country) => {
    onCountryChange(country);
    setIsCountryDropdownOpen(false);
    setSearchTerm('');
  };

  const toggleCountryDropdown = () => {
    if (!disabled) {
      setIsCountryDropdownOpen(!isCountryDropdownOpen);
      setSearchTerm('');
    }
  };

  return (
    <div className={`relative ${className}`} data-testid={testId}>
      <div className="relative">
        {/* Phone Number Input with integrated country selector */}
        <input
          ref={inputRef}
          id={id}
          type="tel"
          value={value.startsWith(selectedCountry.dialCode) ? 
            value.substring(selectedCountry.dialCode.length).trim() : 
            value}
          onChange={(e) => {
            onChange(selectedCountry.dialCode + ' ' + e.target.value);
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={isFocused ? placeholder : ''}
          required={required}
          disabled={disabled}
          className={`
            w-full pl-24 pr-4 py-4 border rounded-xl transition-colors duration-200 text-base
            focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500
            bg-slate-800 text-white placeholder-slate-400
            disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed
            ${error 
              ? 'border-red-500 focus:ring-1 focus:ring-red-500' 
              : 'border-slate-600 focus:border-orange-500'
            }
          `}
          data-testid={`${testId}-input`}
        />
        
        {/* Floating Label */}
        <label
          htmlFor={id}
          className={`
            absolute left-24 transition-all duration-200 cursor-text pointer-events-none origin-left
            ${(value && value !== selectedCountry.dialCode + ' ') || isFocused
              ? 'top-1 left-24 scale-75 text-orange-500' 
              : 'top-4 left-24 text-slate-400'
            }
            ${error ? 'text-red-400' : ''}
          `}
          data-testid={`${testId}-label`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {/* Country Selector Button */}
        <button
          ref={dropdownRef}
          type="button"
          onClick={toggleCountryDropdown}
          disabled={disabled}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 text-sm font-medium text-white hover:text-orange-500 transition-colors z-10 bg-slate-800 px-1 rounded"
          data-testid={`${testId}-country-selector`}
          aria-haspopup="listbox"
          aria-expanded={isCountryDropdownOpen}
        >
{selectedCountry.flag ? (
              <span className="text-base">{selectedCountry.flag}</span>
            ) : (
              <span className="inline-block w-6 h-4 bg-slate-600 rounded text-[10px] font-bold text-white text-center leading-4">
                {selectedCountry.code}
              </span>
            )}
            <span className="text-sm">{selectedCountry.dialCode}</span>
            <span className="text-xs">▼</span>
        </button>

        {/* Country Dropdown */}
        {isCountryDropdownOpen && (
          <div 
            className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto"
            data-testid={`${testId}-dropdown`}
          >
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className="w-full flex items-center space-x-2 px-3 py-2.5 text-sm hover:bg-slate-700 transition-colors text-left"
                  data-testid={`${testId}-option-${country.code}`}
                  role="option"
                  aria-selected={selectedCountry.code === country.code}
                >
{country.flag ? (
                    <span className="text-base">{country.flag}</span>
                  ) : (
                    <span className="inline-block w-6 h-4 bg-slate-600 rounded text-[10px] font-bold text-white text-center leading-4">
                      {country.code}
                    </span>
                  )}
                  <span className="font-medium text-white">{country.dialCode}</span>
                  <span className="text-slate-400">{country.name}</span>
                </button>
              ))}
          </div>
        )}
      </div>

      {error && (
        <p 
          className="mt-1 text-sm text-red-400" 
          data-testid={`${testId}-error`}
        >
          {error}
        </p>
      )}

      {/* Click overlay to close dropdown */}
      {isCountryDropdownOpen && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setIsCountryDropdownOpen(false)}
        />
      )}
    </div>
  );
}

export { countries };
export type { Country };