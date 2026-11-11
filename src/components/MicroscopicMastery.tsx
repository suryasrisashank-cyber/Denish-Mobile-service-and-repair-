"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import ScrollReveal from "./ScrollReveal";

export default function MicroscopicMastery() {
  const cards = [
    {
      title: "Micro-Soldering & Board Diagnostics",
      badge: "Circuit Care",
      desc: "Micro-trace examination, power IC diagnostics, and chip-level motherboard inspection under high-magnification optical equipment.",
      icon: "memory",
      iconColor: "text-primary",
    },
    {
      title: "Ultrasonic Chemical Deoxidation",
      badge: "Liquid Treatment",
      desc: "Specialized ultrasonic immersion to help remove moisture residues and mineral oxidation from compact smartphone circuit boards.",
      icon: "water_drop",
      iconColor: "text-secondary",
    },
    {
      title: "Display & Sensor Alignment",
      badge: "Calibration",
      desc: "Careful screen fitment, touch digitizer testing, ambient light sensor checks, and camera module alignment for seamless daily operation.",
      icon: "tune",
      iconColor: "text-primary-fixed-dim",
    },
  ];

  return (
    <section className="w-full py-space-xl px-margin-sm lg:px-margin-lg max-w-7xl mx-auto">
      <ScrollReveal className="space-y-space-md" direction="up">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-sm border-b border-white/5 pb-space-sm">
          <div>
            <div className="flex items-center gap-space-xs mb-1">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
                Workshop Capabilities
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              Microscopic Diagnostics &amp; Care
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mt-1">
              Precision soldering equipment, optical magnification, and ultrasonic tools configured for intricate modern smartphone repairs.
            </p>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center gap-space-xs px-space-md h-10 rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md hover:bg-surface-variant transition-colors self-start sm:self-auto shrink-0"
          >
            <span>Explore All 8 Services</span>
            <span className="material-symbols-outlined text-[16px] text-primary">arrow_forward</span>
          </Link>
        </div>

        {/* Featured Visual & 3 Tech Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-stretch">
          
          {/* Visual Showcase (7 cols) */}
          <div className="lg:col-span-7 relative min-h-[300px] sm:min-h-[380px] rounded-2xl overflow-hidden bg-surface-container-low border border-white/5 shadow-md group">
            <Image
              src="/motherboard-macro-repair.png"
              alt="Microscopic mobile repair workstation with precision soldering and PCB inspection in Gandhinagar workshop"
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/40 to-transparent" />
            
            <div className="absolute bottom-4 left-4 right-4 p-space-md rounded-xl bg-surface-container-highest/90 backdrop-blur-md border border-white/10">
              <div className="flex items-center justify-between mb-1">
                <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
                  Micro-Trace Soldering Station
                </span>
                <span className="font-label-sm text-label-sm text-secondary">Diagnostic Rig</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Optical stereo microscope setup for fine jumper wiring and micro-component replacement on compact multi-layer circuit boards.
              </p>
            </div>
          </div>

          {/* 3 Stacked Cards (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-space-sm">
            {cards.map((c, i) => (
              <div
                key={i}
                className="p-space-md rounded-2xl bg-surface-container-low border border-white/5 hover:border-primary/20 hover:bg-surface-container transition-all flex items-start gap-space-md shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0">
                  <span className={`material-symbols-outlined text-[22px] ${c.iconColor}`}>
                    {c.icon}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-title-md text-title-md text-on-surface truncate">
                      {c.title}
                    </h3>
                    <span className="font-label-sm text-label-sm text-secondary bg-surface-container-high px-2 py-0.5 rounded-full shrink-0">
                      {c.badge}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">
                    {c.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </ScrollReveal>
    </section>
  );
}
