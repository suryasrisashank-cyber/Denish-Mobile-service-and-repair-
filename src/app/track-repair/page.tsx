"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileStickyBar from "@/components/MobileStickyBar";
import BackButton from "@/components/BackButton";
import { BUSINESS_CONFIG } from "@/data/repairData";
import {
  Activity,
  Search,
  MessageCircle,
  Phone,
  AlertCircle,
  ArrowRight
} from "lucide-react";

export default function TrackRepairPage() {
  const [referenceId, setReferenceId] = useState("");
  const [hasQueried, setHasQueried] = useState(false);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (referenceId.trim().length >= 4) {
      setHasQueried(true);
    }
  };

  const cleanRef = referenceId.trim().toUpperCase();
  const whatsappStatusUrl = `https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    `Hello Denish Mobile Repairing, please provide a status update for my repair Reference ID: ${cleanRef || "[ENTER_ID]"}.`
  )}`;

  const workflowStages = [
    {
      step: "01",
      title: "Intake & Assessment",
      desc: "Device received at workshop, initial symptoms examined, and component requirements identified.",
    },
    {
      step: "02",
      title: "Component Preparation",
      desc: "Replacement parts inspected and prepared for installation.",
    },
    {
      step: "03",
      title: "Technical Repair",
      desc: "Screen fitting, battery swap, port replacement, or micro-soldering performed under bench magnification.",
    },
    {
      step: "04",
      title: "Testing & Handover",
      desc: "Multi-point diagnostic test (display, touch, audio, charging) before return to customer.",
    },
  ];

  return (
    <main className="min-h-screen bg-surface-canvas text-on-surface pb-24 lg:pb-0">
      <Navbar />

      {/* Hero Header */}
      <section className="pt-28 pb-12 sm:pt-36 sm:pb-16 bg-surface-canvas border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

        {/* Universal Back Button */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 text-left">
          <BackButton />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Telemetry Portal • Preview Mode</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Repair Status &amp; <span className="metallic-gold-text">Telemetry</span>
          </h1>

          <p className="text-sm sm:text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Check the progress of your repair. Enter your ticket Reference ID below to initiate a live status verification with our technician.
          </p>
        </div>
      </section>

      {/* Lookup Card Section */}
      <section className="py-12 sm:py-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Dedicated Live Tracking Portal Announcement */}
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <span className="font-bold text-amber-600 dark:text-amber-400 block text-xs uppercase tracking-wider">
                Live Customer Tracking Portal Available
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Track your device stage progression, inspection report, and pickup readiness.
              </p>
            </div>
          </div>
          <Link
            href="/track"
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg shrink-0 flex items-center gap-1 shadow-xs"
          >
            <span>Open Tracker</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Preview Disclosure Badge */}
        <div className="mb-6 p-4 rounded-xl bg-surface-container border border-white/10 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-on-surface-variant leading-relaxed">
            <span className="font-semibold text-on-surface block">
              Portal Status: Preview Mode
            </span>
            <p>
              To maintain live accuracy without fabricated automated statuses, real-time ticket progress is verified directly by our workshop team. Enter your Reference ID below to connect via WhatsApp for an immediate update.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <div className="p-6 sm:p-8 rounded-2xl bg-surface-container border border-white/10 shadow-md">
          <form onSubmit={handleLookup} className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-label-badge text-xs text-on-surface-variant uppercase font-semibold">
                Repair Reference ID
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={referenceId}
                  onChange={(e) => {
                    setReferenceId(e.target.value);
                    setHasQueried(false);
                  }}
                  placeholder="e.g. DMR-261110-4821"
                  className="w-full h-12 pl-10 pr-4 rounded-lg bg-surface-container-lowest border border-white/10 text-on-surface placeholder:text-outline text-sm focus:outline-none focus:border-secondary transition-colors font-mono uppercase"
                />
              </div>
              <span className="text-[11px] text-on-surface-variant block">
                Your Reference ID was provided when submitting an enquiry or dropping off your phone.
              </span>
            </div>

            <button
              type="submit"
              className="btn-gold w-full h-12 text-xs sm:text-sm font-bold shadow-md"
            >
              <Activity className="w-4 h-4 mr-1.5" />
              <span>Verify Reference ID</span>
            </button>
          </form>

          {/* Lookup Result Modal/Panel */}
          {hasQueried && (
            <div className="mt-6 p-5 rounded-xl bg-surface-container-lowest border border-secondary/30 space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <span className="font-label-badge text-[10px] text-secondary uppercase font-mono block">
                    Ticket Reference
                  </span>
                  <span className="font-mono text-base font-bold text-on-surface">
                    {cleanRef}
                  </span>
                </div>
                <span className="font-label-badge text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded font-mono">
                  Active in System
                </span>
              </div>

              <div className="space-y-2 text-xs text-on-surface-variant leading-relaxed">
                <p>
                  To receive the exact diagnostic stage, turnaround estimate, and component update for ticket <strong>{cleanRef}</strong>, connect directly with our bench technician:
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                <a
                  href={whatsappStatusUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp w-full sm:w-auto px-5 py-2.5 text-xs font-bold"
                >
                  <MessageCircle className="w-4 h-4 mr-1.5" />
                  <span>Request Live Status on WhatsApp</span>
                </a>

                <a
                  href={BUSINESS_CONFIG.phoneTel}
                  className="btn-ghost w-full sm:w-auto px-5 py-2.5 text-xs font-mono font-semibold"
                >
                  <Phone className="w-3.5 h-3.5 text-primary mr-1.5" />
                  <span>Call: {BUSINESS_CONFIG.phoneRaw}</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Workflow Progression Roadmap */}
        <div className="mt-12 space-y-6">
          <div className="text-center sm:text-left">
            <span className="font-label-badge text-xs text-primary font-mono uppercase font-semibold">
              Repair Lifecycle
            </span>
            <h2 className="font-headline-md text-xl font-bold text-on-surface mt-1">
              Standard 4-Stage Service Roadmap
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Every device logged with a Reference ID moves through these systematic quality stages.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {workflowStages.map((st) => (
              <div
                key={st.step}
                className="p-4 rounded-xl bg-surface-container border border-white/5 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-label-mono text-xs font-bold text-secondary">
                    STAGE {st.step}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-secondary/50" />
                </div>
                <h3 className="font-title-md text-sm font-bold text-on-surface">
                  {st.title}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Need to Book First? */}
        <div className="mt-10 p-5 rounded-xl bg-surface-container border border-white/10 text-center space-y-2">
          <span className="text-xs text-on-surface-variant block">
            Don&apos;t have a Reference ID yet?
          </span>
          <Link
            href="/book-repair"
            className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1"
          >
            <span>Submit a repair enquiry to generate a ticket</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </section>

      <Footer />
      <MobileStickyBar />
    </main>
  );
}
