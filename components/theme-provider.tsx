"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type ThemeContextType = {
  isLight: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isLight: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "light") {
      setIsLight(true);
    }
  }, []);

  const toggleTheme = () => {
    setIsLight((prev) => {
      const next = !prev;
      localStorage.setItem("theme", next ? "light" : "dark");
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ isLight, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);