"use client";

import React from 'react';
import { ClipboardList, Microscope, ShieldCheck, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC<{ onBookClick?: () => void }> = ({ onBookClick }) => {
  void onBookClick;
  const steps = [
    {
      num: '01',
      title: 'Book or Walk-In',
      description: 'Select your brand, model, and symptoms online or call our technician desk at +91 8511668848. Walk-in customers receive immediate intake receipts and a unique Service ID.',
      badge: 'Free Diagnostic Check',
      icon: <ClipboardList className="w-6 h-6 text-sky-500" />
    },
    {
      num: '02',
      title: 'Microscope Diagnostic & Fix',
      description: 'Our certified technician tests power lines, replaces broken components with authentic OEM inventory, and runs a standard 24-point hardware and thermal inspection.',
      badge: 'Under 60 Min Average',
      icon: <Microscope className="w-6 h-6 text-amber-500" />
    },
    {
      num: '03',
      title: 'Quality Testing & Device Handover',
      description: 'Inspect your fully revived mobile device in person, verify all features including cameras, touch sampling, and biometrics before final delivery.',
      badge: '100% Quality Verified',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />
    }
  ];

  return (
    <section id="how-it-works" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Simple 3-Step Process
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
            Seamless Service Experience
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            We prioritize your time, privacy, and device security. Here is how our certified walk-in or courier repair flows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div
              key={step.num}
              className="relative flex flex-col justify-between p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {step.icon}
                  </div>
                  <span className="text-2xl font-extrabold font-mono text-slate-300 dark:text-slate-700">
                    {step.num}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-sky-600 dark:text-sky-400">
                <span>{step.badge}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
