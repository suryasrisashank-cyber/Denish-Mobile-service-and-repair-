"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  label?: string;
  className?: string;
}

export default function BackButton({ label = "← Back", className = "" }: BackButtonProps) {
  const handleBack = () => {
    if (typeof window !== "undefined") {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "/";
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 text-xs sm:text-sm font-semibold transition-all active:scale-95 border border-white/10 shadow-sm backdrop-blur-md ${className}`}
      aria-label="Back to previous page"
    >
      <ArrowLeft className="w-4 h-4 text-amber-400" />
      <span>{label}</span>
    </button>
  );
}

