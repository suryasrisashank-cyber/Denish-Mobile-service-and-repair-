"use client";

import React from "react";
import { Sun, Moon, Laptop, Check } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface ThemeSelectorProps {
  compact?: boolean;
  className?: string;
}

export default function ThemeSelector({ compact = false, className = "" }: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme();

  const themes: Array<{ id: "light" | "dark" | "system"; label: string; icon: React.ElementType }> = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Laptop },
  ];

  const getStatusText = () => {
    switch (theme) {
      case "light":
        return "Light mode selected";
      case "dark":
        return "Dark mode selected";
      case "system":
        return "System mode selected";
      default:
        return "System mode selected";
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <div
          className="flex items-center p-1 rounded-lg bg-[var(--bg-page)] border border-[var(--border-color)] shadow-xs"
          role="group"
          aria-label="Theme mode selection"
        >
          {themes.map((t) => {
            const Icon = t.icon;
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                title={`${t.label} mode (${isSelected ? "Selected" : "Click to select"})`}
                className={`relative px-2.5 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-[#126FE5] text-white shadow-xs font-bold"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)]/30"
                }`}
                aria-pressed={isSelected}
                aria-label={`Switch to ${t.label} mode`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.label}</span>
                {isSelected && <Check className="w-3 h-3 text-white ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl p-3.5 bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2.5 shadow-xs ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
          Appearance Theme
        </span>
        <span className="text-[11px] font-semibold text-[#126FE5] bg-[#126FE5]/10 px-2 py-0.5 rounded-full">
          {getStatusText()}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2" role="group" aria-label="Theme mode selection">
        {themes.map((t) => {
          const Icon = t.icon;
          const isSelected = theme === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                isSelected
                  ? "border-[#126FE5] bg-[#126FE5]/10 text-[#126FE5] shadow-xs font-bold"
                  : "border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
              aria-pressed={isSelected}
            >
              <div className="flex items-center gap-1 mb-1">
                <Icon className="w-4 h-4" />
                {isSelected && <Check className="w-3.5 h-3.5 text-[#126FE5]" />}
              </div>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
