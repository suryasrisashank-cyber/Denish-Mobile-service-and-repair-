"use client";

import React from "react";
import { BRANDS } from "@/data/repairData";

export default function BrandsSupported() {
  return (
    <section className="py-space-lg bg-surface border-y border-white/5 relative">
      <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-space-xs mb-space-md">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">
              smartphone
            </span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Supported Smartphone Ecosystems
            </h3>
          </div>
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
            Hardware Tooling for All Major Brands
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-space-xs">
          {BRANDS.map((brand, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-surface-container-low border border-white/5 hover:border-primary/40 hover:bg-surface-container text-on-surface hover:text-primary transition-all duration-200 font-label-md text-label-md text-center shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
              <span>{brand}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
