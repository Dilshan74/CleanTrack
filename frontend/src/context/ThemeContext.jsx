import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { storage, STORAGE_KEYS } from "../utils/storage";

export const ThemeContext = createContext(null);

function applyTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => storage.get(STORAGE_KEYS.theme) ?? "light",
  );

  useEffect(() => {
    applyTheme(theme);
    storage.set(STORAGE_KEYS.theme, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(
    () => ({ theme, isDark: theme === "dark", setTheme, toggleTheme }),
    [theme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
