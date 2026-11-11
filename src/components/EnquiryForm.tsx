"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Send,
  MessageCircle,
  Phone,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Clock,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  Copy
} from "lucide-react";
import { BUSINESS_CONFIG, SERVICES_LIST, BRANDS } from "@/data/repairData";

interface EnquiryFormProps {
  initialIssue?: string;
  isStandalonePage?: boolean;
}

export default function EnquiryForm({ initialIssue = "", isStandalonePage = false }: EnquiryFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "Gandhinagar",
    deviceBrand: "",
    deviceModel: "",
    issue: initialIssue,
    description: "",
    appointmentDate: "",
    appointmentTime: "",
    preferredContact: "whatsapp",
    consent: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    trackingId?: string;
    referenceId?: string;
    trackingUrl?: string;
    directWhatsAppUrl?: string;
    message?: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    if (initialIssue) {
      setFormData((prev) => ({ ...prev, issue: initialIssue }));
    }
  }, [initialIssue]);

  useEffect(() => {
    const handleServiceSelect = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setFormData((prev) => ({ ...prev, issue: customEvent.detail }));
      }
    };
    window.addEventListener("select-repair-service", handleServiceSelect);
    return () => window.removeEventListener("select-repair-service", handleServiceSelect);
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = "Full name must be at least 2 characters.";
    }

    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      errs.phone = "Enter a valid 10-digit mobile number.";
    }

    if (!formData.deviceBrand) {
      errs.deviceBrand = "Please select your smartphone brand.";
    }

    if (!formData.deviceModel.trim()) {
      errs.deviceModel = "Please enter your device model (e.g. iPhone 13, Galaxy S22).";
    }

    if (!formData.issue) {
      errs.issue = "Please select the primary issue.";
    }

    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setSubmissionResult(null);

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setSubmissionResult({
          success: false,
          error: data.error || "Submission failed. Please tap Call Now directly.",
        });
      } else {
        const id = data.trackingId || data.referenceId;
        setSubmissionResult({
          success: true,
          trackingId: id,
          referenceId: id,
          trackingUrl: data.trackingUrl || `/track?id=${id}`,
          directWhatsAppUrl: data.whatsAppUrl || data.directWhatsAppUrl,
          message: data.message,
        });
      }
    } catch {
      setSubmissionResult({
        success: false,
        error: "Network error occurred. Please tap Call Now to connect directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      phone: "",
      location: "Gandhinagar",
      deviceBrand: "",
      deviceModel: "",
      issue: "",
      description: "",
      appointmentDate: "",
      appointmentTime: "",
      preferredContact: "whatsapp",
      consent: true,
    });
    setErrors({});
    setSubmissionResult(null);
  };

  return (
    <section id="enquiry-section" className={`relative overflow-hidden ${isStandalonePage ? "py-12" : "py-16 lg:py-24 bg-surface"}`}>
      <div id="enquiry" className="relative -top-28" />

      {/* Real High-Resolution Workbench Photographic Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/repair-workbench.jpg"
          alt="Professional electronics workbench with technician repairing opened smartphone"
          fill
          priority={false}
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Obsidian Atelier dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-surface-canvas/92 via-surface/85 to-surface-canvas/92" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-white/10 text-primary text-xs font-semibold uppercase tracking-wider font-mono">
            <Wrench className="w-3.5 h-3.5 text-primary" />
            <span>Diagnostic &amp; Repair Portal</span>
          </div>
          <h2 className="font-headline-lg text-2xl sm:text-4xl font-extrabold text-on-surface uppercase tracking-tight">
            Book a Diagnostic or <span className="text-primary">Request an Estimate</span>
          </h2>
          <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
            Provide your phone details and symptoms below. We review requests and connect directly to discuss parts, feasibility, and costs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Direct Contact & Guidelines (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-2xl p-6 sm:p-7 bg-surface-container/90 backdrop-blur-xl border border-white/10 space-y-5 shadow-2xl">
              <div>
                <span className="font-label-badge text-xs uppercase tracking-wider text-primary font-mono font-bold">
                  Direct Channels
                </span>
                <h3 className="font-title-md text-lg font-bold text-on-surface mt-1">
                  Connect With Our Workshop
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
                  Prefer direct assistance? Reach out to speak directly with our technician.
                </p>
              </div>

              {/* Phone Card */}
              <a
                href={BUSINESS_CONFIG.phoneTel}
                className="flex items-center gap-3.5 p-3.5 rounded-xl bg-surface-container-lowest border border-white/10 hover:border-primary/50 transition-all group shadow-sm"
              >
                <div className="w-10 h-10 rounded-lg bg-surface-container-high border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-label-badge text-[10px] text-on-surface-variant uppercase font-mono block">
                    Helpline
                  </span>
                  <span className="text-sm font-bold font-mono text-on-surface group-hover:text-primary transition-colors">
                    Call Now
                  </span>
                </div>
              </a>

              {/* WhatsApp Card */}
              <a
                href={BUSINESS_CONFIG.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 p-3.5 rounded-xl bg-surface-container-lowest border border-white/10 hover:border-emerald-500/50 transition-all group shadow-sm"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-label-badge text-[10px] text-on-surface-variant uppercase font-mono block">
                    Chat on WhatsApp
                  </span>
                  <span className="text-sm font-bold font-mono text-on-surface group-hover:text-emerald-400 transition-colors">
                    Message Workshop
                  </span>
                </div>
              </a>

              {/* Guidelines */}
              <div className="pt-3 border-t border-white/5 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-on-surface">
                  <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Transparent Diagnostic Discussion</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface">
                  <Clock className="w-3.5 h-3.5 text-secondary shrink-0" />
                  <span>Quality Tested Replacement Components</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary-fixed shrink-0" />
                  <span>Data Confidentiality Respected</span>
                </div>
              </div>

              {/* Process Note */}
              <div className="p-3 rounded-lg bg-surface-container-lowest border border-white/5 text-[11px] text-on-surface-variant leading-relaxed">
                <strong>Appointment Note:</strong> Submitting an online enquiry registers your repair request and generates a Reference ID. Our team confirms part availability and scheduling directly with you before final confirmation.
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl p-6 sm:p-8 bg-surface-container/90 backdrop-blur-2xl border border-white/10 shadow-2xl relative">
              
              {/* Submission Result Success State */}
              {submissionResult?.success ? (
                <div className="space-y-5 text-center py-6 animate-in fade-in duration-300">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 shadow-lg">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <span className="font-label-badge text-xs uppercase tracking-wider text-emerald-400 font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      Service Request Registered
                    </span>
                    <h3 className="font-headline-sm text-xl sm:text-2xl font-bold text-on-surface">
                      Thank You, {formData.name}!
                    </h3>
                    <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto">
                      Your service request has been permanently saved to our database. Your unique Service Tracking ID is:
                    </p>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <div className="inline-block px-5 py-2.5 rounded-xl bg-surface-container-lowest border border-primary/40 text-primary font-mono font-black text-xl sm:text-2xl shadow-sm tracking-wider">
                        {submissionResult.trackingId || submissionResult.referenceId}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const id = submissionResult.trackingId || submissionResult.referenceId || "";
                          navigator.clipboard.writeText(id);
                          setCopiedId(true);
                          setTimeout(() => setCopiedId(false), 2000);
                        }}
                        className="p-2.5 rounded-xl bg-surface-container-high border border-white/10 hover:border-primary text-on-surface transition"
                        title="Copy Tracking ID"
                        aria-label="Copy Tracking ID"
                      >
                        {copiedId ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-on-surface-variant max-w-md mx-auto leading-relaxed">
                    Our technical workshop has logged your intake. You can track its live progress or message our technician directly on WhatsApp:
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    {submissionResult.directWhatsAppUrl && (
                      <a
                        href={submissionResult.directWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-whatsapp w-full sm:w-auto px-5 py-3 text-xs sm:text-sm font-bold shadow-md flex items-center justify-center"
                      >
                        <MessageCircle className="w-4 h-4 mr-1.5" />
                        <span>Send Details on WhatsApp</span>
                      </a>
                    )}

                    <a
                      href={`/track?id=${encodeURIComponent(submissionResult.trackingId || submissionResult.referenceId || "")}`}
                      className="btn-gold w-full sm:w-auto px-5 py-3 text-xs sm:text-sm font-bold shadow-md flex items-center justify-center"
                    >
                      <Wrench className="w-4 h-4 mr-1.5" />
                      <span>Track Live Status</span>
                    </a>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors p-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Submit another device request</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* The Enquiry Form */
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  
                  {submissionResult?.error && (
                    <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{submissionResult.error}</span>
                    </div>
                  )}

                  {/* Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label htmlFor="customerName" className="font-label-badge text-[10px] text-on-surface-variant uppercase font-semibold">
                        Your Full Name <span className="text-primary">*</span>
                      </label>
                      <input
                        id="customerName"
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (errors.name) setErrors({ ...errors, name: "" });
                        }}
                        placeholder="Enter your full name"
                        className={`w-full h-11 px-3.5 rounded-lg bg-surface-container-lowest border text-on-surface placeholder:text-outline text-xs sm:text-sm focus:outline-none transition-colors ${
                          errors.name ? "border-red-500 ring-1 ring-red-500" : "border-white/10 focus:border-primary"
                        }`}
                      />
                      {errors.name && <p className="text-[10px] text-red-400">{errors.name}</p>}
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="customerPhone" className="font-label-badge text-[10px] text-on-surface-variant uppercase font-semibold">
                        Mobile Number <span className="text-primary">*</span>
                      </label>
                      <input
                        id="customerPhone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value });
                          if (errors.phone) setErrors({ ...errors, phone: "" });
                        }}
                        placeholder="10-digit mobile number"
                        className={`w-full h-11 px-3.5 rounded-lg bg-surface-container-lowest border text-on-surface placeholder:text-outline text-xs sm:text-sm focus:outline-none transition-colors font-mono ${
                          errors.phone ? "border-red-500 ring-1 ring-red-500" : "border-white/10 focus:border-primary"
                        }`}
                      />
                      {errors.phone && <p className="text-[10px] text-red-400">{errors.phone}</p>}
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="customerLocation" className="font-label-badge text-[10px] text-on-surface-variant uppercase font-semibold">
                        Customer Location (Area / City / Address)
                      </label>
                      <input
                        id="customerLocation"
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g. Sector 7, Gandhinagar"
                        className="w-full h-11 px-3.5 rounded-lg bg-surface-container-lowest border border-white/10 focus:border-primary text-on-surface placeholder:text-outline text-xs sm:text-sm focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Brand & Model */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label htmlFor="deviceBrand" className="font-label-badge text-[10px] text-on-surface-variant uppercase font-semibold">
                        Device Brand <span className="text-primary">*</span>
                      </label>
                      <select
                        id="deviceBrand"
                        value={formData.deviceBrand}
                        onChange={(e) => {
                          setFormData({ ...formData, deviceBrand: e.target.value });
                          if (errors.deviceBrand) setErrors({ ...errors, deviceBrand: "" });
                        }}
                        className={`w-full h-11 px-3.5 rounded-lg bg-surface-container-lowest border text-on-surface text-xs sm:text-sm focus:outline-none transition-colors ${
                          errors.deviceBrand ? "border-red-500 ring-1 ring-red-500" : "border-white/10 focus:border-primary"
                        }`}
                      >
                        <option value="">Select Brand</option>
                        {BRANDS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                        <option value="Other">Other Brand</option>
                      </select>
                      {errors.deviceBrand && <p className="text-[10px] text-red-400">{errors.deviceBrand}</p>}
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="deviceModel" className="font-label-badge text-[10px] text-on-surface-variant uppercase font-semibold">
                        Device Model <span className="text-primary">*</span>
                      </label>
                      <input
                        id="deviceModel"
                        type="text"
                        value={formData.deviceModel}
                        onChange={(e) => {
                          setFormData({ ...formData, deviceModel: e.target.value });
                          if (errors.deviceModel) setErrors({ ...errors, deviceModel: "" });
                        }}
                        placeholder="e.g. iPhone 13, Note 10"
                        className={`w-full h-11 px-3.5 rounded-lg bg-surface-container-lowest border text-on-surface placeholder:text-outline text-xs sm:text-sm focus:outline-none transition-colors ${
                          errors.deviceModel ? "border-red-500 ring-1 ring-red-500" : "border-white/10 focus:border-primary"
                        }`}
                      />
                      {errors.deviceModel && <p className="text-[10px] text-red-400">{errors.deviceModel}</p>}
                    </div>
                  </div>

                  {/* Primary Issue */}
                  <div className="space-y-1">
                    <label htmlFor="repairIssue" className="font-label-badge text-[10px] text-on-surface-variant uppercase font-semibold">
                      Primary Repair Issue <span className="text-primary">*</span>
                    </label>
                    <select
                      id="repairIssue"
                      value={formData.issue}
                      onChange={(e) => {
                        setFormData({ ...formData, issue: e.target.value });
                        if (errors.issue) setErrors({ ...errors, issue: "" });
                      }}
                      className={`w-full h-11 px-3.5 rounded-lg bg-surface-container-lowest border text-on-surface text-xs sm:text-sm focus:outline-none transition-colors ${
                        errors.issue ? "border-red-500 ring-1 ring-red-500" : "border-white/10 focus:border-primary"
                      }`}
                    >
                      <option value="">Select Service Needed</option>
                      {SERVICES_LIST.map((s) => (
                        <option key={s.id} value={s.title}>
                          {s.title}
                        </option>
                      ))}
                      <option value="Other Hardware/Software Fault">Other Hardware/Software Fault</option>
                    </select>
                    {errors.issue && <p className="text-[10px] text-red-400">{errors.issue}</p>}
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="font-label-badge text-[10px] text-on-surface-variant uppercase font-semibold">
                      Describe the Symptoms (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="e.g. Phone fell down, display is black but phone vibrates on call..."
                      className="w-full p-3 rounded-lg bg-surface-container-lowest border border-white/10 text-on-surface placeholder:text-outline text-xs sm:text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                    />
                  </div>

                  {/* Preferred Appointment Date & Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="font-label-badge text-[10px] text-on-surface-variant uppercase font-semibold">
                        Preferred Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={formData.appointmentDate}
                        onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-lg bg-surface-container-lowest border border-white/10 text-on-surface text-xs sm:text-sm focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-label-badge text-[10px] text-on-surface-variant uppercase font-semibold">
                        Preferred Time Slot (Optional)
                      </label>
                      <select
                        value={formData.appointmentTime}
                        onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-lg bg-surface-container-lowest border border-white/10 text-on-surface text-xs sm:text-sm focus:outline-none focus:border-primary transition-colors"
                      >
                        <option value="">Select Time Window</option>
                        <option value="Morning (9:00 AM - 1:00 PM)">Morning (9:00 AM - 1:00 PM)</option>
                        <option value="Afternoon (1:00 PM - 5:00 PM)">Afternoon (1:00 PM - 5:00 PM)</option>
                        <option value="Evening (5:00 PM - 8:30 PM)">Evening (5:00 PM - 8:30 PM)</option>
                      </select>
                    </div>
                  </div>

                  {/* Customer Notice & Consent */}
                  <div className="p-3 rounded-lg bg-surface-container-lowest border border-white/5 space-y-1">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.consent}
                        onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                        className="mt-0.5 rounded border-white/20 text-primary focus:ring-primary"
                      />
                      <span className="text-[11px] text-on-surface-variant leading-tight">
                        I consent to store my repair details and receive service tracking updates. No passwords or device PINs are collected.
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-gold w-full h-12 text-sm font-bold shadow-lg disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? "Registering Service Ticket..." : "Register Service Request"}</span>
                  </button>

                  <p className="text-[10px] text-on-surface-variant text-center pt-1">
                    * Submitting this form sends an enquiry to our workshop team. We will review and connect to discuss options.
                  </p>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
