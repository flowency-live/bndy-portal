'use client';

import React, { useState } from 'react';
import { BndyLogo } from 'bndy-ui';
import { PhoneAuthForm } from './components/PhoneAuthForm';

export default function AuthPage() {
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePhoneAuthSuccess = (verificationId: string) => {
    console.log('[AuthPage] Phone auth successful, verification ID:', verificationId);
    setVerificationId(verificationId);
    setError(null);
  };

  const handlePhoneAuthError = (errorMessage: string) => {
    console.error('[AuthPage] Phone auth error:', errorMessage);
    setError(errorMessage);
    setVerificationId(null);
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-900 p-4 md:p-8">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        {/* Logo/Brand */}
        <div className="mb-8">
          <div className="w-48 md:w-64 mx-auto mb-6">
            <BndyLogo className="w-full h-auto" color="#f97316" holeColor='#0f172a' />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">
            <span className="text-white">Keeping </span>
            <span className="text-cyan-500">LIVE</span>
            <span className="text-white"> Music </span>
            <span className="text-orange-500">ALIVE</span>
          </h1>
          <p className="text-slate-400 text-center text-sm">
            A community-driven platform connecting people to grassroots live music events
          </p>
        </div>

        {/* Auth Form */}
        {!verificationId ? (
          <PhoneAuthForm 
            onSuccess={handlePhoneAuthSuccess}
            onError={handlePhoneAuthError}
          />
        ) : (
          /* Verification Code Input - TODO: Implement */
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white mb-4">
              Check your phone
            </h2>
            <p className="text-slate-400 mb-6">
              We sent you a magic link. Click it to sign in instantly.
            </p>
            <button
              onClick={() => {
                setVerificationId(null);
                setError(null);
              }}
              className="text-orange-500 hover:text-orange-400 text-sm underline"
            >
              Try again with a different number
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-200 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-xs">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </main>
  );
}