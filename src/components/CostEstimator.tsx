import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Send, 
  Wrench, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { DEVICE_BRANDS, PRICE_MATRIX, BUSINESS_INFO, CORE_SERVICES } from '../data/constants';

interface CostEstimatorProps {
  onProceedToBooking: (details: {
    brand: string;
    model: string;
    serviceType: string;
    estimatedPrice: string;
  }) => void;
}

export const CostEstimator: React.FC<CostEstimatorProps> = ({ onProceedToBooking }) => {
  const [selectedBrand, setSelectedBrand] = useState('apple');
  const [modelInput, setModelInput] = useState('iPhone 13');
  const [selectedIssue, setSelectedIssue] = useState('screen');

  const quote = useMemo(() => {
    const issueMap = PRICE_MATRIX[selectedIssue] || PRICE_MATRIX.screen;
    const brandQuote = issueMap[selectedBrand] || issueMap.other;
    return brandQuote;
  }, [selectedBrand, selectedIssue]);

  const serviceCategory = useMemo(() => {
    return CORE_SERVICES.find((s) => s.id === selectedIssue) || CORE_SERVICES[0];
  }, [selectedIssue]);

  const formattedPriceRange = `₹${quote.min.toLocaleString('en-IN')} – ₹${quote.max.toLocaleString('en-IN')}`;

  const whatsappMessage = useMemo(() => {
    const brandObj = DEVICE_BRANDS.find((b) => b.id === selectedBrand);
    const brandName = brandObj ? brandObj.label.split(' ')[0] : 'Smartphone';
    const text = `Hello Denish Mobile Repairing, I checked the estimate online for *${modelInput || 'Device'}* (${brandName}) with *${serviceCategory.name}*. Estimated Workshop Range: *${formattedPriceRange}* (Turnaround: ${quote.time}). Please confirm parts availability and appointment.`;
    return encodeURIComponent(text);
  }, [modelInput, selectedBrand, serviceCategory, formattedPriceRange, quote.time]);

  const handleBookNow = () => {
    const brandObj = DEVICE_BRANDS.find((b) => b.id === selectedBrand);
    onProceedToBooking({
      brand: brandObj ? brandObj.label : 'Other',
      model: modelInput || 'Smartphone',
      serviceType: serviceCategory.name,
      estimatedPrice: formattedPriceRange
    });
  };

  return (
    <section id="estimator" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 lg:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm relative overflow-hidden">
          
          {/* Subtle Ambient Accent */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/5 dark:bg-sky-400/5 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="max-w-3xl mb-10">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
              <Calculator className="w-4 h-4" />
              <span>Upfront Workshop Cost Calculator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
              Interactive Repair Cost Estimator
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2">
              Get an instant workshop price range and repair turnaround time for your device. No hidden diagnostic fees, 6-month spares warranty included.
            </p>
          </div>

          {/* Form Selection Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Device Brand */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                1. Select Device Brand
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all cursor-pointer"
              >
                {DEVICE_BRANDS.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Device Model */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                2. Device Model
              </label>
              <input
                type="text"
                value={modelInput}
                onChange={(e) => setModelInput(e.target.value)}
                placeholder="e.g. iPhone 14 Pro, Galaxy S23, Nord CE"
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* 3. Primary Issue */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                3. Primary Repair Issue
              </label>
              <select
                value={selectedIssue}
                onChange={(e) => setSelectedIssue(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all cursor-pointer"
              >
                {CORE_SERVICES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.subtitle})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic Result Banner Card */}
          <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="space-y-2 text-center lg:text-left">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Estimated Workshop Price (Parts + Labour)
              </div>
              <div className="flex items-baseline justify-center lg:justify-start gap-3">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tabular-nums font-['Plus_Jakarta_Sans']">
                  {formattedPriceRange}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  (Inclusive of taxes)
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-600 dark:text-slate-300 pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-sky-500" />
                  Turnaround: <strong>{quote.time}</strong>
                </span>
                <span className="text-slate-400">·</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Warranty: <strong>{serviceCategory.warranty}</strong>
                </span>
              </div>
            </div>

            {/* Action CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 w-full lg:w-auto">
              <button
                type="button"
                onClick={handleBookNow}
                className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl bg-[#101c2c] dark:bg-[#173b59] hover:bg-[#173b59] dark:hover:bg-[#1e4a6f] text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>Book This Repair</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <a
                href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Confirm on WhatsApp</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
