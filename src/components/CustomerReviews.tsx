"use client";

import React from "react";
import { MessageSquare, ShieldCheck, HeartHandshake } from "lucide-react";
import { BUSINESS_CONFIG } from "@/data/repairData";

export default function CustomerReviews() {
  const whatsappReviewUrl = `https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    "Hello Denish Mobile Repairing, I would like to submit my feedback regarding my recent smartphone repair service."
  )}`;

  return (
    <section id="reviews" className="py-12 sm:py-20 bg-[var(--bg-card)]/80 backdrop-blur-xs border-y border-[var(--border-color)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#126FE5]/10 text-[#126FE5] text-xs font-bold uppercase tracking-wider mb-2">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Customer Feedback</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
            Customer Reviews
          </h2>
          <p className="text-xs sm:text-base text-[var(--text-muted)] mt-1.5 sm:mt-2 font-medium">
            Real experiences from smartphone owners who trust our technical workmanship.
          </p>
        </div>

        {/* Transparent Authentic Review Notice Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[var(--bg-page)]/90 backdrop-blur-md border border-[var(--border-color)] text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-[#126FE5]/10 text-[#126FE5] flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6 text-[#126FE5]" />
          </div>

          <div className="space-y-1.5 max-w-lg mx-auto">
            <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
              Authentic &amp; Direct Feedback Only
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-medium">
              We uphold strict ethical standards: we never publish fabricated ratings or artificial customer reviews. Verified customer feedback will be showcased here directly from real repairs.
            </p>
          </div>

          <div className="pt-2">
            <p className="text-xs font-bold text-[var(--text-primary)] mb-3">
              Did our technician service your phone recently? Share your experience with us!
            </p>
            <a
              href={whatsappReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 h-11 rounded-lg bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Share Review on WhatsApp</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}