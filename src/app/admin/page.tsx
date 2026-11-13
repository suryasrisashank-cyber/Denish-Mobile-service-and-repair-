"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Plus, CheckCircle2, Search, X, 
  Sun, Moon, Laptop, Phone, MapPin, Copy, 
  RefreshCw, MessageCircle, AlertTriangle, 
  Check, ArrowUpDown, Download, Printer,
  BarChart3, Settings, ShieldCheck,
  Edit3, Archive, Send, Trash2, Users, Wrench, ListOrdered
} from "lucide-react";
import { REPAIR_STATUSES, RepairStatus, SYSTEM_CONFIG } from "@/lib/constants";
import EditOrderModal from "@/components/admin/EditOrderModal";
import ArchiveOrderModal from "@/components/admin/ArchiveOrderModal";
import SpecialMessageModal from "@/components/admin/SpecialMessageModal";
import WhatsAppInboxView from "@/components/admin/WhatsAppInboxView";
import CustomerMessagesView from "@/components/admin/CustomerMessagesView";
import ArchivedOrdersView from "@/components/admin/ArchivedOrdersView";
import DeleteOrderModal from "@/components/admin/DeleteOrderModal";
import DeleteCustomerModal from "@/components/admin/DeleteCustomerModal";

// Interface for real repair order from database
interface RepairOrderItem {
  id: number;
  serviceId?: string;
  trackingId: string;
  deviceBrand: string;
  deviceModel: string;
  repairCategory: string;
  reportedIssue: string;
  currentStatus: RepairStatus;
  statusLabel: string;
  badgeClass: string;
  stepIndex: number;
  pickupReady: boolean;
  serviceCost: number | null;
  amount: string;
  paid: boolean;
  type: string;
  due: string;
  estimatedCompletion: string | null;
  source: string;
  isArchived?: boolean;
  archivedAt?: string | null;
  archiveReason?: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: number;
    name: string;
    phone: string;
    location: string;
  };
}

interface DashboardMetrics {
  total: number;
  activeOrders?: number;
  completedOrPaid?: number;
  newRequests: number;
  received: number;
  underInspection: number;
  repairing: number;
  waitingForParts: number;
  waitingForApproval: number;
  qualityCheck: number;
  completed: number;
  readyForPickup: number;
  delivered: number;
  cancelled: number;
  inProgress: number;
  activeRepairs: number;
  overdueRepairs: number;
  customerCount: number;
  dealerCount: number;
  dueToday: number;
  pendingBalance: number;
  newJobsToday: number;
  deliveredThisMonth: number;
  revenueThisMonth: number;
  totalRevenue: number;
}

interface OrderHistoryEntry {
  id: number;
  previousStatus: string | null;
  newStatus: RepairStatus;
  statusLabel: string;
  customerNote: string | null;
  internalNote: string | null;
  updatedBy: string;
  createdAt: string;
}

interface DetailedOrder extends RepairOrderItem {
  imeiSerial?: string | null;
  inspectionNotes?: string | null;
  statusHistory?: OrderHistoryEntry[];
}

interface DeviceStat {
  brand: string;
  count: number;
}

interface PartStat {
  category: string;
  count: number;
}

interface CustomerSummary {
  id: number;
  name: string;
  phone: string;
  location: string | null;
  order_count: number;
  last_order_date: string;
  total_spent: number;
}

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active view: default (orders) | 'reports' | 'settings'
  const currentView = searchParams.get("view") || "orders";

  // Theme management: 'light' | 'dark' | 'system'
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("light");
  const [activeTheme, setActiveTheme] = useState<"light" | "dark">("light");

  // Filtering & Pagination State
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateRange, setDateRange] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Status update modal for a specific order
  const [activeModalOrder, setActiveModalOrder] = useState<RepairOrderItem | null>(null);
  const [targetStatus, setTargetStatus] = useState<RepairStatus>("RECEIVED");
  const [customerNote, setCustomerNote] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [editCost, setEditCost] = useState("");
  const [editEstimatedDate, setEditEstimatedDate] = useState("");
  const [editPickupReady, setEditPickupReady] = useState(false);
  const [editPaid, setEditPaid] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Detailed Order Drawer / Bottom Sheet state
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<DetailedOrder | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Active Primary Tab: 'active' | 'completed' | 'all'
  const [activeTab, setActiveTab] = useState<"active" | "completed" | "all">("active");

  // New Modals: Edit, Archive, Delete Order, Special Message, and Delete Customer
  const [orderToEdit, setOrderToEdit] = useState<RepairOrderItem | null>(null);
  const [orderToArchive, setOrderToArchive] = useState<RepairOrderItem | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<RepairOrderItem | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<CustomerSummary | null>(null);
  const [orderForSpecialMessage, setOrderForSpecialMessage] = useState<RepairOrderItem | null>(null);

  // Settings State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Real Database state
  const [orders, setOrders] = useState<RepairOrderItem[]>([]);
  const [devicesStats, setDevicesStats] = useState<DeviceStat[]>([]);
  const [partsStats, setPartsStats] = useState<PartStat[]>([]);
  const [customersSummary, setCustomersSummary] = useState<CustomerSummary[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    total: 0,
    newRequests: 0,
    received: 0,
    underInspection: 0,
    repairing: 0,
    waitingForParts: 0,
    waitingForApproval: 0,
    qualityCheck: 0,
    completed: 0,
    readyForPickup: 0,
    delivered: 0,
    cancelled: 0,
    inProgress: 0,
    activeRepairs: 0,
    overdueRepairs: 0,
    customerCount: 0,
    dealerCount: 0,
    dueToday: 0,
    pendingBalance: 0,
    newJobsToday: 0,
    deliveredThisMonth: 0,
    revenueThisMonth: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Synchronize status and tab filters from URL query parameters
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "completed") {
      setActiveTab("completed");
    } else if (tabParam === "all") {
      setActiveTab("all");
    } else if (tabParam === "active") {
      setActiveTab("active");
    }

    const statusParam = searchParams.get("status");
    if (statusParam) {
      setSelectedStatus(statusParam);
      if (statusParam === "COMPLETED" || statusParam === "COMPLETED_ORDERS" || statusParam === "READY_FOR_PICKUP" || statusParam === "DELIVERED") {
        setActiveTab("completed");
      }
    } else if (!tabParam) {
      setSelectedStatus("ACTIVE");
      setActiveTab("active");
    }

    const focusParam = searchParams.get("focus");
    if (focusParam === "search") {
      const searchEl = document.getElementById("admin-search-input");
      if (searchEl) searchEl.focus();
    }
  }, [searchParams]);

  // Handle system / dark / light theme synchronization
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("denish_admin_theme") as "light" | "dark" | "system" | null;
      if (savedTheme) setThemeMode(savedTheme);
    } catch {}
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      let resolved: "light" | "dark" = themeMode === "dark" ? "dark" : "light";
      if (themeMode === "system") {
        resolved = mediaQuery.matches ? "dark" : "light";
      }
      setActiveTheme(resolved);
      if (resolved === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    applyTheme();
    try {
      localStorage.setItem("denish_admin_theme", themeMode);
    } catch {}

    mediaQuery.addEventListener("change", applyTheme);
    return () => mediaQuery.removeEventListener("change", applyTheme);
  }, [themeMode]);

  // Handle search query debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2600);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(text);
    triggerToast(`Tracking ID ${text} copied`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    if (orders.length === 0) {
      triggerToast("No orders available to export");
      return;
    }
    const headers = [
      "Tracking ID",
      "Customer Name",
      "Phone",
      "Location",
      "Device Brand",
      "Device Model",
      "Repair Service",
      "Work Status",
      "Source",
      "Cost (INR)",
      "Paid",
      "Request Date",
      "Last Updated"
    ];
    const rows = orders.map((o) => [
      `"${o.trackingId}"`,
      `"${(o.customer.name || "").replace(/"/g, '""')}"`,
      `"${o.customer.phone || ""}"`,
      `"${(o.customer.location || "").replace(/"/g, '""')}"`,
      `"${o.deviceBrand}"`,
      `"${o.deviceModel}"`,
      `"${o.repairCategory}"`,
      `"${o.currentStatus}"`,
      `"${o.source}"`,
      `"${o.serviceCost || 0}"`,
      `"${o.paid ? "Yes" : "No"}"`,
      `"${o.createdAt}"`,
      `"${o.updatedAt}"`
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `denish_repair_orders_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Exported orders CSV successfully");
  };

  // Format real date display
  const formattedToday = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());

  // ── FETCH REAL DATA STRICTLY FROM DATABASE ──
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setDbError(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("denish_admin_token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      if (activeTab) params.set("tab", activeTab);
      if (selectedStatus && selectedStatus !== "ALL") params.set("status", selectedStatus);
      if (dateRange && dateRange !== "all") params.set("dateRange", dateRange);
      if (debouncedSearch) params.set("q", debouncedSearch);

      const res = await fetch(`/api/admin/orders?${params.toString()}`, { headers, cache: "no-store" });
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        setOrders(json.data.orders || []);
        if (json.data.metrics) setMetrics(json.data.metrics);
        if (json.data.devices) setDevicesStats(json.data.devices);
        if (json.data.parts) setPartsStats(json.data.parts);
        if (json.data.customers) setCustomersSummary(json.data.customers);
        if (json.data.pagination) {
          setTotalPages(json.data.pagination.totalPages || 1);
          setTotalCount(json.data.pagination.total || 0);
        }
      } else {
        throw new Error(json.error || "Unable to retrieve dashboard data");
      }
    } catch (err: unknown) {
      console.error("[DASHBOARD_DATA_FETCH_ERROR]", err);
      setDbError(
        err instanceof Error
          ? err.message
          : "Unable to query service orders from database."
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, activeTab, selectedStatus, dateRange, sortBy, sortOrder, debouncedSearch, router]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Open Full Order Details
  const handleOpenOrderDetails = async (order: RepairOrderItem) => {
    setSelectedOrderForDetails(order);
    setIsLoadingDetails(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("denish_admin_token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/admin/orders/${order.id}`, { headers });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setSelectedOrderForDetails({
            ...order,
            imeiSerial: json.data.imeiSerial,
            inspectionNotes: json.data.inspectionNotes,
            statusHistory: json.data.statusHistory,
          });
        }
      }
    } catch (err) {
      console.error("[FETCH_ORDER_DETAILS_ERROR]", err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Open Status Update Modal
  const openStatusModal = (order: RepairOrderItem) => {
    setActiveModalOrder(order);
    setTargetStatus(order.currentStatus);
    setCustomerNote("");
    setInternalNote("");
    setEditCost(order.serviceCost ? String(order.serviceCost) : "");
    setEditEstimatedDate(order.estimatedCompletion || "");
    setEditPickupReady(order.pickupReady);
    setEditPaid(order.paid);
  };

  // Submit Status Update to Real DB
  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalOrder) return;

    setIsUpdatingStatus(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("denish_admin_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/admin/orders/${activeModalOrder.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          newStatus: targetStatus,
          customerNote: customerNote.trim() || undefined,
          internalNote: internalNote.trim() || undefined,
          serviceCost: editCost ? Number(editCost) : null,
          estimatedCompletion: editEstimatedDate || null,
          pickupReady: editPickupReady || targetStatus === "READY_FOR_PICKUP",
          paid: editPaid,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update status");
      }

      if (targetStatus === "COMPLETED" || targetStatus === "DELIVERED" || editPaid) {
        triggerToast("Order updated and moved to Completed Orders list.");
      } else {
        triggerToast(`Status updated to ${REPAIR_STATUSES[targetStatus]?.label || targetStatus}`);
      }
      setActiveModalOrder(null);
      await fetchDashboardData();
    } catch (err: unknown) {
      triggerToast(err instanceof Error ? err.message : "Error updating status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Quick State Transitions (One-Click)
  const handleQuickStatusTransition = async (orderId: number, status: RepairStatus, noteText: string) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("denish_admin_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          newStatus: status,
          customerNote: noteText,
          internalNote: `Quick transition triggered by admin to ${status}.`,
          pickupReady: status === "READY_FOR_PICKUP",
        }),
      });

      if (res.ok) {
        if (status === "COMPLETED" || status === "DELIVERED") {
          triggerToast("Order marked completed and moved to Completed Orders list.");
        } else {
          triggerToast(`Order status updated to ${REPAIR_STATUSES[status]?.label || status}`);
        }
        if (selectedOrderForDetails && selectedOrderForDetails.id === orderId) {
          handleOpenOrderDetails({ ...selectedOrderForDetails, currentStatus: status });
        }
        fetchDashboardData();
      }
    } catch {
      triggerToast("Failed to transition status");
    }
  };

  // Change Admin Password handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPasswordMsg({ type: "error", text: "Please enter current and new passwords." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    setIsChangingPassword(true);
    setPasswordMsg(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("denish_admin_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers,
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setPasswordMsg({ type: "success", text: "Admin master password changed successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        triggerToast("Password updated securely");
      } else {
        setPasswordMsg({ type: "error", text: json.error || "Failed to update password." });
      }
    } catch {
      setPasswordMsg({ type: "error", text: "Network exception updating password." });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Array of 11 distinct database statistics
  const statusStatCards = [
    { key: "total", label: "Total Orders", count: metrics.total, filter: "ALL", bg: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800" },
    { key: "newRequests", label: "New Requests", count: metrics.newRequests, filter: "NEW_REQUEST", bg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800" },
    { key: "received", label: "Received", count: metrics.received, filter: "RECEIVED", bg: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800" },
    { key: "underInspection", label: "Under Inspection", count: metrics.underInspection, filter: "UNDER_INSPECTION", bg: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800" },
    { key: "waitingForParts", label: "Waiting for Parts", count: metrics.waitingForParts, filter: "WAITING_FOR_PARTS", bg: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800" },
    { key: "repairing", label: "Repairing", count: metrics.repairing, filter: "REPAIRING", bg: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800" },
    { key: "qualityCheck", label: "Quality Check", count: metrics.qualityCheck, filter: "QUALITY_CHECK", bg: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800" },
    { key: "completed", label: "Completed", count: metrics.completed, filter: "COMPLETED", bg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800" },
    { key: "readyForPickup", label: "Ready for Pickup", count: metrics.readyForPickup, filter: "READY_FOR_PICKUP", bg: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800" },
    { key: "delivered", label: "Delivered", count: metrics.delivered, filter: "DELIVERED", bg: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700" },
    { key: "cancelled", label: "Cancelled", count: metrics.cancelled, filter: "CANCELLED", bg: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800" },
  ];

  return (
    <div className={`space-y-6 ${activeTheme === "dark" ? "dark text-slate-100" : "text-slate-900"} font-sans antialiased transition-colors duration-200`}>
      
      {/* ── TOAST NOTIFICATION ── */}
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900 dark:bg-slate-800 text-white px-4 py-2 rounded-full shadow-2xl border border-slate-700/50 text-xs font-semibold backdrop-blur-md animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
    </div>
      )}

      {/* ── DATABASE ERROR BANNER (Honest Connection State) ── */}
      {dbError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{dbError}</span>
      </div>
          <button 
            onClick={fetchDashboardData}
            className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition"
          >
            Retry Connection
          </button>
    </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          VIEW 1: REPORTS VIEW (Item 12: Reports — ?view=reports)
          ══════════════════════════════════════════════════════════════════════════ */}
      {currentView === "reports" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <div>
              <h1 className="text-base font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>12. Workshop Reports &amp; Real Analytics</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculated dynamically from real customer service records.
              </p>
        </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Report</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
        </div>
      </div>

          {/* KPI Metrics Summary Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Work Orders</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{metrics.total}</div>
              <span className="text-[10px] text-blue-600 font-semibold">{metrics.newRequests} New Queued</span>
        </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Revenue Tracked</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">₹{metrics.totalRevenue.toLocaleString("en-IN")}</div>
              <span className="text-[10px] text-slate-500 font-semibold">Completed &amp; Paid Jobs</span>
        </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Delivered Devices</span>
              <div className="text-2xl font-black text-blue-600 mt-1">{metrics.delivered}</div>
              <span className="text-[10px] text-slate-500 font-semibold">{metrics.readyForPickup} Ready For Collection</span>
        </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Active Bench Repairs</span>
              <div className="text-2xl font-black text-cyan-600 mt-1">{metrics.activeRepairs}</div>
              <span className="text-[10px] text-orange-500 font-semibold">{metrics.waitingForParts} Waiting for Parts</span>
        </div>
      </div>

          {/* Breakdown Grids: Brands & Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Device Brands Breakdown */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
                Smartphone Brands Volume (Real DB)
              </h3>
              <div className="space-y-2">
                {devicesStats.length === 0 ? (
                  <p className="text-xs text-slate-400">No brand data recorded yet.</p>
                ) : (
                  devicesStats.map((d) => {
                    const pct = metrics.total > 0 ? Math.round((d.count / metrics.total) * 100) : 0;
                    return (
                      <div key={d.brand} className="text-xs space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span className="text-slate-700 dark:text-slate-300">{d.brand}</span>
                          <span className="text-slate-500">{d.count} orders ({pct}%)</span>
                    </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                    );
                  })
                )}
          </div>
        </div>

            {/* Repair Category Breakdown */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
                Repair Services Distribution (Real DB)
              </h3>
              <div className="space-y-2">
                {partsStats.length === 0 ? (
                  <p className="text-xs text-slate-400">No repair categories recorded yet.</p>
                ) : (
                  partsStats.map((p) => {
                    const pct = metrics.total > 0 ? Math.round((p.count / metrics.total) * 100) : 0;
                    return (
                      <div key={p.category} className="text-xs space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span className="text-slate-700 dark:text-slate-300">{p.category}</span>
                          <span className="text-slate-500">{p.count} orders ({pct}%)</span>
                    </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                    );
                  })
                )}
          </div>
        </div>
      </div>

          {/* Customer Directory Summary */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
              Recent Genuine Customers Directory ({customersSummary.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Phone</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Total Orders</th>
                    <th className="py-2.5 px-3">Total Amount</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {customersSummary.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{c.name}</td>
                      <td className="py-2.5 px-3 font-mono text-blue-600">{c.phone}</td>
                      <td className="py-2.5 px-3 text-slate-500">{c.location || "Gandhinagar"}</td>
                      <td className="py-2.5 px-3 font-bold">{c.order_count}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-600">₹{c.total_spent?.toLocaleString("en-IN") || 0}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => setCustomerToDelete(c)}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-[11px] font-bold inline-flex items-center gap-1.5 transition ml-auto"
                          title="Delete Customer & Orders"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
        </div>
      </div>
    </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          VIEW 2: SETTINGS VIEW (Item 13: Settings — ?view=settings)
          ══════════════════════════════════════════════════════════════════════════ */}
      {currentView === "settings" && (
        <div className="space-y-6 max-w-4xl">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <div>
              <h1 className="text-base font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                <span>13. Admin &amp; Workshop Settings</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Technical center configuration, admin authentication, and security settings.
              </p>
        </div>
      </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Workshop Information */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3 text-xs">
              <h3 className="font-black uppercase tracking-wider text-blue-600 text-[11px] pb-2 border-b border-slate-100 dark:border-slate-800">
                Workshop Profile
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Store Name</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{SYSTEM_CONFIG.storeName}</span>
            </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Tagline</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">&quot;{SYSTEM_CONFIG.tagline}&quot;</span>
            </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Location</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{SYSTEM_CONFIG.location}</span>
            </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Hours</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{SYSTEM_CONFIG.hours}</span>
            </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Official Contact / WhatsApp</span>
                  <span className="font-mono font-bold text-blue-600">{SYSTEM_CONFIG.phoneFull}</span>
            </div>
          </div>
        </div>

            {/* Security & Operations Overview */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3 text-xs">
              <h3 className="font-black uppercase tracking-wider text-emerald-600 text-[11px] pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Security &amp; Operations Overview</span>
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Environment:</span>
                  <span className="font-bold text-emerald-600">Production (Live)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Admin Authentication:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">JWT Authenticated Session</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer Data Privacy:</span>
                  <span className="font-bold text-emerald-600">Enforced (PII Stripped on /track)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Registered Customer Records:</span>
                  <span className="font-bold text-blue-600">{customersSummary.length} customers</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Service Orders:</span>
                  <span className="font-bold text-blue-600">{metrics.total} orders</span>
                </div>
              </div>
            </div>
      </div>

          {/* Change Admin Password */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 max-w-md">
            <h3 className="font-black uppercase tracking-wider text-slate-900 dark:text-white text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Change Master Admin Password</span>
            </h3>

            {passwordMsg && (
              <div className={`p-3 rounded-xl text-xs font-semibold ${
                passwordMsg.type === "success" 
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300"
              }`}>
                {passwordMsg.text}
          </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Current Password *</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none font-mono"
                  placeholder="••••••••••••"
                />
          </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">New Password (Min 8 chars) *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none font-mono"
                  placeholder="••••••••••••"
                />
          </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none font-mono"
                  placeholder="••••••••••••"
                />
          </div>
              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition disabled:opacity-50"
              >
                {isChangingPassword ? "Updating Password..." : "Save New Password"}
              </button>
            </form>
      </div>
    </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          VIEW: WHATSAPP BUSINESS INBOX (?view=inbox)
          ══════════════════════════════════════════════════════════════════════════ */}
      {currentView === "inbox" && <WhatsAppInboxView />}

      {/* ══════════════════════════════════════════════════════════════════════════
          VIEW: CUSTOMER NOTIFICATIONS LOG (?view=messages)
          ══════════════════════════════════════════════════════════════════════════ */}
      {currentView === "messages" && <CustomerMessagesView />}

      {/* ══════════════════════════════════════════════════════════════════════════
          VIEW: ARCHIVED ORDERS (?view=archived)
          ══════════════════════════════════════════════════════════════════════════ */}
      {currentView === "archived" && <ArchivedOrdersView />}

      {/* ══════════════════════════════════════════════════════════════════════════
          VIEW: CUSTOMERS DIRECTORY (?view=customers)
          ══════════════════════════════════════════════════════════════════════════ */}
      {currentView === "customers" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <div>
              <h1 className="text-base font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Customer Directory &amp; Records Management</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage registered customer profiles, track order counts, or remove customer records.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-bold text-xs">
                {customersSummary.length} Registered Customers
              </span>
              <button
                onClick={fetchDashboardData}
                disabled={isLoading}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                title="Refresh Customers"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Customer Name</th>
                    <th className="py-3 px-3">Mobile Number / Service ID</th>
                    <th className="py-3 px-3">Location</th>
                    <th className="py-3 px-3">Total Orders</th>
                    <th className="py-3 px-3">Total Amount</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {customersSummary.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <div className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Customer Records Found</div>
                        <div className="text-xs text-slate-500 mt-1">Customer profiles will appear here as orders are submitted.</div>
                      </td>
                    </tr>
                  ) : (
                    customersSummary.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{c.name}</td>
                        <td className="py-3 px-3 font-mono font-semibold text-blue-600 dark:text-blue-400">
                          <a href={`tel:${c.phone}`} className="hover:underline">
                            {c.phone}
                          </a>
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{c.location || "Gandhinagar"}</td>
                        <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">{c.order_count} order(s)</td>
                        <td className="py-3 px-3 font-bold text-emerald-600">₹{c.total_spent?.toLocaleString("en-IN") || 0}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setCustomerToDelete(c)}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-xs font-bold inline-flex items-center gap-1.5 transition active:scale-95 shadow-xs"
                            title="Delete Customer & Orders"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Customer</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          VIEW 3: DEFAULT ORDERS DASHBOARD (PC Desktop + Mobile Adaptive)
          ══════════════════════════════════════════════════════════════════════════ */}
      {currentView === "orders" && (
        <>
          {/* ──────────────────────────────────────────────────────────────────
              DESKTOP VIEW: Screens >= 1024px
              ────────────────────────────────────────────────────────────────── */}
          <div className="hidden lg:block space-y-6">

            {/* 1. Desktop Top Bar Header */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">
                    DENISH MOBILE REPAIRING AND SERVICE
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    Gandhinagar Workshop
                  </span>
            </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {formattedToday} • System: <span className="text-emerald-600 font-semibold">Active &amp; Secure</span>
            </div>
          </div>

              <div className="flex items-center gap-2.5">
                {/* Theme Toggle */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                  <button
                    onClick={() => setThemeMode("light")}
                    className={`p-1.5 rounded-lg transition ${themeMode === "light" ? "bg-white text-blue-600 shadow-xs" : "text-slate-500"}`}
                    title="Light Theme"
                  >
                    <Sun className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setThemeMode("dark")}
                    className={`p-1.5 rounded-lg transition ${themeMode === "dark" ? "bg-slate-700 text-blue-400 shadow-xs" : "text-slate-500"}`}
                    title="Dark Theme"
                  >
                    <Moon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setThemeMode("system")}
                    className={`p-1.5 rounded-lg transition ${themeMode === "system" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs" : "text-slate-500"}`}
                    title="System Theme"
                  >
                    <Laptop className="w-3.5 h-3.5" />
                  </button>
            </div>

                {/* Refresh Button */}
                <button
                  onClick={fetchDashboardData}
                  disabled={isLoading}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  title="Refresh Orders"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
                </button>

                {/* Export CSV Button */}
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition active:scale-95"
                  title="Export Current Orders as CSV"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Export CSV</span>
                </button>

                {/* Create New Order Button */}
                <Link
                  href="/admin/new-order"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>New Repair Order</span>
                </Link>
          </div>
        </div>

            {/* Primary Order Tabs: Active Queue vs Completed & Paid Orders vs All Orders */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-xs">
              <button
                onClick={() => {
                  setActiveTab("active");
                  setSelectedStatus("ACTIVE");
                  setPage(1);
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  activeTab === "active"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Wrench className="w-4 h-4" />
                <span>Active Repair Queue</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === "active" ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                }`}>
                  {metrics.activeOrders ?? 0}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("completed");
                  setSelectedStatus("COMPLETED_ORDERS");
                  setPage(1);
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  activeTab === "completed"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Completed &amp; Paid Orders</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === "completed" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                }`}>
                  {metrics.completedOrPaid ?? 0}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("all");
                  setSelectedStatus("ALL");
                  setPage(1);
                }}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  activeTab === "all"
                    ? "bg-slate-800 text-white dark:bg-slate-700 shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <ListOrdered className="w-4 h-4" />
                <span>All Orders</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}>
                  {metrics.total ?? 0}
                </span>
              </button>
            </div>

            {/* 2. All 11 Real Database Statistics Cards (Interactive Filter Grid) */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11 gap-2.5">
              {statusStatCards.map((sc) => {
                const isSelected = selectedStatus === sc.filter;
                return (
                  <div
                    key={sc.key}
                    onClick={() => {
                      setSelectedStatus(sc.filter);
                      setPage(1);
                    }}
                    className={`cursor-pointer p-3 rounded-2xl border transition shadow-xs flex flex-col justify-between ${
                      isSelected
                        ? "ring-2 ring-blue-600 border-blue-600 bg-white dark:bg-slate-800 shadow-md scale-[1.02]"
                        : `${sc.bg} hover:shadow-md hover:scale-[1.01]`
                    }`}
                    title={`Filter by ${sc.label}`}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider truncate">
                      {sc.label}
                </div>
                    <div className="text-xl font-black mt-1">
                      {sc.count}
                </div>
              </div>
                );
              })}
        </div>

            {/* 3. Filtering, Search & Sorting Controls */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                
                {/* Search Input */}
                <div className="relative flex-1 min-w-[280px]">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="admin-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Tracking ID, Customer Name, Phone, Device Model..."
                    className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
            </div>

                {/* Filter Dropdowns */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Date Filter */}
                  <select
                    value={dateRange}
                    onChange={(e) => {
                      setDateRange(e.target.value);
                      setPage(1);
                    }}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-semibold outline-none"
                  >
                    <option value="all">Date: All Time</option>
                    <option value="today">Date: Today Only</option>
                    <option value="7d">Date: Last 7 Days</option>
                    <option value="30d">Date: Last 30 Days</option>
                  </select>

                  {/* Sort By */}
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setPage(1);
                    }}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-semibold outline-none"
                  >
                    <option value="createdAt">Sort: Request Date</option>
                    <option value="updatedAt">Sort: Last Updated</option>
                    <option value="customer">Sort: Customer Name</option>
                    <option value="status">Sort: Current Status</option>
                    <option value="device">Sort: Device Model</option>
                  </select>

                  {/* Sort Order Toggle */}
                  <button
                    onClick={() => setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC")}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    title={`Order: ${sortOrder === "ASC" ? "Ascending" : "Descending"}`}
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Rows Per Page */}
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-semibold outline-none"
                  >
                    <option value={10}>10 rows</option>
                    <option value={15}>15 rows</option>
                    <option value={25}>25 rows</option>
                    <option value={50}>50 rows</option>
                  </select>
            </div>

          </div>

              {/* Quick Status Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 text-xs scrollbar-none">
                {statusStatCards.map((st) => (
                  <button
                    key={st.key}
                    onClick={() => {
                      setSelectedStatus(st.filter);
                      setPage(1);
                    }}
                    className={`px-3 py-1 rounded-xl font-bold uppercase text-[10px] tracking-wider shrink-0 transition ${
                      selectedStatus === st.filter
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {st.label} ({st.count})
                  </button>
                ))}
          </div>
        </div>

            {/* 4. Professional 11-Column Desktop Data Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3.5 px-3">1. Tracking ID</th>
                      <th className="py-3.5 px-3">2. Customer Name</th>
                      <th className="py-3.5 px-3">3. Phone Number</th>
                      <th className="py-3.5 px-3">4. Location</th>
                      <th className="py-3.5 px-3">5. Device Brand</th>
                      <th className="py-3.5 px-3">6. Device Model</th>
                      <th className="py-3.5 px-3">7. Repair Service</th>
                      <th className="py-3.5 px-3">8. Work Status</th>
                      <th className="py-3.5 px-3">9. Request Date</th>
                      <th className="py-3.5 px-3">10. Last Updated</th>
                      <th className="py-3.5 px-3 text-right">11. Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="py-16 text-center text-slate-400">
                          <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            No Customer Orders Yet
                      </div>
                          <div className="text-xs text-slate-500 mt-1">
                            Start receiving customer service requests to see them here. New customer service requests will appear here after successful submission.
                      </div>
                        </td>
                      </tr>
                    ) : (
                      orders.map((o) => (
                        <tr 
                          key={o.id}
                          className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition cursor-pointer"
                          onClick={() => handleOpenOrderDetails(o)}
                        >
                          {/* 1. Tracking ID & Service ID */}
                          <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">
                                {o.trackingId}
                              </span>
                              <button
                                onClick={() => copyToClipboard(o.trackingId)}
                                className="text-slate-400 hover:text-slate-600 p-0.5"
                                title="Copy Tracking ID"
                              >
                                {copiedId === o.trackingId ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                o.source === "ADMIN_CREATED"
                                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
                              }`}>
                                {o.source === "ADMIN_CREATED" ? "Walk-in" : "Online"}
                              </span>
                        </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                              Service ID: <span className="font-semibold text-slate-700 dark:text-slate-300">{o.serviceId || o.customer.phone}</span>
                        </div>
                          </td>

                          {/* 2. Customer Name */}
                          <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                            {o.customer.name}
                          </td>

                          {/* 3. Phone Number */}
                          <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300" onClick={(e) => e.stopPropagation()}>
                            <a href={`tel:${o.customer.phone}`} className="hover:text-blue-600 hover:underline">
                              {o.customer.phone}
                            </a>
                          </td>

                          {/* 4. Location */}
                          <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                            {o.customer.location}
                          </td>

                          {/* 5. Device Brand */}
                          <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                            {o.deviceBrand}
                          </td>

                          {/* 6. Device Model */}
                          <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                            {o.deviceModel}
                          </td>

                          {/* 7. Repair Service */}
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                            <div className="font-medium">{o.repairCategory}</div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[180px]">{o.reportedIssue}</div>
                          </td>

                          {/* 8. Work Status */}
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${o.badgeClass}`}>
                              {o.statusLabel}
                            </span>
                          </td>

                          {/* 9. Request Date */}
                          <td className="py-3 px-3 text-slate-500 text-[11px]">
                            {new Date(o.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>

                          {/* 10. Last Updated */}
                          <td className="py-3 px-3 text-slate-500 text-[11px]">
                            {new Date(o.updatedAt).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>

                          {/* 11. Actions */}
                          <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              {o.currentStatus === "NEW_REQUEST" && (
                                <button
                                  onClick={() => handleQuickStatusTransition(o.id, "RECEIVED", "Device intake confirmed by Gandhinagar workshop.")}
                                  className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-300 text-[11px] font-bold hover:bg-emerald-100 transition"
                                  title="Accept & Mark Received"
                                >
                                  Accept
                                </button>
                              )}
                              <button
                                onClick={() => openStatusModal(o)}
                                className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-[11px] font-bold transition"
                                title="Update Status & Notes"
                              >
                                Status
                              </button>
                              <button
                                onClick={() => setOrderToEdit(o)}
                                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition flex items-center gap-1"
                                title="Edit Order Details"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => setOrderForSpecialMessage(o)}
                                className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-bold transition flex items-center gap-1"
                                title="Send Special WhatsApp Message"
                              >
                                <Send className="w-3 h-3" />
                                <span>Message</span>
                              </button>
                              <a
                                href={`https://wa.me/${o.customer.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello ${o.customer.name}, update regarding your ${o.deviceModel} (Tracking ID: ${o.trackingId}) at ${SYSTEM_CONFIG.storeName} Gandhinagar.`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
                                title="Contact Customer on WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => setOrderToArchive(o)}
                                className="p-1 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
                                title="Archive Order"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setOrderToDelete(o)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                                title="Permanently Delete Order"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              </button>
                              <button
                                onClick={() => handleOpenOrderDetails(o)}
                                className="px-2 py-1 rounded-lg bg-slate-800 text-white text-[11px] font-bold hover:bg-slate-700 transition"
                              >
                                Details
                              </button>
                        </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
          </div>

              {/* 5. Pagination Controls */}
              {totalCount > 0 && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <div>
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of {totalCount} genuine customer records
              </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 font-semibold"
                    >
                      Previous
                    </button>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 font-semibold"
                    >
                      Next
                    </button>
              </div>
            </div>
              )}
        </div>

      </div>

          {/* ──────────────────────────────────────────────────────────────────
              MOBILE VIEW: Screens < 1024px strictly
              ────────────────────────────────────────────────────────────────── */}
          <div className="block lg:hidden space-y-4">

            {/* Mobile Primary Workflow Tabs */}
            <div className="grid grid-cols-3 gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-xs text-xs font-bold">
              <button
                onClick={() => { setActiveTab("active"); setSelectedStatus("ACTIVE"); setPage(1); }}
                className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition ${
                  activeTab === "active" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-300"
                }`}
              >
                <span>Active Queue</span>
                <span className="text-[10px] opacity-90">{metrics.activeOrders ?? 0}</span>
              </button>

              <button
                onClick={() => { setActiveTab("completed"); setSelectedStatus("COMPLETED_ORDERS"); setPage(1); }}
                className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition ${
                  activeTab === "completed" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-300"
                }`}
              >
                <span>Completed</span>
                <span className="text-[10px] opacity-90">{metrics.completedOrPaid ?? 0}</span>
              </button>

              <button
                onClick={() => { setActiveTab("all"); setSelectedStatus("ALL"); setPage(1); }}
                className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition ${
                  activeTab === "all" ? "bg-slate-800 text-white dark:bg-slate-700 shadow-xs" : "text-slate-600 dark:text-slate-300"
                }`}
              >
                <span>All Orders</span>
                <span className="text-[10px] opacity-90">{metrics.total ?? 0}</span>
              </button>
            </div>

            {/* 1. Mobile Dashboard: 4 Compact Summary Cards (Clean 2-Column Grid) */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Card 1: Total Orders */}
              <div 
                onClick={() => { setSelectedStatus("ALL"); setPage(1); }}
                className={`p-3.5 rounded-2xl border transition shadow-xs cursor-pointer ${
                  selectedStatus === "ALL"
                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                }`}
              >
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                  Total Orders
            </div>
                <div className="text-2xl font-black mt-1">
                  {metrics.total}
            </div>
          </div>

              {/* Card 2: New Requests */}
              <div 
                onClick={() => { setSelectedStatus("NEW_REQUEST"); setPage(1); }}
                className={`p-3.5 rounded-2xl border transition shadow-xs cursor-pointer ${
                  selectedStatus === "NEW_REQUEST"
                    ? "bg-amber-600 text-white border-amber-600 shadow-md"
                    : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300"
                }`}
              >
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                  New Requests
            </div>
                <div className="text-2xl font-black mt-1">
                  {metrics.newRequests}
            </div>
          </div>

              {/* Card 3: Repairing */}
              <div 
                onClick={() => { setSelectedStatus("REPAIRING"); setPage(1); }}
                className={`p-3.5 rounded-2xl border transition shadow-xs cursor-pointer ${
                  selectedStatus === "REPAIRING"
                    ? "bg-cyan-600 text-white border-cyan-600 shadow-md"
                    : "bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300"
                }`}
              >
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                  Repairing
            </div>
                <div className="text-2xl font-black mt-1">
                  {metrics.repairing}
            </div>
          </div>

              {/* Card 4: Completed */}
              <div 
                onClick={() => { setSelectedStatus("COMPLETED"); setPage(1); }}
                className={`p-3.5 rounded-2xl border transition shadow-xs cursor-pointer ${
                  selectedStatus === "COMPLETED"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                    : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                }`}
              >
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                  Completed
            </div>
                <div className="text-2xl font-black mt-1">
                  {metrics.completed}
            </div>
          </div>
        </div>

            {/* 2. Horizontal Status Chips (Touch Scrollable) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
              {statusStatCards.map((sc) => (
                <button
                  key={sc.key}
                  onClick={() => {
                    setSelectedStatus(sc.filter);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-full uppercase text-[10px] font-bold tracking-wider shrink-0 transition ${
                    selectedStatus === sc.filter
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {sc.label} ({sc.count})
                </button>
              ))}
        </div>

            {/* 3. Mobile Search & Quick Action Controls */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search orders, phone, customer..."
                  className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white outline-none shadow-xs"
                />
          </div>
              <button
                onClick={fetchDashboardData}
                disabled={isLoading}
                className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 shrink-0 shadow-xs"
                title="Refresh Data"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
              </button>
              <button
                onClick={handleExportCSV}
                className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 shrink-0 shadow-xs"
                title="Export CSV"
              >
                <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </button>
        </div>

            {/* 4. Vertical Service Order Cards */}
            <div className="space-y-3">
              {orders.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    No Customer Orders Yet
              </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Start receiving customer service requests to see them here. New customer service requests will appear here after successful submission.
              </div>
            </div>
              ) : (
                orders.map((o) => (
                  <div
                    key={o.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3"
                  >
                    {/* Header: Tracking ID + Status */}
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">
                            {o.trackingId}
                          </span>
                          <button
                            onClick={() => copyToClipboard(o.trackingId)}
                            className="text-slate-400 p-0.5"
                            title="Copy Tracking ID"
                          >
                            {copiedId === o.trackingId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            o.source === "ADMIN_CREATED"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
                          }`}>
                            {o.source === "ADMIN_CREATED" ? "Walk-in" : "Online"}
                          </span>
                    </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          Service ID: <span className="font-semibold text-slate-700 dark:text-slate-300">{o.serviceId || o.customer.phone}</span>
                    </div>
                  </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${o.badgeClass}`}>
                        {o.statusLabel}
                      </span>
                </div>

                    {/* Customer Details */}
                    <div className="space-y-1">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {o.customer.name}
                  </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <a href={`tel:${o.customer.phone}`} className="font-mono text-blue-600 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{o.customer.phone}</span>
                        </a>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{o.customer.location}</span>
                        </span>
                  </div>
                </div>

                    {/* Device & Repair Service */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {o.deviceBrand} {o.deviceModel}
                  </div>
                      <div className="text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                        {o.repairCategory}
                  </div>
                      <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {o.reportedIssue}
                  </div>
                </div>

                    {/* Date & Cost */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <div>
                        Request: {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </div>
                      <div>
                        Cost: <span className="font-bold text-slate-800 dark:text-slate-200">{o.amount}</span>
                  </div>
                </div>

                    {/* Touch-Friendly Action Buttons (>= 44px min height) */}
                    <div className="grid grid-cols-5 gap-1 pt-1">
                      <button
                        onClick={() => handleOpenOrderDetails(o)}
                        className="min-h-[44px] py-2 px-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] flex items-center justify-center transition active:scale-95"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => openStatusModal(o)}
                        className="min-h-[44px] py-2 px-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[11px] flex items-center justify-center transition active:scale-95"
                      >
                        Status
                      </button>
                      <button
                        onClick={() => setOrderForSpecialMessage(o)}
                        className="min-h-[44px] py-2 px-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px] flex items-center justify-center transition active:scale-95"
                      >
                        Msg
                      </button>
                      <a
                        href={`https://wa.me/${o.customer.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello ${o.customer.name}, update on your ${o.deviceModel} (ID: ${o.trackingId}) at Denish Mobile Care.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[44px] py-2 px-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition active:scale-95"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat</span>
                      </a>
                      <button
                        onClick={() => setOrderToDelete(o)}
                        className="min-h-[44px] py-2 px-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 font-bold text-[11px] flex items-center justify-center gap-1 transition active:scale-95"
                        title="Delete Order"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>Del</span>
                      </button>
                </div>
              </div>
                ))
              )}
        </div>

            {/* Mobile Pagination */}
            {totalCount > limit && (
              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-4 py-2.5 min-h-[44px] rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-4 py-2.5 min-h-[44px] rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold disabled:opacity-50"
                >
                  Next
                </button>
          </div>
            )}

      </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          ORDER DETAILS MODAL / BOTTOM SHEET (Shared Desktop Drawer & Mobile Sheet)
          ══════════════════════════════════════════════════════════════════════════ */}
      {selectedOrderForDetails && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end lg:items-center justify-center p-0 lg:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl lg:rounded-2xl max-w-lg w-full p-5 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                    {selectedOrderForDetails.trackingId}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${selectedOrderForDetails.badgeClass}`}>
                    {selectedOrderForDetails.statusLabel}
                  </span>
            </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Order Details &amp; History Timeline
            </div>
          </div>
              <button
                onClick={() => setSelectedOrderForDetails(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
        </div>

            {/* Customer Information */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-xs">
              <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
                Customer Information
          </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2 p-2 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300">Service ID (Customer Phone)</span>
                  <span className="font-mono font-bold text-xs text-blue-700 dark:text-blue-300">{selectedOrderForDetails.serviceId || selectedOrderForDetails.customer.phone}</span>
            </div>
                <div>
                  <span className="text-slate-400">Name:</span>{" "}
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedOrderForDetails.customer.name}</span>
            </div>
                <div>
                  <span className="text-slate-400">Phone:</span>{" "}
                  <a href={`tel:${selectedOrderForDetails.customer.phone}`} className="font-mono text-blue-600 font-bold">
                    {selectedOrderForDetails.customer.phone}
                  </a>
            </div>
                <div className="col-span-2">
                  <span className="text-slate-400">Location:</span>{" "}
                  <span className="text-slate-700 dark:text-slate-300">{selectedOrderForDetails.customer.location}</span>
            </div>
          </div>
        </div>

            {/* Device Information */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-xs">
              <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
                Device &amp; Repair Information
          </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400">Device:</span>{" "}
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedOrderForDetails.deviceBrand} {selectedOrderForDetails.deviceModel}</span>
            </div>
                <div>
                  <span className="text-slate-400">Category:</span>{" "}
                  <span className="font-bold text-blue-600">{selectedOrderForDetails.repairCategory}</span>
            </div>
                <div>
                  <span className="text-slate-400">Estimated Cost:</span>{" "}
                  <span className="font-bold text-slate-900 dark:text-white">{selectedOrderForDetails.amount}</span>
            </div>
                <div>
                  <span className="text-slate-400">Payment:</span>{" "}
                  <span className={`font-bold ${selectedOrderForDetails.paid ? "text-emerald-600" : "text-amber-600"}`}>
                    {selectedOrderForDetails.paid ? "Paid" : "Pending Payment"}
                  </span>
            </div>
                {selectedOrderForDetails.estimatedCompletion && (
                  <div className="col-span-2">
                    <span className="text-slate-400">Estimated Completion:</span>{" "}
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedOrderForDetails.estimatedCompletion}</span>
              </div>
                )}
                <div className="col-span-2">
                  <span className="text-slate-400">Reported Problem:</span>
                  <p className="mt-0.5 text-slate-700 dark:text-slate-300 font-medium">
                    {selectedOrderForDetails.reportedIssue}
                  </p>
            </div>
                {selectedOrderForDetails.inspectionNotes && (
                  <div className="col-span-2">
                    <span className="text-slate-400">Internal Intake Notes:</span>
                    <p className="mt-0.5 text-slate-500 font-mono text-[11px]">
                      {selectedOrderForDetails.inspectionNotes}
                    </p>
              </div>
                )}
          </div>
        </div>

            {/* Quick Status State Transition Action Strip */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Quick Action Transitions</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleQuickStatusTransition(selectedOrderForDetails.id, "READY_FOR_PICKUP", "Your device is tested and ready for collection at our Gandhinagar shop.")}
                  className="py-2 px-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 text-[11px] font-bold transition text-left"
                >
                  ✓ Ready for Pickup
                </button>
                <button
                  onClick={() => handleQuickStatusTransition(selectedOrderForDetails.id, "COMPLETED", "Technical service and 24-point bench tests completed successfully.")}
                  className="py-2 px-2.5 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-300 text-[11px] font-bold transition text-left"
                >
                  ✓ Mark Completed
                </button>
                <button
                  onClick={() => handleQuickStatusTransition(selectedOrderForDetails.id, "DELIVERED", "Device safely handed over to customer. Warranty activated.")}
                  className="py-2 px-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 text-[11px] font-bold transition text-left"
                >
                  ✓ Mark Delivered
                </button>
                <button
                  onClick={() => handleQuickStatusTransition(selectedOrderForDetails.id, "CANCELLED", "Order cancelled as requested.")}
                  className="py-2 px-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-300 text-[11px] font-bold transition text-left"
                >
                  ✕ Cancel Request
                </button>
          </div>
        </div>

            {/* Status History Timeline */}
            <div className="space-y-2">
              <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
                Status Audit Trail ({selectedOrderForDetails.statusHistory?.length || 0} transitions)
          </div>
              {isLoadingDetails ? (
                <div className="p-4 text-center text-xs text-slate-400">Loading audit history...</div>
              ) : selectedOrderForDetails.statusHistory && selectedOrderForDetails.statusHistory.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedOrderForDetails.statusHistory.map((h) => (
                    <div key={h.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-600 dark:text-blue-400">{h.statusLabel}</span>
                        <span className="text-[10px] text-slate-400">{new Date(h.createdAt).toLocaleString("en-IN")}</span>
                  </div>
                      {h.customerNote && (
                        <div className="mt-1 text-slate-600 dark:text-slate-300 text-[11px]">
                          <span className="text-slate-400 font-medium">Customer Note:</span> {h.customerNote}
                    </div>
                      )}
                      {h.internalNote && (
                        <div className="mt-0.5 text-slate-500 text-[10px] italic">
                          Internal: {h.internalNote}
                    </div>
                      )}
                </div>
                  ))}
            </div>
              ) : (
                <div className="p-3 text-xs text-slate-400 italic">No transition history recorded yet.</div>
              )}
        </div>

            {/* Actions */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-6 gap-1.5 text-xs">
              <button
                onClick={() => {
                  const o = selectedOrderForDetails;
                  setSelectedOrderForDetails(null);
                  setOrderToEdit(o);
                }}
                className="py-2.5 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl font-bold flex items-center justify-center gap-1 transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => {
                  const o = selectedOrderForDetails;
                  setSelectedOrderForDetails(null);
                  setOrderForSpecialMessage(o);
                }}
                className="py-2.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl font-bold flex items-center justify-center gap-1 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Special Msg</span>
              </button>
              <button
                onClick={() => {
                  const o = selectedOrderForDetails;
                  setSelectedOrderForDetails(null);
                  setOrderToArchive(o);
                }}
                className="py-2.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl font-bold flex items-center justify-center gap-1 transition"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Archive</span>
              </button>
              <button
                onClick={() => {
                  const o = selectedOrderForDetails;
                  setSelectedOrderForDetails(null);
                  setOrderToDelete(o);
                }}
                className="py-2.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 rounded-xl font-bold flex items-center justify-center gap-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Delete</span>
              </button>
              <a
                href={`https://wa.me/${selectedOrderForDetails.customer.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello ${selectedOrderForDetails.customer.name}, update on your ${selectedOrderForDetails.deviceModel} (Tracking ID: ${selectedOrderForDetails.trackingId}) at Denish Mobile Care.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-1 transition"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
              <button
                onClick={() => {
                  const o = selectedOrderForDetails;
                  setSelectedOrderForDetails(null);
                  openStatusModal(o);
                }}
                className="py-2.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center transition col-span-2 sm:col-span-1"
              >
                Update
              </button>
            </div>

      </div>
    </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          QUICK STATUS UPDATE MODAL (Real Database Transition)
          ══════════════════════════════════════════════════════════════════════════ */}
      {activeModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                  {activeModalOrder.trackingId}
            </div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Update Service Status &amp; Notes
                </h3>
          </div>
              <button 
                onClick={() => setActiveModalOrder(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
        </div>

            <form onSubmit={handleSaveStatus} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  1. Lifecycle Status (11 Distinct States)
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as RepairStatus)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {Object.entries(REPAIR_STATUSES).map(([code, meta]) => (
                    <option key={code} value={code}>
                      {meta.label} ({code})
                    </option>
                  ))}
                </select>
          </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  2. Customer Status Note (Visible on Public Tracker)
                </label>
                <input
                  type="text"
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="e.g. Diagnostics completed. Screen in stock, repair in progress."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
                />
          </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  3. Internal Workshop Note (Technician Only)
                </label>
                <input
                  type="text"
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="e.g. Tested touch sensitivity and charging rate."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
                />
          </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                    Service Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={editCost}
                    onChange={(e) => setEditCost(e.target.value)}
                    placeholder="e.g. 2500"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
            </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                    Payment Status
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditPaid(!editPaid)}
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      editPaid ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-amber-50 text-amber-700 border-amber-300"
                    }`}
                  >
                    {editPaid ? "Paid ✓" : "Pending"}
                  </button>
            </div>
          </div>

              {/* Estimated Completion Date */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Estimated Completion Date / Time
                </label>
                <input
                  type="text"
                  value={editEstimatedDate}
                  onChange={(e) => setEditEstimatedDate(e.target.value)}
                  placeholder="e.g. Today by 6:00 PM / Tomorrow 12:00 PM"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                />
          </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pickup-ready-chk"
                  checked={editPickupReady || targetStatus === "READY_FOR_PICKUP"}
                  onChange={(e) => setEditPickupReady(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <label htmlFor="pickup-ready-chk" className="text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                  Mark Device Ready for Pickup at Gandhinagar Shop
                </label>
          </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModalOrder(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  {isUpdatingStatus ? "Saving..." : "Save to Database"}
                </button>
          </div>
            </form>
      </div>
    </div>
      )}

      {/* ── EDIT ORDER MODAL ── */}
      {orderToEdit && (
        <EditOrderModal
          order={orderToEdit}
          onClose={() => setOrderToEdit(null)}
          onSaved={fetchDashboardData}
        />
      )}

      {/* ── ARCHIVE ORDER MODAL ── */}
      {orderToArchive && (
        <ArchiveOrderModal
          order={orderToArchive}
          onClose={() => setOrderToArchive(null)}
          onArchived={fetchDashboardData}
        />
      )}

      {/* ── SPECIAL WHATSAPP MESSAGE MODAL ── */}
      {orderForSpecialMessage && (
        <SpecialMessageModal
          order={orderForSpecialMessage}
          onClose={() => setOrderForSpecialMessage(null)}
          onSent={fetchDashboardData}
        />
      )}

      {/* ── DELETE ORDER MODAL ── */}
      {orderToDelete && (
        <DeleteOrderModal
          order={orderToDelete}
          onClose={() => setOrderToDelete(null)}
          onDeleted={() => {
            triggerToast("Repair order deleted permanently.");
            fetchDashboardData();
          }}
        />
      )}

      {/* ── DELETE CUSTOMER MODAL ── */}
      {customerToDelete && (
        <DeleteCustomerModal
          customer={customerToDelete}
          onClose={() => setCustomerToDelete(null)}
          onDeleted={() => {
            triggerToast(`Customer ${customerToDelete.name} and records deleted.`);
            fetchDashboardData();
          }}
        />
      )}

</div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={
      <div className="p-16 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-2xl">
        Loading Admin Dashboard...
  </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}
