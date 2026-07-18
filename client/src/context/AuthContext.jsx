import { createContext, useCallback, useEffect, useState } from "react";
import authService from "../services/authService";

/**
 * AuthContext holds the current session and auth actions.
 * Consume it through the `useAuth` hook (src/hooks/useAuth.js).
 */
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getStoredUser());
  const [loading, setLoading] = useState(false);

  // Keep session in sync across browser tabs.
  useEffect(() => {
    function sync() {
      setUser(authService.getStoredUser());
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const { user: loggedIn } = await authService.login(credentials);
      setUser(loggedIn);
      return loggedIn;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setLoading(true);
    try {
      const { user: created } = await authService.register(payload);
      setUser(created);
      return created;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value = {
    user,
    role: user?.role ?? null,
    isAuthenticated: Boolean(user),
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
