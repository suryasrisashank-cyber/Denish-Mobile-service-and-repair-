"use client";

import React from "react";
import Link from "next/link";
import {
  Smartphone,
  Battery,
  Zap,
  Cpu,
  Droplets,
  Wrench,
  Volume2,
  Camera,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { BUSINESS_CONFIG } from "@/data/repairData";

interface ServiceItem {
  id: string;
  title: string;
  shortDesc: string;
  icon: React.ElementType;
  tag: string;
}

const SERVICES_LIST: ServiceItem[] = [
  {
    id: "screen-replacement",
    title: "Screen Replacement",
    shortDesc: "OLED, AMOLED and LCD display replacement for cracked glass, lines, touch failure, and black screens.",
    icon: Smartphone,
    tag: "OLED • LCD",
  },
  {
    id: "battery-replacement",
    title: "Battery Replacement",
    shortDesc: "Fresh high-density battery cell installation for rapid drain, unexpected shutdowns, and swelling.",
    icon: Battery,
    tag: "Health Renewal",
  },
  {
    id: "charging-repair",
    title: "Charging Repair",
    shortDesc: "Diagnostic port restoration, loose connector pin realignment, and fast-charge power circuit fixing.",
    icon: Zap,
    tag: "Type-C • Lightning",
  },
  {
    id: "software-solutions",
    title: "Software Solutions",
    shortDesc: "Firmware flashing, bootloop recovery, system upgrade errors, and device performance optimization.",
    icon: Cpu,
    tag: "Android • iOS",
  },
  {
    id: "water-damage-repair",
    title: "Water Damage Repair",
    shortDesc: "Ultrasonic chemical cleaning, deep moisture extraction, and motherboard circuit deoxidation.",
    icon: Droplets,
    tag: "Ultrasonic Wash",
  },
  {
    id: "ic-pcb-repair",
    title: "IC / PCB Repair",
    shortDesc: "Component-level micro-soldering, power IC replacement, audio IC fixes, and motherboard trace repair.",
    icon: Wrench,
    tag: "Micro-Soldering",
  },
  {
    id: "speaker-replacement",
    title: "Speaker Replacement",
    shortDesc: "Restoration for muffled earpieces, distorted loudspeakers, buzzing audio, and microphone issues.",
    icon: Volume2,
    tag: "Audio & Mic",
  },
  {
    id: "camera-replacement",
    title: "Camera Replacement",
    shortDesc: "Camera sensor and lens replacement for blurred autofocus, cracked outer glass, and camera crashes.",
    icon: Camera,
    tag: "OIS & Optics",
  },
];

export default function Services() {
  return (
    <section id="services" className="py-12 sm:py-20 bg-[var(--bg-page)]/80 backdrop-blur-xs relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#126FE5]/10 text-[#126FE5] text-xs font-bold uppercase tracking-wider mb-2">
            <span>Specialized Services</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
            Our Repair Services
          </h2>
          <p className="text-xs sm:text-base text-[var(--text-muted)] mt-1.5 sm:mt-2 font-medium">
            Every repair is handled with technical precision, quality replacement components, and transparent communication.
          </p>
        </div>

        {/* ── 8 SERVICES IN A COMPACT 2-COLUMN MOBILE GRID ──────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
          {SERVICES_LIST.map((srv) => {
            const Icon = srv.icon;
            const encodedMsg = encodeURIComponent(
              `Hello Denish Mobile Repairing, I would like to enquire about ${srv.title} service for my phone.`
            );
            const waUrl = `https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodedMsg}`;

            return (
              <div
                key={srv.id}
                className="bg-[var(--bg-card)]/95 backdrop-blur-md border border-[var(--border-color)] hover:border-[#126FE5]/60 hover:shadow-md transition-all duration-200 rounded-xl p-3.5 sm:p-5 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2 sm:mb-3.5">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-[#126FE5]/10 text-[#126FE5] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#126FE5]" />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-[#126FE5] uppercase tracking-wider bg-[#126FE5]/10 border border-[#126FE5]/20 px-1.5 sm:px-2 py-0.5 rounded truncate max-w-[80px] sm:max-w-none">
                      {srv.tag}
                    </span>
                  </div>

                  <h3 className="font-bold text-xs sm:text-base text-[var(--text-primary)] mb-1 group-hover:text-[#126FE5] transition-colors leading-snug">
                    {srv.title}
                  </h3>
                  <p className="text-[11px] sm:text-sm text-[var(--text-muted)] font-medium leading-relaxed line-clamp-2 sm:line-clamp-3">
                    {srv.shortDesc}
                  </p>
                </div>

                {/* Touch-Friendly Working Actions */}
                <div className="pt-3 mt-3 border-t border-[var(--border-color)] flex items-center justify-between gap-1.5">
                  <Link
                    href={`/book-repair?issue=${encodeURIComponent(srv.title)}`}
                    className="text-[11px] sm:text-xs font-bold text-[#126FE5] hover:underline inline-flex items-center gap-1 min-h-[36px] py-1"
                  >
                    <span>Enquire</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Ask on WhatsApp about ${srv.title}`}
                    className="w-8 h-8 rounded-md bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white flex items-center justify-center transition-colors shrink-0"
                    title="Enquire on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
