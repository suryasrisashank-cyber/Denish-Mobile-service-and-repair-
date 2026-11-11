/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Smartphone, QrCode, CheckCircle2, ExternalLink } from "lucide-react";

export default function MobilePreviewPage() {
  const [device, setDevice] = useState({
    name: "iPhone 15 Pro",
    width: 393,
    height: 852,
    hasNotch: true,
  });

  const devices = [
    { name: "iPhone 15 Pro", width: 393, height: 852, hasNotch: true },
    { name: "Galaxy S24", width: 360, height: 780, hasNotch: true },
    { name: "Pixel 8", width: 412, height: 892, hasNotch: true },
    { name: "Compact Phone", width: 320, height: 568, hasNotch: false },
    { name: "Tablet (768px)", width: 768, height: 1024, hasNotch: false },
  ];

  const lanUrl = "http://172.26.167.197:3000";
  const adminUrl = "http://172.26.167.197:3000/admin";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(lanUrl)}`;
  const adminQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(adminUrl)}`;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-white/10 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Site</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px] tracking-wider uppercase">
              TEST SUITE
            </span>
            <h1 className="text-sm sm:text-base font-bold">
              DENISH MOBILE — Mobile UI Interactive Simulator
            </h1>
          </div>
        </div>

        {/* Device Switcher Pills */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/10">
          {devices.map((d) => (
            <button
              key={d.name}
              onClick={() => setDevice(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                device.name === d.name
                  ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col xl:flex-row items-center xl:items-start justify-center gap-10 p-6 md:p-10">
        
        {/* Device Frame */}
        <div className="flex flex-col items-center gap-3">
          <div className="text-xs text-slate-400 font-medium">
            Active Viewport: <strong className="text-white">{device.name}</strong> ({device.width} × {device.height}px)
          </div>

          <div
            className="relative bg-slate-800 p-3 shadow-2xl transition-all duration-300"
            style={{
              borderRadius: device.hasNotch ? "50px" : "28px",
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 0 3px #334155, 0 0 40px rgba(245, 158, 11, 0.15)",
            }}
          >
            {/* Dynamic Island / Notch */}
            {device.hasNotch && (
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-30 pointer-events-none shadow-sm" />
            )}

            {/* Screen Viewport */}
            <div
              className="bg-black overflow-hidden relative transition-all duration-300"
              style={{
                width: `${device.width}px`,
                height: `${device.height}px`,
                borderRadius: device.hasNotch ? "40px" : "18px",
              }}
            >
              <iframe
                src="/"
                title="Mobile UI Live Preview"
                className="w-full h-full border-none"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Controls & Real Phone Testing Instructions */}
        <div className="w-full max-w-md flex flex-col gap-6">
          
          {/* Card: Real Smartphone Testing */}
          <div className="rounded-2xl bg-slate-900 border border-white/10 p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Smartphone className="w-5 h-5" />
              <span>Test On Your Real Smartphone</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Connect your smartphone to the same Wi-Fi network and open this direct LAN link in Safari, Chrome, or Firefox:
            </p>

            <div className="p-3 rounded-xl bg-slate-950 border border-white/10 font-mono text-xs text-sky-400 select-all break-all">
              {lanUrl}
            </div>

            {/* QR Code */}
            <div className="text-center pt-2">
              <div className="inline-block p-3 rounded-xl bg-white shadow-lg">
                <img
                  src={qrCodeUrl}
                  alt="QR Code for Mobile Testing"
                  className="w-40 h-40 block mx-auto"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                <span>Scan with your phone camera to open instantly</span>
              </p>
            </div>

            <a
              href={lanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs hover:opacity-95 transition-opacity"
            >
              <span>Open in New Browser Tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Card: Admin Portal Direct Link */}
          <div className="rounded-2xl bg-slate-900 border border-amber-500/20 p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <span className="text-amber-400">🔐</span>
              <span>Admin Portal — Direct Link Only</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              The admin dashboard is <strong className="text-amber-300">not visible on the public website</strong>. Access it only via this direct link. Share only with the workshop owner.
            </p>
            <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/20 font-mono text-xs text-amber-400 select-all break-all">
              {adminUrl}
            </div>
            <div className="text-center pt-1">
              <div className="inline-block p-3 rounded-xl bg-white shadow-lg">
                <img
                  src={adminQrUrl}
                  alt="QR Code for Admin Portal"
                  className="w-32 h-32 block mx-auto"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Admin access QR (private — do not share publicly)</p>
            </div>
            <a
              href={adminUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-xs hover:opacity-95 transition-opacity"
            >
              <span>Open Admin Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Card: Verified Mobile UI Features */}
          <div className="rounded-2xl bg-slate-900 border border-white/10 p-6 space-y-3 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Verified Mobile UI Checklist</span>
            </h3>

            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span><strong>Persistent Sticky Bar:</strong> Fixed at bottom with 1-tap Call &amp; WhatsApp.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span><strong>Mobile Drawer:</strong> Hamburger button with slide-down navigation.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span><strong>Safe Area Padding:</strong> iPhone home indicator clearance.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span><strong>Responsive Form:</strong> 1-column layout with 48px+ touch targets.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span><strong>Service Cards:</strong> Single-column stacking without clipping.</span>
              </li>
            </ul>
          </div>

        </div>

      </main>
    </div>
  );
}
