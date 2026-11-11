import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileStickyBar from "@/components/MobileStickyBar";
import { BUSINESS_CONFIG } from "@/data/repairData";
import {
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Clock,
  Sparkles,
  MapPin
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Our Workshop | DENISH MOBILE REPAIRING AND SERVICE",
  description:
    "Learn about DENISH MOBILE REPAIRING AND SERVICE: technical hardware repair, microscopic board diagnostics, and ethical smartphone care in Gujarat. Tap Call Now for assistance.",
};

export default function AboutPage() {
  const values = [
    {
      title: "Data Confidentiality",
      desc: "We strictly respect your privacy. Hardware repairs are performed without altering personal messages, photos, or accounts.",
      icon: ShieldCheck,
    },
    {
      title: "Tested Replacement Parts",
      desc: "We use quality-checked replacement screens, batteries, and charging ports to ensure dependable performance.",
      icon: CheckCircle2,
    },
    {
      title: "Clear Communication",
      desc: "We discuss feasibility and repair requirements transparently before opening your smartphone or beginning work.",
      icon: Wrench,
    },
    {
      title: "Focused Turnaround",
      desc: "We understand that your mobile is vital for everyday life. Common repairs are completed as promptly as possible.",
      icon: Clock,
    },
  ];

  const equipment = [
    {
      name: "Stereo Optical Microscope",
      use: "High-magnification inspection for microscopic PCB solder traces and BGA package realignment.",
    },
    {
      name: "Ultrasonic Cleaning Bath",
      use: "Multi-stage deoxidation for liquid-exposed circuit boards to remove mineral corrosion.",
    },
    {
      name: "Precision Thermal Hot-Air Rework Station",
      use: "Controlled temperature profiles for safe desoldering and micro-chip replacement.",
    },
    {
      name: "Digital Multimeter & DC Power Supply",
      use: "Accurate current draw and short-circuit voltage diagnostic probing.",
    },
  ];

  return (
    <main className="min-h-screen bg-surface-canvas text-on-surface pb-24 lg:pb-0">
      <Navbar />

      {/* Hero Header */}
      <section className="pt-28 pb-14 sm:pt-36 sm:pb-20 bg-surface-canvas border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-white/10 text-primary text-xs font-mono font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Dedicated Mobile Care</span>
          </div>

          <h1 className="font-display-hero text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-on-surface">
            About <span className="text-primary">Denish Mobile Repair</span>
          </h1>

          <p className="font-headline-sm text-base sm:text-xl text-primary font-bold italic">
            &ldquo;{BUSINESS_CONFIG.tagline}&rdquo;
          </p>

          <p className="text-sm sm:text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            {BUSINESS_CONFIG.supportingTagline} Founded to deliver honest diagnostics, specialized hardware repair, and quality workmanship for smartphone users across Gujarat.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/book-repair" className="btn-gold px-5 py-2.5 text-xs sm:text-sm font-bold shadow-md">
              <span>Book a Diagnostic</span>
            </Link>
            <a
              href={BUSINESS_CONFIG.phoneTel}
              className="btn-ghost px-5 py-2.5 text-xs sm:text-sm font-semibold"
            >
              <Phone className="w-4 h-4 text-primary mr-1.5" />
              <span>Call Now</span>
            </a>
          </div>
        </div>
      </section>

      {/* Story & Philosophy */}
      <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-6 relative h-[320px] sm:h-[420px] rounded-2xl overflow-hidden bg-surface-container border border-white/10 shadow-lg">
            <Image
              src="/stitch-micro-lab.jpg"
              alt="DENISH MOBILE REPAIR workshop microscope and technician workstation"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent opacity-70" />
            <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-surface-container-lowest/90 backdrop-blur-md border border-white/10">
              <span className="font-label-badge text-[10px] text-primary uppercase font-mono font-bold block">
                Precision Hardware Workbench
              </span>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Specialized tooling for delicate micro-soldering and high-magnification circuit diagnostics.
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-5">
            <div className="space-y-1">
              <span className="font-label-badge text-xs uppercase tracking-wider text-secondary font-mono font-semibold">
                Our Foundation
              </span>
              <h2 className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-on-surface uppercase tracking-tight">
                Craftsmanship &amp; Integrity
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              At <strong>{BUSINESS_CONFIG.name}</strong>, we treat every customer device as a critical personal and professional tool. Rather than recommending unnecessary full board swaps, we diagnose the exact component failure—saving you time and cost.
            </p>

            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Whether you bring in a flagship Apple iPhone, a Samsung Galaxy fold, or a daily Android device, our approach remains the same: thorough diagnostic testing, honest quotes, and quality-tested parts.
            </p>

            <div className="p-4 rounded-xl bg-surface-container border-l-4 border-primary space-y-1">
              <span className="font-title-md text-xs font-bold text-on-surface block">
                Service Guarantee
              </span>
              <p className="text-xs text-on-surface-variant">
                We confirm repair feasibility and costs upfront. You approve the work before any repair is initiated.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Workshop Equipment & Standards */}
      <section className="py-14 bg-surface border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <span className="font-label-badge text-xs text-primary font-mono uppercase tracking-wider font-semibold">
              Bench Standards
            </span>
            <h2 className="font-headline-md text-xl sm:text-3xl font-bold text-on-surface mt-1">
              Diagnostic &amp; Repair Equipment
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              Proper tools prevent board warping, electrostatic discharge, and component overheating.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {equipment.map((eq, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-surface-container border border-white/10 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <span className="font-label-mono text-xs text-secondary font-bold">
                    TOOL 0{idx + 1}
                  </span>
                  <h3 className="font-title-md text-sm font-bold text-on-surface mt-2 mb-1.5">
                    {eq.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {eq.use}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <span className="font-label-badge text-xs text-secondary font-mono uppercase tracking-wider font-semibold">
            Our Core Principles
          </span>
          <h2 className="font-headline-md text-xl sm:text-3xl font-bold text-on-surface mt-1">
            Why Customers Trust Our Atelier
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {values.map((val, idx) => {
            const Icon = val.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-xl bg-surface-container border border-white/10 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high border border-white/5 flex items-center justify-center text-primary mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-title-md text-sm font-bold text-on-surface mb-1.5">
                    {val.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {val.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Workshop Location & Info */}
      <section className="py-12 bg-surface-container border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-lowest border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-primary text-xs font-bold uppercase font-mono">
                <Phone className="w-4 h-4" />
                <span>Hotline Phone</span>
              </div>
              <a
                href={BUSINESS_CONFIG.phoneTel}
                className="font-mono text-sm font-bold text-on-surface hover:text-primary transition-colors block"
              >
                {BUSINESS_CONFIG.phoneDisplay}
              </a>
              <span className="text-[11px] text-on-surface-variant">Call for diagnostic inquiries</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-secondary text-xs font-bold uppercase font-mono">
                <Clock className="w-4 h-4" />
                <span>Operating Timings</span>
              </div>
              <span className="text-xs text-on-surface block font-semibold">
                {BUSINESS_CONFIG.hoursPlaceholder}
              </span>
              <span className="text-[11px] text-on-surface-variant">Walk-in visits welcome</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-primary-fixed text-xs font-bold uppercase font-mono">
                <MapPin className="w-4 h-4" />
                <span>Shop Location</span>
              </div>
              <span className="text-xs text-on-surface block font-semibold">
                {BUSINESS_CONFIG.locationPlaceholder}
              </span>
              <span className="text-[11px] text-on-surface-variant">{BUSINESS_CONFIG.state}</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <MobileStickyBar />
    </main>
  );
}
