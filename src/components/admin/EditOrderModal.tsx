"use client";

import React, { useState } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import { REPAIR_STATUSES, RepairStatus, DEVICE_BRANDS, REPAIR_SERVICES } from "@/lib/constants";

interface EditOrderModalProps {
  order: {
    id: number;
    trackingId: string;
    deviceBrand: string;
    deviceModel: string;
    imeiSerial?: string | null;
    repairCategory: string;
    reportedIssue: string;
    inspectionNotes?: string | null;
    estimatedCompletion: string | null;
    serviceCost: number | null;
    currentStatus: RepairStatus;
    paid: boolean;
    type?: string;
    customer: {
      id: number;
      name: string;
      phone: string;
      location: string;
      email?: string | null;
    };
  };
  onClose: () => void;
  onSaved: () => void;
}

export default function EditOrderModal({ order, onClose, onSaved }: EditOrderModalProps) {
  const [customerName, setCustomerName] = useState(order.customer.name || "");
  const [customerPhone, setCustomerPhone] = useState(order.customer.phone || "");
  const [customerLocation, setCustomerLocation] = useState(order.customer.location || "");
  const [customerEmail, setCustomerEmail] = useState(order.customer.email || "");

  const [deviceBrand, setDeviceBrand] = useState(order.deviceBrand || "Apple");
  const [deviceModel, setDeviceModel] = useState(order.deviceModel || "");
  const [imeiSerial, setImeiSerial] = useState(order.imeiSerial || "");
  const [repairCategory, setRepairCategory] = useState(order.repairCategory || "Screen Replacement");
  const [reportedIssue, setReportedIssue] = useState(order.reportedIssue || "");
  const [inspectionNotes, setInspectionNotes] = useState(order.inspectionNotes || "");
  const [estimatedCompletion, setEstimatedCompletion] = useState(order.estimatedCompletion || "");
  const [serviceCost, setServiceCost] = useState(order.serviceCost ? String(order.serviceCost) : "");
  const [currentStatus, setCurrentStatus] = useState<RepairStatus>(order.currentStatus);
  const [paid, setPaid] = useState<boolean>(order.paid);
  const [customerType, setCustomerType] = useState<string>(order.type || "Customer");
  const [internalNote, setInternalNote] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("denish_admin_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerLocation: customerLocation.trim(),
          customerEmail: customerEmail.trim() || undefined,
          deviceBrand: deviceBrand.trim(),
          deviceModel: deviceModel.trim(),
          imeiSerial: imeiSerial.trim() || undefined,
          repairCategory: repairCategory.trim(),
          reportedIssue: reportedIssue.trim(),
          inspectionNotes: inspectionNotes.trim() || undefined,
          estimatedCompletion: estimatedCompletion.trim() || undefined,
          serviceCost: serviceCost ? Number(serviceCost) : null,
          currentStatus,
          paid,
          customerType,
          internalNote: internalNote.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update order details.");
      }

      onSaved();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error saving changes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl max-w-2xl w-full p-5 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[92vh] overflow-y-auto space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">
                {order.trackingId}
              </span>
              <span className="text-[11px] font-mono font-semibold text-slate-500">
                Service ID: {order.customer.phone}
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
              Edit Repair Order Details
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Section 1: Customer Details */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-3">
            <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
              Customer Information
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Customer Phone (Service ID) *
                </label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Location / Sector *</label>
                <input
                  type="text"
                  required
                  value={customerLocation}
                  onChange={(e) => setCustomerLocation(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Email Address</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Optional customer email"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Customer Type</label>
                <select
                  value={customerType}
                  onChange={(e) => setCustomerType(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  <option value="Customer">Retail Customer</option>
                  <option value="Dealer">Dealer / Workshop Partner</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Device & Problem Details */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-3">
            <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
              Device &amp; Issue Details
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Device Brand *</label>
                <select
                  value={deviceBrand}
                  onChange={(e) => setDeviceBrand(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  {DEVICE_BRANDS.map((b) => (
                    <option key={b.name} value={b.name}>{b.name}</option>
                  ))}
                  <option value="Other">Other Brand</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Model Name / Number *</label>
                <input
                  type="text"
                  required
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                  placeholder="e.g. iPhone 13 Pro / Galaxy S22"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">IMEI / Serial Number</label>
                <input
                  type="text"
                  value={imeiSerial}
                  onChange={(e) => setImeiSerial(e.target.value)}
                  placeholder="Optional 15-digit IMEI"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Repair Category *</label>
                <select
                  value={repairCategory}
                  onChange={(e) => setRepairCategory(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  {REPAIR_SERVICES.map((s) => (
                    <option key={s.id} value={s.title}>{s.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Estimated Completion</label>
                <input
                  type="text"
                  value={estimatedCompletion}
                  onChange={(e) => setEstimatedCompletion(e.target.value)}
                  placeholder="e.g. Today 6:00 PM / 24 Hours"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Reported Issue / Fault Description *</label>
              <textarea
                required
                rows={2}
                value={reportedIssue}
                onChange={(e) => setReportedIssue(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Intake / Technical Inspection Notes</label>
              <textarea
                rows={2}
                value={inspectionNotes}
                onChange={(e) => setInspectionNotes(e.target.value)}
                placeholder="Diagnostic findings, visual inspection..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>

          {/* Section 3: Status & Pricing */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-3">
            <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
              Status &amp; Billing
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Work Status</label>
                <select
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value as RepairStatus)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  {Object.entries(REPAIR_STATUSES).map(([code, meta]) => (
                    <option key={code} value={code}>{meta.label} ({code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Service Cost (₹)</label>
                <input
                  type="number"
                  value={serviceCost}
                  onChange={(e) => setServiceCost(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Payment Status</label>
                <button
                  type="button"
                  onClick={() => setPaid(!paid)}
                  className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition ${
                    paid ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-amber-50 text-amber-700 border-amber-300"
                  }`}
                >
                  {paid ? "Paid ✓" : "Pending Payment"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Internal Admin Note (Audit Log)</label>
              <input
                type="text"
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Reason for change / technician updates..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-md transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? "Saving Changes..." : "Save Changes"}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
