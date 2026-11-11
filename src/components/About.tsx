"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle, Smartphone, Sparkles, Phone, MessageCircle } from "lucide-react";
import { BUSINESS_CONFIG } from "@/data/repairData";
import ScrollReveal from "./ScrollReveal";

export default function About() {
  const points = [
    "Diagnostic inspection to identify root hardware and software faults.",
    "Specialized micro-soldering tools for delicate motherboard IC repairs.",
    "Inventory of tested replacement screens, batteries, and charging ports.",
    "Strict adherence to customer data security and complete confidentiality.",
    "Clear, honest consultations before commencing any repair procedure.",
  ];

  return (
    <section id="about" className="py-16 lg:py-24 relative bg-surface-canvas overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

          {/* Left Column (5 cols) */}
          <ScrollReveal className="lg:col-span-5" direction="left">
            <div className="rounded-2xl p-1 bg-gradient-to-br from-primary/30 via-secondary/20 to-white/5 shadow-2xl">
              <div className="rounded-[15px] bg-surface-container p-6 sm:p-7 space-y-5 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-surface-container-high border border-primary/30 flex items-center justify-center text-primary shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-lg font-bold text-on-surface tracking-wide">
                      Your Mobile, Our Care
                    </h3>
                    <p className="font-label-badge text-xs text-primary font-mono uppercase tracking-wider">
                      Technical Workshop
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  Smartphones have become central to daily work and communication. At{" "}
                  <strong className="text-on-surface font-semibold">{BUSINESS_CONFIG.name}</strong>, we treat every device with meticulous care, whether addressing cracked glass or diagnosing a motherboard fault.
                </p>

                <div className="space-y-2 pt-2 border-t border-white/5">
                  {[
                    { label: "Hardware Assessment", value: "Detailed Inspection", color: "text-primary" },
                    { label: "Service Handling", value: "Dedicated Workmanship", color: "text-secondary" },
                    { label: "Component Grade", value: "Quality Tested", color: "text-primary-fixed" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-surface-container-lowest border border-white/5">
                      <span className="text-on-surface-variant font-medium">{label}</span>
                      <span className={`${color} font-mono font-bold`}>{value}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-lg bg-surface-container-lowest border-l-4 border-primary">
                  <p className="text-xs text-on-surface-variant italic leading-relaxed">
                    &ldquo;All Mobile Problems | One Solution. Professional repairs delivered with total dedication to device health and customer satisfaction.&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href="/about"
                    className="btn-gold py-2 px-3.5 text-xs font-bold w-full text-center"
                  >
                    <span>Read About Our Atelier</span>
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Right Column (7 cols) */}
          <ScrollReveal className="lg:col-span-7 space-y-6" direction="right" delay={150}>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high border border-white/10 text-secondary text-xs font-mono font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-secondary" />
                <span>Dedicated Smartphone Care</span>
              </div>
              <h2 className="font-display-hero-mobile text-2xl sm:text-4xl font-extrabold text-on-surface uppercase tracking-tight">
                About <span className="text-primary">Denish Mobile Repair</span>
              </h2>
              <p className="font-headline-sm text-sm sm:text-base text-primary font-semibold italic">
                &ldquo;{BUSINESS_CONFIG.tagline}&rdquo; — {BUSINESS_CONFIG.supportingTagline}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              We provide comprehensive hardware and software solutions across all major smartphone ecosystems. Backed by specialized testing equipment, anti-static workstations, and years of hands-on experience, we diagnose faults accurately and execute repairs with high standards of workmanship.
            </p>

            <div className="space-y-2.5 pt-1">
              {points.map((pt, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-on-surface">{pt}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <a
                href={BUSINESS_CONFIG.phoneTel}
                className="btn-ghost px-4 py-2.5 text-xs font-mono font-bold"
              >
                <Phone className="w-3.5 h-3.5 text-primary mr-1.5" />
                <span>Call: {BUSINESS_CONFIG.phoneRaw}</span>
              </a>

              <a
                href={BUSINESS_CONFIG.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp px-4 py-2.5 text-xs font-bold"
              >
                <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                <span>WhatsApp Consultation</span>
              </a>
            </div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}
