"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, Smartphone, User, Wrench, Clock, CheckCircle2, 
  MessageCircle, AlertCircle, RefreshCw, Send, ExternalLink
} from "lucide-react";
import { REPAIR_STATUSES, RepairStatus, SYSTEM_CONFIG } from "@/lib/constants";

interface OrderDetail {
  id: number;
  trackingId: string;
  deviceBrand: string;
  deviceModel: string;
  imeiSerial: string | null;
  repairCategory: string;
  reportedIssue: string;
  inspectionNotes: string | null;
  estimatedCompletion: string | null;
  serviceCost: number | null;
  currentStatus: RepairStatus;
  statusLabel: string;
  badgeClass: string;
  pickupReady: boolean;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: number;
    name: string;
    phone: string;
    location?: string;
    email: string | null;
    consentWhatsApp: boolean;
  };
  statusHistory: Array<{
    id: number;
    previousStatus: string | null;
    newStatus: RepairStatus;
    statusLabel: string;
    customerNote: string | null;
    internalNote: string | null;
    updatedBy: string;
    createdAt: string;
  }>;
  notifications: Array<{
    id: number;
    channel: string;
    recipient_phone: string;
    message_template: string;
    status: string;
    created_at: string;
  }>;
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Status transition state
  const [selectedStatus, setSelectedStatus] = useState<RepairStatus>("RECEIVED");
  const [customerNote, setCustomerNote] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [pickupReady, setPickupReady] = useState(false);
  const [submittingStatus, setSubmittingStatus] = useState(false);
  const [statusSuccessMsg, setStatusSuccessMsg] = useState("");

  // Cloud API dispatch state
  const [sendingCloudWa, setSendingCloudWa] = useState(false);
  const [cloudWaResult, setCloudWaResult] = useState<string | null>(null);

  const fetchOrderDetail = useCallback(async () => {
    setLoading(true);
    try {
      const headers: HeadersInit = {};
      const token = typeof window !== "undefined" ? localStorage.getItem("denish_admin_token") : null;
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/admin/orders/${orderId}`, { headers });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrder(data.data);
        setSelectedStatus(data.data.currentStatus);
        setPickupReady(data.data.pickupReady);
      } else {
        setError(data.error || "Order not found in database.");
      }
    } catch {
      setError("Failed to fetch order details from server.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingStatus(true);
    setStatusSuccessMsg("");

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const token = typeof window !== "undefined" ? localStorage.getItem("denish_admin_token") : null;
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          newStatus: selectedStatus,
          customerNote: customerNote.trim() || undefined,
          internalNote: internalNote.trim() || undefined,
          pickupReady: selectedStatus === "READY_FOR_PICKUP" ? true : pickupReady,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusSuccessMsg(`Status updated to ${data.data.statusLabel}!`);
        setCustomerNote("");
        setInternalNote("");
        fetchOrderDetail();
      } else {
        alert(data.error || "Failed to update status.");
      }
    } catch {
      alert("Network error updating order status.");
    } finally {
      setSubmittingStatus(false);
    }
  };

  const handleCloudApiDispatch = async () => {
    if (!order) return;
    setSendingCloudWa(true);
    setCloudWaResult(null);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const token = typeof window !== "undefined" ? localStorage.getItem("denish_admin_token") : null;
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/admin/notifications/send", {
        method: "POST",
        headers,
        body: JSON.stringify({
          orderId: order.id,
          notificationType: selectedStatus,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setCloudWaResult("Official WhatsApp Cloud message sent successfully!");
        fetchOrderDetail();
      } else {
        setCloudWaResult(`Meta Cloud API: ${json.error || "Failed"}`);
      }
    } catch {
      setCloudWaResult("Network exception while calling WhatsApp gateway.");
    } finally {
      setSendingCloudWa(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
        <span className="font-semibold text-slate-700">Loading Order Records from Database...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-3 shadow-xs">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-sm font-bold text-slate-900">Order Lookup Failed</h3>
        <p className="text-xs text-rose-600">{error || "Order not found"}</p>
        <Link href="/admin" className="text-xs text-blue-600 font-bold hover:underline inline-block pt-2">
          ← Back to Orders Console
        </Link>
      </div>
    );
  }

  const trackingUrl = typeof window !== "undefined"
    ? `${window.location.origin}/track?id=${encodeURIComponent(order.trackingId)}`
    : `/track?id=${order.trackingId}`;

  const manualWhatsAppMessage = `Hello ${order.customer.name}, update regarding your ${order.deviceBrand} ${order.deviceModel} (Tracking ID: ${order.trackingId}) at ${SYSTEM_CONFIG.storeName}: Current status is ${order.statusLabel}. Track live: ${trackingUrl}`;
  const manualWhatsAppUrl = `https://wa.me/${order.customer.phone.replace(/\D/g, "")}?text=${encodeURIComponent(manualWhatsAppMessage)}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 transition shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black uppercase text-slate-900 font-mono">
                {order.trackingId}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${order.badgeClass}`}>
                {order.statusLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Registered on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Quick External Actions */}
        <div className="flex items-center gap-2">
          <Link
            href={`/track?id=${order.trackingId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-blue-600 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
            <span>Customer View</span>
          </Link>

          <a
            href={manualWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm active:scale-95 transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Customer</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Order Details & Status Updater */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Status Workflow Manager Box */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-xs font-black uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-blue-600" />
                <span>Update Repair Status Workflow</span>
              </h2>
              <span className="text-[10px] text-slate-500 font-semibold">11 Certified Statuses</span>
            </div>

            {statusSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{statusSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleStatusUpdate} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Transition Status *
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as RepairStatus)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {Object.entries(REPAIR_STATUSES).map(([code, meta]) => (
                    <option key={code} value={code}>
                      {meta.label} ({code})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Customer will see: &quot;{REPAIR_STATUSES[selectedStatus]?.customerDescription}&quot;
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Customer-Visible Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Screen assembly replaced; now running touch calibration..."
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Internal Technician Note (Strictly Staff Only)
                </label>
                <textarea
                  rows={2}
                  placeholder="PCB voltage check, replaced PMIC capacitor C23, parts supplier invoice ref..."
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={selectedStatus === "READY_FOR_PICKUP" || pickupReady}
                    onChange={(e) => setPickupReady(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span>Mark Ready for Pickup at Gandhinagar store</span>
                </label>

                <button
                  type="submit"
                  disabled={submittingStatus}
                  className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition disabled:opacity-50"
                >
                  {submittingStatus ? "Recording..." : "Apply Status Update"}
                </button>
              </div>
            </form>
          </div>

          {/* Immutable Audit Trail: Status History */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Immutable Status History &amp; Audit Trail</span>
            </h2>

            <div className="space-y-2.5">
              {order.statusHistory.map((h, index) => (
                <div
                  key={h.id || index}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-800">{h.statusLabel}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(h.createdAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {h.customerNote && (
                    <div className="text-[11px] text-slate-700">
                      <span className="text-slate-500 font-semibold">Customer Update:</span> &quot;{h.customerNote}&quot;
                    </div>
                  )}

                  {h.internalNote && (
                    <div className="text-[11px] text-amber-900 font-mono bg-amber-50/60 p-2 rounded-lg border border-amber-200/60">
                      <span className="text-amber-700 font-semibold">Staff Note:</span> {h.internalNote}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 pt-0.5">
                    Logged by: <span className="text-slate-700 font-medium">{h.updatedBy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (1 col): Customer Details & Notifications */}
        <div className="space-y-6">
          
          {/* Customer Profile Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3 text-xs">
            <h2 className="text-xs font-black uppercase tracking-wider text-blue-700 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <User className="w-4 h-4 text-blue-600" />
              <span>Customer Information</span>
            </h2>

            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Name</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">{order.customer.name}</span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Phone Number</span>
              <a
                href={`tel:${order.customer.phone}`}
                className="font-mono font-bold text-blue-600 hover:underline block mt-0.5"
              >
                {order.customer.phone}
              </a>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Location</span>
              <span className="font-bold text-slate-800 block mt-0.5">{order.customer.location || "Gandhinagar"}</span>
            </div>

            {order.customer.email && (
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Email</span>
                <span className="text-slate-700 block mt-0.5">{order.customer.email}</span>
              </div>
            )}

            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">WhatsApp Notifications</span>
              <span className={`text-[10px] font-bold uppercase mt-0.5 inline-block px-2 py-0.5 rounded-full ${order.customer.consentWhatsApp ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                {order.customer.consentWhatsApp ? "✓ Consented" : "Not Requested"}
              </span>
            </div>
          </div>

          {/* Smartphone Hardware Specs */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3 text-xs">
            <h2 className="text-xs font-black uppercase tracking-wider text-blue-700 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>Device &amp; Repair Info</span>
            </h2>

            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Brand &amp; Model</span>
              <span className="font-bold text-slate-900 block mt-0.5">
                {order.deviceBrand} {order.deviceModel}
              </span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Category</span>
              <span className="text-slate-800 font-semibold block mt-0.5">{order.repairCategory}</span>
            </div>

            {order.imeiSerial && (
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">IMEI / Serial</span>
                <span className="font-mono text-slate-700 block mt-0.5">{order.imeiSerial}</span>
              </div>
            )}

            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Reported Problem</span>
              <p className="text-slate-700 leading-relaxed mt-0.5">{order.reportedIssue}</p>
            </div>

            {order.serviceCost && (
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Quoted Service Cost</span>
                <span className="font-mono font-bold text-emerald-700 text-sm block mt-0.5">
                  ₹{order.serviceCost.toLocaleString("en-IN")}
                </span>
              </div>
            )}
          </div>

          {/* Meta WhatsApp Cloud API Trigger Station */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3 text-xs">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Official Cloud API Broadcast</span>
            </h2>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              If Meta WhatsApp Business credentials are configured, you can trigger official direct notifications to the client&apos;s phone.
            </p>

            {cloudWaResult && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-blue-700">
                {cloudWaResult}
              </div>
            )}

            <button
              onClick={handleCloudApiDispatch}
              disabled={sendingCloudWa}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-emerald-400" />
              <span>{sendingCloudWa ? "Dispatching..." : "Send Cloud API WhatsApp"}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
