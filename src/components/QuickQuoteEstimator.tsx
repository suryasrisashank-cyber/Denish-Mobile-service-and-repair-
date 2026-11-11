"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BUSINESS_CONFIG } from "@/data/repairData";

export default function QuickQuoteEstimator() {
  const [device, setDevice] = useState("Apple iPhone");
  const [symptom, setSymptom] = useState("Screen / Display Replacement");
  const [contactNumber, setContactNumber] = useState("");
  const [hasRequested, setHasRequested] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasRequested(true);
  };

  const constructWhatsAppQuoteUrl = () => {
    const text = encodeURIComponent(
      `Hello Denish Mobile Repairing, I would like an accurate repair estimate:\n` +
      `- Ecosystem: ${device}\n` +
      `- Symptom: ${symptom}\n` +
      (contactNumber ? `- My Contact: ${contactNumber}\n` : "") +
      `Please let me know the estimated cost and turnaround.`
    );
    return `https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${text}`;
  };

  return (
    <section className="w-full py-space-xl px-margin-sm lg:px-margin-lg max-w-7xl mx-auto" id="quick-quote">
      <div className="p-space-lg sm:p-space-xl rounded-2xl bg-surface-container-low border border-white/5 shadow-md relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-container/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-md">
          <div>
            <div className="flex items-center gap-space-xs mb-1">
              <span className="material-symbols-outlined text-primary text-[22px]">calculate</span>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Repair Cost &amp; Diagnostic Enquiry
              </h2>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              Select your smartphone brand and issue. Because parts and pricing vary by exact model, we provide a personalized, accurate estimate for your device.
            </p>
          </div>

          <span className="font-label-md text-label-md text-secondary bg-surface-container px-space-md py-1.5 rounded-full border border-secondary/20 self-start lg:self-auto">
            Direct Technician Quote
          </span>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          {/* 1. Device Ecosystem */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface-variant uppercase font-semibold">
              1. Device Ecosystem / Brand
            </label>
            <select
              value={device}
              onChange={(e) => setDevice(e.target.value)}
              className="w-full h-12 px-space-md rounded-xl bg-surface-container border border-white/10 text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary transition-colors"
            >
              <option value="Apple iPhone">Apple iPhone Series</option>
              <option value="Samsung Galaxy">Samsung Galaxy (S, Z, A, M Series)</option>
              <option value="OnePlus">OnePlus Series</option>
              <option value="Google Pixel">Google Pixel Series</option>
              <option value="Xiaomi / Redmi / Poco">Xiaomi / Redmi / Poco</option>
              <option value="Vivo / Oppo / Realme">Vivo / Oppo / Realme</option>
              <option value="Other Smartphone">Other Smartphone Brand</option>
            </select>
          </div>

          {/* 2. Hardware Module / Symptom */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface-variant uppercase font-semibold">
              2. Repair Issue / Symptom
            </label>
            <select
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              className="w-full h-12 px-space-md rounded-xl bg-surface-container border border-white/10 text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary transition-colors"
            >
              <option value="Screen / Display Replacement">Screen / Glass / Touchscreen Issue</option>
              <option value="Battery Replacement">Battery Drain / Battery Replacement</option>
              <option value="Charging Problem">Charging Port / Not Charging</option>
              <option value="Motherboard / IC Repair">Motherboard / Dead Phone / IC Issue</option>
              <option value="Water Damage Recovery">Water / Liquid Damage</option>
              <option value="Speaker / Microphone">Speaker / Audio / Mic Issue</option>
              <option value="Camera Lens / Sensor">Camera / Lens Replacement</option>
              <option value="Software / Bootloop">Software / Stuck on Logo</option>
            </select>
          </div>

          {/* 3. Mobile Number */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface-variant uppercase font-semibold">
              3. WhatsApp / Mobile Number (Optional)
            </label>
            <input
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="Enter 10-digit number"
              className="w-full h-12 px-space-md rounded-xl bg-surface-container border border-white/10 text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="md:col-span-3 pt-space-xs">
            <button
              type="submit"
              className="inline-flex items-center gap-space-xs px-space-lg h-12 rounded-xl bg-primary-container text-on-primary-container font-label-lg text-label-lg hover:bg-primary-container/90 transition-all shadow-[0_0_16px_rgba(0,112,243,0.35)]"
            >
              <span>Get Estimate Guidance</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </form>

        {/* Output Card */}
        {hasRequested && (
          <div className="mt-space-lg p-space-md rounded-xl bg-surface-container-high border border-primary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md animate-in fade-in duration-300">
            <div className="space-y-1">
              <span className="font-label-sm text-label-sm text-primary uppercase font-bold block">
                Estimate Request Registered
              </span>
              <p className="font-title-md text-title-md text-on-surface">
                Contact us for an accurate repair estimate.
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Component pricing and turnaround time depend on your specific device model and required parts. Connect directly with our technician for upfront guidance.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-space-xs shrink-0">
              <a
                href={constructWhatsAppQuoteUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-space-xs px-space-md h-11 rounded-xl bg-secondary-container text-on-secondary-container font-label-md text-label-md hover:opacity-95 transition-opacity"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                <span>Ask on WhatsApp</span>
              </a>

              <a
                href={`tel:${BUSINESS_CONFIG.phoneRaw}`}
                className="inline-flex items-center gap-space-xs px-space-md h-11 rounded-xl bg-surface-container text-primary font-label-md text-label-md hover:bg-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">call</span>
                <span>Call {BUSINESS_CONFIG.phoneRaw}</span>
              </a>

              <Link
                href="/book-repair"
                className="inline-flex items-center gap-space-xs px-space-md h-11 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md hover:bg-primary-container/90 transition-all"
              >
                <span>Full Booking Form</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
