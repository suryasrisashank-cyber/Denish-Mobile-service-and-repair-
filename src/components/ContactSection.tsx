import React from 'react';
import { Phone, MessageCircle, Clock, MapPin, CheckCircle, Navigation, ShieldCheck } from 'lucide-react';
import { BUSINESS_INFO, DEVICE_BRANDS } from '../data/constants';

export const ContactSection: React.FC = () => {
  return (
    <section id="contact" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Info Card */}
          <div className="lg:col-span-7 p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-8">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Workshop & Walk-In Desk
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-['Plus_Jakarta_Sans']">
                    {BUSINESS_INFO.fullTitle}
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Open 7 Days A Week
                </span>
              </div>

              {/* Working Hours & Direct Hotline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <Clock className="w-4 h-4 text-sky-500" />
                    <span>Working Hours</span>
                  </div>
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {BUSINESS_INFO.days}
                  </div>
                  <div className="text-lg font-extrabold text-sky-600 dark:text-sky-400 tabular-nums">
                    {BUSINESS_INFO.hours}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Continuous workbench service without lunch break
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <Phone className="w-4 h-4 text-amber-500" />
                    <span>Technician Hotline</span>
                  </div>
                  <a
                    href={`tel:${BUSINESS_INFO.phone}`}
                    className="text-lg font-extrabold text-slate-900 dark:text-white hover:text-amber-500 transition-colors block tabular-nums"
                  >
                    {BUSINESS_INFO.formattedPhone}
                  </a>
                  <div className="text-[11px] text-slate-500">
                    Direct call or WhatsApp response
                  </div>
                </div>
              </div>

              {/* Supported Brands Grid */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                  Supported Smartphone Brands
                </div>
                <div className="flex flex-wrap gap-2">
                  {DEVICE_BRANDS.map((b) => (
                    <span
                      key={b.id}
                      className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300"
                    >
                      {b.label}
                    </span>
                  ))}
                  <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                    iPads & Tablets
                  </span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <a
                href={`tel:${BUSINESS_INFO.phone}`}
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-[#101c2c] dark:bg-[#173b59] hover:bg-[#173b59] dark:hover:bg-[#1e4a6f] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Call Hotline</span>
              </a>

              <a
                href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hello%20Denish%20Mobile%2C%20I%20would%20like%20to%20visit%20your%20workshop`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Directions</span>
              </a>
            </div>
          </div>

          {/* Workshop Showcase Card */}
          <div className="lg:col-span-5 rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="relative w-full h-64 sm:h-72 bg-slate-900 overflow-hidden">
              <img
                src="/assets/aistudio/IMG_20261109_185606_267_4219b34c.jpg"
                alt="DENISH Mobile Repairing Poster and Lab"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <div className="text-xs font-semibold text-amber-400 uppercase">
                  Central Diagnostic Hub
                </div>
                <div className="text-base font-bold">DENISH Workshop Lounge</div>
              </div>
            </div>

            <div className="p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400">
                <MapPin className="w-4 h-4" />
                <span>Walk-In Facility</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Centrally accessible workshop with dedicated client inspection counter, live repair display screens, and instant spare parts testing bench.
              </p>
              <div className="pt-2 flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Free Parking</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Air-Conditioned Waiting</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
