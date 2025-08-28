'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from 'bndy-ui/auth';
import { BndyLoadingScreen } from 'bndy-ui';
import { MainLayout } from '../../components/layout/MainLayout';
import { RoleSelector, UserRole } from '../../components/profile/RoleSelector';
import { InstrumentSelector } from '../../components/profile/InstrumentSelector';
import { FaUser, FaCamera, FaMapMarkerAlt, FaSave } from 'react-icons/fa';

interface ValidationErrors {
  displayName?: string;
  hometown?: string;
  role?: string;
  instruments?: string;
}

export default function MyProfilePage() {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [hometown, setHometown] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, isLoading, router]);

  useEffect(() => {
    if (currentUser?.displayName) {
      setDisplayName(currentUser.displayName);
    }
  }, [currentUser]);

  if (isLoading) {
    return <BndyLoadingScreen />;
  }

  if (!currentUser) {
    return <BndyLoadingScreen />;
  }

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (!hometown.trim()) {
      newErrors.hometown = 'Hometown is required';
    }

    if (selectedRoles.length === 0) {
      newErrors.role = 'Please select at least one role';
    }

    if (selectedRoles.includes('artist') && selectedInstruments.length === 0) {
      newErrors.instruments = 'Artists must select at least one instrument or vocal ability';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Save profile data to Firestore
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Navigate to dashboard after successful save
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    }
    return email.slice(0, 2).toUpperCase();
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  return (
    <MainLayout>
      <div 
        data-testid="my-profile-page"
        className="p-4 sm:p-6 text-slate-900 dark:text-white max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 
            data-testid="profile-title"
            className="text-2xl sm:text-3xl font-bold mb-2"
          >
            My Profile
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Complete your profile to connect with the music community and showcase your talents.
          </p>
        </div>

        {/* User Avatar Section */}
        <section 
          data-testid="user-avatar-section"
          className="mb-8 flex flex-col items-center"
        >
          <div className="relative mb-4">
            {currentUser.photoURL ? (
              <Image
                data-testid="user-avatar"
                src={currentUser.photoURL}
                alt={currentUser.displayName || 'User avatar'}
                width={120}
                height={120}
                className="rounded-full border-4 border-orange-500"
              />
            ) : (
              <div 
                data-testid="fallback-avatar"
                className="w-30 h-30 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-2xl border-4 border-orange-500"
                style={{ width: '120px', height: '120px' }}
              >
                {getInitials(currentUser.displayName, currentUser.email || '')}
              </div>
            )}
            
            <button
              data-testid="change-avatar-button"
              className="absolute bottom-0 right-0 p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
              aria-label="Change profile photo"
            >
              <FaCamera className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
            Click the camera icon to update your profile photo
          </p>
        </section>

        <div className="space-y-8">
          {/* Basic Information */}
          <section 
            data-testid="basic-info-section"
            className="bg-profile-bg text-profile-text border-profile-border rounded-lg p-6 border transition-colors duration-300"
          >
            <div className="flex items-center mb-4">
              <FaUser className="text-orange-500 mr-3" />
              <h2 className="text-xl font-semibold">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  data-testid="display-name-input"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition-colors duration-300"
                  placeholder="Enter your display name"
                  aria-label="Display Name (required)"
                />
                {errors.displayName && (
                  <p role="alert" className="text-red-500 text-sm mt-1">
                    {errors.displayName}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center text-sm font-medium mb-2">
                  <FaMapMarkerAlt className="text-orange-500 mr-2" />
                  Hometown <span className="text-red-500">*</span>
                </label>
                <input
                  data-testid="hometown-input"
                  type="text"
                  value={hometown}
                  onChange={(e) => setHometown(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition-colors duration-300"
                  placeholder="Enter your hometown"
                  aria-label="Hometown (required)"
                />
                {errors.hometown && (
                  <p role="alert" className="text-red-500 text-sm mt-1">
                    {errors.hometown}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Role Selection */}
          <section className="bg-card text-card-foreground rounded-lg p-6 border border-border transition-colors duration-300">
            <h2 className="text-xl font-semibold mb-2">Your Role</h2>
            <p className="text-sm opacity-75 mb-6">
              What describes you best? You can select multiple roles if they apply to you.
            </p>

            <RoleSelector
              selectedRoles={selectedRoles}
              onRoleChange={setSelectedRoles}
              required={true}
              error={errors.role}
            />
          </section>

          {/* Instrument Selection (only for artists) */}
          {selectedRoles.includes('artist') && (
            <section className="bg-card text-card-foreground rounded-lg p-6 border border-border transition-colors duration-300">
              <h2 className="text-xl font-semibold mb-2">Instruments & Vocals</h2>
              <p className="text-sm opacity-75 mb-6">
                What instruments do you play and vocal abilities do you have?
              </p>

              <InstrumentSelector
                selectedInstruments={selectedInstruments}
                onInstrumentChange={setSelectedInstruments}
                required={selectedRoles.includes('artist')}
                error={errors.instruments}
              />
            </section>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              data-testid="save-profile-button"
              onClick={handleSave}
              onKeyDown={(e) => handleKeyDown(e, handleSave)}
              disabled={isSaving}
              className="min-h-[44px] touch-target px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
              tabIndex={0}
            >
              <FaSave className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}