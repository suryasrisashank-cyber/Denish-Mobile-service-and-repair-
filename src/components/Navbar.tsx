"use client";

import React, { useState } from 'react';
import { 
  Phone, 
  MessageCircle, 
  Sun, 
  Moon, 
  Laptop, 
  Menu, 
  X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { BUSINESS_INFO } from '../data/constants';

interface NavbarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab = "home", setActiveTab }) => {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tabId: string) => {
    if (typeof setActiveTab === "function") setActiveTab(tabId);
    setMobileMenuOpen(false);
    
    // Smooth scroll to target section if on home
    const el = document.getElementById(tabId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#101820]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      {/* Top Announcement Bar */}
      <div className="w-full bg-[#101c2c] text-white py-1.5 px-4 text-xs font-medium border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-400" />
            <span className="tracking-wide text-slate-200">
              Workshop Open Today: <strong className="text-white">{BUSINESS_INFO.hours}</strong>
            </span>
            <span className="hidden md:inline text-slate-600">·</span>
            <span className="hidden md:inline text-amber-400 font-medium">
              {BUSINESS_INFO.guarantee}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <a 
              href={`tel:${BUSINESS_INFO.phone}`} 
              className="flex items-center gap-1.5 text-slate-200 hover:text-amber-300 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>Direct: {BUSINESS_INFO.formattedPhone}</span>
            </a>
            <span className="text-slate-600 hidden sm:inline">·</span>
            <a 
              href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hello%20Denish%20Mobile%2C%20I%20have%20an%20enquiry%20regarding%20mobile%20repair`}
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp Chat</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6">
        {/* Brand Zone */}
        <button 
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 text-left group focus:outline-none"
        >
          <img 
            src="/assets/denish-logo-icon.png" 
            alt="DENISH Mobile Repairing and Service Logo" 
            className="w-11 h-11 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
          />
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                DENISH
              </span>
              <span className="hidden sm:inline text-xs font-semibold text-amber-600 dark:text-amber-400">
                REPAIR
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5 whitespace-nowrap">
              {BUSINESS_INFO.tagline}
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-1 xl:gap-2">
          <button
            onClick={() => handleNavClick('home')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'home'
                ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('services')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'services'
                ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            Services
          </button>
          <button
            onClick={() => handleNavClick('estimator')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'estimator'
                ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            Service Enquiry
          </button>
          <button
            onClick={() => handleNavClick('book')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'book'
                ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            Book Repair
          </button>
          <button
            onClick={() => handleNavClick('track')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'track'
                ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            Track Order
          </button>
          <button
            onClick={() => handleNavClick('contact')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'contact'
                ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            Contact
          </button>
        </nav>

        {/* Right Action Controls: 3-Way Theme Switcher + Call Hotline */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Switcher Segmented Control */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-400">
            <button
              type="button"
              onClick={() => setTheme('light')}
              title="Light Mode"
              className={`p-1.5 rounded-md transition-all ${
                theme === 'light'
                  ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-xs'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              title="Dark Mode"
              className={`p-1.5 rounded-md transition-all ${
                theme === 'dark'
                  ? 'bg-white dark:bg-slate-700 text-sky-400 shadow-xs'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Moon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setTheme('system')}
              title="System Preference"
              className={`p-1.5 rounded-md transition-all ${
                theme === 'system'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Laptop className="w-4 h-4" />
            </button>
          </div>

          {/* Master Hotline Pill */}
          <a
            href={`tel:${BUSINESS_INFO.phone}`}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#101c2c] dark:bg-[#173b59] hover:bg-[#173b59] dark:hover:bg-[#1e4a6f] text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span className="whitespace-nowrap">Call: {BUSINESS_INFO.phone}</span>
          </a>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/98 dark:bg-[#101820]/98 border-b border-slate-200 dark:border-slate-800 px-4 py-4 space-y-1 shadow-lg transition-all animate-in slide-in-from-top-2">
          <button
            onClick={() => handleNavClick('home')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('services')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Repair Services
          </button>
          <button
            onClick={() => handleNavClick('estimator')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Service Enquiry
          </button>
          <button
            onClick={() => handleNavClick('book')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Book a Repair
          </button>
          <button
            onClick={() => handleNavClick('track')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Track My Order
          </button>
          <button
            onClick={() => handleNavClick('contact')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Workshop & Timings
          </button>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            <a
              href={`tel:${BUSINESS_INFO.phone}`}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#101c2c] dark:bg-[#173b59] text-white text-sm font-semibold"
            >
              <Phone className="w-4 h-4 text-amber-400" />
              <span>Call Technician ({BUSINESS_INFO.phone})</span>
            </a>
            <a
              href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hello%20Denish%20Mobile%2C%20I%20need%20quick%20assistance`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Quick Help</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
