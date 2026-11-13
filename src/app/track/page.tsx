"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Search, Clock, CheckCircle2, AlertCircle, Phone,
  MessageCircle, ArrowRight, RefreshCw,
  PackageCheck, MapPin, Wrench, ArrowLeft
} from "lucide-react";
import { SYSTEM_CONFIG, RepairStatus } from "@/lib/constants";

interface StatusHistoryItem {
  status: RepairStatus;
  statusLabel: string;
  customerNote: string | null;
  timestamp: string;
}

interface TrackingData {
  trackingId: string;
  customerName?: string;
  deviceBrand: string;
  deviceModel: string;
  repairCategory: string;
  reportedIssue: string;
  currentStatus: RepairStatus;
  statusLabel: string;
  statusDescription: string;
  stepIndex: number;
  badgeClass: string;
  dotColor: string;
  pickupReady: boolean;
  receivedDate: string;
  lastUpdatedDate: string;
  estimatedCompletionDate: string | null;
  statusHistory: StatusHistoryItem[];
}

// 9-stage linear progression for tracking timeline
const PROGRESS_STAGES: Array<{ code: RepairStatus; label: string }> = [
  { code: "NEW_REQUEST", label: "Booking Received" },
  { code: "RECEIVED", label: "Device Received" },
  { code: "UNDER_INSPECTION", label: "Inspection & Diagnosis" },
  { code: "WAITING_FOR_APPROVAL", label: "Customer Approval" },
  { code: "WAITING_FOR_PARTS", label: "Spares Allocated" },
  { code: "REPAIRING", label: "Bench Repair" },
  { code: "QUALITY_CHECK", label: "Quality Testing" },
  { code: "COMPLETED", label: "Repair Completed" },
  { code: "READY_FOR_PICKUP", label: "Ready for Pickup" },
];

function UrlParamListener({ onParam }: { onParam: (id: string) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      onParam(id);
    }
  }, [searchParams, onParam]);
  return null;
}

export default function TrackPage() {
  const [trackingId, setTrackingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [error, setError] = useState("");
  const [data, setData] = useState<TrackingData | null>(null);

  const fetchTracking = async (idToQuery: string) => {
    const cleanId = idToQuery.trim().toUpperCase();
    if (!cleanId) {
      setData(null);
      setErrorTitle("");
      setError("Please enter your tracking ID.");
      return;
    }

    setLoading(true);
    setError("");
    setErrorTitle("");

    try {
      const res = await fetch(`/api/track/${encodeURIComponent(cleanId)}`);
      const result = await res.json();

      if (res.ok && result.success) {
        setData(result.data);
        setError("");
        setErrorTitle("");
      } else {
        setData(null);
        setErrorTitle(result.errorTitle || "Invalid Tracking ID");
        setError(result.error || "We couldn't find a service request with this tracking ID. Please check the ID and try again.");
      }
    } catch {
      setData(null);
      setErrorTitle("Connection Error");
      setError("Unable to check tracking status right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUrlParam = (id: string) => {
    const clean = id.trim().toUpperCase();
    setTrackingId(clean);
    if (clean.length >= 8) {
      fetchTracking(clean);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(trackingId);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Suspense fallback={null}>
        <UrlParamListener onParam={handleUrlParam} />
      </Suspense>

      {/* Top Brand Notification Bar with Back Button & Authentic 3D Logo */}
      <div className="bg-[#0B0F17] text-slate-300 px-4 py-2.5 text-xs border-b border-amber-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  window.location.href = "/";
                }
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 text-xs sm:text-sm font-semibold transition-all active:scale-95 border border-white/10 shadow-sm"
            aria-label="Back to Home"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>← Back</span>
          </button>

          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition">
            <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-amber-500/30 shrink-0 bg-[#0B0F17]">
              <Image
                src="/assets/denish-logo-icon.png"
                alt="DENISH Logo"
                width={28}
                height={28}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-black tracking-wider uppercase text-xs metallic-gold-text hidden xs:inline">
              {SYSTEM_CONFIG.storeName}
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="hidden sm:inline text-amber-400 font-bold">Fix Today • Use Tomorrow</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-300">{SYSTEM_CONFIG.hours}</span>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">

        {/* Page Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Real-Time Customer Portal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase">
            Track Your Mobile <span className="metallic-gold-text">Repair</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            Enter your service tracking ID to check the latest repair status, diagnosis report, and collection readiness.
          </p>
        </div>

        {/* Tracking Search Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xl mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label
                htmlFor="tracking-input"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Mobile Number / Tracking ID
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    id="tracking-input"
                    type="text"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                    placeholder="Enter 10-digit mobile number (e.g. 9666200066)"
                    maxLength={24}
                    autoComplete="off"
                    autoFocus
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm font-mono uppercase tracking-widest text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 active:scale-95 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center gap-2 shrink-0"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <span>Track Service</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
                  <div>
                    {errorTitle && (
                      <div className="font-bold text-sm text-rose-700 dark:text-rose-300">
                        {errorTitle}
                      </div>
                    )}
                    <div className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
                      {error}
                    </div>
                  </div>
                </div>
                {trackingId.trim() && (
                  <button
                    type="button"
                    onClick={() => fetchTracking(trackingId)}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-700 dark:text-rose-300 font-bold text-[11px] flex items-center gap-1.5 transition shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Tracking Details View */}
        {data && (
          <div className="space-y-6 animate-in fade-in-50 duration-300">

            {/* Primary Status Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Tracking Identifier
                  </span>
                  <div className="text-lg font-mono font-black text-amber-600 dark:text-amber-400">
                    {data.trackingId}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase border ${data.badgeClass}`}>
                    {data.statusLabel}
                  </span>
                  {data.pickupReady && (
                    <span className="px-3 py-1.5 rounded-full text-xs font-black uppercase bg-emerald-500 text-slate-950 shadow-sm animate-pulse">
                      Ready For Collection
                    </span>
                  )}
                </div>
              </div>

              {/* Device and Category Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-semibold block text-[11px]">Customer</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-0.5 block text-sm">
                    {data.customerName || "Verified Customer"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-semibold block text-[11px]">Device Handset</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-0.5 block text-sm">
                    {data.deviceBrand} {data.deviceModel}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-semibold block text-[11px]">Service Category</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                    {data.repairCategory}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-semibold block text-[11px]">Received In Lab</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300 mt-0.5 block">
                    {new Date(data.receivedDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-semibold block text-[11px]">Last Updated</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300 mt-0.5 block">
                    {new Date(data.lastUpdatedDate).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {/* Status Explanation Box */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs mt-2">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${data.dotColor}`}></div>
                  <span>Current Laboratory Assessment:</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {data.statusDescription}
                </p>
                {data.estimatedCompletionDate && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-700/60 flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Estimated Completion: {data.estimatedCompletionDate}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Repair Progress Timeline */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-500" />
                <span>Service Stage Progression</span>
              </h2>

              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {PROGRESS_STAGES.map((stage, idx) => {
                  const isCurrent = data.currentStatus === stage.code;
                  const isPassed = data.stepIndex >= idx && data.currentStatus !== "CANCELLED";

                  return (
                    <div key={stage.code} className="relative flex items-start gap-3">
                      <div
                        className={`absolute -left-6 sm:-left-8 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${isPassed
                          ? "bg-amber-500 border-amber-500 text-slate-950"
                          : isCurrent
                            ? "bg-white dark:bg-slate-900 border-amber-500 text-amber-500 animate-ping"
                            : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400"
                          }`}
                      >
                        {isPassed ? <CheckCircle2 className="w-3 h-3 stroke-[3]" /> : idx + 1}
                      </div>

                      <div>
                        <div
                          className={`text-xs font-bold uppercase tracking-wide ${isCurrent
                            ? "text-amber-600 dark:text-amber-400 font-black"
                            : isPassed
                              ? "text-slate-900 dark:text-white"
                              : "text-slate-400 dark:text-slate-500"
                            }`}
                        >
                          {stage.label}
                        </div>
                        {isCurrent && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Active stage in technician workflow
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status History Updates Log */}
            {data.statusHistory.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Updates &amp; Verification Milestones</span>
                </h2>

                <div className="space-y-3">
                  {data.statusHistory.map((item, index) => (
                    <div
                      key={index}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {item.statusLabel}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          {new Date(item.timestamp).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {item.customerNote && (
                        <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-1 leading-relaxed">
                          &quot;{item.customerNote}&quot;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Shop Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-black text-white border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>Gandhinagar Service Center</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Have questions regarding your repair? Speak directly with our master technician.
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                <a
                  href={`tel:${SYSTEM_CONFIG.phone}`}
                  className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Store</span>
                </a>
                <a
                  href={`https://wa.me/${SYSTEM_CONFIG.whatsappNumber}?text=${encodeURIComponent(`Hello DENISH Mobile Repairing, I am following up on Tracking ID: ${data.trackingId}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 mt-12">
        <p className="font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          {SYSTEM_CONFIG.storeName}
        </p>
        <p className="text-[11px] mt-1">
          {SYSTEM_CONFIG.tagline} • Gandhinagar Center • {SYSTEM_CONFIG.hours}
        </p>
      </footer>

    </div>
  );
}
