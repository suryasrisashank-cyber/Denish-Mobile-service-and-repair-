// DENISH MOBILE REPAIRING AND SERVICE
// Application Constants, Status Definitions, and Types

export type RepairStatus =
  | "NEW_REQUEST"
  | "RECEIVED"
  | "UNDER_INSPECTION"
  | "WAITING_FOR_APPROVAL"
  | "WAITING_FOR_PARTS"
  | "REPAIRING"
  | "QUALITY_CHECK"
  | "COMPLETED"
  | "READY_FOR_PICKUP"
  | "DELIVERED"
  | "CANCELLED";

export interface StatusMeta {
  code: RepairStatus;
  label: string;
  stepIndex: number; // 0-based for active progress
  customerDescription: string;
  badgeClass: string;
  dotColor: string;
}

export const REPAIR_STATUSES: Record<RepairStatus, StatusMeta> = {
  NEW_REQUEST: {
    code: "NEW_REQUEST",
    label: "Service Request Registered",
    stepIndex: 0,
    customerDescription: "Your repair request has been registered online and queued for technical intake at our Gandhinagar center.",
    badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
    dotColor: "bg-sky-500",
  },
  RECEIVED: {
    code: "RECEIVED",
    label: "Device Received at Center",
    stepIndex: 1,
    customerDescription: "Device safely logged into our Gandhinagar Technical Center custody with intake photography.",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    dotColor: "bg-blue-500",
  },
  UNDER_INSPECTION: {
    code: "UNDER_INSPECTION",
    label: "Under Technical Inspection",
    stepIndex: 2,
    customerDescription: "Hardware diagnostics, voltage draw measurement, and microscope component inspection in progress.",
    badgeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    dotColor: "bg-indigo-500",
  },
  WAITING_FOR_APPROVAL: {
    code: "WAITING_FOR_APPROVAL",
    label: "Awaiting Customer Approval",
    stepIndex: 3,
    customerDescription: "Diagnosis completed. Detailed technician report and repair scope shared with customer for confirmation.",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    dotColor: "bg-amber-500",
  },
  WAITING_FOR_PARTS: {
    code: "WAITING_FOR_PARTS",
    label: "Awaiting Genuine Spare Parts",
    stepIndex: 3,
    customerDescription: "Specific OEM-grade replacement display or micro-IC allocated from authorized component supply.",
    badgeClass: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30",
    dotColor: "bg-orange-500",
  },
  REPAIRING: {
    code: "REPAIRING",
    label: "Bench Repair in Progress",
    stepIndex: 4,
    customerDescription: "Active bench micro-soldering, adhesive bonding, or module replacement underway at ESD station.",
    badgeClass: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
    dotColor: "bg-cyan-500",
  },
  QUALITY_CHECK: {
    code: "QUALITY_CHECK",
    label: "Quality & Diagnostic Calibration",
    stepIndex: 5,
    customerDescription: "24-point display touch calibration, thermal dissipation test, and fast-charge stress testing.",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
    dotColor: "bg-purple-500",
  },
  COMPLETED: {
    code: "COMPLETED",
    label: "Repair Completed",
    stepIndex: 6,
    customerDescription: "All technical repairs verified. Protective packaging applied with tamper-evident security seal.",
    badgeClass: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30",
    dotColor: "bg-teal-500",
  },
  READY_FOR_PICKUP: {
    code: "READY_FOR_PICKUP",
    label: "Ready for Pickup at Center",
    stepIndex: 7,
    customerDescription: "Your smartphone is ready for collection at our Gandhinagar center during store hours (9 AM – 9 PM).",
    badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40",
    dotColor: "bg-emerald-500",
  },
  DELIVERED: {
    code: "DELIVERED",
    label: "Delivered to Customer",
    stepIndex: 8,
    customerDescription: "Device handed over to customer. Handover successfully completed.",
    badgeClass: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30",
    dotColor: "bg-slate-400",
  },
  CANCELLED: {
    code: "CANCELLED",
    label: "Service Cancelled",
    stepIndex: -1,
    customerDescription: "Work order closed. Please contact technician directly for equipment return.",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
    dotColor: "bg-rose-500",
  },
};

export const REPAIR_CATEGORIES = [
  "Screen Replacement",
  "Battery Replacement",
  "Charging Port / Problem",
  "Software Solutions",
  "Water Damage Repair",
  "IC / PCB Repair",
  "Speaker Replacement",
  "Camera Replacement",
  "Other Hardware Repair",
] as const;

export const POPULAR_BRANDS = [
  "Vivo",
  "Samsung",
  "Oppo",
  "Xiaomi",
  "Realme",
  "Apple",
  "Motorola",
  "Nothing",
  "OnePlus",
  "Google Pixel",
  "Other",
] as const;

export const DEVICE_BRANDS = POPULAR_BRANDS.map((name) => ({ name }));
export const REPAIR_SERVICES = REPAIR_CATEGORIES.map((title) => ({ id: title, title }));

export const SYSTEM_CONFIG = {
  storeName: "DENISH MOBILE REPAIRING AND SERVICE",
  tagline: "Your Mobile, Our Care.",
  location: "Gandhinagar, Gujarat",
  hours: "9:00 AM to 9:00 PM (Monday to Saturday)",
  days: "Monday to Saturday (6 Days)",
  phone: "8511668848",
  phoneDisplay: "+91 85116 •••••",
  phoneFull: "+918511668848",
  whatsappNumber: "918511668848",
  trackingPrefix: "DMR-",
  trackingRegex: /^(DMR-\d{6}-[A-Z0-9]{4,8}|DEN-[2-9A-HJ-NP-Z0-9]{6,16}(-[0-9A-Z]+)?)$/i,
};
