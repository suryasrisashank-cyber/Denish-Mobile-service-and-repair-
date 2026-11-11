"use client";

import React, { useState } from "react";
import { X, Archive } from "lucide-react";

interface ArchiveOrderModalProps {
  order: {
    id: number;
    trackingId: string;
    deviceBrand: string;
    deviceModel: string;
    customer: {
      name: string;
      phone: string;
    };
  };
  onClose: () => void;
  onArchived: () => void;
}

export default function ArchiveOrderModal({ order, onClose, onArchived }: ArchiveOrderModalProps) {
  const [reason, setReason] = useState("Customer requested cancellation");
  const [customReason, setCustomReason] = useState("");
  const [isArchiving, setIsArchiving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const predefinedReasons = [
    "Customer requested cancellation",
    "Duplicate request entry",
    "Device unrepairable / Motherboard dead",
    "Parts discontinued or unavailable",
    "Customer declined estimated quote",
    "Other reason",
  ];

  const handleArchive = async () => {
    setIsArchiving(true);
    setErrorMsg(null);

    const finalReason = reason === "Other reason" && customReason.trim() ? customReason.trim() : reason;

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("denish_admin_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "DELETE",
        headers,
        body: JSON.stringify({ reason: finalReason }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to archive order.");
      }

      onArchived();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error archiving order.");
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in slide-in-from-bottom duration-200 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-rose-600">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
              <Archive className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Archive Repair Order
              </h3>
              <p className="text-[11px] text-slate-500">Soft-delete order from active board</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {errorMsg}
          </div>
        )}

        {/* Order Details Highlight */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Tracking ID:</span>
            <span className="font-mono font-bold text-blue-600">{order.trackingId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Service ID (Phone):</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{order.customer.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Customer:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{order.customer.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Device:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{order.deviceBrand} {order.deviceModel}</span>
          </div>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-400">
          This order will be safely archived and hidden from active views. You can restore it anytime from the <strong>Archived Orders</strong> tab.
        </div>

        {/* Reason Selector */}
        <div className="space-y-2 text-xs">
          <label className="block text-[10px] font-bold uppercase text-slate-500">
            Reason for Archival *
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold outline-none"
          >
            {predefinedReasons.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {reason === "Other reason" && (
            <input
              type="text"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Specify custom archive reason..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none mt-1"
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={onClose}
            disabled={isArchiving}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleArchive}
            disabled={isArchiving}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-md disabled:opacity-50"
          >
            {isArchiving ? "Archiving..." : "Confirm Archive"}
          </button>
        </div>

      </div>
    </div>
  );
}
