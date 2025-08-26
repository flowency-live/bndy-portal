'use client';

import { useEffect, useState } from 'react';
import { useAuth } from 'bndy-ui/auth';
import { useRouter } from 'next/navigation';
import { BndyLogo } from 'bndy-ui';
import { ProfileTab } from './components/ProfileTab';

export default function AccountPage() {
  const { currentUser, isLoading, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [verificationSent, setVerificationSent] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // Will redirect via useEffect
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleSendVerification = async () => {
    if (!currentUser) return;
    
    setSendingVerification(true);
    try {
      // TODO: Implement email verification sending
      // await sendEmailVerification(currentUser);
      setVerificationSent(true);
    } catch (error) {
      console.error('Error sending verification:', error);
    } finally {
      setSendingVerification(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'settings', label: 'Settings' },
    { id: 'security', label: 'Security' }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BndyLogo className="w-8 h-8" color="#f97316" holeColor="#1e293b" />
              <h1 className="text-xl font-semibold text-white">Account</h1>
            </div>
            <button
              onClick={handleSignOut}
              className="min-h-[44px] px-4 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded-md transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        {/* Tab Navigation */}
        <div className="border-b border-slate-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors min-h-[44px] ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'profile' && (
            <ProfileTab
              verificationSent={verificationSent}
              sendingVerification={sendingVerification}
              handleSendVerification={handleSendVerification}
            />
          )}
          {activeTab === 'settings' && (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-medium text-white mb-4">Settings</h3>
              <p className="text-slate-300">Settings tab coming soon...</p>
            </div>
          )}
          {activeTab === 'security' && (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-medium text-white mb-4">Security</h3>
              <p className="text-slate-300">Security tab coming soon...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}