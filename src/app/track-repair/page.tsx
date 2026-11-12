"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileStickyBar from "@/components/MobileStickyBar";
import BackButton from "@/components/BackButton";
import { BUSINESS_CONFIG } from "@/data/repairData";
import { RepairStatus, SYSTEM_CONFIG } from "@/lib/constants";
import {
  Activity,
  Search,
  MessageCircle,
  Phone,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  RefreshCw,
  Wrench,
  Smartphone,
  ShieldCheck,
} from "lucide-react";

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

const LIFECYCLE_STAGES: Array<{ code: RepairStatus; label: string; stepIndex: number }> = [
  { code: "NEW_REQUEST", label: "Booking Received", stepIndex: 0 },
  { code: "RECEIVED", label: "Device Received at Center", stepIndex: 1 },
  { code: "UNDER_INSPECTION", label: "Diagnosis in Progress", stepIndex: 2 },
  { code: "WAITING_FOR_APPROVAL", label: "Waiting for Approval", stepIndex: 3 },
  { code: "REPAIRING", label: "Repair in Progress", stepIndex: 4 },
  { code: "QUALITY_CHECK", label: "Quality & Testing", stepIndex: 5 },
  { code: "COMPLETED", label: "Repair Completed", stepIndex: 6 },
  { code: "READY_FOR_PICKUP", label: "Ready for Pickup", stepIndex: 7 },
  { code: "DELIVERED", label: "Delivered", stepIndex: 8 },
];

function UrlIdListener({ onParam }: { onParam: (id: string) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      onParam(id);
    }
  }, [searchParams, onParam]);
  return null;
}

export default function TrackRepairPage() {
  const [referenceId, setReferenceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [error, setError] = useState("");
  const [data, setData] = useState<TrackingData | null>(null);

  const fetchTracking = useCallback(async (idToQuery: string) => {
    const clean = idToQuery.trim().toUpperCase();
    if (!clean || clean.length < 4) {
      setData(null);
      setErrorTitle("Enter Repair Reference");
      setError("Please enter a valid Repair Reference (e.g. DMR-261112-K9P3) or 10-digit mobile number.");
      return;
    }

    setLoading(true);
    setError("");
    setErrorTitle("");

    try {
      const res = await fetch(`/api/track/${encodeURIComponent(clean)}`, {
        cache: "no-store",
      });
      const result = await res.json();

      if (res.ok && result.success && result.data) {
        setData(result.data);
        setError("");
        setErrorTitle("");
      } else {
        setData(null);
        setErrorTitle(result.errorTitle || "Order Not Found");
        setError(
          result.error ||
            "No active repair record matched that reference. Please verify your ID and try again."
        );
      }
    } catch {
      setData(null);
      setErrorTitle("Connection Error");
      setError("Unable to reach the tracking server right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleParamId = useCallback(
    (paramId: string) => {
      const normalized = paramId.trim().toUpperCase();
      setReferenceId(normalized);
      fetchTracking(normalized);
    },
    [fetchTracking]
  );

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(referenceId);
  };

  const cleanRef = (data?.trackingId || referenceId).trim().toUpperCase();
  const whatsappStatusUrl = `https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    `Hello Denish Mobile Repairing, I am checking status for my Repair Reference: ${cleanRef || "[ENTER_ID]"}.`
  )}`;

  return (
    <main className="min-h-screen bg-surface-canvas text-on-surface pb-24 lg:pb-0">
      <Suspense fallback={null}>
        <UrlIdListener onParam={handleParamId} />
      </Suspense>

      <Navbar />

      {/* Hero Header */}
      <section className="pt-28 pb-12 sm:pt-36 sm:pb-16 bg-surface-canvas border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 text-left">
          <BackButton />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Live Database Order Tracking</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Track Your <span className="metallic-gold-text">Mobile Repair</span>
          </h1>

          <p className="text-sm sm:text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Enter your Repair Reference ID (e.g. DMR-261112-XXXX) or registered 10-digit mobile number to check real-time technician status.
          </p>
        </div>
      </section>

      {/* Main Tracking Section */}
      <section className="py-12 sm:py-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Search Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-surface-container border border-white/10 shadow-2xl space-y-5">
          <form onSubmit={handleLookup} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="track-reference-input"
                className="font-label-badge text-xs text-on-surface-variant uppercase font-mono font-semibold block"
              >
                Repair Reference / Registered Mobile Number
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="track-reference-input"
                    type="text"
                    value={referenceId}
                    onChange={(e) => setReferenceId(e.target.value.toUpperCase())}
                    placeholder="e.g. DMR-261112-K9P3"
                    maxLength={24}
                    autoComplete="off"
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-surface-container-lowest border border-white/10 text-on-surface font-mono uppercase tracking-wider text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold h-12 px-6 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <span>Check Live Status</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                <div>
                  {errorTitle && <div className="font-bold text-sm text-rose-200">{errorTitle}</div>}
                  <p className="mt-0.5 leading-relaxed">{error}</p>
                </div>
              </div>
              <a
                href={whatsappStatusUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] uppercase shrink-0"
              >
                Ask on WhatsApp
              </a>
            </div>
          )}

          {!data && !error && !loading && (
            <div className="p-4 rounded-xl bg-surface-container-lowest border border-white/5 text-xs text-on-surface-variant flex items-center justify-between gap-3">
              <span>Haven&apos;t booked your repair yet?</span>
              <Link href="/book-repair" className="text-primary font-bold hover:underline shrink-0">
                Book a Repair →
              </Link>
            </div>
          )}
        </div>

        {/* Live Tracking Results */}
        {data && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Overview Status Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-surface-container border border-white/10 shadow-2xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant block">
                    Repair Reference
                  </span>
                  <div className="text-xl sm:text-2xl font-black font-mono text-primary tracking-wider mt-0.5">
                    {data.trackingId}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${data.badgeClass}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${data.dotColor}`} />
                    {data.statusLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => fetchTracking(data.trackingId)}
                    className="p-2 rounded-lg bg-surface-container-high border border-white/10 hover:border-primary text-on-surface-variant hover:text-primary transition"
                    title="Refresh Status"
                    aria-label="Refresh Status"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-on-surface-variant block text-[11px]">Customer</span>
                  <span className="font-bold text-on-surface mt-0.5 block">
                    {data.customerName || "Valued Customer"}
                  </span>
                </div>
                <div>
                  <span className="text-on-surface-variant block text-[11px]">Device</span>
                  <span className="font-bold text-on-surface mt-0.5 flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>
                      {data.deviceBrand} {data.deviceModel}
                    </span>
                  </span>
                </div>
                <div>
                  <span className="text-on-surface-variant block text-[11px]">Service Type</span>
                  <span className="font-bold text-on-surface mt-0.5 block">{data.repairCategory}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block text-[11px]">Last Updated</span>
                  <span className="font-mono text-on-surface mt-0.5 block">
                    {new Date(data.lastUpdatedDate).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-lowest border border-white/10 text-xs space-y-1.5">
                <div className="font-bold text-on-surface flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Current Workshop Update</span>
                </div>
                <p className="text-on-surface-variant leading-relaxed">{data.statusDescription}</p>
                {data.estimatedCompletionDate && (
                  <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-amber-400 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Estimated Completion: {data.estimatedCompletionDate}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stage Progression */}
            <div className="p-6 sm:p-8 rounded-2xl bg-surface-container border border-white/10 shadow-2xl space-y-5">
              <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>Repair Lifecycle Stages</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LIFECYCLE_STAGES.map((stage) => {
                  const isCurrent = data.currentStatus === stage.code;
                  const isCompleted =
                    data.currentStatus !== "CANCELLED" &&
                    (data.stepIndex > stage.stepIndex ||
                      (data.stepIndex === stage.stepIndex && isCurrent) ||
                      data.currentStatus === "DELIVERED");

                  return (
                    <div
                      key={stage.code}
                      className={`p-3 rounded-xl border text-xs flex items-center gap-3 ${
                        isCurrent
                          ? "bg-amber-500/15 border-amber-500/50 text-amber-200 font-bold"
                          : isCompleted
                          ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
                          : "bg-surface-container-lowest border-white/5 text-on-surface-variant opacity-70"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isCurrent
                            ? "bg-amber-500 text-slate-950"
                            : isCompleted
                            ? "bg-emerald-500 text-slate-950"
                            : "bg-white/10 text-on-surface-variant"
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : stage.stepIndex + 1}
                      </div>
                      <span className="truncate">{stage.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status History Timeline */}
            {data.statusHistory.length > 0 && (
              <div className="p-6 sm:p-8 rounded-2xl bg-surface-container border border-white/10 shadow-2xl space-y-4">
                <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Status History &amp; Notes</span>
                </h2>

                <div className="space-y-3">
                  {data.statusHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-surface-container-lowest border border-white/10 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-on-surface">{item.statusLabel}</span>
                        <span className="text-[11px] font-mono text-on-surface-variant">
                          {new Date(item.timestamp).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {item.customerNote && (
                        <p className="text-on-surface-variant leading-relaxed">{item.customerNote}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Direct Support CTA */}
            <div className="p-5 rounded-2xl bg-surface-container border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs space-y-1 text-center sm:text-left">
                <div className="font-bold text-white uppercase tracking-wider">
                  Need Immediate Assistance?
                </div>
                <p className="text-on-surface-variant">{SYSTEM_CONFIG.hours}</p>
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <a
                  href={BUSINESS_CONFIG.phoneTel}
                  className="btn-gold flex-1 sm:flex-initial px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Store</span>
                </a>
                <a
                  href={whatsappStatusUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp flex-1 sm:flex-initial px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </section>

      <Footer />
      <MobileStickyBar />
    </main>
  );
}
