import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: "system",
  setThemeMode: () => {},
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const saved = (localStorage.getItem("optikur_theme_mode") || localStorage.getItem("illumine_theme_mode")) as ThemeMode | null;
    return saved && ["light", "dark", "system"].includes(saved) ? saved : "system";
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Listen to OS system color scheme changes with clean disposal
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  const isDark = themeMode === "system" ? systemIsDark : themeMode === "dark";

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
  }, [isDark]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem("optikur_theme_mode", mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeModeState((prev) => {
      const nextMode: ThemeMode = prev === "dark" ? "light" : "dark";
      localStorage.setItem("optikur_theme_mode", nextMode);
      return nextMode;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
