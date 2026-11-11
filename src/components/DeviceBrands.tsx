"use client";

import React from "react";
import Link from "next/link";
import { Smartphone, ArrowRight, MessageCircle } from "lucide-react";
import { BUSINESS_CONFIG } from "@/data/repairData";

interface BrandItem {
  id: string;
  name: string;
  series: string;
  popularModels: string;
}

const BRANDS_LIST: BrandItem[] = [
  {
    id: "apple",
    name: "Apple iPhone",
    series: "iPhone 11 to 15 Pro Max, SE, X series",
    popularModels: "Screen, Battery, Charging Port & Audio Fixes",
  },
  {
    id: "samsung",
    name: "Samsung Galaxy",
    series: "Galaxy S Series, Z Fold/Flip, A Series, M Series",
    popularModels: "Curved AMOLED Screen & Battery Renewal",
  },
  {
    id: "oneplus",
    name: "OnePlus",
    series: "OnePlus 9, 10, 11, 12 Series, Nord Series",
    popularModels: "Green Line Fix, Display & Warp Charge Port",
  },
  {
    id: "xiaomi",
    name: "Xiaomi / Redmi",
    series: "Redmi Note Series, Xiaomi Numbers, Poco Series",
    popularModels: "Display Replacement & Motherboard Power IC",
  },
  {
    id: "vivo",
    name: "Vivo",
    series: "V Series, X Series, Y Series, T Series",
    popularModels: "AMOLED Glass Repair & Camera Lens Fix",
  },
  {
    id: "oppo",
    name: "Oppo",
    series: "Reno Series, F Series, A Series, Find Series",
    popularModels: "SuperVOOC Port Repair & Battery Replacement",
  },
  {
    id: "realme",
    name: "Realme",
    series: "Number Series, GT Series, Narzo Series",
    popularModels: "Touch Screen Assembly & Speaker Replacement",
  },
  {
    id: "google-pixel",
    name: "Google Pixel",
    series: "Pixel 6, 7, 8 Series, Pixel A Series",
    popularModels: "OLED Panel Restoration & Battery Swelling Fix",
  },
  {
    id: "motorola",
    name: "Motorola",
    series: "Edge Series, Moto G Series, Razr",
    popularModels: "LCD/OLED Screen & Power Switch Repairs",
  },
];

export default function DeviceBrands() {
  return (
    <section id="device-brands" className="py-12 sm:py-20 bg-[var(--bg-card)]/80 backdrop-blur-xs border-y border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#126FE5]/10 text-[#126FE5] text-xs font-bold uppercase tracking-wider mb-2">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Multi-Brand Smartphone Support</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
            Supported Device Brands
          </h2>
          <p className="text-xs sm:text-base text-[var(--text-muted)] mt-1.5 sm:mt-2 font-medium">
            Independent bench diagnostic and hardware repair expertise for all major smartphone manufacturers in Gandhinagar.
          </p>
        </div>

        {/* Brand Cards Grid: 3 cols on tablet, 3 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
          {BRANDS_LIST.map((b) => {
            const encoded = encodeURIComponent(`Hello Denish Mobile Repairing, I need a repair consultation for my ${b.name}.`);
            const waUrl = `https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encoded}`;

            return (
              <div
                key={b.id}
                className="p-4 sm:p-5 rounded-xl bg-[var(--bg-page)]/90 backdrop-blur-md border border-[var(--border-color)] hover:border-[#126FE5]/50 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-lg bg-[#126FE5]/10 text-[#126FE5] flex items-center justify-center font-black text-xs">
                      <Smartphone className="w-4 h-4 text-[#126FE5]" />
                    </div>
                    <span className="text-[10px] font-bold text-[#126FE5] bg-[#126FE5]/10 px-2 py-0.5 rounded uppercase tracking-wider">
                      Supported
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] group-hover:text-[#126FE5] transition-colors">
                    {b.name}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 font-medium">
                    {b.series}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]/90 mt-1.5 leading-relaxed font-normal">
                    {b.popularModels}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-[var(--border-color)] flex items-center justify-between">
                  <Link
                    href={`/book-repair?brand=${encodeURIComponent(b.name)}`}
                    className="text-xs font-bold text-[#126FE5] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Check Repair</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#25D366] hover:underline"
                    title={`Enquire about ${b.name} on WhatsApp`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trademark & Independence Transparency Note */}
        <div className="mt-8 text-center max-w-xl mx-auto">
          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            * Independent repair workshop. All brand names, model trademarks, and logos are property of their respective owners and referenced solely for device compatibility identification.
          </p>
        </div>

      </div>
    </section>
  );
}