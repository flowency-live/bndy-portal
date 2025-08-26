'use client';

import { useState } from 'react';
import { useAuth } from 'bndy-ui/auth';

export default function PhoneAuthPage() {
  const { signInWithPhone, isLoading, error, clearError } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
      if (match) {
        return `+1 (${match[1]})${match[2] ? ' ' + match[2] : ''}${match[3] ? '-' + match[3] : ''}`;
      }
    }
    return `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    // Convert formatted phone to E.164 format
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const e164Phone = `+${cleanPhone}`;
    
    try {
      // This would normally create a RecaptchaVerifier, but for now we'll mock it
      const mockRecaptchaVerifier = {} as any;
      await signInWithPhone(e164Phone, mockRecaptchaVerifier);
    } catch (err) {
      console.error('Phone auth error:', err);
    }
  };

  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Bndy
          </h1>
          <p className="text-lg text-gray-600">
            Sign in with your phone
          </p>
        </div>

        {/* Phone Auth Form */}
        <form onSubmit={handleSubmit} role="form" aria-label="Phone authentication" className="space-y-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="+1 (555) 123-4567"
              aria-describedby="phone-help"
              className="w-full px-4 py-4 text-lg border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p id="phone-help" className="mt-2 text-sm text-gray-500">
              We'll send you a link to sign in
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="text-red-600 text-center p-3 bg-red-50 rounded-lg">
              Please check your phone number and try again
            </div>
          )}

          {/* Send Button */}
          <button
            type="submit"
            disabled={isLoading || !phoneNumber}
            className="w-full py-4 text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg min-h-[44px] transition-colors"
          >
            {isLoading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>

        {/* Desktop Email Fallback */}
        {isDesktop && (
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Prefer email?</p>
            <a
              href="/auth/email"
              className="text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              Sign in with email
            </a>
          </div>
        )}
      </div>
    </div>
  );
}