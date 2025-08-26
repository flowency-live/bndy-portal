'use client';

import React from 'react';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import Image from 'next/image';
import { User as FirebaseUser } from 'firebase/auth';
import { useAuth } from 'bndy-ui/auth';

interface ProfileTabProps {
  verificationSent: boolean;
  sendingVerification: boolean;
  handleSendVerification: () => Promise<void>;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  verificationSent,
  sendingVerification,
  handleSendVerification
}) => {
  // Get the authenticated user from auth context
  const { currentUser } = useAuth();

  if (!currentUser) return null;
  
  // Cast to Firebase User type for access to auth-specific properties
  const firebaseUser = currentUser as unknown as FirebaseUser;

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative h-20 w-20 rounded-full overflow-hidden bg-slate-700">
            {currentUser.photoURL ? (
              <Image
                src={currentUser.photoURL}
                alt={currentUser.displayName || 'User'}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-300 text-xl font-medium">
                {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              {currentUser.displayName || 'User'}
            </h2>
            <div className="flex items-center mt-1">
              <p className="text-slate-300">{currentUser.email}</p>
              {currentUser.emailVerified ? (
                <span className="ml-2 inline-flex items-center text-green-400 text-sm">
                  <FaCheckCircle size={14} className="mr-1" />
                  Verified
                </span>
              ) : (
                <span className="ml-2 inline-flex items-center text-amber-400 text-sm">
                  <FaExclamationTriangle size={14} className="mr-1" />
                  Not verified
                </span>
              )}
            </div>
            {!currentUser.emailVerified && (
              <button
                onClick={handleSendVerification}
                disabled={sendingVerification || verificationSent}
                className={`mt-2 text-sm px-3 py-1 rounded min-h-[44px] transition-colors ${
                  verificationSent
                    ? 'bg-green-900 text-green-200 border border-green-700'
                    : 'bg-orange-500 text-white hover:bg-orange-600 border border-orange-400'
                } ${(sendingVerification || verificationSent) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {verificationSent
                  ? 'Verification email sent!'
                  : sendingVerification
                  ? 'Sending...'
                  : 'Send verification email'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-sm p-6">
        <h3 className="text-lg font-medium text-white mb-4">Account Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              User ID
            </label>
            <div className="bg-slate-700 p-2 rounded text-sm text-slate-300 font-mono break-all">
              {currentUser.uid}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Account Created
            </label>
            <div className="text-slate-300">
              {firebaseUser.metadata?.creationTime
                ? new Date(firebaseUser.metadata.creationTime).toLocaleString()
                : 'Unknown'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Last Sign In
            </label>
            <div className="text-slate-300">
              {firebaseUser.metadata?.lastSignInTime
                ? new Date(firebaseUser.metadata.lastSignInTime).toLocaleString()
                : 'Unknown'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Authentication Providers
            </label>
            <div className="text-slate-300">
              {firebaseUser.providerData && firebaseUser.providerData.length > 0
                ? firebaseUser.providerData
                    .map((provider) => provider.providerId)
                    .join(', ')
                : 'None'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};