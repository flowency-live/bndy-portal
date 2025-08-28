'use client';

import { useState, useEffect } from 'react';
import { BndyLogo } from 'bndy-ui';
import { FloatingLabelInput } from './FloatingLabelInput';
import { PhoneInput, countries, Country } from './PhoneInput';
import { AuthTabs } from './AuthTabs';
import { InputMethodToggle } from './InputMethodToggle';
import { SocialButtonGrid, GoogleIcon, FacebookIcon, AppleIcon } from './SocialButtonGrid';

interface AuthFormProps {
  onSubmit?: (data: AuthFormData) => void;
  onSocialAuth?: (provider: string) => void;
  initialMode?: 'login' | 'register';
  isLoading?: boolean;
  error?: string;
  className?: string;
  'data-testid'?: string;
}

interface AuthFormData {
  mode: 'login' | 'register';
  method: 'email' | 'phone';
  email?: string;
  phone?: string;
  countryCode?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  rememberMe?: boolean;
  acceptTerms?: boolean;
}

export function AuthForm({
  onSubmit,
  onSocialAuth,
  initialMode = 'register',
  isLoading = false,
  error,
  className = '',
  'data-testid': testId,
}: AuthFormProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialMode);
  const [inputMethod, setInputMethod] = useState<'email' | 'phone'>('email');
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries.find(c => c.code === 'GB') || countries[0]); // UK default
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  // Field errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setActiveTab(initialMode);
  }, [initialMode]);

  const socialProviders = [
    {
      id: 'google',
      name: 'Google',
      icon: <GoogleIcon />,
      onClick: () => onSocialAuth?.('google'),
      disabled: isLoading,
    },
    {
      id: 'facebook', 
      name: 'Facebook',
      icon: <FacebookIcon />,
      onClick: () => onSocialAuth?.('facebook'),
      disabled: isLoading,
    },
    {
      id: 'apple',
      name: 'Apple',
      icon: <AppleIcon />,
      onClick: () => onSocialAuth?.('apple'),
      disabled: isLoading,
    },
  ];

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (inputMethod === 'email') {
      if (!email) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Please enter a valid email address';
      }
    } else {
      if (!phone) {
        errors.phone = 'Phone number is required';
      } else if (!/^\d{10,15}$/.test(phone.replace(/\s/g, ''))) {
        errors.phone = 'Please enter a valid phone number';
      }
    }

    if (!showForgotPassword) {
      if (!password) {
        errors.password = 'Password is required';
      } else if (password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      }
    }

    if (activeTab === 'register') {
      if (!firstName) {
        errors.firstName = 'First name is required';
      }
      if (!lastName) {
        errors.lastName = 'Last name is required';
      }
      if (!acceptTerms) {
        errors.acceptTerms = 'You must accept the terms and conditions';
      }
    }

    if (showForgotPassword && !forgotEmail) {
      errors.forgotEmail = 'Email is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isFormValid = () => {
    if (activeTab === 'register' && !acceptTerms) {
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (showForgotPassword) {
      // Handle forgot password submission
      if (forgotEmail) {
        onSubmit?.({
          mode: 'forgot-password' as any,
          method: 'email',
          email: forgotEmail,
        });
      }
      return;
    }

    if (!validateForm()) {
      return;
    }

    const formData: AuthFormData = {
      mode: activeTab,
      method: inputMethod,
      ...(inputMethod === 'email' ? { email } : { phone, countryCode: selectedCountry.dialCode }),
      password,
      ...(activeTab === 'register' && { firstName, lastName }),
      rememberMe: activeTab === 'login' ? rememberMe : undefined,
      acceptTerms: activeTab === 'register' ? acceptTerms : undefined,
    };

    onSubmit?.(formData);
  };

  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);
    setFieldErrors({});
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setForgotEmail('');
    setFieldErrors({});
  };

  if (showForgotPassword) {
    return (
      <div className={`space-y-6 ${className}`} data-testid={testId}>
        <div className="text-center" data-testid={`${testId}-forgot-password-header`}>
          <h2 className="text-2xl font-bold text-white mb-2">Reset your password</h2>
          <p className="text-slate-400">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg" data-testid={`${testId}-error`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" data-testid={`${testId}-forgot-form`}>
          <FloatingLabelInput
            id="forgot-email"
            type="email"
            label="Email address"
            value={forgotEmail}
            onChange={setForgotEmail}
            error={fieldErrors.forgotEmail}
            required
            disabled={isLoading}
            data-testid={`${testId}-forgot-email`}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            data-testid={`${testId}-reset-button`}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <button
            type="button"
            onClick={handleBackToLogin}
            className="w-full py-2 text-orange-500 hover:text-orange-400 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded"
            data-testid={`${testId}-back-to-login`}
          >
            ← Back to sign in
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`} data-testid={testId}>
      {/* BNDY Branding Section */}
      <div className="text-center mb-8" data-testid={`${testId}-branding`}>
        <div className="mb-4">
          <BndyLogo 
            data-testid="bndy-logo"
            className="w-24 sm:w-32 mx-auto" 
            color="#f97316"
            holeColor="#0f172a"
          />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold mb-2">
          <span className="text-white">Keeping </span>
          <span className="text-cyan-500">LIVE</span>
          <span className="text-white"> Music </span>
          <span className="text-orange-500">ALIVE</span>
        </h1>
      </div>

      <div className="text-center" data-testid={`${testId}-header`}>
        <h2 className="text-2xl font-bold text-white mb-2" data-testid={`${testId}-title`}>
          {activeTab === 'login' ? 'Welcome back' : 'Create your account'}
        </h2>
        <p className="text-slate-400" data-testid={`${testId}-subtitle`}>
          {activeTab === 'login' 
            ? 'Sign in to your account' 
            : 'Join us and get started'
          }
        </p>
      </div>

      <AuthTabs 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        data-testid={`${testId}-tabs`}
      />

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg" data-testid={`${testId}-error`}>
          {error}
        </div>
      )}

      <SocialButtonGrid
        providers={socialProviders}
        isLogin={activeTab === 'login'}
        data-testid={`${testId}-social-grid`}
      />

      <div className="relative" data-testid={`${testId}-divider`}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-slate-800 text-slate-400">
            {`Or ${activeTab === 'login' ? 'sign in' : 'register'} with email/phone`}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" data-testid={`${testId}-form`}>
        <InputMethodToggle
          method={inputMethod}
          onMethodChange={setInputMethod}
          data-testid={`${testId}-method-toggle`}
        />

        {activeTab === 'register' && (
          <div className="grid grid-cols-2 gap-4" data-testid={`${testId}-name-fields`}>
            <FloatingLabelInput
              id="first-name"
              type="text"
              label="First name"
              value={firstName}
              onChange={setFirstName}
              error={fieldErrors.firstName}
              required
              disabled={isLoading}
              data-testid={`${testId}-first-name`}
            />
            <FloatingLabelInput
              id="last-name"
              type="text"
              label="Last name"
              value={lastName}
              onChange={setLastName}
              error={fieldErrors.lastName}
              required
              disabled={isLoading}
              data-testid={`${testId}-last-name`}
            />
          </div>
        )}

        {inputMethod === 'email' ? (
          <FloatingLabelInput
            id="email"
            type="email"
            label="Email address"
            value={email}
            onChange={setEmail}
            error={fieldErrors.email}
            required
            disabled={isLoading}
            data-testid={`${testId}-email`}
          />
        ) : (
          <PhoneInput
            id="phone"
            label="Phone number"
            value={phone}
            onChange={setPhone}
            selectedCountry={selectedCountry}
            onCountryChange={setSelectedCountry}
            error={fieldErrors.phone}
            required
            disabled={isLoading}
            data-testid={`${testId}-phone`}
          />
        )}

        <FloatingLabelInput
          id="password"
          type="password"
          label="Password"
          value={password}
          onChange={setPassword}
          error={fieldErrors.password}
          required
          disabled={isLoading}
          data-testid={`${testId}-password`}
        />

        {activeTab === 'login' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between" data-testid={`${testId}-login-options`}>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-slate-600 rounded bg-slate-800"
                  data-testid={`${testId}-remember-me`}
                />
                <span className="ml-2 text-base text-slate-300">Remember me</span>
              </label>
              <button
                type="button"
                onClick={handleForgotPasswordClick}
                className="text-base text-orange-500 hover:text-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded font-medium"
                data-testid={`${testId}-forgot-password`}
              >
                Forgot password?
              </button>
            </div>
            {/* Spacer to match register mode name fields height */}
            <div className="grid grid-cols-2 gap-4 invisible">
              <div className="h-16"></div>
              <div className="h-16"></div>
            </div>
          </div>
        )}

        {activeTab === 'register' && (
          <div className="space-y-3" data-testid={`${testId}-register-options`}>
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-slate-600 rounded bg-slate-800 mt-0.5"
                data-testid={`${testId}-accept-terms`}
              />
              <span className="ml-2 text-base text-slate-300">
                I accept the{' '}
                <a href="/terms" className="text-orange-500 hover:text-orange-400" target="_blank" rel="noopener noreferrer">
                  Terms of Service
                </a>
                {' '}and{' '}
                <a href="/privacy" className="text-orange-500 hover:text-orange-400" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>
              </span>
            </label>
            {fieldErrors.acceptTerms && (
              <p className="text-sm text-red-400">{fieldErrors.acceptTerms}</p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full !bg-gradient-to-r !from-orange-500 !to-orange-600 hover:!from-orange-600 hover:!to-orange-700 !text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
          data-testid={`${testId}-submit`}
        >
          {isLoading ? 'Please wait...' : activeTab === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}

export type { AuthFormData };