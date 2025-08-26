'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from 'bndy-ui/auth';
import { BndyLoadingScreen } from 'bndy-ui';
import { MainLayout } from '../../components/layout/MainLayout';
import { CollapsibleSection } from '../../components/ui/CollapsibleSection';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt,
  FaLock,
  FaCog,
  FaBell,
  FaCamera,
  FaCheck,
  FaTimes
} from 'react-icons/fa';

interface ProfileFormData {
  displayName: string;
  bio: string;
  email: string;
  phoneNumber: string;
  location: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
}

export default function ProfilePage() {
  const { currentUser, isLoading: authLoading, signOut } = useAuth();
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState<ProfileFormData>({
    displayName: '',
    bio: '',
    email: '',
    phoneNumber: '',
    location: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    emailNotifications: true,
    pushNotifications: false,
    theme: 'system'
  });

  // UI state
  const [expandedSections, setExpandedSections] = useState({
    'basic-info': true,
    'contact-info': false,
    'security': false,
    'preferences': false
  });

  const [hasChanges, setHasChanges] = useState({
    basicInfo: false,
    contactInfo: false,
    security: false,
    preferences: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadButton, setShowUploadButton] = useState(false);
  const [additionalEmails, setAdditionalEmails] = useState<string[]>([]);

  // Initialize form data from current user
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        displayName: currentUser.displayName || '',
        email: currentUser.email || '',
        phoneNumber: currentUser.phoneNumber || ''
      }));
    }
  }, [currentUser]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, authLoading, router]);

  if (authLoading) {
    return <BndyLoadingScreen />;
  }

  if (!currentUser) {
    return null;
  }

  const toggleSection = (sectionId: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    section: keyof typeof hasChanges
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    setHasChanges(prev => ({
      ...prev,
      [section]: true
    }));

    // Clear errors for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    return null;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'newPassword') {
      const error = validatePassword(value);
      if (error) {
        setErrors(prev => ({ ...prev, newPassword: error }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.newPassword;
          return newErrors;
        });
      }
    }

    if (name === 'confirmPassword' && formData.newPassword !== value) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
    } else if (name === 'confirmPassword') {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.confirmPassword;
        return newErrors;
      });
    }

    handleInputChange(e, 'security');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // Mock upload - in real implementation, upload to storage
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsUploading(false);
  };

  const handleAddEmail = () => {
    setAdditionalEmails(prev => [...prev, '']);
  };

  const saveSection = async (section: keyof typeof hasChanges) => {
    // Mock save - in real implementation, save to backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setHasChanges(prev => ({
      ...prev,
      [section]: false
    }));
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

  return (
    <MainLayout>
      <div data-testid="profile-page" className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Profile Header */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Avatar */}
            <div 
              data-testid="avatar-container"
              className="relative w-24 h-24 sm:w-32 sm:h-32"
              onMouseEnter={() => setShowUploadButton(true)}
              onMouseLeave={() => setShowUploadButton(false)}
            >
              {currentUser.photoURL ? (
                <Image
                  data-testid="user-avatar"
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User avatar'}
                  width={128}
                  height={128}
                  className="rounded-full object-cover"
                />
              ) : (
                <div 
                  data-testid="fallback-avatar"
                  className="w-full h-full bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold"
                >
                  {getInitials(currentUser.displayName, currentUser.email || '')}
                </div>
              )}
              
              {showUploadButton && (
                <label 
                  data-testid="upload-photo-button"
                  className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer transition-opacity"
                >
                  <FaCamera className="text-white text-2xl" />
                  <input
                    data-testid="photo-input"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}

              {isUploading && (
                <div 
                  data-testid="upload-progress"
                  className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center"
                >
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {currentUser.displayName || 'User'}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {currentUser.email}
              </p>
              <div className="flex items-center justify-center sm:justify-start mt-2 space-x-2">
                {currentUser.emailVerified ? (
                  <span 
                    data-testid="email-verified"
                    className="inline-flex items-center text-green-600 text-sm"
                  >
                    <FaCheck className="mr-1" size={14} />
                    Email Verified
                  </span>
                ) : (
                  <span 
                    data-testid="email-unverified"
                    className="inline-flex items-center text-amber-600 text-sm"
                  >
                    <FaTimes className="mr-1" size={14} />
                    Email Not Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information Section */}
        <CollapsibleSection
          id="basic-info"
          title="Basic Information"
          description="Your name and personal details"
          icon={<FaUser className="h-5 w-5 text-white" />}
          gradientFrom="blue-500"
          gradientTo="blue-600"
          isExpanded={expandedSections['basic-info']}
          onToggle={() => toggleSection('basic-info')}
        >
          <div className="space-y-4">
            <div>
              <label 
                htmlFor="displayName"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Display Name
              </label>
              <input
                data-testid="name-input"
                id="displayName"
                name="displayName"
                type="text"
                value={formData.displayName}
                onChange={(e) => handleInputChange(e, 'basicInfo')}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label 
                htmlFor="bio"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Bio
              </label>
              <textarea
                data-testid="bio-input"
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={(e) => handleInputChange(e, 'basicInfo')}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                placeholder="Tell us about yourself..."
              />
            </div>

            {hasChanges.basicInfo && (
              <button
                data-testid="save-basic-info"
                onClick={() => saveSection('basicInfo')}
                className="min-h-[44px] touch-target px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            )}
          </div>
        </CollapsibleSection>

        {/* Contact Information Section */}
        <CollapsibleSection
          id="contact-info"
          title="Contact Information"
          description="Email, phone and address"
          icon={<FaEnvelope className="h-5 w-5 text-white" />}
          gradientFrom="green-500"
          gradientTo="green-600"
          isExpanded={expandedSections['contact-info']}
          onToggle={() => toggleSection('contact-info')}
        >
          <div className="space-y-4">
            <div>
              <label 
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Email Address
              </label>
              <input
                data-testid="email-input"
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange(e, 'contactInfo')}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label 
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Phone Number
              </label>
              <input
                data-testid="phone-input"
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange(e, 'contactInfo')}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Additional Emails
              </label>
              {additionalEmails.map((email, index) => (
                <input
                  key={index}
                  data-testid="additional-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    const newEmails = [...additionalEmails];
                    newEmails[index] = e.target.value;
                    setAdditionalEmails(newEmails);
                    setHasChanges(prev => ({ ...prev, contactInfo: true }));
                  }}
                  className="w-full px-3 py-2 mb-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-white"
                />
              ))}
              <button
                data-testid="add-email-button"
                onClick={handleAddEmail}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                + Add another email
              </button>
            </div>

            {hasChanges.contactInfo && (
              <button
                data-testid="save-contact-info"
                onClick={() => saveSection('contactInfo')}
                className="min-h-[44px] touch-target px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Changes
              </button>
            )}
          </div>
        </CollapsibleSection>

        {/* Security Section */}
        <CollapsibleSection
          id="security"
          title="Security"
          description="Password and authentication settings"
          icon={<FaLock className="h-5 w-5 text-white" />}
          gradientFrom="red-500"
          gradientTo="red-600"
          isExpanded={expandedSections.security}
          onToggle={() => toggleSection('security')}
        >
          <div className="space-y-4">
            <div>
              <label 
                htmlFor="currentPassword"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Current Password
              </label>
              <input
                data-testid="current-password-input"
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={(e) => handlePasswordChange(e)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label 
                htmlFor="newPassword"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                New Password
              </label>
              <input
                data-testid="new-password-input"
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={(e) => handlePasswordChange(e)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-slate-700 dark:text-white"
              />
              {errors.newPassword && (
                <p 
                  data-testid="password-error"
                  role="alert"
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.newPassword}
                </p>
              )}
            </div>

            <div>
              <label 
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Confirm Password
              </label>
              <input
                data-testid="confirm-password-input"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handlePasswordChange(e)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-slate-700 dark:text-white"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">
                    Two-Factor Authentication
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Add an extra layer of security
                  </p>
                </div>
                <button
                  data-testid="2fa-toggle"
                  className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Enable
                </button>
              </div>
            </div>

            {hasChanges.security && (
              <button
                data-testid="save-security"
                onClick={() => saveSection('security')}
                className="min-h-[44px] touch-target px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Save Changes
              </button>
            )}
          </div>
        </CollapsibleSection>

        {/* Preferences Section */}
        <CollapsibleSection
          id="preferences"
          title="Preferences"
          description="Notifications and app settings"
          icon={<FaCog className="h-5 w-5 text-white" />}
          gradientFrom="purple-500"
          gradientTo="purple-600"
          isExpanded={expandedSections.preferences}
          onToggle={() => toggleSection('preferences')}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">
                  Email Notifications
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Receive updates via email
                </p>
              </div>
              <input
                data-testid="email-notifications-toggle"
                type="checkbox"
                name="emailNotifications"
                checked={formData.emailNotifications}
                onChange={(e) => handleInputChange(e, 'preferences')}
                className="w-5 h-5 text-purple-600"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">
                  Push Notifications
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Receive push notifications
                </p>
              </div>
              <input
                data-testid="push-notifications-toggle"
                type="checkbox"
                name="pushNotifications"
                checked={formData.pushNotifications}
                onChange={(e) => handleInputChange(e, 'preferences')}
                className="w-5 h-5 text-purple-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Theme Preference
              </label>
              <select
                data-testid="theme-selector"
                name="theme"
                value={formData.theme}
                onChange={(e) => handleInputChange(e, 'preferences')}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>

            {hasChanges.preferences && (
              <button
                data-testid="save-preferences"
                onClick={() => saveSection('preferences')}
                className="min-h-[44px] touch-target px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Save Changes
              </button>
            )}
          </div>
        </CollapsibleSection>
      </div>
    </MainLayout>
  );
}