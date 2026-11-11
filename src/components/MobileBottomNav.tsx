"use client";

import React from 'react';
import { Home, Wrench, MessageCircle, Search, CalendarPlus } from 'lucide-react';
import { BUSINESS_INFO } from '../data/constants';

interface MobileBottomNavProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab = "home", setActiveTab }) => {
  const handleTabClick = (tabId: string) => {
    if (typeof setActiveTab === "function") setActiveTab(tabId);
    const el = document.getElementById(tabId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#101820]/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800 px-3 py-1 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)] h-15"
    >
      <button
        type="button"
        onClick={() => handleTabClick('home')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 transition-colors ${
          activeTab === 'home'
            ? 'text-sky-600 dark:text-sky-400'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-medium tracking-tight mt-0.5">Home</span>
      </button>

      <button
        type="button"
        onClick={() => handleTabClick('services')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 transition-colors ${
          activeTab === 'services'
            ? 'text-sky-600 dark:text-sky-400'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
        }`}
      >
        <Wrench className="w-5 h-5" />
        <span className="text-[10px] font-medium tracking-tight mt-0.5">Services</span>
      </button>

      {/* Center WhatsApp Quick Action */}
      <div className="relative -top-3">
        <a
          href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hello%20Denish%20Mobile%2C%20I%20need%20quick%20repair%20help`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="w-12 h-12 rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center active:scale-90 transition-transform"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
      </div>

      <button
        type="button"
        onClick={() => handleTabClick('track')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 transition-colors ${
          activeTab === 'track'
            ? 'text-sky-600 dark:text-sky-400'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
        }`}
      >
        <Search className="w-5 h-5" />
        <span className="text-[10px] font-medium tracking-tight mt-0.5">Track</span>
      </button>

      <button
        type="button"
        onClick={() => handleTabClick('book')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 transition-colors ${
          activeTab === 'book'
            ? 'text-sky-600 dark:text-sky-400'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
        }`}
      >
        <CalendarPlus className="w-5 h-5" />
        <span className="text-[10px] font-medium tracking-tight mt-0.5">Book</span>
      </button>
    </nav>
  );
};

export default MobileBottomNav;
