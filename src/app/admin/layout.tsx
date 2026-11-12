"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, ListOrdered, Inbox, Wrench, 
  CheckCircle2, PackageCheck, Truck, XCircle, Search, 
  BarChart3, Settings, LogOut, PlusCircle, ExternalLink, 
  Menu, X, User, ChevronRight, ShieldCheck, Eye, Clock,
  ShoppingBag, Bell, Sun, Moon, Laptop, MessageCircle,
  Archive, Send, CheckCheck, Check, Trash2, ArrowUpRight,
  RefreshCw, Filter
} from "lucide-react";

interface AdminUser {
  adminId: number;
  username: string;
  name: string;
  role: "super_admin" | "technician";
  email: string;
}

interface AdminNotificationItem {
  id: number;
  type: "SERVICE_REQUEST" | "INCOMING_WHATSAPP" | "STATUS_UPDATE" | "OUTGOING_MESSAGE" | "SYSTEM_ALERT" | string;
  title: string;
  message: string;
  order_id?: number;
  conversation_id?: number;
  tracking_id?: string;
  customer_name?: string;
  customer_phone?: string;
  is_read: number;
  created_at: string;
  device_model?: string;
  current_status?: string;
}

interface NotificationCounts {
  total: number;
  unread: number;
  serviceRequests: number;
  incomingWhatsApp: number;
  statusUpdates: number;
  outgoingMessages: number;
}

// Helper for relative notification timestamps
function formatNotifTime(isoString?: string): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  } catch {
    return isoString;
  }
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";

  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(!isLoginPage);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [notifCounts, setNotifCounts] = useState<NotificationCounts>({
    total: 0,
    unread: 0,
    serviceRequests: 0,
    incomingWhatsApp: 0,
    statusUpdates: 0,
    outgoingMessages: 0,
  });
  const [selectedNotifCategory, setSelectedNotifCategory] = useState<"ALL" | "SERVICE_REQUEST" | "INCOMING_WHATSAPP" | "STATUS_UPDATE" | "OUTGOING_MESSAGE">("ALL");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  // Theme & client search state (hydrated safely after mount)
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("light");
  const [clientSearch, setClientSearch] = useState("");

  useEffect(() => {
    setClientSearch(typeof window !== "undefined" ? window.location.search : "");
  }, [pathname]);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("denish_admin_theme") as "light" | "dark" | "system" | null;
      if (savedTheme) setThemeMode(savedTheme);
    } catch {}
  }, []);

  const changeTheme = (mode: "light" | "dark" | "system") => {
    setThemeMode(mode);
    try {
      localStorage.setItem("denish_admin_theme", mode);
      const root = document.documentElement;
      let isDark = mode === "dark";
      if (mode === "system") {
        isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
      if (isDark) root.classList.add("dark");
      else root.classList.remove("dark");
    } catch {}
  };

  const fetchNotifications = useCallback(async (cat = selectedNotifCategory, unread = unreadOnly) => {
    setLoadingNotifs(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("denish_admin_token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const params = new URLSearchParams();
      if (cat && cat !== "ALL") params.append("type", cat);
      if (unread) params.append("unread", "true");

      const res = await fetch(`/api/admin/notifications?${params.toString()}`, { headers });
      const json = await res.json();
      if (json.success && json.data) {
        setNotifications(json.data.notifications || []);
        if (json.data.counts) {
          setNotifCounts(json.data.counts);
        }
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoadingNotifs(false);
    }
  }, [selectedNotifCategory, unreadOnly]);

  useEffect(() => {
    if (isLoginPage) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("denish_admin_token") : null;
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    fetch("/api/admin/me", { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setAdmin(data.data);
          fetchNotifications();
        } else {
          try {
            localStorage.removeItem("denish_admin_token");
          } catch {}
          router.replace("/admin/login");
        }
      })
      .catch(() => {
        router.replace("/admin/login");
      })
      .finally(() => setLoading(false));
  }, [isLoginPage, router, fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("denish_admin_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers,
        body: JSON.stringify({ markAllRead: true }),
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (e) {
      console.error("Error marking all read:", e);
    }
  };

  const handleClearRead = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("denish_admin_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers,
        body: JSON.stringify({ clearRead: true }),
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (e) {
      console.error("Error clearing read:", e);
    }
  };

  const handleMarkSingleRead = async (id: number) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
      setNotifCounts((prev) => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1),
      }));

      const token = typeof window !== "undefined" ? localStorage.getItem("denish_admin_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers,
        body: JSON.stringify({ id }),
      });
    } catch (e) {
      console.error("Error marking notification read:", e);
    }
  };

  const handleCategoryChange = (cat: "ALL" | "SERVICE_REQUEST" | "INCOMING_WHATSAPP" | "STATUS_UPDATE" | "OUTGOING_MESSAGE") => {
    setSelectedNotifCategory(cat);
    fetchNotifications(cat, unreadOnly);
  };

  const handleToggleUnread = () => {
    const next = !unreadOnly;
    setUnreadOnly(next);
    fetchNotifications(selectedNotifCategory, next);
  };

  const handleLogout = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("denish_admin_token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      await fetch("/api/admin/logout", { method: "POST", headers });
      try {
        localStorage.removeItem("denish_admin_token");
      } catch {}
    } finally {
      window.location.href = "/admin/login";
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading || !admin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-slate-600 dark:text-slate-300">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider">Verifying Admin Session...</span>
        </div>
      </div>
    );
  }

  // 14 Desktop Sidebar Navigation Items strictly matching Phase 3 specification
  const desktopSidebarItems = [
    { id: "dashboard", href: "/admin", label: "Dashboard", number: "1", icon: LayoutDashboard },
    { id: "all_orders", href: "/admin?status=ALL", label: "All Orders", number: "2", icon: ListOrdered },
    { id: "new_requests", href: "/admin?status=NEW_REQUEST", label: "New Requests", number: "3", icon: Inbox, highlight: true },
    { id: "received", href: "/admin?status=RECEIVED", label: "Received", number: "4", icon: PackageCheck },
    { id: "under_inspection", href: "/admin?status=UNDER_INSPECTION", label: "Under Inspection", number: "5", icon: Eye },
    { id: "repairing", href: "/admin?status=REPAIRING", label: "Repairing", number: "6", icon: Wrench },
    { id: "waiting_for_parts", href: "/admin?status=WAITING_FOR_PARTS", label: "Waiting for Parts", number: "7", icon: Clock },
    { id: "completed", href: "/admin?status=COMPLETED", label: "Completed", number: "8", icon: CheckCircle2 },
    { id: "pickup_ready", href: "/admin?status=READY_FOR_PICKUP", label: "Ready for Pickup", number: "9", icon: ShoppingBag },
    { id: "delivered", href: "/admin?status=DELIVERED", label: "Delivered", number: "10", icon: Truck },
    { id: "cancelled", href: "/admin?status=CANCELLED", label: "Cancelled", number: "11", icon: XCircle },
    { id: "reports", href: "/admin?view=reports", label: "Reports", number: "12", icon: BarChart3 },
    { id: "settings", href: "/admin?view=settings", label: "Settings", number: "13", icon: Settings },
  ];

  const commsSidebarItems = [
    { id: "inbox", href: "/admin?view=inbox", label: "WhatsApp Inbox", icon: MessageCircle },
    { id: "messages", href: "/admin?view=messages", label: "Customer Messages", icon: Send },
    { id: "archived", href: "/admin?view=archived", label: "Archived Orders", icon: Archive },
  ];

  const isItemActive = (item: { id: string; href: string }) => {
    if (item.id === "dashboard") {
      return pathname === "/admin" && !clientSearch;
    }
    if (item.href.includes("?")) {
      const queryPart = item.href.split("?")[1];
      return pathname === "/admin" && clientSearch.includes(queryPart);
    }
    return pathname === item.href;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row font-sans antialiased">
      
      {/* ── MOBILE / TABLET TOP HEADER BAR (Screens < 1024px) ── */}
      <header className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3.5 py-2.5 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2.5">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-sm flex items-center justify-center shadow-xs">
              D
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white leading-tight">
                DENISH MOBILE
              </div>
              <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                Admin Portal
              </div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Notifications Icon Button */}
          <button
            onClick={() => {
              fetchNotifications();
              setShowNotificationsModal(true);
            }}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 relative transition"
            title="Admin Notifications"
            aria-label="View Admin Notifications"
          >
            <Bell className="w-4 h-4" />
            {notifCounts.unread > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-blue-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                {notifCounts.unread > 9 ? "9+" : notifCounts.unread}
              </span>
            )}
          </button>

          {/* Account Button */}
          <button
            onClick={() => setShowAccountModal(true)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            title="Admin Account"
            aria-label="Admin Account"
          >
            <User className="w-4 h-4" />
          </button>

          {/* Create Order Quick Button */}
          <Link
            href="/admin/new-order"
            className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition active:scale-95"
            title="Create New Order"
          >
            <PlusCircle className="w-4 h-4" />
          </Link>

          {/* Slide-out Menu Toggle */}
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle Navigation Drawer"
          >
            {mobileDrawerOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ── DESKTOP FIXED SIDEBAR (Screens >= 1024px) ── */}
      <aside className="hidden lg:flex flex-col justify-between w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0 z-30 p-4 shadow-xs">
        <div>
          {/* Brand & Logo Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-lg flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              D
            </div>
            <div className="truncate">
              <div className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white truncate">
                DENISH REPAIR
              </div>
              <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider truncate">
                Gandhinagar Workshop
              </div>
            </div>
          </div>

          {/* Quick Order Action */}
          <div className="mt-3.5">
            <Link
              href="/admin/new-order"
              className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs active:scale-95 transition"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>New Repair Order</span>
            </Link>
          </div>

          {/* 13 Navigation Items (Items 1 - 13) */}
          <nav className="mt-3 space-y-0.5 overflow-y-auto max-h-[calc(100vh-320px)] pr-1 scrollbar-thin">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-1">
              Service Operations
            </div>
            {desktopSidebarItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    active
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${active ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`} />
                    <span className="truncate">{item.number}. {item.label}</span>
                  </div>
                  {item.highlight && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0" />
                  )}
                </Link>
              );
            })}

            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 pt-3 py-1">
              WhatsApp & Records
            </div>
            {commsSidebarItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    active
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${active ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                </Link>
              );
            })}

            {/* Desktop Admin Notifications Action */}
            <button
              onClick={() => {
                fetchNotifications();
                setShowNotificationsModal(true);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition group text-left"
            >
              <div className="flex items-center gap-2.5 truncate">
                <Bell className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition shrink-0" />
                <span className="truncate">Admin Notifications</span>
              </div>
              {notifCounts.unread > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {notifCounts.unread}
                </span>
              )}
            </button>

            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 pt-3 py-1">
              Live Public Links
            </div>
            <Link
              href="/track"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <span className="flex items-center gap-2.5">
                <ExternalLink className="w-4 h-4 text-blue-600" />
                <span>Customer Tracker</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <span className="flex items-center gap-2.5">
                <ExternalLink className="w-4 h-4 text-emerald-600" />
                <span>Customer Website</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </nav>
        </div>

        {/* Desktop Admin Profile & Sign Out (Item 14: Logout) */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          {admin && (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {admin.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    @{admin.username}
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shrink-0">
                {admin.role === "super_admin" ? "Admin" : "Tech"}
              </span>
            </div>
          )}

          {/* Item 14: Logout */}
          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 hover:border-rose-200 text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>14. Logout</span>
          </button>
        </div>
      </aside>

      {/* ── MOBILE SLIDE-OUT DRAWER (For Screens < 1024px) ── */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" 
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-72 bg-white dark:bg-slate-900 h-full flex flex-col justify-between p-4 shadow-xl z-10 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                    D
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase text-slate-900 dark:text-white">DENISH REPAIR</div>
                    <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase">Mobile Console</div>
                  </div>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="mt-4 space-y-1">
                {desktopSidebarItems.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item);
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        active
                          ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`} />
                      <span>{item.number}. {item.label}</span>
                    </Link>
                  );
                })}

                <div className="pt-2 pb-1 border-t border-slate-100 dark:border-slate-800 mt-2">
                  <div className="text-[10px] font-bold uppercase text-slate-400 px-3 py-1">WhatsApp & Records</div>
                  {commsSidebarItems.map((item) => {
                    const Icon = item.icon;
                    const active = isItemActive(item);
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setMobileDrawerOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                          active
                            ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${active ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}

                  <button
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      fetchNotifications();
                      setShowNotificationsModal(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Bell className="w-4 h-4 text-slate-400" />
                      <span>Admin Notifications</span>
                    </div>
                    {notifCounts.unread > 0 && (
                      <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {notifCounts.unread}
                      </span>
                    )}
                  </button>
                </div>

                <div className="pt-2 pb-1 border-t border-slate-100 dark:border-slate-800 mt-2">
                  <div className="text-[10px] font-bold uppercase text-slate-400 px-3 py-1">Quick Links</div>
                  <Link
                    href="/track"
                    target="_blank"
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                    <span>Customer Tracker</span>
                  </Link>
                  <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    <ExternalLink className="w-4 h-4 text-emerald-600" />
                    <span>Customer Website</span>
                  </Link>
                </div>
              </nav>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>14. Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <main className="flex-1 p-3 sm:p-5 lg:p-7 max-w-7xl w-full mx-auto pb-28 md:pb-8">
          {loading ? (
            <div className="p-16 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Verifying Admin Authorization...</span>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAVIGATION BAR (Screens < 768px strictly) ── */}
      <nav 
        aria-label="Mobile Navigation Bar" 
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-40 px-2 py-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-lg flex items-center justify-around"
      >
        {/* 1. Home */}
        <Link
          href="/admin"
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl min-w-[56px] min-h-[44px] transition active:scale-95 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight font-medium">Home</span>
        </Link>

        {/* 2. Orders */}
        <Link
          href="/admin?status=ALL"
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl min-w-[56px] min-h-[44px] transition active:scale-95 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <ListOrdered className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight font-medium">Orders</span>
        </Link>

        {/* 3. New Order (Prominent Center Touch Target) */}
        <Link
          href="/admin/new-order"
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl min-w-[56px] min-h-[44px] transition active:scale-95"
        >
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30 -mt-4 border-2 border-white dark:border-slate-900">
            <PlusCircle className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 leading-tight mt-0.5">New</span>
        </Link>

        {/* 4. Search */}
        <Link
          href="/admin?focus=search"
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl min-w-[56px] min-h-[44px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition active:scale-95"
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight font-medium">Search</span>
        </Link>

        {/* 5. Account */}
        <button
          onClick={() => setShowAccountModal(true)}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl min-w-[56px] min-h-[44px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition active:scale-95"
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight font-medium">Account</span>
        </button>
      </nav>

      {/* ── ADMIN OPERATIONAL & WHATSAPP NOTIFICATIONS DRAWER / MODAL ── */}
      {showNotificationsModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
            onClick={() => setShowNotificationsModal(false)}
          />
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl z-10 flex flex-col max-h-[90vh] sm:max-h-[85vh] border border-slate-200/80 dark:border-slate-800 overflow-hidden">
            {/* Mobile Drag Handle */}
            <div className="pt-3 pb-1 sm:hidden">
              <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto" />
            </div>

            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center relative shrink-0">
                  <Bell className="w-5 h-5" />
                  {notifCounts.unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-900 animate-ping" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900 dark:text-white text-base">
                      Admin Notifications
                    </h3>
                    {notifCounts.unread > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[10px]">
                        {notifCounts.unread} unread
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Real-time requests, incoming WhatsApp & status updates
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => fetchNotifications()}
                  disabled={loadingNotifs}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Refresh notifications"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingNotifs ? "animate-spin text-blue-600" : ""}`} />
                </button>
                <button 
                  onClick={() => setShowNotificationsModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="px-4 py-2 bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
              {[
                { key: "ALL", label: "All", count: notifCounts.total },
                { key: "SERVICE_REQUEST", label: "Requests", count: notifCounts.serviceRequests },
                { key: "INCOMING_WHATSAPP", label: "WhatsApp In", count: notifCounts.incomingWhatsApp },
                { key: "STATUS_UPDATE", label: "Updates", count: notifCounts.statusUpdates },
                { key: "OUTGOING_MESSAGE", label: "Messages Out", count: notifCounts.outgoingMessages },
              ].map((tab) => {
                const isSelected = selectedNotifCategory === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => handleCategoryChange(tab.key as "ALL" | "SERVICE_REQUEST" | "INCOMING_WHATSAPP" | "STATUS_UPDATE" | "OUTGOING_MESSAGE")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                      isSelected 
                        ? "bg-blue-700 text-white" 
                        : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Toolbar: Unread Toggle & Actions */}
            <div className="px-4 py-2 bg-slate-50/40 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs shrink-0">
              <button
                onClick={handleToggleUnread}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-semibold transition ${
                  unreadOnly
                    ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700"
                    : "text-slate-500 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>{unreadOnly ? "Showing Unread" : "Filter Unread"}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleMarkAllRead}
                  disabled={notifCounts.unread === 0}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Mark all read</span>
                </button>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <button
                  onClick={handleClearRead}
                  disabled={(notifCounts.total - notifCounts.unread) === 0}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear read</span>
                </button>
              </div>
            </div>

            {/* Notification List Body */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1 scrollbar-thin">
              {loadingNotifs && notifications.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <div>Loading notifications...</div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-14 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <div className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                    No Notifications Found
                  </div>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Customer service requests, WhatsApp inbound chats, and repair updates will automatically appear here.
                  </p>
                </div>
              ) : (
                notifications.map((n) => {
                  const isUnread = n.is_read === 0;

                  // Category Badge Styling
                  let badgeIcon = <Bell className="w-3.5 h-3.5" />;
                  let badgeLabel = "Alert";
                  let badgeClass = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

                  if (n.type === "SERVICE_REQUEST") {
                    badgeIcon = <Inbox className="w-3.5 h-3.5" />;
                    badgeLabel = "Service Request";
                    badgeClass = "bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800";
                  } else if (n.type === "INCOMING_WHATSAPP") {
                    badgeIcon = <MessageCircle className="w-3.5 h-3.5" />;
                    badgeLabel = "WhatsApp Inbound";
                    badgeClass = "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800";
                  } else if (n.type === "STATUS_UPDATE") {
                    badgeIcon = <Wrench className="w-3.5 h-3.5" />;
                    badgeLabel = "Status Update";
                    badgeClass = "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800";
                  } else if (n.type === "OUTGOING_MESSAGE") {
                    badgeIcon = <Send className="w-3.5 h-3.5" />;
                    badgeLabel = "Customer Message";
                    badgeClass = "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800";
                  }

                  return (
                    <div 
                      key={n.id} 
                      className={`p-3.5 rounded-2xl border transition space-y-2 relative ${
                        isUnread 
                          ? "bg-blue-50/40 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800 shadow-xs" 
                          : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      {/* Top Meta Row */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${badgeClass}`}>
                            {badgeIcon}
                            <span>{badgeLabel}</span>
                          </span>

                          {n.tracking_id && (
                            <span className="font-mono text-[10px] font-bold text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                              {n.tracking_id}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" title="Unread" />
                          )}
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatNotifTime(n.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Title & Body */}
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-xs leading-snug">
                          {n.title}
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed mt-0.5 line-clamp-3">
                          {n.message}
                        </p>
                      </div>

                      {/* Customer / Device Info Pill */}
                      {(n.customer_name || n.customer_phone || n.device_model) && (
                        <div className="flex items-center gap-2 flex-wrap text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                          {n.customer_name && (
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {n.customer_name}
                            </span>
                          )}
                          {n.customer_phone && (
                            <span className="font-mono">
                              📱 {n.customer_phone}
                            </span>
                          )}
                          {n.device_model && (
                            <span className="px-1.5 py-0.2 rounded bg-slate-200/60 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                              {n.device_model}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Card Action Footer */}
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <div className="flex items-center gap-1.5">
                          {n.tracking_id && (
                            <button
                              onClick={() => {
                                setShowNotificationsModal(false);
                                router.push(`/admin?q=${n.tracking_id}`);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] transition active:scale-95 shadow-xs"
                            >
                              <span>View Order</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          )}

                          {n.type === "INCOMING_WHATSAPP" && (
                            <button
                              onClick={() => {
                                setShowNotificationsModal(false);
                                router.push("/admin?view=inbox");
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition active:scale-95 shadow-xs"
                            >
                              <span>Open Chat</span>
                              <MessageCircle className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {isUnread && (
                          <button
                            onClick={() => handleMarkSingleRead(n.id)}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-blue-600 p-1 transition"
                            title="Mark as read"
                          >
                            <Check className="w-3 h-3" />
                            <span>Mark read</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-400">
                {notifications.length} {notifications.length === 1 ? "notification" : "notifications"} displayed
              </span>
              <button
                onClick={() => setShowNotificationsModal(false)}
                className="py-1.5 px-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ACCOUNT MODAL SHEET ── */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" 
            onClick={() => setShowAccountModal(false)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl z-10 space-y-4">
            <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto sm:hidden" />
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{admin?.name}</div>
                  <div className="text-xs text-slate-500 font-mono">@{admin?.username} • {admin?.role}</div>
                </div>
              </div>
              <button 
                onClick={() => setShowAccountModal(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-slate-500">Workshop Center</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Gandhinagar, Gujarat</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-slate-500">Session Status</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Authenticated
                </span>
              </div>

              {/* Theme Selector */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-slate-500">Theme</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => changeTheme("light")}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                      themeMode === "light" ? "bg-white text-blue-600 shadow-xs font-bold" : "text-slate-500"
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" /> Light
                  </button>
                  <button
                    onClick={() => changeTheme("dark")}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                      themeMode === "dark" ? "bg-slate-700 text-blue-400 shadow-xs font-bold" : "text-slate-500"
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" /> Dark
                  </button>
                  <button
                    onClick={() => changeTheme("system")}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                      themeMode === "system" ? "bg-blue-100 text-blue-700 shadow-xs font-bold" : "text-slate-500"
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" /> Auto
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <Link
                href="/admin?view=settings"
                onClick={() => setShowAccountModal(false)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Settings className="w-4 h-4" />
                <span>Open Admin Settings</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>14. Sign Out of Admin Console</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
