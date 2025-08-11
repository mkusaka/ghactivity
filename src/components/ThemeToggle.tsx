// src/components/ThemeToggle.tsx
"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    // Check localStorage and system preference
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    if (stored) {
      setTheme(stored);
      if (stored === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      // Use system preference
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(isDark ? "dark" : "light");
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Don't render until theme is determined to avoid hydration mismatch
  if (theme === null) return null;

  return (
    <button
      onClick={toggleTheme}
      className="
        fixed z-50
        bottom-4 right-4
        sm:bottom-auto sm:top-4 sm:right-4
        p-2.5 sm:p-2 rounded-xl
        bg-white dark:bg-slate-900
        ring-1 ring-slate-200 dark:ring-slate-800
        shadow-lg sm:shadow-sm hover:shadow-xl sm:hover:shadow-md
        transition-all duration-200
      "
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-slate-700" />
      ) : (
        <Sun className="w-5 h-5 text-slate-300" />
      )}
    </button>
  );
}