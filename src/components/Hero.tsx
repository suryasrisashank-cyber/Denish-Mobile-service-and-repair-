"use client";

import React from "react";
import Link from "next/link";
import { Phone, MessageCircle, ArrowRight, MapPin, ShieldCheck, Wrench } from "lucide-react";
import { BUSINESS_CONFIG } from "@/data/repairData";

export default function Hero() {
  return (
    <section
      className="relative z-10 w-full min-h-[500px] sm:min-h-[560px] lg:min-h-[620px] flex items-center justify-center pt-24 pb-12 sm:pt-32 sm:pb-16 bg-transparent"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl p-6 sm:p-10 rounded-2xl bg-[var(--bg-card)]/85 backdrop-blur-md border border-[var(--border-color)] shadow-xl flex flex-col gap-4 sm:gap-6 text-left transition-colors duration-200">
          
          {/* Brand Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#126FE5]/10 border border-[#126FE5]/30 text-[#126FE5] w-fit shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#126FE5] animate-pulse" />
            <span className="text-xs font-bold tracking-wide uppercase">
              {BUSINESS_CONFIG.tagline}
            </span>
          </div>

          {/* Brand & Main Heading */}
          <div className="space-y-1.5 sm:space-y-2">
            <span className="text-xs sm:text-sm font-black tracking-widest uppercase text-[#126FE5] block">
              DENISH MOBILE REPAIRING AND SERVICE
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[var(--text-primary)] tracking-tight leading-[1.12]">
              Mobile Repair, <span className="text-[#126FE5]">Made Simple.</span>
            </h1>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-[var(--text-muted)] font-medium leading-relaxed max-w-2xl">
            Gandhinagar&apos;s trusted smartphone workshop for cracked screens, depleted batteries, loose charging ports, and motherboard micro-soldering. Transparent diagnostics and direct technician care.
          </p>

          {/* Primary Action Buttons: Call Now, WhatsApp, Explore Services */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
            <a
              href={BUSINESS_CONFIG.phoneTel}
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 h-11 sm:h-12 rounded-lg bg-[#126FE5] hover:bg-[#0F5EBE] text-white text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Call Now</span>
            </a>

            <a
              href={BUSINESS_CONFIG.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 h-11 sm:h-12 rounded-lg bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>

            <Link
              href="/#services"
              className="inline-flex items-center justify-center gap-1.5 px-4 h-11 sm:h-12 rounded-lg bg-[var(--bg-page)] hover:bg-[var(--bg-card)] text-[var(--text-primary)] text-xs sm:text-sm font-bold transition-colors border border-[var(--border-color)] shadow-xs"
            >
              <span>Explore Services</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Location & Trust Micro-Strip */}
          <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-[var(--border-color)] text-xs font-semibold text-[var(--text-muted)]">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#126FE5] shrink-0" />
              <span>Gandhinagar, Gujarat</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-[#126FE5] shrink-0" />
              <span>8 Core Repair Services</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
              <span>Tested Replacement Parts</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}