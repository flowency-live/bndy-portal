'use client';

import React, { useState } from 'react';
import { useAuth } from 'bndy-ui/auth';
import { FaGoogle, FaFacebook, FaApple } from 'react-icons/fa';

interface SocialLoginButtonsProps {
  onError: (message: string) => void;
  disabled?: boolean;
  onSuccess?: () => void;
}

export function SocialLoginButtons({ onError, disabled = false, onSuccess }: SocialLoginButtonsProps) {
  const { signInWithGoogle, signInWithFacebook, signInWithApple, isLoading } = useAuth();
  const [signingIn, setSigningIn] = useState<string | null>(null);

  const handleError = (error: any) => {
    const errorMessage = error?.message || error?.code || 'Unknown error';
    
    const errorMap: Record<string, string> = {
      'auth/popup-closed-by-user': 'Sign-in cancelled. Please try again.',
      'auth/cancelled-popup-request': 'Only one sign-in popup allowed at a time.',
      'auth/popup-blocked': 'Sign-in popup was blocked. Please allow popups for this site.',
      'auth/account-exists-with-different-credential': 'An account already exists with the same email address but different sign-in credentials.',
      'auth/network-request-failed': 'Network error. Please check your connection and try again.',
      'auth/too-many-requests': 'Too many unsuccessful attempts. Please try again later.',
      'auth/user-disabled': 'This account has been disabled. Please contact support.',
      'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.'
    };

    const friendlyMessage = errorMap[errorMessage] || 'An unexpected error occurred. Please try again.';
    onError(friendlyMessage);
  };

  const handleSocialSignIn = async (provider: 'google' | 'facebook' | 'apple') => {
    setSigningIn(provider);
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else if (provider === 'facebook') {
        await signInWithFacebook();
      } else if (provider === 'apple') {
        await signInWithApple();
      }
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      handleError(error);
    } finally {
      setSigningIn(null);
    }
  };

  const isDisabled = disabled || isLoading || signingIn !== null;

  return (
    <div className="space-y-3" data-testid="social-login-container">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">Or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => handleSocialSignIn('google')}
        disabled={isDisabled}
        aria-label="Continue with Google"
        className="w-full flex items-center justify-center gap-3 px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <FaGoogle className="h-5 w-5 text-red-500" />
        <span className="text-sm font-medium text-gray-700">
          {signingIn === 'google' ? 'Signing in...' : 'Continue with Google'}
        </span>
      </button>

      <button
        type="button"
        onClick={() => handleSocialSignIn('facebook')}
        disabled={isDisabled}
        aria-label="Continue with Facebook"
        className="w-full flex items-center justify-center gap-3 px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <FaFacebook className="h-5 w-5 text-blue-600" />
        <span className="text-sm font-medium text-gray-700">
          {signingIn === 'facebook' ? 'Signing in...' : 'Continue with Facebook'}
        </span>
      </button>

      <button
        type="button"
        onClick={() => handleSocialSignIn('apple')}
        disabled={isDisabled}
        aria-label="Continue with Apple"
        className="w-full flex items-center justify-center gap-3 px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg shadow-sm bg-[#000000] hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <FaApple className="h-5 w-5 text-white" />
        <span className="text-sm font-medium text-white">
          {signingIn === 'apple' ? 'Signing in...' : 'Continue with Apple'}
        </span>
      </button>
    </div>
  );
}