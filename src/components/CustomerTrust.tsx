"use client";

import React from "react";
import { BUSINESS_CONFIG, APPROVED_TESTIMONIALS } from "@/data/repairData";
import ScrollReveal from "./ScrollReveal";

export default function CustomerTrust() {
  const hasApprovedTestimonials = APPROVED_TESTIMONIALS && APPROVED_TESTIMONIALS.length > 0;

  return (
    <section id="reviews" className="py-space-xl bg-surface border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin-lg">
        
        {/* Section Header */}
        <ScrollReveal className="text-center max-w-3xl mx-auto space-y-3 mb-space-lg" direction="up">
          <div className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-high border border-white/10 text-primary font-label-sm text-label-sm uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Client Feedback &amp; Integrity</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg font-extrabold text-on-surface uppercase tracking-tight">
            Authentic Service, <span className="text-secondary">Direct Feedback</span>
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            We uphold complete transparency. We do not publish simulated reviews; authentic client experiences will appear here once approved by the business owner.
          </p>
        </ScrollReveal>

        {hasApprovedTestimonials ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mb-space-lg">
            {APPROVED_TESTIMONIALS.map((t) => (
              <div
                key={t.id}
                className="p-space-lg rounded-2xl bg-surface-container-low border border-white/5 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1 text-primary">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-[18px]">
                        star
                      </span>
                    ))}
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant italic">
                    &ldquo;{t.comment}&rdquo;
                  </p>
                </div>
                <div className="pt-space-sm mt-space-sm border-t border-white/5 flex items-center justify-between">
                  <div>
                    <span className="font-title-md text-title-md text-on-surface block">
                      {t.customerName}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {t.deviceModel} • {t.repairService}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-space-xl rounded-2xl bg-surface-container-low border border-white/5 text-center max-w-2xl mx-auto space-y-space-md shadow-md">
            <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center mx-auto text-primary">
              <span className="material-symbols-outlined text-[24px]">rate_review</span>
            </div>
            <div className="space-y-1.5">
              <h3 className="font-title-md text-title-md text-on-surface">
                Real Customer Reviews Policy
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                To guarantee absolute authenticity, we only display feedback directly provided by verified clients. If you have recently visited our Gandhinagar workshop, we welcome your feedback via WhatsApp!
              </p>
            </div>
            <a
              href={BUSINESS_CONFIG.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-space-xs px-space-lg h-12 rounded-xl bg-secondary-container text-on-secondary-container font-label-lg text-label-lg hover:opacity-95 transition-opacity"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              <span>Share Your Repair Experience</span>
            </a>
          </div>
        )}

      </div>
    </section>
  );
}
