"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileStickyBar from "@/components/MobileStickyBar";
import { FAQS, BUSINESS_CONFIG } from "@/data/repairData";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Phone,
  Search
} from "lucide-react";

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = [
    { id: "all", name: "All Questions" },
    { id: "turnaround", name: "Turnaround & Timing" },
    { id: "privacy", name: "Data & Privacy" },
    { id: "quote", name: "Service Enquiries" },
    { id: "water", name: "Water Damage" },
    { id: "ic", name: "Motherboard & IC" },
    { id: "parts", name: "Parts & Quality" },
  ];

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className="min-h-screen bg-surface-canvas text-on-surface pb-24 lg:pb-0">
      <Navbar />

      {/* Hero Header */}
      <section className="pt-28 pb-12 sm:pt-36 sm:pb-16 bg-surface-canvas border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[500px] h-[300px] bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-white/10 text-primary text-xs font-mono font-semibold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-primary" />
            <span>Help &amp; Knowledge Base</span>
          </div>

          <h1 className="font-display-hero text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-on-surface">
            Frequently Asked <span className="text-primary">Questions</span>
          </h1>

          <p className="text-sm sm:text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Find answers to common questions about mobile diagnostics, component testing, turnaround guidelines, and data safety.
          </p>

          {/* Search Input */}
          <div className="max-w-md mx-auto pt-2">
            <div className="relative">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search question or keyword (e.g. data, screen, water)..."
                className="w-full h-11 pl-10 pr-4 rounded-lg bg-surface-container border border-white/10 text-on-surface placeholder:text-outline text-xs sm:text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main FAQ Content */}
      <section className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-6">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setOpenIndex(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-primary text-on-primary font-bold shadow-sm"
                    : "bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Accordion Questions */}
        {filteredFaqs.length > 0 ? (
          <div className="space-y-3">
            {filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-xl bg-surface-container border border-white/10 overflow-hidden transition-all duration-200 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(index)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-surface-container-high/50 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base font-bold text-on-surface tracking-wide">
                      {faq.question}
                    </span>
                    <div className="p-1.5 rounded-lg bg-surface-container-high border border-white/5 shrink-0 text-primary">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-on-surface-variant leading-relaxed border-t border-white/5 animate-in fade-in duration-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl bg-surface-container border border-white/10 space-y-2">
            <p className="text-sm font-semibold text-on-surface">No questions match your search.</p>
            <p className="text-xs text-on-surface-variant">Try searching for another keyword or reset the category filter.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="btn-ghost px-4 py-1.5 text-xs font-bold mt-2"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Contact Assistance Box */}
        <div className="mt-12 p-6 rounded-2xl bg-surface-container border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h3 className="font-title-md text-base font-bold text-on-surface">
              Didn&apos;t find what you need?
            </h3>
            <p className="text-xs text-on-surface-variant">
              Our workshop team can answer any specific question regarding your phone.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
            <a
              href={BUSINESS_CONFIG.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp px-4 py-2.5 text-xs font-bold"
            >
              <MessageCircle className="w-4 h-4 mr-1.5" />
              <span>Ask on WhatsApp</span>
            </a>

            <a
              href={BUSINESS_CONFIG.phoneTel}
              className="btn-ghost px-4 py-2.5 text-xs font-mono font-semibold"
            >
              <Phone className="w-3.5 h-3.5 text-primary mr-1.5" />
              <span>Call: {BUSINESS_CONFIG.phoneRaw}</span>
            </a>
          </div>
        </div>

      </section>

      <Footer />
      <MobileStickyBar />
    </main>
  );
}
