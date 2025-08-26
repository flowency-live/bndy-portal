'use client';

import { type ReactNode } from 'react';
import { AuthProvider, initFirebase } from 'bndy-ui/auth';
import { PortalAuthEnhancer } from '../components/PortalAuthEnhancer';
import { ThemeProvider } from '../context/ThemeContext';
// Production Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!
};

console.log('[Firebase] Initializing production Firebase connection');
console.log('[Firebase] Project ID:', firebaseConfig.projectId);
console.log('[Firebase] Auth Domain:', firebaseConfig.authDomain);

// Initialize Firebase from bndy-ui for production
const { auth, firestore } = initFirebase(firebaseConfig);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PortalAuthEnhancer />
        {/* @ts-expect-error - React version mismatch between bndy-ui (React 18) and bndy-portal (React 19) */}
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
