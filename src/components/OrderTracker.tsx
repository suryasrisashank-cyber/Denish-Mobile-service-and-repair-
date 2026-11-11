"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Wrench, 
  XCircle, 
  MessageSquare, 
  MessageCircle, 
  Smartphone, 
  Calendar,
  RotateCcw
} from 'lucide-react';
import { RepairOrder, RepairStatus } from '../types';
import { BUSINESS_INFO } from '../data/constants';

interface OrderTrackerProps {
  initialPhone?: string;
  onBookNewClick: () => void;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({ initialPhone = '', onBookNewClick }) => {
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [orders, setOrders] = useState<RepairOrder[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchOrders = async (phoneToSearch: string) => {
    const clean = phoneToSearch.replace(/\D/g, '');
    if (clean.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSearching(true);
    setErrorMessage('');
    setHasSearched(true);

    try {
      const res = await fetch(`/api/orders/track/${clean}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to search order records');
      }

      setOrders(data.orders || []);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Unable to connect to order server.');
      setOrders([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (initialPhone && initialPhone.length >= 10) {
      setPhoneNumber(initialPhone);
      fetchOrders(initialPhone);
    }
  }, [initialPhone]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(phoneNumber);
  };

  const getStatusColor = (status: RepairStatus) => {
    switch (status) {
      case 'Pending':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/40',
          text: 'text-amber-700 dark:text-amber-400',
          border: 'border-amber-200 dark:border-amber-800',
          icon: <Clock className="w-4 h-4 text-amber-500" />
        };
      case 'In Progress':
        return {
          bg: 'bg-sky-50 dark:bg-sky-950/40',
          text: 'text-sky-700 dark:text-sky-400',
          border: 'border-sky-200 dark:border-sky-800',
          icon: <Wrench className="w-4 h-4 text-sky-500 animate-spin" />
        };
      case 'Completed':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/40',
          text: 'text-emerald-700 dark:text-emerald-400',
          border: 'border-emerald-200 dark:border-emerald-800',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        };
      case 'Cancelled':
        return {
          bg: 'bg-slate-100 dark:bg-slate-800',
          text: 'text-slate-600 dark:text-slate-400',
          border: 'border-slate-200 dark:border-slate-700',
          icon: <XCircle className="w-4 h-4 text-slate-500" />
        };
    }
  };

  return (
    <section id="track" className="py-20 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          
          {/* Header */}
          <div className="max-w-2xl mb-8">
            <div className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-1">
              Live Workshop Status
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
              Track Repair Order / My Orders
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Enter your registered 10-digit mobile number to view live repair progress, component diagnostic stages, and custom messages from our workshop technician.
            </p>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter 10-digit mobile number (Service ID)"
                className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="h-12 px-6 rounded-xl bg-[#101c2c] dark:bg-[#173b59] hover:bg-[#173b59] dark:hover:bg-[#1e4a6f] text-white text-xs sm:text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{isSearching ? 'Searching...' : 'Check Status'}</span>
            </button>
          </form>

          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Results List */}
          {hasSearched && (
            <div className="space-y-6">
              {orders.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 mx-auto flex items-center justify-center">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      No Repair Records Found
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                      We could not find an active or completed repair order under mobile number{' '}
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{phoneNumber}</span>.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={onBookNewClick}
                      className="px-5 py-2.5 rounded-lg bg-[#101c2c] dark:bg-[#173b59] text-white text-xs font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2"
                    >
                      <Wrench className="w-3.5 h-3.5 text-amber-400" />
                      <span>Book a New Repair</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Found {orders.length} repair order(s) for your mobile number</span>
                    <button
                      onClick={() => fetchOrders(phoneNumber)}
                      className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:underline"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {orders.map((order) => {
                    const statusConfig = getStatusColor(order.status);
                    const whatsappOrderUrl = `https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent(
                      `Hello Denish Workshop, checking status of my repair: Order ${order.id} (Service ID: ${order.serviceId}) for ${order.brand} ${order.model}.`
                    )}`;

                    return (
                      <div
                        key={order.id}
                        className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5"
                      >
                        {/* Header: Service ID + Status Badge */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                          <div>
                            <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                              Order Ticket: {order.id}
                            </div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <span>Service ID:</span>
                              <span className="font-mono text-sky-600 dark:text-sky-400">{order.serviceId}</span>
                            </div>
                          </div>

                          <div
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                          >
                            {statusConfig.icon}
                            <span>{order.status}</span>
                          </div>
                        </div>

                        {/* Order Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                          <div className="space-y-1">
                            <span className="text-slate-500 dark:text-slate-400">Device</span>
                            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{order.brand} - {order.model}</span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-slate-500 dark:text-slate-400">Service Required</span>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {order.serviceType}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-slate-500 dark:text-slate-400">Booking Date</span>
                            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</span>
                            </div>
                          </div>
                        </div>

                        {/* Issue Symptoms */}
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Customer Reported Symptoms: </span>
                          <span className="text-slate-600 dark:text-slate-400">{order.issueDescription}</span>
                        </div>

                        {/* Special Message from Administrator (Section 11) */}
                        {order.adminMessage && (
                          <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-300">
                              <div className="flex items-center gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                <span>Special Message from Workshop Master</span>
                              </div>
                              {order.adminUpdatedAt && (
                                <span className="text-[10px] font-normal text-amber-800 dark:text-amber-400">
                                  Updated: {new Date(order.adminUpdatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-amber-950 dark:text-amber-200 font-medium">
                              &quot;{order.adminMessage}&quot;
                            </p>
                          </div>
                        )}

                        {/* WhatsApp Action */}
                        <div className="pt-2 flex items-center justify-end">
                          <a
                            href={whatsappOrderUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Enquire on WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </section>
  );
};
