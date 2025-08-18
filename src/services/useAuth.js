import { useCallback, useEffect, useState } from 'react';
import AuthService from './AuthService';

/**
 * useAuth - React hook that encapsulates auth state and actions.
 * - Subscribes to Firebase auth state.
 * - Exposes the current user, isAuthenticated, and a signOut action.
 * Follows SRP by isolating auth concerns away from UI components.
 */
export default function useAuth() {
  const [user, setUser] = useState(() => AuthService.getCurrentUser?.() || null);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged?.((u) => {
      setUser(u || null);
    });
    return () => {
      try {
        unsubscribe && unsubscribe();
      } catch {
        // no-op
      }
    };
  }, []);

  const signOut = useCallback(async () => {
    await AuthService.signOut();
  }, []);

  const isAuthenticated = !!user && !user.isAnonymous;

  return { user, isAuthenticated, signOut };
}
