"use client";

import React, { useState } from "react";
import { Phone, MessageCircle, MapPin, Clock, Info, CheckCircle, AlertCircle, Send } from "lucide-react";
import { BUSINESS_CONFIG } from "@/data/repairData";

export default function LocationMap() {
  const [callbackData, setCallbackData] = useState({ name: "", phone: "", issue: "" });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; refId?: string; msg?: string } | null>(null);

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackData.name || callbackData.phone.replace(/\D/g, "").length < 10) {
      setResult({ success: false, msg: "Please enter your name and a valid 10-digit phone number." });
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/enquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: callbackData.name,
          phone: callbackData.phone,
          deviceBrand: "Not Specified",
          deviceModel: "Callback Request",
          issue: callbackData.issue || "General Repair Enquiry",
          description: "Priority callback requested via Contact section.",
          preferredContact: "phone",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResult({
          success: true,
          refId: data.referenceId,
          msg: "Callback request registered! We will reach out shortly.",
        });
        setCallbackData({ name: "", phone: "", issue: "" });
      } else {
        setResult({
          success: false,
          msg: data.error || "Unable to submit callback right now. Please call us directly.",
        });
      }
    } catch {
      setResult({
        success: false,
        msg: "Network issue. Please tap Call Now for direct support.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-14 sm:py-20 bg-[var(--bg-page)]/80 backdrop-blur-xs border-y border-[var(--border-color)]/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#126FE5]/10 text-[#126FE5] text-xs font-bold uppercase tracking-wider mb-2">
            <span>Direct Support</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
            Get in Touch
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)] mt-2 font-medium">
            Speak directly to our technician. Call our hotline or message us on WhatsApp with your phone model.
          </p>
        </div>

        {/* Two-Column Clean Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Phone Support & Callback Form (6 cols) */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-xl bg-[var(--bg-card)]/95 backdrop-blur-md border border-[var(--border-color)] flex flex-col justify-between gap-6 shadow-sm">
            <div>
              <div className="w-12 h-12 rounded-lg bg-[#126FE5]/10 text-[#126FE5] flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-[#126FE5]" />
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-[#126FE5] block">
                Technician Helpline
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mt-1">
                Direct Contact Desk
              </h3>
              <a
                href={`tel:+91${BUSINESS_CONFIG.phoneRaw}`}
                className="text-2xl sm:text-3xl font-black text-[#126FE5] hover:underline block mt-2 tracking-tight"
              >
                Contact Shop (Call Now)
              </a>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2 leading-relaxed font-medium">
                Speak directly with Denish regarding screen damages, battery renewal, or moisture-damaged electronics. We assess your issue upfront and discuss practical fixes.
              </p>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`tel:+91${BUSINESS_CONFIG.phoneRaw}`}
                className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-lg bg-[#126FE5] hover:bg-[#0F5EBE] text-white text-sm font-bold transition-colors shadow-xs"
              >
                <Phone className="w-4 h-4" />
                <span>Call Now</span>
              </a>
              <a
                href={BUSINESS_CONFIG.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-lg bg-[#25D366] hover:bg-[#20BD5A] text-white text-sm font-bold transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            {/* Quick Callback Request */}
            <div className="pt-4 border-t border-[var(--border-color)]">
              <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider block mb-3">
                Request a Priority Callback
              </span>

              {result && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-start gap-2 mb-3 ${
                    result.success
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      : "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
                  }`}
                >
                  {result.success ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                  <div>
                    <p className="font-semibold">{result.msg}</p>
                    {result.refId && <p className="font-mono mt-0.5">Ref ID: <strong>{result.refId}</strong></p>}
                  </div>
                </div>
              )}

              <form onSubmit={handleCallbackSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="callbackName" className="sr-only">Your Name</label>
                    <input
                      id="callbackName"
                      name="callbackName"
                      type="text"
                      required
                      placeholder="Your Name"
                      value={callbackData.name}
                      onChange={(e) => setCallbackData({ ...callbackData, name: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg bg-[var(--bg-page)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-medium placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#126FE5]"
                    />
                  </div>
                  <div>
                    <label htmlFor="callbackPhone" className="sr-only">Phone Number</label>
                    <input
                      id="callbackPhone"
                      name="callbackPhone"
                      type="tel"
                      required
                      placeholder="Phone Number (10 digits)"
                      value={callbackData.phone}
                      onChange={(e) => setCallbackData({ ...callbackData, phone: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg bg-[var(--bg-page)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-medium placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#126FE5]"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="callbackIssue" className="sr-only">Device model or repair issue</label>
                  <input
                    id="callbackIssue"
                    name="callbackIssue"
                    type="text"
                    placeholder="Device model / repair issue (optional)"
                    value={callbackData.issue}
                    onChange={(e) => setCallbackData({ ...callbackData, issue: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-[var(--bg-page)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-medium placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#126FE5]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-10 rounded-lg bg-[#126FE5] hover:bg-[#0F5EBE] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? "Sending..." : "Submit Callback Request"}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Service Region & Location Advisory (6 cols) */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-xl bg-[var(--bg-card)]/95 backdrop-blur-md border border-[var(--border-color)] flex flex-col justify-between gap-6 shadow-sm">
            <div>
              <div className="w-12 h-12 rounded-lg bg-[#126FE5]/10 text-[#126FE5] flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-[#126FE5]" />
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-[#126FE5] block">
                Service Hub
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mt-1">
                Gandhinagar, Gujarat
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2 leading-relaxed font-medium">
                Serving smartphone users across Gandhinagar and surrounding areas with reliable component repair and micro-soldering.
              </p>

              {/* Location Advisory Box (Pending Client Confirmation) */}
              <div className="mt-5 p-4 rounded-lg bg-[#126FE5]/5 border border-[#126FE5]/20 text-xs text-[var(--text-muted)] space-y-1.5 font-medium">
                <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
                  <Info className="w-4 h-4 text-[#126FE5] shrink-0" />
                  <span>Location Advisory</span>
                </div>
                <p className="leading-relaxed">
                  Shop Location: Gandhinagar. Full shop address pending client confirmation. Visit by appointment or call before arriving.
                </p>
              </div>

              {/* Wait Prevention Notice */}
              <div className="mt-4 flex items-start gap-2 text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                <Clock className="w-4 h-4 text-[#126FE5] shrink-0 mt-0.5" />
                <span>To prevent waiting, please tap Call Now prior to heading over so we can confirm bench availability.</span>
              </div>
            </div>

            {/* Hub Badge */}
            <div className="p-4 rounded-lg bg-[var(--bg-page)] border border-[var(--border-color)] flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-[#126FE5]/10 text-[#126FE5] flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-[#126FE5]" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[var(--text-primary)] block">Gandhinagar Repair Desk</span>
                  <span className="text-[11px] text-[var(--text-muted)] font-medium">Hardware Service Node</span>
                </div>
              </div>
              <a
                href={`tel:+91${BUSINESS_CONFIG.phoneRaw}`}
                className="text-xs font-bold text-[#126FE5] hover:underline"
              >
                Call First →
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
