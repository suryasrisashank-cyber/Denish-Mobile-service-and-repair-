"use client";

import React from 'react';
import { 
  Smartphone, 
  BatteryCharging, 
  Zap, 
  Cpu, 
  Droplets, 
  CircuitBoard, 
  Volume2, 
  Camera, 
  ArrowRight, 
  MessageCircle, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';
import { CORE_SERVICES, BUSINESS_INFO } from '../data/constants';
import { ServiceCategory } from '../types';

interface ServicesSectionProps {
  onSelectService: (service: ServiceCategory) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectService }) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Smartphone':
        return <Smartphone className="w-6 h-6 text-sky-500" />;
      case 'BatteryCharging':
        return <BatteryCharging className="w-6 h-6 text-amber-500" />;
      case 'Zap':
        return <Zap className="w-6 h-6 text-sky-500" />;
      case 'Cpu':
        return <Cpu className="w-6 h-6 text-emerald-500" />;
      case 'Droplets':
        return <Droplets className="w-6 h-6 text-blue-500" />;
      case 'CircuitBoard':
        return <CircuitBoard className="w-6 h-6 text-purple-500" />;
      case 'Volume2':
        return <Volume2 className="w-6 h-6 text-amber-500" />;
      case 'Camera':
        return <Camera className="w-6 h-6 text-rose-500" />;
      default:
        return <Smartphone className="w-6 h-6 text-sky-500" />;
    }
  };

  return (
    <section id="services" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Precision Diagnostics & Spares
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
              Specialized Smartphone Repair Solutions
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
              From delicate curved OLED glass laminations to deep motherboard short-circuit micro-soldering, our workbench handles all flagship brands with verified OEM standards.
            </p>
          </div>

          <a
            href={`tel:${BUSINESS_INFO.phone}`}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-amber-400 transition-colors shadow-xs"
          >
            <span>Consult Lead Engineer</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
          </a>
        </div>

        {/* 8 Services Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CORE_SERVICES.map((service, index) => {
            const num = (index + 1).toString().padStart(2, '0');
            return (
              <div
                key={service.id}
                className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/90 hover:border-sky-300 dark:hover:border-sky-700 shadow-xs hover:shadow-md transition-all duration-200"
              >
                <div className="space-y-4">
                  {/* Top Bar inside card: Icon and Editorial Number */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 flex items-center justify-center transition-colors group-hover:bg-sky-50 dark:group-hover:bg-sky-950/40">
                      {getIcon(service.iconName)}
                    </div>
                    <span className="text-xs font-mono font-medium text-slate-400 dark:text-slate-500">
                      {num}
                    </span>
                  </div>

                  {/* Service Title & Subtitle */}
                  <div>
                    <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                      {service.subtitle}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {service.name}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {service.description}
                  </p>

                  {/* Clean unboxed metadata with bullet separators */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{service.turnaroundTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>{service.warranty}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-5 mt-4 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => onSelectService(service)}
                    className="flex-1 py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-[#101c2c] hover:text-white dark:hover:bg-sky-600 dark:hover:text-white text-xs font-semibold transition-all text-center"
                  >
                    Book Repair
                  </button>
                  <a
                    href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent(
                      service.whatsappPreset
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`WhatsApp enquiry for ${service.name}`}
                    className="p-2 rounded-lg text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
