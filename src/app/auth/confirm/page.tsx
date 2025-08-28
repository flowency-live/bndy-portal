'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from 'bndy-ui/auth';
import { BndyLogo } from 'bndy-ui';

export default function AuthConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    currentUser, 
    isLoading, 
    signInWithEmailLink, 
    isSignInWithEmailLink, 
    error 
  } = useAuth();

  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmationState, setConfirmationState] = useState<'checking' | 'success' | 'error' | 'email-required'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleEmailLinkSignIn = async () => {
      // Get the full URL including search parameters
      const currentUrl = window.location.href;
      
      // Check if this is a valid sign-in link
      if (!isSignInWithEmailLink(currentUrl)) {
        setConfirmationState('error');
        setErrorMessage('Invalid sign-in link');
        return;
      }

      // Try to get email from localStorage (Firebase recommendation)
      let email = window.localStorage.getItem('emailForSignIn');
      
      if (!email) {
        // If no email in localStorage, we need to ask the user
        setConfirmationState('email-required');
        return;
      }

      setIsProcessing(true);
      
      try {
        // Sign in with email link
        await signInWithEmailLink(email, currentUrl);
        
        // Clear the email from localStorage
        window.localStorage.removeItem('emailForSignIn');
        
        setConfirmationState('success');
        
        // Redirect after a brief success message
        setTimeout(() => {
          const returnUrl = searchParams.get('returnUrl') || '/dashboard';
          router.replace(returnUrl);
        }, 2000);
        
      } catch (err) {
        console.error('Email link sign-in error:', err);
        setConfirmationState('error');
        setErrorMessage('Failed to sign in with email link. Please try again.');
        
        // Clear the email from localStorage on error
        window.localStorage.removeItem('emailForSignIn');
      } finally {
        setIsProcessing(false);
      }
    };

    // Only run if we're not already authenticated
    if (!currentUser && !isLoading) {
      handleEmailLinkSignIn();
    } else if (currentUser) {
      // User is already authenticated, redirect them
      const returnUrl = searchParams.get('returnUrl') || '/dashboard';
      router.replace(returnUrl);
    }
  }, [currentUser, isLoading, signInWithEmailLink, isSignInWithEmailLink, searchParams, router]);

  const handleEmailSubmit = async (email: string) => {
    const currentUrl = window.location.href;
    
    setIsProcessing(true);
    
    try {
      // Sign in with email link
      await signInWithEmailLink(email, currentUrl);
      
      setConfirmationState('success');
      
      // Redirect after success
      setTimeout(() => {
        const returnUrl = searchParams.get('returnUrl') || '/dashboard';
        router.replace(returnUrl);
      }, 2000);
      
    } catch (err) {
      console.error('Email link sign-in error:', err);
      setConfirmationState('error');
      setErrorMessage('Failed to sign in. Please check your email address and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading state
  if (isLoading || confirmationState === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Confirming your email...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-slate-900 p-4 md:p-8">
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        {/* Logo/Brand */}
        <div className="mb-8">
          <div className="w-32 sm:w-48 md:w-64 mx-auto mb-6">
            <BndyLogo 
              className="w-32 sm:w-48 md:w-64 mx-auto" 
              color="#f97316" 
              holeColor='#0f172a' 
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">
            <span className="text-white">Keeping </span>
            <span className="text-cyan-500">LIVE</span>
            <span className="text-white"> Music </span>
            <span className="text-orange-500">ALIVE</span>
          </h1>
        </div>

        {/* Success State */}
        {confirmationState === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Welcome to BNDY!
            </h2>
            <p className="text-slate-400 mb-4">
              You've been successfully signed in.
            </p>
            <p className="text-slate-500 text-sm">
              Redirecting you to your dashboard...
            </p>
          </div>
        )}

        {/* Email Required State */}
        {confirmationState === 'email-required' && (
          <div className="w-full">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">
                Confirm Your Email
              </h2>
              <p className="text-slate-400 text-sm">
                Please enter the email address you used to request the sign-in link
              </p>
            </div>

            <EmailConfirmForm 
              onSubmit={handleEmailSubmit}
              isLoading={isProcessing}
              error={errorMessage}
            />
          </div>
        )}

        {/* Error State */}
        {confirmationState === 'error' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Sign-in Failed
            </h2>
            <p className="text-red-400 mb-6">
              {errorMessage || error?.message || 'Something went wrong with your sign-in link'}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/auth?mode=signin')}
                className="w-full min-h-[44px] py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Try Signing In Again
              </button>
              <button
                onClick={() => router.push('/auth?mode=signup')}
                className="w-full min-h-[44px] py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Create New Account
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-xs">
            Having trouble? <button className="underline hover:text-slate-400">Contact support</button>
          </p>
        </div>
      </div>
    </main>
  );
}

// Email confirmation form component
interface EmailConfirmFormProps {
  onSubmit: (email: string) => void;
  isLoading: boolean;
  error: string | null;
}

function EmailConfirmForm({ onSubmit, isLoading, error }: EmailConfirmFormProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onSubmit(email.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          required
          disabled={isLoading}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !email.trim()}
        className="w-full min-h-[44px] py-3 px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200"
      >
        {isLoading ? 'Signing in...' : 'Confirm & Sign In'}
      </button>
    </form>
  );
}