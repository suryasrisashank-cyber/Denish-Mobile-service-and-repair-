"use client";

import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Search, 
  Trash2, 
  Edit3, 
  PlusCircle, 
  RotateCcw,
  X,
  AlertTriangle
} from 'lucide-react';
import { RepairOrder, RepairStatus } from '../types';
import { CORE_SERVICES, DEVICE_BRANDS } from '../data/constants';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ isOpen, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [orders, setOrders] = useState<RepairOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Edit Modal State
  const [editingOrder, setEditingOrder] = useState<RepairOrder | null>(null);
  const [editStatus, setEditStatus] = useState<RepairStatus>('Pending');
  const [editAdminMessage, setEditAdminMessage] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  // Delete Confirmation State
  const [deletingOrder, setDeletingOrder] = useState<RepairOrder | null>(null);

  // New Walk-in Order Modal State
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newBrand, setNewBrand] = useState(DEVICE_BRANDS[0].label);
  const [newModel, setNewModel] = useState('');
  const [newService, setNewService] = useState(CORE_SERVICES[0].name);
  const [newIssue, setNewIssue] = useState('');
  const [newStatus] = useState<RepairStatus>('In Progress');

  // Load orders after authentication
  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/orders', {
        headers: {
          'x-admin-pin': '8511',
          'Authorization': 'Bearer denish-workshop-auth-token'
        }
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setPinInput('');
      } else {
        setLoginError(data.error || 'Incorrect Workshop PIN');
      }
    } catch {
      setLoginError('Server error while authenticating');
    }
  };

  const handleOpenEdit = (order: RepairOrder) => {
    setEditingOrder(order);
    setEditStatus(order.status);
    setEditAdminMessage(order.adminMessage || '');
    setEditPrice(order.estimatedPrice || '');
    setUpdateError('');
  };

  const handleSaveEdit = async () => {
    if (!editingOrder) return;
    setIsUpdating(true);
    setUpdateError('');

    try {
      const res = await fetch(`/api/admin/orders/${editingOrder.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': '8511',
          'Authorization': 'Bearer denish-workshop-auth-token'
        },
        body: JSON.stringify({
          status: editStatus,
          adminMessage: editAdminMessage,
          estimatedPrice: editPrice
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update order');
      }

      // Update state locally
      setOrders((prev) =>
        prev.map((o) => (o.id === editingOrder.id ? data.order : o))
      );
      setEditingOrder(null);
    } catch (err: unknown) {
      setUpdateError((err as Error).message || 'Error updating order');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingOrder) return;

    try {
      const res = await fetch(`/api/admin/orders/${deletingOrder.id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-pin': '8511',
          'Authorization': 'Bearer denish-workshop-auth-token'
        }
      });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== deletingOrder.id));
        setDeletingOrder(null);
      }
    } catch (err) {
      console.error('Failed to delete order:', err);
    }
  };

  const handleCreateWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName || !newPhone || !newModel) return;

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': '8511',
          'Authorization': 'Bearer denish-workshop-auth-token'
        },
        body: JSON.stringify({
          customerName: newCustomerName,
          phone: newPhone,
          brand: newBrand,
          model: newModel,
          serviceType: newService,
          issueDescription: newIssue,
          status: newStatus,
          adminMessage: 'Device admitted at workshop counter for inspection.'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders((prev) => [data.order, ...prev]);
        setShowNewOrderModal(false);
        setNewCustomerName('');
        setNewPhone('');
        setNewModel('');
        setNewIssue('');
      }
    } catch (err) {
      console.error('Failed to create walk-in order:', err);
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      order.customerName.toLowerCase().includes(query) ||
      order.serviceId.includes(query) ||
      order.model.toLowerCase().includes(query) ||
      order.brand.toLowerCase().includes(query) ||
      order.serviceType.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  // Real statistics (strictly from actual orders - NO demo/mock numbers!)
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'Pending').length,
    inProgress: orders.filter((o) => o.status === 'In Progress').length,
    completed: orders.filter((o) => o.status === 'Completed').length
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        
        {/* Top Header */}
        <div className="p-6 bg-[#101c2c] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-['Plus_Jakarta_Sans']">
                DENISH Workshop Administration
              </h2>
              <p className="text-xs text-slate-400">
                Authorized technician console · Real customer repair logs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {!isAuthenticated ? (
          /* PIN Authentication Screen */
          <div className="p-8 sm:p-12 max-w-md mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mx-auto flex items-center justify-center">
              <Lock className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Enter Workshop PIN
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your technician passcode to manage genuine customer repair tickets.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Passcode (Default: 8511)"
                className="w-full h-12 text-center tracking-widest text-lg font-mono font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                autoFocus
              />

              {loginError && (
                <div className="text-xs text-rose-500 font-medium">
                  {loginError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#101c2c] dark:bg-[#173b59] text-white text-xs font-semibold hover:opacity-90 shadow-sm"
                >
                  Unlock Portal
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Authenticated Admin Dashboard */
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Real Stats Ribbon (Strictly from real customer orders) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Genuine Orders</div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums">
                  {stats.total}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60">
                <div className="text-xs font-medium text-amber-700 dark:text-amber-400">Pending Review</div>
                <div className="text-2xl font-extrabold text-amber-800 dark:text-amber-300 mt-1 tabular-nums">
                  {stats.pending}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-800/60">
                <div className="text-xs font-medium text-sky-700 dark:text-sky-400">On Workbench</div>
                <div className="text-2xl font-extrabold text-sky-800 dark:text-sky-300 mt-1 tabular-nums">
                  {stats.inProgress}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60">
                <div className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Completed</div>
                <div className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-300 mt-1 tabular-nums">
                  {stats.completed}
                </div>
              </div>
            </div>

            {/* Controls Row: Search + Filter + Add Walk-in Order */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by customer, phone, device model..."
                    className="w-full h-10 pl-10 pr-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(true)}
                  className="px-3.5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>New Walk-in Order</span>
                </button>
                <button
                  type="button"
                  onClick={loadOrders}
                  title="Reload Orders"
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
                  <p className="text-sm font-semibold">No repair orders match your criteria.</p>
                  <p className="text-xs">
                    (Zero demo data policy: Only authentic customer submissions appear here).
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4 font-semibold">Service ID / Date</th>
                        <th className="py-3 px-4 font-semibold">Customer</th>
                        <th className="py-3 px-4 font-semibold">Device & Service</th>
                        <th className="py-3 px-4 font-semibold">Status</th>
                        <th className="py-3 px-4 font-semibold">Admin Special Note</th>
                        <th className="py-3 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-3.5 px-4 font-mono">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {order.serviceId}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-900 dark:text-white">
                              {order.customerName}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {order.phone}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-900 dark:text-white">
                              {order.brand} {order.model}
                            </div>
                            <div className="text-[11px] text-sky-600 dark:text-sky-400">
                              {order.serviceType}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold ${
                                order.status === 'Completed'
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                  : order.status === 'In Progress'
                                  ? 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300'
                                  : order.status === 'Cancelled'
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                  : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 max-w-xs">
                            {order.adminMessage ? (
                              <div className="text-slate-700 dark:text-slate-300 line-clamp-2">
                                &quot;{order.adminMessage}&quot;
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">No custom message</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(order)}
                                title="Edit Status & Custom Message"
                                className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-sky-600 dark:text-sky-400 transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingOrder(order)}
                                title="Delete Order"
                                className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Edit Order & Special Customer Message Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Update Repair Order
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  {editingOrder.id} · Service ID: {editingOrder.serviceId}
                </span>
              </div>
              <button
                onClick={() => setEditingOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {updateError && (
              <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600 text-xs">
                {updateError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Repair Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Pending', 'In Progress', 'Completed', 'Cancelled'] as RepairStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEditStatus(st)}
                      className={`p-2 rounded-lg border text-center font-bold transition-all ${
                        editStatus === st
                          ? 'bg-sky-50 dark:bg-sky-950 border-sky-500 text-sky-700 dark:text-sky-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Customer Message (Section 11) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    Special Message for Customer (Visible on Tracking Page)
                  </label>
                </div>
                <textarea
                  rows={3}
                  value={editAdminMessage}
                  onChange={(e) => setEditAdminMessage(e.target.value)}
                  placeholder="e.g. Your replacement display has arrived. Micro-soldering is underway..."
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {[
                    'Your mobile repair is currently in progress.',
                    'Your replacement display has arrived.',
                    'Your mobile is ready for collection.',
                    'Your repair may require additional time for motherboard testing.'
                  ].map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setEditAdminMessage(preset)}
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[10px] text-slate-600 dark:text-slate-300"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Estimated / Final Workshop Price (Optional)
                </label>
                <input
                  type="text"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  placeholder="e.g. ₹2,400"
                  className="w-full h-9 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs"
              >
                {isUpdating ? 'Saving...' : 'Save & Publish Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingOrder && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Delete Repair Order?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to permanently delete order{' '}
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{deletingOrder.id}</span> (Service ID: {deletingOrder.serviceId})? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingOrder(null)}
                className="flex-1 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Walk-in Order Modal */}
      {showNewOrderModal && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Create Walk-in Workshop Order
              </h3>
              <button
                onClick={() => setShowNewOrderModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWalkIn} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="Customer Name"
                    className="w-full h-9 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Phone Number (Service ID) *</label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="10-digit number"
                    className="w-full h-9 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Brand *</label>
                  <select
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full h-9 px-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {DEVICE_BRANDS.map((b) => (
                      <option key={b.id} value={b.label}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Model *</label>
                  <input
                    type="text"
                    required
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    placeholder="e.g. Galaxy S23 Ultra"
                    className="w-full h-9 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Service *</label>
                <select
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  className="w-full h-9 px-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {CORE_SERVICES.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Intake Symptoms</label>
                <input
                  type="text"
                  value={newIssue}
                  onChange={(e) => setNewIssue(e.target.value)}
                  placeholder="e.g. Broken glass, battery bulging..."
                  className="w-full h-9 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                >
                  Save Walk-in Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
