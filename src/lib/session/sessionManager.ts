import type { User } from 'firebase/auth';

export interface SessionState {
  isAuthenticated: boolean;
  user: { uid: string; email: string | null } | null;
  sessionId: string | null;
}

export interface SessionValidationResult {
  isValid: boolean;
  user: { uid: string; email: string | null } | null;
  error?: string;
}

export interface CookieOptions {
  domain?: string;
  secure?: boolean;
  sameSite?: 'None' | 'Lax' | 'Strict';
}

export class SessionManager {
  private sessionState: SessionState = {
    isAuthenticated: false,
    user: null,
    sessionId: null
  };

  private stateChangeListeners: Array<(state: SessionState) => void> = [];

  /**
   * Create a session cookie using Firebase ID token
   */
  async createSessionCookie(user: User, cookieOptions?: CookieOptions): Promise<void> {
    try {
      const idToken = await user.getIdToken();
      
      const requestBody = {
        idToken,
        uid: user.uid,
        ...(cookieOptions && { cookieOptions })
      };

      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // If token is expired, try refreshing once
        if (response.status === 401 && errorData.error?.includes('expired')) {
          const freshToken = await user.getIdToken(true); // Force refresh
          const retryResponse = await fetch('/api/auth/session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              ...requestBody,
              idToken: freshToken
            })
          });

          if (!retryResponse.ok) {
            const retryErrorData = await retryResponse.json();
            throw new Error(`Failed to create session cookie: ${retryErrorData.error}`);
          }
          return;
        }

        throw new Error(`Failed to create session cookie: ${errorData.error}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create session cookie');
    }
  }

  /**
   * Validate the current session cookie
   */
  async validateSession(): Promise<SessionValidationResult> {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          isValid: false,
          user: null,
          error: errorData.error || 'Session invalid'
        };
      }

      const data = await response.json();
      return {
        isValid: data.valid,
        user: data.user || null
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        isValid: false,
        user: null,
        error: errorMessage
      };
    }
  }

  /**
   * Clear the session cookie
   */
  async clearSessionCookie(): Promise<void> {
    try {
      await fetch('/api/auth/session', {
        method: 'DELETE',
        credentials: 'include'
      });
    } catch (error) {
      // Silently handle cleanup errors
      console.warn('Failed to clear session cookie:', error);
    }
  }

  /**
   * Refresh the Firebase ID token
   */
  async refreshToken(user: User): Promise<string> {
    return await user.getIdToken(true); // Force refresh
  }

  /**
   * Set the session state and notify listeners
   */
  setSessionState(state: SessionState): void {
    this.sessionState = { ...state };
    this.notifyStateChange();
  }

  /**
   * Get the current session state
   */
  getSessionState(): SessionState {
    return { ...this.sessionState };
  }

  /**
   * Subscribe to session state changes
   */
  onSessionStateChange(callback: (state: SessionState) => void): void {
    this.stateChangeListeners.push(callback);
  }

  /**
   * Unsubscribe from session state changes
   */
  offSessionStateChange(callback: (state: SessionState) => void): void {
    const index = this.stateChangeListeners.indexOf(callback);
    if (index > -1) {
      this.stateChangeListeners.splice(index, 1);
    }
  }

  private notifyStateChange(): void {
    this.stateChangeListeners.forEach(callback => {
      callback(this.sessionState);
    });
  }
}