"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./theme-provider";

export default function ThemeToggle() {
  const { isLight, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2.5 rounded-xl border transition-all ${
        isLight
          ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
          : "bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700"
      }`}
      aria-label="Toggle Theme"
    >
      {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
    </button>
  );
}