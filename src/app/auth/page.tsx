'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from 'bndy-ui/auth';
import { AuthForm, AuthFormData } from './components/AuthForm';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    currentUser, 
    isLoading, 
    signInWithGoogle,
    signInWithFacebook,
    signInWithApple,
    signInWithEmail,
    createUserWithEmail,
    error: authError
  } = useAuth();
  const [initialMode, setInitialMode] = useState<'login' | 'register'>('register');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize auth mode from URL parameters
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signin') {
      setInitialMode('login');
    } else if (mode === 'signup') {
      setInitialMode('register');
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (currentUser) {
      router.replace('/dashboard');
    }
  }, [currentUser, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  const handleFormSubmit = async (data: AuthFormData) => {
    setError(null);
    setIsSubmitting(true);

    try {
      if (data.mode === 'login') {
        if (data.method === 'email' && data.email && data.password) {
          await signInWithEmail(data.email, data.password);
        } else if (data.method === 'phone') {
          // Phone authentication would need a different flow with verification code
          console.log('Phone sign-in not yet implemented');
          setError('Phone sign-in is coming soon');
        }
      } else if (data.mode === 'register') {
        if (data.method === 'email' && data.email && data.password) {
          await createUserWithEmail(data.email, data.password);
          // TODO: Update user profile with firstName and lastName
        } else if (data.method === 'phone') {
          console.log('Phone registration not yet implemented');
          setError('Phone registration is coming soon');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialAuth = async (provider: string) => {
    setError(null);
    setIsSubmitting(true);

    try {
      switch (provider) {
        case 'google':
          await signInWithGoogle();
          break;
        case 'facebook':
          await signInWithFacebook();
          break;
        case 'apple':
          await signInWithApple();
          break;
        default:
          console.error('Unknown provider:', provider);
      }
    } catch (err: any) {
      console.error('Social auth error:', err);
      setError(err.message || `${provider} sign-in failed. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl border border-slate-700">
        <AuthForm
          initialMode={initialMode}
          onSubmit={handleFormSubmit}
          onSocialAuth={handleSocialAuth}
          isLoading={isSubmitting}
          error={error || authError}
          data-testid="auth-form"
        />
      </div>
    </div>
  );
}