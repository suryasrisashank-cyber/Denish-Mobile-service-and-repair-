import React from 'react';
import { Microscope, Flame, Zap, Shield, Sparkles, MessageCircle } from 'lucide-react';
import { BUSINESS_INFO } from '../data/constants';

export const LabShowcase: React.FC = () => {
  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Visual Media with ESD Badge */}
          <div className="lg:col-span-6 relative">
            <div className="w-full h-80 sm:h-96 rounded-3xl overflow-hidden shadow-lg border border-slate-200/90 dark:border-slate-800 bg-slate-900">
              <img
                src="/assets/aistudio/IMG_20261109_185606_267_4219b34c.jpg"
                alt="Denish Lab High Precision Micro-Soldering Workstation"
                className="w-full h-full object-cover object-bottom"
              />
            </div>

            {/* Floating ESD Badge */}
            <div className="absolute -bottom-6 -right-4 sm:right-6 hidden sm:flex flex-col p-4 rounded-2xl bg-[#101c2c] text-white border border-slate-700 shadow-xl max-w-xs">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" />
                <span>ESD Protected Lab</span>
              </div>
              <div className="text-sm font-bold mt-1">Anti-Static Calibration</div>
              <div className="text-[11px] text-slate-300 mt-1">
                Zero electrostatic discharge risk to delicate flash storage & CPU chips.
              </div>
            </div>
          </div>

          {/* Right Column: Description & Tooling Highlights */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Master Craftsmanship & Lab Standards
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                Industrial-Grade Tooling for Flawless Precision
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                We never cut corners with cheap heat guns or non-conductive adhesives. DENISH Mobile Repairing operates an authorized-level diagnostic workbench equipped with vacuum display laminators, programmable thermal preheaters, and optical zoom microscopes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
                <Microscope className="w-5 h-5 text-sky-500 mb-2" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Stereo Microscopes
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Up to 45x magnification for sub-millimeter 0.02mm motherboard jumper wiring.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
                <Flame className="w-5 h-5 text-amber-500 mb-2" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Precision Thermals
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Controlled hot air rework stations preventing thermal warping of multi-layer PCBs.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hello%20Denish%2C%20I%20have%20a%20complicated%20IC%20motherboard%20repair%20question`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Consult With Chip Specialist</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
