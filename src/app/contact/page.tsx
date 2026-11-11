import React from "react";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileStickyBar from "@/components/MobileStickyBar";
import LocationMap from "@/components/LocationMap";
import BackButton from "@/components/BackButton";
import { BUSINESS_CONFIG } from "@/data/repairData";
import { Phone, MessageCircle, ExternalLink, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact & Workshop Location | DENISH MOBILE REPAIR",
  description:
    "Contact DENISH MOBILE REPAIRING AND SERVICE in Gujarat. Tap Call Now, message on WhatsApp, or visit our workshop for smartphone repair diagnostics.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-surface-canvas text-on-surface pb-24 lg:pb-0">
      <Navbar />

      {/* Hero Header */}
      <section className="pt-28 pb-12 sm:pt-36 sm:pb-16 bg-surface-canvas border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-1/3 w-[500px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        {/* Universal Back Button */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 text-left">
          <BackButton />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Direct Support Desk</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Contact &amp; <span className="metallic-gold-text">Workshop Location</span>
          </h1>

          <p className="font-headline-sm text-base sm:text-lg text-primary font-bold italic">
            &ldquo;{BUSINESS_CONFIG.tagline}&rdquo;
          </p>

          <p className="text-sm sm:text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Need an urgent repair or have questions about your phone? Call our direct hotline, connect via WhatsApp, or visit our workshop in person.
          </p>

          {/* Quick Contact Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href={BUSINESS_CONFIG.phoneTel}
              className="btn-gold px-6 py-3 text-xs sm:text-sm font-bold shadow-md"
            >
              <Phone className="w-4 h-4 mr-2" />
              <span>Call Now</span>
            </a>

            <a
              href={BUSINESS_CONFIG.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp px-6 py-3 text-xs sm:text-sm font-bold shadow-md"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              <span>WhatsApp Chat</span>
            </a>
          </div>
        </div>
      </section>

      {/* Embedded Location & Callback Section */}
      <LocationMap />

      {/* Google Maps Embed Section */}
      <section className="py-12 bg-surface max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-2xl bg-surface-container border border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-label-badge text-xs text-secondary font-mono uppercase font-semibold">
                Interactive Navigation
              </span>
              <h2 className="font-headline-md text-xl font-bold text-on-surface mt-0.5">
                Google Maps Route Pin
              </h2>
            </div>

            <a
              href={BUSINESS_CONFIG.googleMapsDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost px-4 py-2 text-xs font-semibold self-start sm:self-auto"
            >
              <span>Open in Google Maps App</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1.5 text-primary" />
            </a>
          </div>

          <div className="w-full h-80 sm:h-96 rounded-xl overflow-hidden border border-white/10 shadow-inner bg-surface-container-lowest relative">
            <iframe
              src={BUSINESS_CONFIG.googleMapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="DENISH MOBILE REPAIRING workshop location map"
              className="w-full h-full filter contrast-125 brightness-90"
            />
          </div>
        </div>
      </section>

      <Footer />
      <MobileStickyBar />
    </main>
  );
}
