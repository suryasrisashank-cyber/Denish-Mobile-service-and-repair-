import React from 'react';
import { Phone, MessageCircle, Clock, ShieldCheck, Heart } from 'lucide-react';
import { BUSINESS_INFO } from '../data/constants';

interface FooterProps {
  onNavClick: (tab: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick, onOpenAdmin }) => {
  return (
    <footer className="w-full bg-slate-100/90 dark:bg-[#0c131a] border-t border-slate-200/90 dark:border-slate-800/80 pt-16 pb-28 md:pb-16 text-slate-600 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <img
                src="/assets/aistudio/1794372520460_a1d82598.png"
                alt="DENISH Logo"
                className="w-10 h-10 object-contain"
              />
              <div>
                <span className="font-extrabold text-lg text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                  {BUSINESS_INFO.name}
                </span>
                <span className="block text-xs text-amber-600 dark:text-amber-400 font-semibold">
                  {BUSINESS_INFO.tagline}
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
              Authorized-grade hardware laboratory delivering authentic AMOLED screens, OEM lithium batteries, logic board micro-soldering, and emergency data retrieval for all flagship smartphones.
            </p>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>{BUSINESS_INFO.warranty}</span>
              </span>
              <span>·</span>
              <span className="text-amber-600 dark:text-amber-400">
                Fix Today • Use Tomorrow
              </span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavClick('home')}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Home Showcase
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('services')}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  8 Core Repair Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('estimator')}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Interactive Price Estimator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('book')}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Book a Repair
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('track')}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Track Order by Mobile
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                >
                  Workshop Admin Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Hotline Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Workshop Contact
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400">Master Hotline:</span>
                <a
                  href={`tel:${BUSINESS_INFO.phone}`}
                  className="block font-bold text-slate-900 dark:text-white hover:text-amber-500 text-sm mt-0.5 tabular-nums"
                >
                  {BUSINESS_INFO.formattedPhone}
                </a>
              </div>
              <div>
                <span className="text-slate-400">Working Hours:</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  10:00 AM – 9:00 PM
                </div>
                <div className="text-[11px] text-slate-400">Monday to Sunday (Open 7 Days)</div>
              </div>
              <div className="pt-1">
                <a
                  href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hello%20Denish%20Mobile`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-500">
          <div>
            © {new Date().getFullYear()} {BUSINESS_INFO.fullTitle}. All rights reserved.
          </div>
          <div className="flex items-center gap-2">
            <span>Official Workshop Portal</span>
            <span>·</span>
            <span>{BUSINESS_INFO.tagline}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
