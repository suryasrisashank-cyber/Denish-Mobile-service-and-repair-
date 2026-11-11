"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  MessageCircle, Search, Send, CheckCheck, Check, 
  ExternalLink, User, Wrench, RefreshCw
} from "lucide-react";
import { DEVICE_BRANDS, REPAIR_SERVICES } from "@/lib/constants";

interface WhatsAppConversation {
  id: number;
  customer_id: number | null;
  customer_phone: string;
  customer_name: string | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  is_enquiry: number;
  converted_order_id: number | null;
  converted_tracking_id?: string | null;
  converted_order_status?: string | null;
}

interface WhatsAppMessage {
  id: number;
  conversation_id: number;
  whatsapp_message_id: string | null;
  direction: "inbound" | "outbound";
  sender_phone: string;
  recipient_phone: string;
  message_type: string;
  message_text: string | null;
  media_url: string | null;
  media_mime_type: string | null;
  status: string;
  created_at: string;
}

export default function WhatsAppInboxView() {
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<WhatsAppConversation | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [filter, setFilter] = useState<"all" | "enquiries" | "unread">("all");
  const [search, setSearch] = useState<string>("");
  const [replyText, setReplyText] = useState<string>("");
  const [isLoadingList, setIsLoadingList] = useState<boolean>(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [manualWhatsAppUrl, setManualWhatsAppUrl] = useState<string | null>(null);

  // Convert Enquiry Modal state
  const [showConvertModal, setShowConvertModal] = useState<boolean>(false);
  const [convertBrand, setConvertBrand] = useState<string>("Apple");
  const [convertModel, setConvertModel] = useState<string>("");
  const [convertCategory, setConvertCategory] = useState<string>("Screen Replacement");
  const [convertIssue, setConvertIssue] = useState<string>("");
  const [convertCost, setConvertCost] = useState<string>("");
  const [convertEstimate, setConvertEstimate] = useState<string>("Same Day / 4 Hours");
  const [convertLocation, setConvertLocation] = useState<string>("Gandhinagar");
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [convertMsg, setConvertMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("denish_admin_token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/admin/whatsapp/conversations?filter=${filter}&q=${encodeURIComponent(search)}`, { headers });
      const json = await res.json();
      if (res.ok && json.success) {
        setConversations(json.data.conversations || []);
        if (!selectedConv && json.data.conversations?.length > 0) {
          setSelectedConv(json.data.conversations[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingList(false);
    }
  }, [filter, search, selectedConv]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch messages when selected conversation changes
  const fetchMessages = useCallback(async (convId: number) => {
    setIsLoadingMessages(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("denish_admin_token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/admin/whatsapp/conversations/${convId}/messages`, { headers });
      const json = await res.json();
      if (res.ok && json.success) {
        setMessages(json.data.messages || []);
        // update unread in conversation list
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, unread_count: 0 } : c))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv.id);
      setConvertIssue(selectedConv.last_message || "");
    }
  }, [selectedConv, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send WhatsApp reply
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConv || !replyText.trim()) return;

    setIsSending(true);
    setManualWhatsAppUrl(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("denish_admin_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/admin/whatsapp/conversations/${selectedConv.id}/messages`, {
        method: "POST",
        headers,
        body: JSON.stringify({ messageText: replyText.trim() }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setReplyText("");
        if (json.data.manualWhatsAppUrl) {
          setManualWhatsAppUrl(json.data.manualWhatsAppUrl);
        }
        await fetchMessages(selectedConv.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  // Convert Enquiry to Order
  const handleConvertEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConv) return;

    setIsConverting(true);
    setConvertMsg(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("denish_admin_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/admin/whatsapp/convert-enquiry", {
        method: "POST",
        headers,
        body: JSON.stringify({
          conversationId: selectedConv.id,
          customerName: selectedConv.customer_name,
          customerLocation: convertLocation,
          deviceBrand: convertBrand,
          deviceModel: convertModel,
          repairCategory: convertCategory,
          reportedIssue: convertIssue || "Enquiry from WhatsApp",
          estimatedCompletion: convertEstimate,
          serviceCost: convertCost ? Number(convertCost) : null,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to convert enquiry.");
      }

      setConvertMsg(`Enquiry converted! Order Tracking ID: ${json.data.trackingId}`);
      setTimeout(() => {
        setShowConvertModal(false);
        setConvertMsg(null);
        fetchConversations();
        if (selectedConv) fetchMessages(selectedConv.id);
      }, 2000);
    } catch (err: unknown) {
      setConvertMsg(err instanceof Error ? err.message : "Error converting enquiry.");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div>
          <h1 className="text-base font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <span>WhatsApp Business Inbox &amp; Customer Enquiries</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real incoming WhatsApp messages via Meta Webhook. Enquiries are kept separate until confirmed.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchConversations}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 hover:bg-slate-100 transition"
            title="Refresh conversations"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left List + Right Thread */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[75vh] min-h-[500px]">
        
        {/* Left Panel: Conversations (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col overflow-hidden">
          
          {/* Search & Filter Tabs */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search phone or name..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
              />
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilter("all")}
                className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition ${
                  filter === "all" ? "bg-slate-900 text-white dark:bg-slate-700" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("enquiries")}
                className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition ${
                  filter === "enquiries" ? "bg-amber-600 text-white" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                Enquiries
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition ${
                  filter === "unread" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                Unread
              </button>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {isLoadingList ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading chats...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <div className="font-bold text-slate-700 dark:text-slate-300">No WhatsApp messages yet</div>
                <div className="mt-1">Inbound messages from Meta Webhook will appear here.</div>
              </div>
            ) : (
              conversations.map((c) => {
                const isSelected = selectedConv?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedConv(c)}
                    className={`p-3 cursor-pointer transition flex items-start justify-between gap-2 ${
                      isSelected
                        ? "bg-blue-50/60 dark:bg-slate-800"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-start gap-2.5 truncate">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="truncate text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white truncate">
                            {c.customer_name || `+${c.customer_phone}`}
                          </span>
                          {c.is_enquiry === 1 && !c.converted_order_id && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                              Enquiry
                            </span>
                          )}
                          {c.converted_order_id && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                              Order #{c.converted_order_id}
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-[11px] text-slate-500">
                          +{c.customer_phone}
                        </div>
                        <p className="text-slate-500 text-[11px] truncate max-w-[190px] mt-0.5">
                          {c.last_message || "No messages yet"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {c.last_message_at
                          ? new Date(c.last_message_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                          : ""}
                      </span>
                      {c.unread_count > 0 && (
                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                          {c.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Chat Thread & Action Composer (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col overflow-hidden">
          {selectedConv ? (
            <>
              {/* Conversation Top Bar */}
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                    {selectedConv.customer_name ? selectedConv.customer_name[0].toUpperCase() : "W"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {selectedConv.customer_name || `WhatsApp User`}
                      </span>
                      <span className="font-mono text-xs text-blue-600 dark:text-blue-400">
                        +{selectedConv.customer_phone}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Service ID: {selectedConv.customer_phone}
                      {selectedConv.converted_tracking_id && ` • Linked Order: ${selectedConv.converted_tracking_id}`}
                    </div>
                  </div>
                </div>

                {/* Conversion Button if enquiry is unconverted */}
                {selectedConv.is_enquiry === 1 && !selectedConv.converted_order_id ? (
                  <button
                    onClick={() => setShowConvertModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Convert Enquiry to Repair Order</span>
                  </button>
                ) : (
                  <a
                    href={`https://wa.me/${selectedConv.customer_phone}?text=${encodeURIComponent(`Hello ${selectedConv.customer_name || ""}, update from DENISH MOBILE REPAIRING AND SERVICE.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>WhatsApp Web</span>
                  </a>
                )}
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30 dark:bg-slate-950/20">
                {isLoadingMessages ? (
                  <div className="p-8 text-center text-xs text-slate-400">Loading conversation history...</div>
                ) : messages.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No messages recorded in this conversation.
                  </div>
                ) : (
                  messages.map((m) => {
                    const isInbound = m.direction === "inbound";
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isInbound ? "items-start" : "items-end"}`}
                      >
                        <div
                          className={`max-w-[75%] p-3 rounded-2xl text-xs space-y-1 ${
                            isInbound
                              ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-tl-xs shadow-xs"
                              : "bg-emerald-600 text-white rounded-tr-xs shadow-xs"
                          }`}
                        >
                          <div className="whitespace-pre-wrap leading-relaxed">{m.message_text}</div>
                          
                          <div className={`flex items-center justify-end gap-1 text-[9px] font-mono ${
                            isInbound ? "text-slate-400" : "text-emerald-100"
                          }`}>
                            <span>
                              {new Date(m.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            {!isInbound && (
                              <span>
                                {m.status === "delivered" || m.status === "read" ? (
                                  <CheckCheck className="w-3 h-3 text-emerald-200" />
                                ) : (
                                  <Check className="w-3 h-3 text-emerald-200" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Manual URL fallback notice if Cloud API is in manual mode */}
              {manualWhatsAppUrl && (
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border-t border-blue-200 dark:border-blue-800 text-xs flex items-center justify-between text-blue-700 dark:text-blue-300">
                  <span>Message logged in database. Click to send directly on WhatsApp:</span>
                  <a
                    href={manualWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold underline flex items-center gap-1"
                  >
                    <span>Send on WhatsApp Web</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Chat Composer */}
              <form onSubmit={handleSendReply} className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type reply to customer..."
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={isSending || !replyText.trim()}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? "Sending..." : "Reply"}</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 text-xs">
              <MessageCircle className="w-10 h-10 text-slate-300 mb-2 stroke-1" />
              <div className="font-semibold">Select a WhatsApp conversation</div>
              <div>View customer chat history and convert enquiries into repair orders.</div>
            </div>
          )}
        </div>

      </div>

      {/* ── CONVERT ENQUIRY MODAL ── */}
      {showConvertModal && selectedConv && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Convert Enquiry to Repair Order
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Creates an authenticated ADMIN_CREATED order with Service ID +{selectedConv.customer_phone}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowConvertModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            {convertMsg && (
              <div className="p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium">
                {convertMsg}
              </div>
            )}

            <form onSubmit={handleConvertEnquiry} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Customer Name</label>
                  <input
                    type="text"
                    disabled
                    value={selectedConv.customer_name || "Valued Customer"}
                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Customer Phone (Service ID)</label>
                  <input
                    type="text"
                    disabled
                    value={selectedConv.customer_phone}
                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Device Brand *</label>
                  <select
                    value={convertBrand}
                    onChange={(e) => setConvertBrand(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    {DEVICE_BRANDS.map((b) => (
                      <option key={b.name} value={b.name}>{b.name}</option>
                    ))}
                    <option value="Other">Other Brand</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Device Model *</label>
                  <input
                    type="text"
                    required
                    value={convertModel}
                    onChange={(e) => setConvertModel(e.target.value)}
                    placeholder="e.g. iPhone 12 / OnePlus 9"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Repair Category *</label>
                  <select
                    value={convertCategory}
                    onChange={(e) => setConvertCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    {REPAIR_SERVICES.map((s) => (
                      <option key={s.id} value={s.title}>{s.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Estimated Cost (₹)</label>
                  <input
                    type="number"
                    value={convertCost}
                    onChange={(e) => setConvertCost(e.target.value)}
                    placeholder="e.g. 2000"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Customer Location</label>
                  <input
                    type="text"
                    value={convertLocation}
                    onChange={(e) => setConvertLocation(e.target.value)}
                    placeholder="e.g. Gandhinagar / Sector 21"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Estimated Completion</label>
                  <input
                    type="text"
                    value={convertEstimate}
                    onChange={(e) => setConvertEstimate(e.target.value)}
                    placeholder="e.g. Same Day / 4 Hours"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Reported Issue *</label>
                <textarea
                  required
                  rows={2}
                  value={convertIssue}
                  onChange={(e) => setConvertIssue(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConvertModal(false)}
                  disabled={isConverting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isConverting || !convertModel.trim()}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition disabled:opacity-50"
                >
                  {isConverting ? "Converting..." : "Confirm & Create Order"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
