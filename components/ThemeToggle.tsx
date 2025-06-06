"use client";

import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Initialize theme from localStorage or system
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme") as "light" | "dark" | null;
      if (stored) setTheme(stored);
      else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setTheme(prefersDark ? "dark" : "light");
      }
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark/light mode"
      style={{
        padding: "0.5rem 1rem",
        borderRadius: 8,
        border: "none",
        cursor: "pointer",
        backgroundColor: theme === "dark" ? "#667eea" : "#4c51bf",
        color: "white",
        fontWeight: "600",
        boxShadow: "0 2px 8px rgba(102,126,234,0.7)",
        transition: "background-color 0.3s ease",
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 1000,
      }}
    >
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
