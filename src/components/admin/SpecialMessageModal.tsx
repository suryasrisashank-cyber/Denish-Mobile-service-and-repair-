"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle, X, Send, Copy, ExternalLink, Check } from "lucide-react";
import { SPECIAL_MESSAGE_TEMPLATES, formatTemplate } from "@/lib/whatsapp-templates";
import { SYSTEM_CONFIG } from "@/lib/constants";

interface SpecialMessageModalProps {
  order: {
    id: number;
    trackingId: string;
    deviceBrand: string;
    deviceModel: string;
    amount?: string;
    serviceCost?: number | null;
    customer: {
      name: string;
      phone: string;
    };
  };
  onClose: () => void;
  onSent?: () => void;
}

export default function SpecialMessageModal({ order, onClose, onSent }: SpecialMessageModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("intake_ack");
  const [messageText, setMessageText] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "info" | "error"; text: string; manualUrl?: string } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Update formatted message when template changes
  useEffect(() => {
    const tmpl = SPECIAL_MESSAGE_TEMPLATES.find((t) => t.id === selectedTemplateId);
    if (tmpl) {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      const trackingUrl = `${baseUrl}/track?id=${encodeURIComponent(order.trackingId)}`;
      const formatted = formatTemplate(tmpl.template, {
        customerName: order.customer.name,
        trackingId: order.trackingId,
        deviceModel: `${order.deviceBrand} ${order.deviceModel}`,
        trackingUrl,
        cost: order.amount || (order.serviceCost ? `₹${order.serviceCost}` : "₹0"),
        storeName: SYSTEM_CONFIG.storeName,
        storePhone: SYSTEM_CONFIG.phone,
      });
      setMessageText(formatted);
    }
  }, [selectedTemplateId, order]);

  const handleSend = async () => {
    setIsSending(true);
    setFeedback(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("denish_admin_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/admin/whatsapp/send-special-message", {
        method: "POST",
        headers,
        body: JSON.stringify({
          orderId: order.id,
          templateId: selectedTemplateId,
          customMessage: messageText.trim(),
          customerPhone: order.customer.phone,
          customerName: order.customer.name,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to dispatch message.");
      }

      if (json.data.cloudApiSuccess) {
        setFeedback({
          type: "success",
          text: "Message sent directly to customer via official Meta WhatsApp Cloud API!",
        });
      } else {
        setFeedback({
          type: "info",
          text: json.data.message || "Cloud API not connected. Click below to send via WhatsApp Web.",
          manualUrl: json.data.manualWhatsAppUrl,
        });
      }

      if (onSent) onSent();
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Error sending message.",
      });
    } finally {
      setIsSending(false);
    }
  };

  const copyMessage = () => {
    navigator.clipboard?.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl max-w-xl w-full p-5 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in slide-in-from-bottom duration-200 space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Special Message to Customer
              </h3>
              <p className="text-[11px] text-slate-500">
                Official WhatsApp notification for {order.customer.name} ({order.customer.phone})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback alert */}
        {feedback && (
          <div className={`p-3 rounded-xl border text-xs space-y-2 ${
            feedback.type === "success" 
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
              : feedback.type === "info"
              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300"
              : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300"
          }`}>
            <div>{feedback.text}</div>
            {feedback.manualUrl && (
              <a
                href={feedback.manualUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in WhatsApp Web / App</span>
              </a>
            )}
          </div>
        )}

        {/* Template Selector (8 Standard Templates) */}
        <div className="space-y-1.5 text-xs">
          <label className="block text-[10px] font-bold uppercase text-slate-500">
            Select Message Template (8 Professional Scenarios)
          </label>
          <select
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold outline-none"
          >
            {SPECIAL_MESSAGE_TEMPLATES.map((tmpl, idx) => (
              <option key={tmpl.id} value={tmpl.id}>
                {idx + 1}. {tmpl.name} — {tmpl.description}
              </option>
            ))}
          </select>
        </div>

        {/* Editable Message Textarea */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <label className="block text-[10px] font-bold uppercase text-slate-500">
              Personalized Message Text (Fully Editable)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono">
                {messageText.length} characters
              </span>
              <button
                type="button"
                onClick={copyMessage}
                className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-[10px]"
                title="Copy message"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
          <textarea
            rows={7}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-sans text-slate-900 dark:text-slate-100 outline-none leading-relaxed"
          />
        </div>

        {/* Live Preview Box */}
        <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40 rounded-xl text-xs space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-400">
            <span>Customer WhatsApp Bubble Preview</span>
            <span>Receiver: +{order.customer.phone.replace(/\D/g, "")}</span>
          </div>
          <p className="text-[11px] text-slate-700 dark:text-slate-300 italic whitespace-pre-wrap max-h-28 overflow-y-auto">
            {messageText}
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={isSending || !messageText.trim()}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-md transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSending ? "Sending Message..." : "Send via WhatsApp"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
