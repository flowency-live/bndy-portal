import { User } from 'firebase/auth';
import { ensureUserProfileExists } from '../firebase/user-management';

export class PortalAuthService {
  static async enhanceUserProfile(user: User): Promise<void> {
    try {
      // Ensure user profile exists with portal-specific enhancements
      const wasCreated = await ensureUserProfileExists(user, 'portal');
      
      if (wasCreated) {
        console.log(`[PortalAuth] Created new user profile for ${user.uid} with portal-specific roles`);
      } else {
        console.log(`[PortalAuth] Updated existing user profile for ${user.uid}`);
      }
    } catch (error) {
      console.error('[PortalAuth] Error enhancing user profile:', error);
      // Don't throw the error to avoid disrupting the auth flow
    }
  }
}