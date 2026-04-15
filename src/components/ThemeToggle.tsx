"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null; // تجنب عدم التطابق مع الخادم

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 transition-colors"
      aria-label="Toggle dark mode"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
