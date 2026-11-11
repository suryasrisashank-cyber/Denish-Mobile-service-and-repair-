"use client";

import React from "react";
import { ShieldCheck, Award, ThumbsUp, Zap } from "lucide-react";

export default function TrustBadges() {
  const badges = [
    {
      title: "GENUINE PARTS",
      subtitle: "OEM Grade & Tested Components",
      icon: ShieldCheck,
      color: "text-amber-400",
      border: "border-amber-500/25",
      bg: "bg-amber-500/10",
    },
    {
      title: "EXPERIENCED TECHNICIANS",
      subtitle: "Certified Chip-Level Specialists",
      icon: Award,
      color: "text-sky-400",
      border: "border-sky-500/25",
      bg: "bg-sky-500/10",
    },
    {
      title: "CUSTOMER SATISFACTION",
      subtitle: "Transparent & Friendly Support",
      icon: ThumbsUp,
      color: "text-emerald-400",
      border: "border-emerald-500/25",
      bg: "bg-emerald-500/10",
    },
    {
      title: "FIX TODAY • USE TOMORROW",
      subtitle: "Rapid Express Turnaround",
      icon: Zap,
      color: "text-purple-400",
      border: "border-purple-500/25",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <section className="relative z-20 -mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {badges.map((b, i) => {
          const Icon = b.icon;
          return (
            <div
              key={i}
              className={`p-5 rounded-2xl bg-brand-navy-card/95 backdrop-blur-xl border ${b.border} shadow-card-glow hover:border-opacity-80 transition-all duration-300 flex items-center gap-4 group hover:-translate-y-1`}
            >
              <div className={`p-3.5 rounded-xl ${b.bg} border ${b.border} shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-6 h-6 ${b.color}`} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black tracking-wider text-white group-hover:text-amber-400 transition-colors uppercase">
                  {b.title}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5 leading-snug">
                  {b.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
