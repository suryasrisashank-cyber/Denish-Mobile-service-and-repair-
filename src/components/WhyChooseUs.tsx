"use client";

import React from "react";
import { Wrench, MessageSquare, CheckCircle, Lock } from "lucide-react";

export default function WhyChooseUs() {
  const benefits = [
    {
      icon: Wrench,
      title: "Careful Technical Handling",
      desc: "Delicate disassembly, ESD-safe workbench protocols, and precision instruments configured for modern compact smartphones.",
    },
    {
      icon: MessageSquare,
      title: "Clear Communication",
      desc: "Upfront explanation of device issues, honest advice on repair feasibility, and straightforward discussions before starting work.",
    },
    {
      icon: CheckCircle,
      title: "Tested Replacement Parts",
      desc: "Quality-checked displays, battery cells, and charging flex assemblies tested for stability and performance.",
    },
    {
      icon: Lock,
      title: "Customer Privacy Respect",
      desc: "We prioritize the safety of your personal device. Hardware fixes are conducted without modifying personal user data.",
    },
  ];

  return (
    <section id="why-denish" className="py-14 sm:py-20 bg-[var(--bg-page)]/80 backdrop-blur-xs border-y border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#126FE5]/10 text-[#126FE5] text-xs font-bold uppercase tracking-wider mb-2">
            <span>Honest Craftsmanship</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
            Why Choose DENISH
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)] mt-2 font-medium">
            Direct technician consultation, realistic repair expectations, and clean hardware execution based in Gandhinagar.
          </p>
        </div>

        {/* 4 Benefit Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {benefits.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-xl bg-[var(--bg-card)]/95 backdrop-blur-md border border-[var(--border-color)] hover:border-[#126FE5]/50 transition-all flex flex-col justify-between shadow-xs group"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-[#126FE5]/10 text-[#126FE5] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5 text-[#126FE5]" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-2 group-hover:text-[#126FE5] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[var(--border-color)] text-[11px] font-bold text-[var(--text-muted)] font-mono">
                  <span>Pillar 0{idx + 1}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}