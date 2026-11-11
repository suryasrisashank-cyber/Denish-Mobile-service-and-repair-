"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle, MessageCircle } from "lucide-react";
import { FAQS, BUSINESS_CONFIG } from "@/data/repairData";

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-14 sm:py-20 bg-[var(--bg-card)]/80 backdrop-blur-xs relative border-y border-[var(--border-color)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#126FE5]/10 text-[#126FE5] text-xs font-bold uppercase tracking-wider mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Common Questions</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)] mt-2 font-medium">
            Clear guidelines on turnaround, data safety, replacement parts, and diagnostic assessments.
          </p>
        </div>

        {/* Compact Clean Accordion */}
        <div className="space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-xl bg-[var(--bg-page)]/90 backdrop-blur-md border border-[var(--border-color)] overflow-hidden transition-all duration-200 shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-[var(--border-color)]/20 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                    {faq.question}
                  </span>
                  <div className="text-[var(--text-muted)] shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4 text-[#126FE5]" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[var(--text-muted)] font-medium leading-relaxed border-t border-[var(--border-color)]">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Questions Banner */}
        <div className="mt-8 p-4 sm:p-5 rounded-xl bg-[var(--bg-page)]/90 backdrop-blur-md border border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-xs">
          <div>
            <span className="text-sm font-bold text-[var(--text-primary)] block">
              Have a specific question about your phone?
            </span>
            <span className="text-xs text-[var(--text-muted)] font-medium">
              Message our technician on WhatsApp or call us directly.
            </span>
          </div>

          <a
            href={BUSINESS_CONFIG.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 h-9 rounded-md bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-bold transition-colors shrink-0 shadow-xs"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Ask on WhatsApp</span>
          </a>
        </div>

      </div>
    </section>
  );
}