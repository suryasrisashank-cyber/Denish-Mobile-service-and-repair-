"use client";

import React from "react";
import { Smartphone, BatteryCharging, Zap, Cpu, HelpCircle, Phone, MessageCircle } from "lucide-react";
import { BUSINESS_CONFIG } from "@/data/repairData";

interface DetailedService {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  symptoms: string[];
  solution: string;
  turnaroundNote: string;
}

const DETAILED_SERVICES: DetailedService[] = [
  {
    id: "screen",
    icon: Smartphone,
    title: "Display & Glass Replacement",
    subtitle: "OLED, AMOLED & High-Definition LCD Assemblies",
    symptoms: [
      "Spider-web glass cracks with normal touch",
      "Black spots, ink bleeds, or colored vertical lines",
      "Unresponsive touch zones or ghost touches",
      "Total black display with incoming sound",
    ],
    solution:
      "We inspect whether only outer glass or the entire digitizer and OLED assembly requires renewal. Every replacement screen is calibrated for touch sensitivity, multi-touch accuracy, and proper brightness output.",
    turnaroundNote: "Turnaround varies by model availability. Contact our shop for service details.",
  },
  {
    id: "battery",
    icon: BatteryCharging,
    title: "Battery Health Renewal",
    subtitle: "High-Capacity Replacement Lithium-Ion Cells",
    symptoms: [
      "Phone abruptly powers off when reaching 20-30%",
      "Battery depletes rapidly within 3-4 hours of light use",
      "Physical screen lifting caused by swollen battery pack",
      "Excessive heating during normal standby or browsing",
    ],
    solution:
      "Old batteries are safely detached using thermal release techniques to avoid puncturing. Fresh high-density cells are seated with fresh adhesive and undergo charging-cycle verification before return.",
    turnaroundNote: "Fresh cell seating and safety testing performed on bench.",
  },
  {
    id: "charging",
    icon: Zap,
    title: "Charging Port & Sub-PCB Fix",
    subtitle: "Type-C, Lightning & Power Circuit Diagnostics",
    symptoms: [
      "Charging cable must be held at an angle to charge",
      "Slow charging warning or moisture detected warning",
      "Loose USB cable falling out of the charging socket",
      "Zero current draw when plugged into known working wall adapter",
    ],
    solution:
      "We first microscopically inspect for compacted pocket lint or debris. If connector pins are oxidized or worn, we replace the charging port or sub-board assembly and test fast-charge power draw.",
    turnaroundNote: "Inspection and connector pin alignment conducted at bench.",
  },
  {
    id: "micro-soldering",
    icon: Cpu,
    title: "Motherboard IC Micro-Soldering",
    subtitle: "Component-Level Logic Board Diagnosis & Repair",
    symptoms: [
      "Completely dead device with zero power or display",
      "Audio IC malfunction (callers cannot hear you, greyed speaker)",
      "Device stuck on boot logo reboot loop after a drop or surge",
      "Motherboard short circuit draining battery instantaneously",
    ],
    solution:
      "Under high-power trinocular microscopes, we identify shorted surface capacitors, repair torn solder traces, and perform BGA chip reballing/replacement for power management ICs (PMIC) and audio processors.",
    turnaroundNote: "Detailed logic board micro-soldering requires multi-stage microscope bench testing.",
  },
];

export default function ServicesExplained() {
  return (
    <section id="services-explained" className="py-14 sm:py-20 bg-[var(--bg-page)]/80 backdrop-blur-xs border-y border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#126FE5]/10 text-[#126FE5] text-xs font-bold uppercase tracking-wider mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Technical Transparency</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
            Repair Services Explained
          </h2>
          <p className="text-xs sm:text-base text-[var(--text-muted)] mt-2 font-medium">
            Understand exactly what is happening to your smartphone and how our technician resolves each issue safely.
          </p>
        </div>

        {/* 4 In-Depth Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {DETAILED_SERVICES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="p-6 sm:p-7 rounded-2xl bg-[var(--bg-card)]/95 backdrop-blur-md border border-[var(--border-color)] hover:border-[#126FE5]/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-[#126FE5]/10 text-[#126FE5] flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-[#126FE5]" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] leading-tight">
                        {item.title}
                      </h3>
                      <span className="text-xs font-semibold text-[#126FE5] block mt-0.5">
                        {item.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* Common Symptoms List */}
                  <div className="mb-4">
                    <span className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wider block mb-2">
                      Common Symptoms:
                    </span>
                    <ul className="space-y-1.5 text-xs text-[var(--text-muted)] font-medium">
                      {item.symptoms.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#126FE5] mt-1.5 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Technical Solution */}
                  <div className="p-3.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-color)] mb-4">
                    <span className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wider block mb-1">
                      Technical Solution:
                    </span>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                      {item.solution}
                    </p>
                  </div>
                </div>

                {/* Turnaround & Action */}
                <div className="pt-3 border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-[11px] font-semibold text-[var(--text-muted)] italic">
                    {item.turnaroundNote}
                  </span>

                  <div className="flex items-center gap-2">
                    <a
                      href={BUSINESS_CONFIG.phoneTel}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#126FE5] hover:bg-[#0F5EBE] text-white text-xs font-bold transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call Now</span>
                    </a>
                    <a
                      href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(
                        `Hello Denish Mobile Repairing, I want to consult regarding ${item.title}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-bold transition-colors"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}