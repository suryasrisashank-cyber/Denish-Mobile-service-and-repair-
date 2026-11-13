"use client";

import React, { useState } from "react";
import { X, Trash2, AlertTriangle, UserX } from "lucide-react";

interface DeleteCustomerModalProps {
  customer: {
    id: number;
    name: string;
    phone: string;
    order_count?: number;
    location?: string | null;
  };
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteCustomerModal({ customer, onClose, onDeleted }: DeleteCustomerModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMsg(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("denish_admin_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/admin/customers/${customer.id}`, {
        method: "DELETE",
        headers,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to permanently delete customer.");
      }

      onDeleted();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error deleting customer.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 border border-rose-200 dark:border-rose-900 shadow-2xl animate-in slide-in-from-bottom duration-200 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-rose-600">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
              <UserX className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Delete Customer
              </h3>
              <p className="text-[11px] text-rose-600 font-semibold">
                Permanent Customer &amp; Order Removal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Customer Details Box */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Customer Name:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{customer.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Mobile Number:</span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{customer.phone}</span>
          </div>
          {customer.location && (
            <div className="flex justify-between">
              <span className="text-slate-500">Location:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{customer.location}</span>
            </div>
          )}
          {customer.order_count !== undefined && (
            <div className="flex justify-between">
              <span className="text-slate-500">Associated Repair Orders:</span>
              <span className="font-bold text-rose-600">{customer.order_count} order(s)</span>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Are you sure you want to permanently delete this customer? This will delete the customer profile and remove all associated repair orders, status history, and communications from the database.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50 shadow-md shadow-rose-600/20"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? "Deleting..." : "Delete Customer"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

