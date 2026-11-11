"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Send, Search } from "lucide-react";

interface NotificationItem {
  id: number;
  order_id?: number;
  recipient_phone: string;
  message_template: string;
  message_body: string;
  status: string;
  created_at: string;
  tracking_id?: string;
  device_model?: string;
  channel?: string;
}

export default function CustomerMessagesView() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("denish_admin_token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/admin/notifications?source=customer_dispatches", { headers });
      const json = await res.json();
      if (res.ok && json.success) {
        setNotifications(json.data.notifications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filtered = notifications.filter((n) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      n.recipient_phone.includes(term) ||
      (n.tracking_id && n.tracking_id.toLowerCase().includes(term)) ||
      (n.message_body && n.message_body.toLowerCase().includes(term)) ||
      (n.message_template && n.message_template.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div>
          <h1 className="text-base font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-600" />
            <span>Customer Notifications &amp; WhatsApp History</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit log of all WhatsApp and manual notification dispatches sent to customers.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search phone, tracking ID..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
          />
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-3">Date / Time</th>
                <th className="py-3 px-3">Tracking ID</th>
                <th className="py-3 px-3">Recipient Phone</th>
                <th className="py-3 px-3">Template</th>
                <th className="py-3 px-3">Message Content</th>
                <th className="py-3 px-3">Channel</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading notifications history...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300">No Customer Messages Logged</div>
                    <div className="text-xs text-slate-500 mt-1">Dispatched notifications will appear here.</div>
                  </td>
                </tr>
              ) : (
                filtered.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(n.created_at).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {n.tracking_id || "Direct"}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold">
                      +{n.recipient_phone}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                      {n.message_template}
                    </td>
                    <td className="py-3 px-3 max-w-xs text-slate-600 dark:text-slate-400 truncate">
                      {n.message_body}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {n.channel || "whatsapp"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        n.status === "sent" || n.status === "delivered"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                          : n.status === "manual_click"
                          ? "bg-blue-50 text-blue-700 border border-blue-300"
                          : "bg-rose-50 text-rose-700 border border-rose-300"
                      }`}>
                        {n.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
