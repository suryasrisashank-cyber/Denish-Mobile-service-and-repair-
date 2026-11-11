"use client";

import React from 'react';
import { 
  Wrench, 
  MessageCircle, 
  Phone, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Microscope,
  ArrowRight
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/constants';

interface HeroSectionProps {
  onBookClick: () => void;
  onEstimatorClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onBookClick, onEstimatorClick }) => {
  return (
    <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Value Proposition & CTAs */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            {/* Editorial Kicker */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="text-sky-600 dark:text-sky-400 font-bold tracking-wider uppercase">
                DENISH CERTIFIED LAB
              </span>
              <span aria-hidden="true">·</span>
              <span>Micro-Soldering & Display Workstation</span>
            </div>

            {/* Slogan & Main Display Headline */}
            <div className="space-y-3">
              <div className="flex items-baseline flex-wrap gap-x-3 text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                <span>Your Mobile,</span>
                <span className="text-amber-500 dark:text-amber-400 italic">
                  Our Care.
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                All Mobile Problems <span className="text-sky-600 dark:text-sky-400">| One Solution.</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                Authorized-grade diagnostic bench, authentic AMOLED display lamination, battery health restoration, and precision micro-soldering for iPhone, Samsung, OnePlus, and all Android flagships.
              </p>
            </div>

            {/* Trust Mini Proof Matrix */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 backdrop-blur-sm shadow-xs">
                <div className="text-sky-600 dark:text-sky-400 text-sm font-bold flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>100% Genuine</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  OEM Grade Spares
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 backdrop-blur-sm shadow-xs">
                <div className="text-amber-600 dark:text-amber-400 text-sm font-bold flex items-center gap-1.5 mb-1">
                  <Zap className="w-4 h-4" />
                  <span>Express Fix</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Same-Day Pickup
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 backdrop-blur-sm shadow-xs">
                <div className="text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Tested Parts</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  ESD-Safe Bench
                </div>
              </div>
            </div>

            {/* Action Buttons & Hotline Pill */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onBookClick}
                className="px-6 py-3.5 rounded-xl bg-[#101c2c] dark:bg-[#173b59] hover:bg-[#173b59] dark:hover:bg-[#1e4a6f] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95"
              >
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>Book a Repair</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                type="button"
                onClick={onEstimatorClick}
                className="px-5 py-3.5 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-sm shadow-xs transition-all flex items-center gap-2 active:scale-95"
              >
                <span>Service Enquiry</span>
              </button>

              <a
                href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hello%20Denish%20Mobile%20Repairing%2C%20I%20have%20a%20repair%20enquiry%20for%20my%20phone`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-all flex items-center gap-2 active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Direct Master Hotline Pill */}
            <div className="pt-1 flex items-center gap-3">
              <a
                href={`tel:${BUSINESS_INFO.phone}`}
                className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-slate-800 dark:text-slate-100 hover:border-amber-400 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400">
                    Direct Technician Desk
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">
                    +91 {BUSINESS_INFO.phone}
                  </span>
                </div>
              </a>
              <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
                Shop Timings: 9:00 AM – 9:00 PM
              </span>
            </div>
          </div>

          {/* Right Column: Lab Showcase Device Visual */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Visual Frame */}
            <div className="relative w-full rounded-2xl p-2 bg-gradient-to-b from-slate-200/60 to-slate-300/40 dark:from-slate-800/80 dark:to-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
              <div className="relative w-full h-[360px] sm:h-[420px] rounded-xl overflow-hidden bg-slate-950">
                <img
                  src="/assets/aistudio/IMG_20261109_185606_267_4219b34c.jpg"
                  alt="DENISH Mobile Repairing & Service Poster with smartphones and technician equipment"
                  className="w-full h-full object-cover object-center transform hover:scale-102 transition-transform duration-700"
                />

                {/* Overlaid Badges */}
                <div className="absolute top-3 left-3 bg-slate-900/90 text-white backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 shadow-md flex items-center gap-2">
                  <Microscope className="w-4 h-4 text-amber-400" />
                  <div className="text-left">
                    <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Diagnosis</div>
                    <div className="text-xs font-bold text-white">45x Optical Zoom Lab</div>
                  </div>
                </div>

                <div className="absolute bottom-3 right-3 bg-slate-900/90 text-white backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 shadow-md flex items-center gap-2">
                  <Zap className="w-4 h-4 text-sky-400" />
                  <div className="text-left">
                    <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Speed</div>
                    <div className="text-xs font-bold text-white">45 Min Turnaround</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
