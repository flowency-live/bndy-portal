'use client';

import { useState } from 'react';
import { useAuth } from 'bndy-ui/auth';
import { BndyLogo } from 'bndy-ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { SocialLoginButtons } from './components/SocialLoginButtons';

export default function LoginPage() {
  const { signInWithEmail, signInWithGoogle, createUserWithEmail, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialError, setSocialError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get redirect URL from query params or default to /account
  const getRedirectUrl = () => {
    return searchParams.get('returnUrl') || searchParams.get('returnTo') || '/account';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearError();

    try {
      if (isSignUp) {
        await createUserWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      // Redirect to account page or custom return URL
      router.push(getRedirectUrl());
    } catch (err) {
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialError = (message: string) => {
    setSocialError(message);
    clearError();
  };

  const handleSocialSuccess = () => {
    // Redirect to account page or custom return URL after social login
    router.push(getRedirectUrl());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-slate-800 rounded-lg shadow-xl border border-slate-700">
        <div className="text-center">
          <BndyLogo className="mx-auto w-32 mb-6" color="#f97316" holeColor="#1e293b" />
          
          {/* Mode Selection Tabs */}
          <div className="flex rounded-lg border border-slate-600 mb-6 p-1 bg-slate-700">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
                !isSignUp
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
                isSignUp
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          <h2 className="text-3xl font-bold text-white">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            {isSignUp ? 'Join the Bndy Portal' : 'Welcome back to Bndy Portal'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {(error || socialError) && (
            <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-700 rounded p-2">
              {socialError || error?.message}
            </div>
          )}

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
              {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>

            <SocialLoginButtons 
              onError={handleSocialError} 
              onSuccess={handleSocialSuccess}
              disabled={loading} 
            />
          </div>
        </form>
      </div>
    </div>
  );
}