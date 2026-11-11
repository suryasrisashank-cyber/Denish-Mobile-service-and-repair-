"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Archive, RotateCcw, Search, AlertCircle, CheckCircle2 } from "lucide-react";

interface ArchivedOrder {
  id: number;
  serviceId?: string;
  trackingId: string;
  deviceBrand: string;
  deviceModel: string;
  repairCategory: string;
  reportedIssue: string;
  currentStatus: string;
  statusLabel: string;
  badgeClass: string;
  amount: string;
  archivedAt: string | null;
  archiveReason: string | null;
  createdAt: string;
  customer: {
    id: number;
    name: string;
    phone: string;
    location: string;
  };
}

export default function ArchivedOrdersView() {
  const [archivedOrders, setArchivedOrders] = useState<ArchivedOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchArchivedOrders = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("denish_admin_token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/admin/orders?archived=true&q=${encodeURIComponent(search)}`, { headers });
      const json = await res.json();
      if (res.ok && json.success) {
        setArchivedOrders(json.data.orders || []);
      } else {
        throw new Error(json.error || "Failed to load archived orders.");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error fetching archived orders.");
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchArchivedOrders();
  }, [fetchArchivedOrders]);

  const handleRestore = async (orderId: number, trackingId: string) => {
    setRestoringId(orderId);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("denish_admin_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/admin/orders/${orderId}/restore`, {
        method: "POST",
        headers,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to restore order.");
      }

      setToastMsg(`Order ${trackingId} restored to active dashboard.`);
      setTimeout(() => setToastMsg(null), 3000);
      await fetchArchivedOrders();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error restoring order.");
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-full shadow-2xl text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div>
          <h1 className="text-base font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
            <Archive className="w-5 h-5 text-rose-600" />
            <span>Archived Repair Orders</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Safely preserved records hidden from the active service queue. Restore an order anytime.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search archived orders..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
          />
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase text-[10px]">
              <th className="py-3 px-3">Tracking ID / Service ID</th>
              <th className="py-3 px-3">Customer</th>
              <th className="py-3 px-3">Location</th>
              <th className="py-3 px-3">Device</th>
              <th className="py-3 px-3">Repair Category</th>
              <th className="py-3 px-3">Archive Reason</th>
              <th className="py-3 px-3">Archived Date</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  Loading archived orders...
                </td>
              </tr>
            ) : archivedOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-300">No Archived Orders</div>
                  <div className="text-xs text-slate-500 mt-1">Orders archived by administrators will appear here.</div>
                </td>
              </tr>
            ) : (
              archivedOrders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3">
                    <div className="font-mono font-bold text-blue-600 dark:text-blue-400">{o.trackingId}</div>
                    <div className="text-[10px] text-slate-500 font-mono">Service ID: {o.serviceId || o.customer.phone}</div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">{o.customer.name}</td>
                  <td className="py-3 px-3 text-slate-500">{o.customer.location}</td>
                  <td className="py-3 px-3 font-semibold">{o.deviceBrand} {o.deviceModel}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{o.repairCategory}</td>
                  <td className="py-3 px-3 text-rose-600 dark:text-rose-400 font-medium">
                    {o.archiveReason || "Archived by admin"}
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-[11px]">
                    {o.archivedAt ? new Date(o.archivedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleRestore(o.id, o.trackingId)}
                      disabled={restoringId === o.id}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 font-bold text-xs inline-flex items-center gap-1 transition disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{restoringId === o.id ? "Restoring..." : "Restore Order"}</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            Loading archived orders...
          </div>
        ) : archivedOrders.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">No Archived Orders</div>
            <div className="text-xs text-slate-500 mt-1">Orders archived by administrators will appear here.</div>
          </div>
        ) : (
          archivedOrders.map((o) => (
            <div key={o.id} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-blue-600">{o.trackingId}</span>
                <span className="text-[10px] text-slate-400 font-mono">Service ID: {o.serviceId || o.customer.phone}</span>
              </div>
              <div className="font-bold text-slate-900 dark:text-white">{o.customer.name}</div>
              <div className="text-slate-700 dark:text-slate-300 font-semibold">{o.deviceBrand} {o.deviceModel} ({o.repairCategory})</div>
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200/50 text-rose-700 dark:text-rose-300 text-[11px]">
                Reason: {o.archiveReason || "Archived by admin"}
              </div>
              <div className="pt-2">
                <button
                  onClick={() => handleRestore(o.id, o.trackingId)}
                  disabled={restoringId === o.id}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{restoringId === o.id ? "Restoring..." : "Restore Order"}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

