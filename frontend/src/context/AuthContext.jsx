import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { storage, STORAGE_KEYS } from "../utils/storage";
import { ROLES } from "../utils/constants";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => storage.get(STORAGE_KEYS.user));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(storage.get(STORAGE_KEYS.user));
    setLoading(false);
  }, []);

  const login = useCallback(({ email, role = ROLES.CITIZEN, name, token }) => {
    const nextUser = {
      email,
      role,
      name: name ?? email?.split("@")[0] ?? "User",
    };
    storage.set(STORAGE_KEYS.user, nextUser);
    if (token) storage.set(STORAGE_KEYS.token, token);
    setUser(nextUser);
    return nextUser;
  }, []);

  const logout = useCallback(() => {
    storage.remove(STORAGE_KEYS.user);
    storage.remove(STORAGE_KEYS.token);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      role: user?.role ?? null,
      isAuthenticated: Boolean(user),
      loading,
      login,
      logout,
    }),
    [user, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
