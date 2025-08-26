'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from 'bndy-ui/auth';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth } from 'bndy-ui/auth';
import { useRouter } from 'next/navigation';
import PhoneInput, { formatPhoneNumber, isPossiblePhoneNumber, isValidPhoneNumber, parsePhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import styles from './PhoneAuthForm.module.css';

interface PhoneAuthFormProps {
  onSuccess: (verificationId: string) => void;
  onError: (message: string) => void;
}

export const PhoneAuthForm: React.FC<PhoneAuthFormProps> = ({ onSuccess, onError }) => {
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>('');
  const [currentCountry, setCurrentCountry] = useState<string>('GB');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const verifierRef = useRef<RecaptchaVerifier | null>(null);

  const { signInWithPhone, isLoading } = useAuth();

  // Initialize reCAPTCHA verifier
  useEffect(() => {
    if (typeof window !== 'undefined' && recaptchaRef.current && !verifierRef.current) {
      try {
        verifierRef.current = new RecaptchaVerifier(auth, recaptchaRef.current, {
          size: 'normal',
          callback: (response: any) => {
            console.log('[PhoneAuth] reCAPTCHA verified');
          },
          'expired-callback': () => {
            console.log('[PhoneAuth] reCAPTCHA expired');
          }
        });
      } catch (error) {
        console.error('[PhoneAuth] Error initializing reCAPTCHA:', error);
      }
    }

    return () => {
      if (verifierRef.current) {
        try {
          verifierRef.current.clear();
        } catch (error) {
          console.error('[PhoneAuth] Error clearing reCAPTCHA:', error);
        }
        verifierRef.current = null;
      }
    };
  }, []);

  const validatePhoneNumber = (phone: string | undefined): boolean => {
    if (!phone) return false;
    
    // Use libphonenumber-js built-in validation
    // isPossiblePhoneNumber() is recommended for user input validation
    // as it validates length but is more forgiving with actual digits
    try {
      // First check if it's a possible phone number (length validation)
      if (!isPossiblePhoneNumber(phone)) {
        return false;
      }
      
      // For production use, you might want stricter validation:
      // return isValidPhoneNumber(phone);
      
      return true;
    } catch (error) {
      console.warn('[PhoneAuth] Phone validation error:', error);
      return false;
    }
  };

  // Check if a phone number is complete and valid for the given country
  const isPhoneNumberComplete = (value: string | undefined, country: string = 'GB'): boolean => {
    if (!value) return false;
    
    try {
      const phoneNumber = parsePhoneNumber(value, country as any);
      return phoneNumber ? phoneNumber.isValid() : false;
    } catch {
      return false;
    }
  };

  const handlePhoneNumberChange = (value: string | undefined, country?: string) => {
    const selectedCountry = country || currentCountry;
    
    if (selectedCountry !== currentCountry) {
      setCurrentCountry(selectedCountry);
    }
    
    if (!value) {
      setPhoneNumber('');
      if (error) setError('');
      return;
    }
    
    // Extract digits to check length
    const newDigits = value.replace(/\D/g, '');
    const currentDigits = phoneNumber ? phoneNumber.replace(/\D/g, '') : '';
    
    // Prevent input if adding more digits beyond country limits
    const maxDigits = selectedCountry === 'GB' ? 13 : 15; // +44 + 11 digits for UK, E.164 for others
    
    if (newDigits.length > maxDigits) {
      return; // Block input if exceeds country digit limit
    }
    
    // For UK numbers, apply stricter limits
    if (selectedCountry === 'GB') {
      let phoneDigits = newDigits;
      
      // If it's international format (+44), remove country code for counting
      if (value.startsWith('+44')) {
        phoneDigits = newDigits.substring(2);
      }
      
      // UK mobile numbers should be exactly 10 digits after country code (or 11 with leading 0)
      if (phoneDigits.length > 11) {
        return; // Block UK input if exceeds 11 digit limit
      }
      
      // Special handling: if user enters without leading 0, prepend it
      if (!value.startsWith('+') && !value.startsWith('0') && newDigits.startsWith('7') && newDigits.length >= 10) {
        value = '0' + value;
      }
    }
    
    setPhoneNumber(value);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!phoneNumber) {
      setError('Phone number is required');
      onError('Phone number is required');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      // Provide more specific error messages based on the current country
      let errorMessage = 'Please enter a valid phone number';
      
      try {
        // Check if it's a length issue vs format issue
        if (phoneNumber && phoneNumber.length > 0) {
          if (phoneNumber.replace(/\D/g, '').length < 7) {
            errorMessage = 'Phone number is too short';
          } else if (phoneNumber.replace(/\D/g, '').length > 15) {
            errorMessage = 'Phone number is too long';
          } else {
            errorMessage = 'Please enter a valid phone number';
          }
        }
      } catch (e) {
        errorMessage = 'Please enter a valid phone number';
      }
      
      setError(errorMessage);
      onError(errorMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      if (!verifierRef.current) {
        throw new Error('reCAPTCHA not initialized. Please refresh the page and try again.');
      }
      
      // phoneNumber is already in E.164 format from react-phone-number-input
      const verificationId = await signInWithPhone(phoneNumber, verifierRef.current);
      onSuccess(verificationId);
    } catch (err: any) {
      console.error('[PhoneAuthForm] Authentication error:', err);
      const errorMessage = 'Failed to send SMS. Please try again.';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
        <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            Enter your phone number
          </h2>
          <p className="text-slate-400 text-sm">
            We'll send you a magic link to sign in
          </p>
        </div>

        {/* Phone Number Input */}
        <div>
          <label 
            htmlFor="phone-number"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            Phone Number
          </label>
          <div className="relative">
            <PhoneInput
              id="phone-number"
              value={phoneNumber}
              onChange={(value, country) => handlePhoneNumberChange(value, country?.country)}
              defaultCountry="GB"
              international
              withCountryCallingCode
              countryCallingCodeEditable={false}
              numberInputProps={{
                className: styles.phoneNumberInput,
                type: 'tel',
                inputMode: 'tel' as const,
                autoComplete: 'tel',
                onBeforeInput: (e: React.FormEvent<HTMLInputElement>) => {
                  const input = e.currentTarget;
                  const currentValue = input.value || '';
                  const newChar = (e as any).data;
                  
                  if (!newChar) return; // Allow deletions and non-character inputs
                  
                  // Simulate what the value would be after this input
                  const cursorPos = input.selectionStart || 0;
                  const potentialValue = currentValue.slice(0, cursorPos) + newChar + currentValue.slice(cursorPos);
                  
                  // Extract digits and check against country limits
                  const digits = potentialValue.replace(/\D/g, '');
                  const maxDigits = currentCountry === 'GB' ? 13 : 15;
                  
                  // For UK, additional check for national format
                  if (currentCountry === 'GB') {
                    let phoneDigits = digits;
                    if (potentialValue.startsWith('+44')) {
                      phoneDigits = digits.substring(2);
                    }
                    
                    if (phoneDigits.length > 11) {
                      console.log('[PhoneAuth] BLOCKING keystroke - UK limit exceeded');
                      e.preventDefault();
                      return;
                    }
                  }
                  
                  if (digits.length > maxDigits) {
                    console.log('[PhoneAuth] BLOCKING keystroke - digit limit exceeded');
                    e.preventDefault();
                  }
                },
                onInput: (e: React.FormEvent<HTMLInputElement>) => {
                  const input = e.currentTarget;
                  const value = input.value;
                  
                  // Double-check and truncate if somehow exceeded
                  const digits = value.replace(/\D/g, '');
                  const maxDigits = currentCountry === 'GB' ? 13 : 15;
                  
                  if (currentCountry === 'GB') {
                    let phoneDigits = digits;
                    if (value.startsWith('+44')) {
                      phoneDigits = digits.substring(2);
                    }
                    if (phoneDigits.length > 11) {
                      // Truncate the value
                      const allowedDigits = phoneDigits.substring(0, 11);
                      const newValue = value.startsWith('+44') ? '+44' + allowedDigits : allowedDigits;
                      input.value = newValue;
                      console.log('[PhoneAuth] TRUNCATED input to UK limit');
                    }
                  } else if (digits.length > maxDigits) {
                    const allowedDigits = digits.substring(0, maxDigits);
                    input.value = value.replace(/\d/g, '').substring(0, value.length - digits.length + allowedDigits.length) + allowedDigits;
                    console.log('[PhoneAuth] TRUNCATED input to country limit');
                  }
                }
              }}
              placeholder="07911 123 456"
              aria-label="Phone number"
              aria-required="true"
              disabled={isSubmitting || isLoading}
              className={`${styles.phoneContainer} ${error ? styles.error : ''}`}
            />
          </div>
          
          {/* Error Message */}
          {error && (
            <p role="alert" className="mt-2 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>

        {/* reCAPTCHA Container */}
        <div 
          ref={recaptchaRef}
          className="flex justify-center mb-4"
        ></div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className={`
            w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 
            disabled:bg-orange-300 disabled:cursor-not-allowed
            text-white font-medium rounded-lg text-base
            min-h-[44px] transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900
          `}
        >
          {isSubmitting || isLoading ? 'Sending...' : 'Send Magic Link'}
        </button>

        {/* Alternative Option */}
        <div className="text-center">
          <button
            type="button"
            className="text-slate-400 hover:text-slate-300 text-sm underline"
            onClick={() => {
              router.push('/login');
            }}
          >
            Use email instead
          </button>
        </div>
      </div>
    </form>
  );
};