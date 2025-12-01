// src/components/ThemeToggle.tsx
"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

function getThemeSnapshot(): "light" | "dark" | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("theme") as "light" | "dark" | null;
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function subscribeToTheme(callback: () => void) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", callback);
  window.addEventListener("storage", callback);
  return () => {
    mediaQuery.removeEventListener("change", callback);
    window.removeEventListener("storage", callback);
  };
}

function getServerSnapshot(): "light" | "dark" | null {
  return null;
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", newTheme);
    // Dispatch a storage event to trigger useSyncExternalStore update
    window.dispatchEvent(new StorageEvent("storage", { key: "theme" }));
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
        p-2.5 sm:p-2 rounded-lg
        bg-white dark:bg-gray-800
        border border-neutral-200 dark:border-gray-600
        shadow-lg shadow-neutral-900/5 dark:shadow-none
        hover:border-neutral-300 hover:shadow-xl hover:shadow-neutral-900/5 dark:hover:border-gray-500
        transition-all duration-200
      "
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-neutral-700" />
      ) : (
        <Sun className="w-5 h-5 text-gray-300" />
      )}
    </button>
  );
}