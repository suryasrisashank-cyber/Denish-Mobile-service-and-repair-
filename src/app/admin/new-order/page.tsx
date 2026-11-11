"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Smartphone, User, FileText, MessageCircle, 
  CheckCircle2, Copy, Check, AlertCircle
} from "lucide-react";
import { REPAIR_CATEGORIES, POPULAR_BRANDS } from "@/lib/constants";

export default function NewOrderPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerLocation: "Gandhinagar",
    customerEmail: "",
    deviceBrand: "Vivo",
    deviceModel: "",
    imeiSerial: "",
    repairCategory: "Screen Replacement",
    reportedIssue: "",
    inspectionNotes: "",
    estimatedCompletion: "",
    serviceCost: "",
    consentWhatsApp: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState<{
    orderId: number;
    trackingId: string;
    trackingUrl: string;
    whatsAppUrl: string;
    customerName: string;
    deviceModel: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.customerPhone.trim() || !formData.deviceModel.trim()) {
      setError("Customer name, phone number, and device model are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const token = typeof window !== "undefined" ? localStorage.getItem("denish_admin_token") : null;
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers,
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSuccessData(json.data);
      } else {
        setError(json.error || "Failed to create repair order in database.");
      }
    } catch {
      setError("Network error while creating order. Please verify backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const copyTrackingUrl = () => {
    if (successData?.trackingUrl) {
      navigator.clipboard.writeText(successData.trackingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
              Create New Repair Order
            </h1>
            <p className="text-xs text-slate-500">
              Register device intake at Gandhinagar Technical Center (Source: In-Store Walk-in).
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Modal / Banner */}
      {successData ? (
        <div className="bg-white border border-emerald-300 rounded-3xl p-6 sm:p-8 shadow-md text-center space-y-5 animate-in zoom-in-95">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Real Work Order Created in Database
            </span>
            <h2 className="text-xl font-black uppercase text-slate-900 mt-2">
              Tracking ID Generated Successfully
            </h2>
            <div className="text-2xl font-mono font-black text-blue-700 mt-2 select-all tracking-wider">
              {successData.trackingId}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Registered for <span className="font-bold text-slate-900">{successData.customerName}</span> ({successData.deviceModel})
            </p>
          </div>

          {/* Customer Tracking Link Copy Box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-600 font-mono truncate text-[11px]">
              {successData.trackingUrl}
            </span>
            <button
              onClick={copyTrackingUrl}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs shrink-0 flex items-center gap-1 transition shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Link"}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <a
              href={successData.whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm active:scale-95 transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send WhatsApp To Customer</span>
            </a>

            <button
              onClick={() => router.push(`/admin/orders/${successData.orderId}`)}
              className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
            >
              <span>Open Order Details</span>
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setSuccessData(null);
                setFormData({
                  customerName: "",
                  customerPhone: "",
                  customerLocation: "Gandhinagar",
                  customerEmail: "",
                  deviceBrand: "Vivo",
                  deviceModel: "",
                  imeiSerial: "",
                  repairCategory: "Screen Replacement",
                  reportedIssue: "",
                  inspectionNotes: "",
                  estimatedCompletion: "",
                  serviceCost: "",
                  consentWhatsApp: true,
                });
              }}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              + Create another repair order
            </button>
          </div>
        </div>
      ) : (
        /* Order Creation Form */
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          
          {/* Section 1: Customer Details */}
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-blue-700 mb-3 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <User className="w-4 h-4 text-blue-600" />
              <span>1. Customer Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter customer full name"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Customer Phone Number (10 digits) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Location / Area
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sector 11, Gandhinagar"
                  value={formData.customerLocation}
                  onChange={(e) => setFormData({ ...formData, customerLocation: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Customer Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="customer@example.com"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Smartphone Device Specs */}
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-blue-700 mb-3 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>2. Smartphone Hardware Specifications</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Brand *
                </label>
                <select
                  value={formData.deviceBrand}
                  onChange={(e) => setFormData({ ...formData, deviceBrand: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {POPULAR_BRANDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Model Name / Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. V29 Pro / Galaxy S23"
                  value={formData.deviceModel}
                  onChange={(e) => setFormData({ ...formData, deviceModel: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  IMEI / Serial (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 8642930481..."
                  value={formData.imeiSerial}
                  onChange={(e) => setFormData({ ...formData, imeiSerial: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Diagnostic Problem & Service Category */}
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-blue-700 mb-3 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>3. Hardware Issue &amp; Workshop Intake Notes</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Repair Service Category *
                </label>
                <select
                  value={formData.repairCategory}
                  onChange={(e) => setFormData({ ...formData, repairCategory: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {REPAIR_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Reported Fault / Problem Description *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Describe visible damage, customer description, touch screen failure..."
                  value={formData.reportedIssue}
                  onChange={(e) => setFormData({ ...formData, reportedIssue: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Intake Inspection Notes (Internal Staff Only)
                </label>
                <textarea
                  rows={2}
                  placeholder="Scratches on rear glass, battery swelling detected, previous third-party glue..."
                  value={formData.inspectionNotes}
                  onChange={(e) => setFormData({ ...formData, inspectionNotes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Quoted Service Cost (₹ INR)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1850"
                    value={formData.serviceCost}
                    onChange={(e) => setFormData({ ...formData, serviceCost: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Estimated Completion Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Today by 6:00 PM / 2 Hours"
                    value={formData.estimatedCompletion}
                    onChange={(e) => setFormData({ ...formData, estimatedCompletion: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Customer Consent */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={formData.consentWhatsApp}
                onChange={(e) => setFormData({ ...formData, consentWhatsApp: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>Send live repair status notifications to customer&apos;s WhatsApp number</span>
            </label>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              href="/admin"
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
            >
              Cancel &amp; Return
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="py-3 px-6 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition disabled:opacity-50"
            >
              {loading ? "Generating ID & Saving..." : "Confirm Intake & Generate ID"}
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
