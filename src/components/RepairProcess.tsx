"use client";

import React from "react";
import { PROCESS_STEPS } from "@/data/repairData";
import ScrollReveal from "./ScrollReveal";

export default function RepairProcess() {
  const guaranteePoints = [
    "Hardware symptoms assessed before service starts",
    "Tested replacement components matched to your device",
    "Customer data privacy respected throughout the process",
    "Transparent pricing discussed and approved before repair",
  ];

  return (
    <section id="process" className="py-space-xl bg-surface relative">
      <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin-lg relative z-10">
        
        {/* Container */}
        <div className="p-space-lg sm:p-space-xl rounded-2xl bg-surface-container-low border border-white/5 shadow-md">
          
          <ScrollReveal className="space-y-4 mb-space-lg" direction="up">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[24px]">
                verified_user
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                The Denish Commitment
              </h2>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              Straightforward service principles centered on honesty, technical care, and prompt communication.
            </p>

            {/* 4-Point Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm pt-space-xs">
              {guaranteePoints.map((point, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-space-xs p-space-sm rounded-xl bg-surface-container border border-white/5"
                >
                  <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface">{point}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* 4-Step Recovery Journey */}
          <div className="pt-space-lg border-t border-white/5">
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
                4-Step Bench Protocol
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
              {PROCESS_STEPS.map((step, idx) => (
                <div
                  key={idx}
                  className="p-space-md rounded-xl bg-surface-container border border-white/5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-space-xs">
                      <span className="font-headline-sm text-headline-sm text-primary">
                        {step.step}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-secondary" />
                    </div>
                    <h3 className="font-title-md text-title-md text-on-surface mb-1">
                      {step.title}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
