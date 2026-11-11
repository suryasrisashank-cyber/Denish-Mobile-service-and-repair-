import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  MessageCircle, 
  Smartphone, 
  User, 
  Phone, 
  HelpCircle, 
  Wrench,
  ArrowRight
} from 'lucide-react';
import { CORE_SERVICES, DEVICE_BRANDS, BUSINESS_INFO } from '../data/constants';
import { RepairOrder } from '../types';

interface BookingFormProps {
  initialValues?: {
    brand?: string;
    model?: string;
    serviceType?: string;
    estimatedPrice?: string;
  };
  onOrderCreated: (order: RepairOrder) => void;
  onTrackOrderClick: (phone: string) => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ 
  initialValues, 
  onOrderCreated,
  onTrackOrderClick 
}) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [brand, setBrand] = useState(initialValues?.brand || DEVICE_BRANDS[0].label);
  const [model, setModel] = useState(initialValues?.model || '');
  const [serviceType, setServiceType] = useState(initialValues?.serviceType || CORE_SERVICES[0].name);
  const [issueDescription, setIssueDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdOrder, setCreatedOrder] = useState<RepairOrder | null>(null);

  // Update when initialValues changes
  React.useEffect(() => {
    if (initialValues?.brand) setBrand(initialValues.brand);
    if (initialValues?.model) setModel(initialValues.model);
    if (initialValues?.serviceType) setServiceType(initialValues.serviceType);
  }, [initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!model.trim()) {
      setErrorMessage('Please enter your smartphone model name.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          phone: phone.trim(),
          brand: brand.trim(),
          model: model.trim(),
          serviceType: serviceType.trim(),
          issueDescription: issueDescription.trim() || undefined,
          estimatedPrice: initialValues?.estimatedPrice
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit booking');
      }

      setCreatedOrder(data.order);
      onOrderCreated(data.order);
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppMessageUrl = (order: RepairOrder) => {
    const text = 
`*NEW REPAIR BOOKING — DENISH MOBILE*
Service ID / Phone: *${order.serviceId}*
Customer Name: *${order.customerName}*
Device: *${order.brand} - ${order.model}*
Service Required: *${order.serviceType}*
Issue Symptoms: ${order.issueDescription}
Booking Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}

Hello Denish Workshop, I have submitted this repair booking on your website. Please inspect and confirm technician availability.`;
    return `https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <section id="book" className="py-20 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm relative overflow-hidden">
          
          {/* Header */}
          <div className="mb-8 text-center sm:text-left">
            <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
              Frictionless Device Intake
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
              Book a Workshop Repair
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Your mobile number acts as your official <strong>Service ID</strong>. Receive live updates, priority technician workbench queue, and 6-month spares warranty.
            </p>
          </div>

          {/* Success State */}
          {createdOrder ? (
            <div className="p-6 sm:p-8 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-6 animate-in fade-in duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Repair Request Successfully Booked!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    Your service record has been stored in our workshop system. You can track its status anytime using your phone number.
                  </p>
                </div>
              </div>

              {/* Service ID Card */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Your Official Service ID
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                    {createdOrder.serviceId}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {createdOrder.brand} {createdOrder.model} · {createdOrder.serviceType}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onTrackOrderClick(createdOrder.serviceId)}
                    className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    Track Status Now
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCreatedOrder(null);
                      setCustomerName('');
                      setPhone('');
                      setModel('');
                      setIssueDescription('');
                    }}
                    className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200"
                  >
                    Book Another
                  </button>
                </div>
              </div>

              {/* WhatsApp Handover Action */}
              <div className="p-4 rounded-xl bg-emerald-100/70 dark:bg-emerald-900/30 border border-emerald-300/80 dark:border-emerald-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Send Ticket to Technician on WhatsApp</span>
                </div>
                <p className="text-xs text-emerald-800 dark:text-emerald-300/90">
                  Click below to open WhatsApp with your booking details already pre-filled. This alerts our master engineer immediately.
                </p>
                <div className="pt-1">
                  <a
                    href={getWhatsAppMessageUrl(createdOrder)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Booking on WhatsApp Now</span>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Customer Name */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                {/* Customer Phone (Service ID) */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Mobile Number (Used as Service ID) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Brand */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Smartphone Brand *
                  </label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    {DEVICE_BRANDS.map((b) => (
                      <option key={b.id} value={b.label}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Model */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Device Model Name *
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="e.g. iPhone 14 Pro / Samsung S23"
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Service Type */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Required Service Category *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CORE_SERVICES.map((s) => {
                    const isSelected = serviceType === s.name;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setServiceType(s.name)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-800 dark:text-sky-300 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-bold truncate">{s.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{s.turnaroundTime}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Issue Description */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Specific Problem Symptoms (Optional)
                </label>
                <textarea
                  rows={3}
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="e.g. Screen flickering with green lines, battery drains from 50% to 0% suddenly, phone fell in water yesterday..."
                  className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  🔒 No advance payment required. Free initial workbench check.
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#101c2c] dark:bg-[#173b59] hover:bg-[#173b59] dark:hover:bg-[#1e4a6f] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span>{isSubmitting ? 'Registering Booking...' : 'Confirm Repair Booking'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </section>
  );
};
