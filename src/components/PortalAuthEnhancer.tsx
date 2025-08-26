'use client';

import { useEffect } from 'react';
import { useAuth } from 'bndy-ui/auth';

export function PortalAuthEnhancer() {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser && typeof window !== 'undefined') {
      // Temporarily disable PortalAuthEnhancer until we fix the Firestore compatibility issue
      // The main auth flow via bndy-ui is working perfectly, this is just a secondary enhancement
      console.log('[PortalAuthEnhancer] User authenticated:', currentUser.uid, currentUser.email);
      
      // TODO: Fix Firestore compatibility and re-enable
      // import('../lib/auth/portal-auth').then(({ PortalAuthService }) => {
      //   PortalAuthService.enhanceUserProfile(currentUser);
      // }).catch(console.error);
    }
  }, [currentUser]);

  // This component doesn't render anything
  return null;
}