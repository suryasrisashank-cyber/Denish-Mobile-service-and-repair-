"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileStickyBar from "@/components/MobileStickyBar";
import EnquiryForm from "@/components/EnquiryForm";
import BackButton from "@/components/BackButton";
import { Wrench, ShieldCheck } from "lucide-react";

function BookingContent() {
  const searchParams = useSearchParams();
  const issueParam = searchParams.get("issue") || "";

  return (
    <div className="pt-24 sm:pt-32">
      {/* Top Prominent Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <BackButton />
      </div>

      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold uppercase tracking-wider">
          <Wrench className="w-3.5 h-3.5 text-amber-400" />
          <span>Priority Repair Desk</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
          Book a <span className="metallic-gold-text">Diagnostic &amp; Repair</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Submit your smartphone details below to generate an official Reference ID. Our technician will review component options and schedule your service.
        </p>
      </div>

      {/* Main Interactive Form */}
      <EnquiryForm initialIssue={issueParam} isStandalonePage={true} />

      {/* Process & Appointment Transparency Notice */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="p-5 rounded-xl bg-surface-container border border-white/10 space-y-3">
          <span className="font-label-badge text-xs text-primary font-mono uppercase font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Appointment &amp; Service Transparency</span>
          </span>
          <div className="space-y-1.5 text-xs text-on-surface-variant leading-relaxed">
            <p>
              • <strong>Enquiry Registration:</strong> Submitting this form creates a ticket reference ID (e.g. <code>DMR-XXXXXX-XXXX</code>) and logs your device symptoms.
            </p>
            <p>
              • <strong>Scheduling Confirmation:</strong> Because part availability varies by specific phone model, an online submission is an initial diagnostic request and is confirmed once our technician connects with you.
            </p>
            <p>
              • <strong>Walk-Ins:</strong> Need emergency service? Tap <strong>Call Now</strong> or visit our workshop.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookRepairPage() {
  return (
    <main className="min-h-screen bg-surface-canvas text-on-surface pb-24 lg:pb-0">
      <Navbar />
      <Suspense
        fallback={
          <div className="min-h-[60vh] flex items-center justify-center pt-32">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <BookingContent />
      </Suspense>
      <Footer />
      <MobileStickyBar />
    </main>
  );
}
