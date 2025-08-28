'use client';

import { useState, useRef, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface FloatingLabelInputProps {
  id: string;
  type?: 'text' | 'email' | 'tel' | 'password';
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  'data-testid'?: string;
}

export function FloatingLabelInput({
  id,
  type = 'text',
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  error,
  className = '',
  'data-testid': testId,
}: FloatingLabelInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasValue = value.length > 0;
  const isFloating = isFocused || hasValue;
  const inputType = type === 'password' && showPassword ? 'text' : type;

  useEffect(() => {
    if (inputRef.current && isFocused) {
      inputRef.current.focus();
    }
  }, [isFocused]);

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`relative ${className}`} data-testid={testId}>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type={inputType}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={isFocused ? placeholder : ''}
          required={required}
          disabled={disabled}
          className={`
            peer w-full px-4 pt-6 pb-2 border rounded-xl transition-colors duration-200 text-base
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
        
        <label
          htmlFor={id}
          className={`
            absolute left-4 transition-all duration-200 cursor-text pointer-events-none origin-left
            ${isFloating 
              ? 'top-2 left-4 scale-75 text-orange-500' 
              : 'top-4 left-4 text-slate-400'
            }
            ${error ? 'text-red-400' : ''}
          `}
          data-testid={`${testId}-label`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {type === 'password' && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 focus:outline-none focus:text-orange-500"
            data-testid={`${testId}-toggle-password`}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
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
    </div>
  );
}