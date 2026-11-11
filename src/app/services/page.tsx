import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileStickyBar from "@/components/MobileStickyBar";
import ServiceSimulations from "@/components/ServiceSimulations";
import BackButton from "@/components/BackButton";
import { SERVICES_LIST, BUSINESS_CONFIG } from "@/data/repairData";
import {
  Smartphone,
  Battery,
  Zap,
  Cpu,
  Droplets,
  Wrench,
  Volume2,
  Camera,
  Calendar,
  MessageCircle,
  Phone,
  CheckCircle2,
  Sparkles
} from "lucide-react";

export const metadata: Metadata = {
  title: "Professional Mobile Repair Services | DENISH MOBILE REPAIR",
  description:
    "Comprehensive smartphone repair solutions: Screen replacement, battery swaps, charging port repairs, software solutions, IC/PCB micro-soldering, and water damage recovery. Tap Call Now for assistance.",
};

export default function ServicesPage() {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Smartphone": return <Smartphone className="w-6 h-6" />;
      case "Battery": return <Battery className="w-6 h-6" />;
      case "Zap": return <Zap className="w-6 h-6" />;
      case "Cpu": return <Cpu className="w-6 h-6" />;
      case "Droplets": return <Droplets className="w-6 h-6" />;
      case "Wrench": return <Wrench className="w-6 h-6" />;
      case "Volume2": return <Volume2 className="w-6 h-6" />;
      case "Camera": return <Camera className="w-6 h-6" />;
      default: return <Wrench className="w-6 h-6" />;
    }
  };

  return (
    <main className="min-h-screen bg-surface-canvas text-on-surface pb-24 lg:pb-0">
      <Navbar />

      {/* Hero Header */}
      <section className="pt-28 pb-12 sm:pt-36 sm:pb-16 bg-surface-canvas border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        {/* Prominent Back Navigation Button */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 text-left">
          <BackButton />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Complete Repair Catalog</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Mobile Hardware &amp; <span className="metallic-gold-text">Chip-Level Services</span>
          </h1>

          <p className="text-sm sm:text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            From outer display glass restoration to complex microscopic IC soldering. We diagnose accurately and use tested quality replacement components.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/book-repair"
              className="btn-gold px-5 py-2.5 text-xs sm:text-sm font-bold shadow-md"
            >
              <Calendar className="w-4 h-4 mr-1.5" />
              <span>Book a Diagnostic</span>
            </Link>

            <a
              href={BUSINESS_CONFIG.phoneTel}
              className="btn-ghost px-5 py-2.5 text-xs sm:text-sm font-mono font-semibold"
            >
              <Phone className="w-4 h-4 text-primary mr-1.5" />
              <span>Direct Call: {BUSINESS_CONFIG.phoneRaw}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Detailed Services Catalog */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {SERVICES_LIST.map((srv, idx) => {
            const isEven = idx % 2 === 0;
            const whatsappUrl = `https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(
              `Hello Denish Mobile Repairing, I would like service details for ${srv.title}.`
            )}`;

            return (
              <div
                key={srv.id}
                id={srv.id}
                className="scroll-mt-28 p-6 sm:p-8 rounded-2xl bg-surface-container border border-white/10 shadow-md"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Service Text Details (7 cols) */}
                  <div className={`space-y-4 ${isEven ? "lg:col-span-7" : "lg:col-span-7 lg:order-2"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shadow-sm ${srv.glowColor}`}>
                        {getIcon(srv.iconName)}
                      </div>
                      <div>
                        <span className="font-label-badge text-[10px] text-secondary font-mono uppercase bg-surface-container-high px-2 py-0.5 rounded">
                          {srv.badge}
                        </span>
                        <h2 className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface mt-0.5">
                          {srv.title}
                        </h2>
                      </div>
                    </div>

                    <p className="text-sm text-on-surface leading-relaxed font-medium">
                      {srv.shortDesc}
                    </p>

                    <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                      {srv.fullDesc}
                    </p>

                    {/* Symptoms Checklist */}
                    <div className="p-4 rounded-xl bg-surface-container-lowest border border-white/5 space-y-2">
                      <span className="font-label-badge text-[10px] text-primary uppercase font-mono font-bold block">
                        Common Identifiers &amp; Symptoms
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {srv.symptoms.map((sym, sIdx) => (
                          <div key={sIdx} className="flex items-start gap-2 text-xs text-on-surface-variant">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                            <span>{sym}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Turnaround Guideline */}
                    <div className="text-xs text-on-surface-variant font-mono">
                      Guideline: <span className="text-on-surface">{srv.turnaroundNote}</span>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Link
                        href={`/book-repair?issue=${encodeURIComponent(srv.title)}`}
                        className="btn-gold px-5 py-2.5 text-xs font-bold"
                      >
                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        <span>Book This Service</span>
                      </Link>

                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-whatsapp px-5 py-2.5 text-xs font-bold"
                      >
                        <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                        <span>WhatsApp Enquiry</span>
                      </a>
                    </div>
                  </div>

                  {/* Interactive Simulation Frame (5 cols) */}
                  <div className={`space-y-2 ${isEven ? "lg:col-span-5" : "lg:col-span-5 lg:order-1"}`}>
                    <div className="p-3 rounded-xl bg-surface-container-lowest border border-white/10 shadow-inner">
                      <div className="flex items-center justify-between mb-2 px-1">
                        <span className="font-label-badge text-[10px] text-secondary font-mono uppercase">
                          Simulation Preview
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                      </div>
                      <ServiceSimulations serviceId={srv.id} />
                    </div>
                    <span className="text-[10px] text-on-surface-variant font-mono block text-center">
                      Interactive benchmark canvas for {srv.title}
                    </span>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-12 bg-surface-container border-t border-white/5 text-center px-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface">
            Not sure what is wrong with your phone?
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Bring your phone in or send symptoms via WhatsApp. We will perform a careful diagnostic check and guide you on the best repair path.
          </p>
          <div className="flex justify-center gap-3 pt-1">
            <Link href="/book-repair" className="btn-gold px-6 py-3 text-xs sm:text-sm font-bold">
              <span>Start Online Diagnostic Request</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <MobileStickyBar />
    </main>
  );
}
