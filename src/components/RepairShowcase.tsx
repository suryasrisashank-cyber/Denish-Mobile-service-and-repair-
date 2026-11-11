"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Wrench } from "lucide-react";

interface ShowcaseItem {
  title: string;
  category: string;
  description: string;
  imageSrc: string;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    title: "Display & Screen Replacement",
    category: "Display Tech",
    description: "Careful removal of damaged OLED panels and precision adhesion of tested high-definition displays.",
    imageSrc: "/hero-isometric-diagnostics.png",
  },
  {
    title: "Battery Health Renewal",
    category: "Power Cell",
    description: "Safe thermal extraction of depleted cells and replacement with fresh, tested lithium-ion packs.",
    imageSrc: "/clean-room-workshop.png",
  },
  {
    title: "Charging Port & Sub-Board Repair",
    category: "Port Service",
    description: "Connector pin realignment, debris extraction, and fast-charging power circuit restoration.",
    imageSrc: "/stitch-micro-lab.jpg",
  },
  {
    title: "Motherboard IC Micro-Soldering",
    category: "Logic Board",
    description: "High-magnification microscope examination, jumper wiring, and surface-mount chip replacement.",
    imageSrc: "/motherboard-macro-repair.png",
  },
];

export default function RepairShowcase() {
  return (
    <section id="showcase" className="py-14 sm:py-20 bg-[var(--bg-card)]/80 backdrop-blur-xs relative border-y border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#126FE5]/10 text-[#126FE5] text-xs font-bold uppercase tracking-wider mb-2">
              <Wrench className="w-3.5 h-3.5" />
              <span>Workbench Craftsmanship</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
              Mobile Repair Showcase
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)] mt-1 max-w-xl font-medium">
              Authentic glimpses of our everyday component diagnosis and hardware restoration workflow.
            </p>
          </div>

          <Link
            href="/#contact"
            className="text-xs sm:text-sm font-bold text-[#126FE5] hover:underline inline-flex items-center gap-1 shrink-0"
          >
            <span>Have a device to fix? Consult us</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4 Clean Showcase Cards with Consistent Aspect Ratio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SHOWCASE_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="bg-[var(--bg-page)]/90 backdrop-blur-md border border-[var(--border-color)] rounded-xl overflow-hidden hover:shadow-lg hover:border-[#126FE5]/50 transition-all group flex flex-col justify-between"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                <Image
                  src={item.imageSrc}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white uppercase tracking-wider">
                  {item.category}
                </div>
              </div>

              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[var(--text-primary)] mb-1 group-hover:text-[#126FE5] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}