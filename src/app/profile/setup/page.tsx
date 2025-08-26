'use client';

import { useState } from 'react';
import { useAuth } from 'bndy-ui/auth';
import { BndyLogo } from 'bndy-ui';
import { useRouter } from 'next/navigation';

export default function ProfileSetupPage() {
  const { currentUser, isLoading, error, updateProfile, signOut, clearError } = useAuth();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

  const formatPhoneNumber = (phone: string | null) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('1')) {
      const number = cleaned.slice(1);
      return `+1 (${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
    }
    return phone;
  };

  const getAuthMethod = () => {
    if (currentUser?.phoneNumber) {
      return {
        display: formatPhoneNumber(currentUser.phoneNumber),
        method: 'phone'
      };
    }
    return {
      display: currentUser?.email || '',
      method: 'email'
    };
  };

  const handleSkip = () => {
    router.push('/');
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    
    setSaving(true);
    clearError();
    
    try {
      await updateProfile({
        displayName: name.trim()
      });
      router.push('/');
    } catch (err) {
      console.error('Profile update error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/auth/phone');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const authInfo = getAuthMethod();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-sm w-full space-y-8 md:max-w-md">
        {/* Header */}
        <div className="text-center">
          <div className="w-32 mx-auto mb-6">
            <BndyLogo />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Bndy
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Tell us your name
          </p>
          
          {/* User Context */}
          <div className="text-sm text-gray-500">
            <p>{authInfo.display}</p>
            <p>Signed in with {authInfo.method}</p>
          </div>
        </div>

        {/* Profile Setup Form */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSave(); }} 
          role="form" 
          aria-label="Profile setup"
          className="space-y-6"
        >
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              aria-describedby="name-help"
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p id="name-help" className="mt-2 text-sm text-gray-500">
              This is how other members will see you
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="text-red-600 text-center p-3 bg-red-50 rounded-lg">
              <p className="font-medium">Something went wrong</p>
              <p className="text-sm">Please try again</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              type="submit"
              disabled={!name.trim() || isLoading || saving}
              className="w-full py-3 text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg min-h-[44px] transition-colors"
            >
              {saving ? 'Saving...' : 'Save and Continue'}
            </button>

            <button
              type="button"
              onClick={handleSkip}
              className="w-full py-3 text-lg font-medium text-blue-600 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg min-h-[44px] transition-colors"
            >
              Skip for now
            </button>
          </div>
        </form>

        {/* Desktop Enhancement - Sign Out Option */}
        {isDesktop && (
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Not you?</p>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}