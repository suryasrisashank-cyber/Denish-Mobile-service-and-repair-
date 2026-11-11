// Client-safe WhatsApp Templates and Formatting Utilities
// (Zero Node.js 'fs' or 'better-sqlite3' dependencies)

import { SYSTEM_CONFIG } from "./constants";

export interface SpecialTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
}

export const SPECIAL_MESSAGE_TEMPLATES: SpecialTemplate[] = [
  {
    id: "intake_ack",
    name: "Intake Acknowledgment",
    description: "Confirm device received at service center with tracking details",
    template: `Hello {customerName},

Your device {deviceModel} has been received at DENISH MOBILE REPAIRING AND SERVICE.

Tracking ID: {trackingId}
Live Tracking: {trackingUrl}

Our certified technician will inspect it shortly. For questions, call {storePhone}.

Thank you for trusting DENISH!`,
  },
  {
    id: "inspection_started",
    name: "Inspection Started",
    description: "Inform customer diagnostic testing is underway",
    template: `Hello {customerName},

Technician inspection has begun for your {deviceModel}.

Tracking ID: {trackingId}
Current Status: Under Inspection
{notes}

We will provide an update once testing completes.
Track live: {trackingUrl}`,
  },
  {
    id: "repair_in_progress",
    name: "Repair In Progress",
    description: "Update on hardware/software repair progression",
    template: `Hello {customerName},

Your {deviceModel} is currently being repaired by our specialist.

Tracking ID: {trackingId}
Status: Repairing
{notes}

We ensure thorough testing before handover.
Track live: {trackingUrl}`,
  },
  {
    id: "waiting_for_parts",
    name: "Waiting for Parts",
    description: "Inform customer genuine OEM spare part is in transit",
    template: `Hello {customerName},

Update regarding your {deviceModel} (Tracking ID: {trackingId}):

We have ordered 100% genuine replacement components for your repair. As soon as the parts arrive and pass inspection, work will resume immediately.
{notes}

Thank you for your patience! Track progress: {trackingUrl}`,
  },
  {
    id: "ready_for_pickup",
    name: "Ready for Pickup",
    description: "Device successfully tested and ready for collection",
    template: `Hello {customerName},

Great news! Your {deviceModel} is ready for pickup at DENISH MOBILE REPAIRING.

Tracking ID: {trackingId}
Total Amount: {cost}
Service Center: DENISH MOBILE REPAIRING, Gandhinagar
Shop Timings: 9:00 AM – 9:00 PM (Monday to Saturday)
{notes}

Please show your tracking ID when collecting: {trackingUrl}`,
  },
  {
    id: "payment_reminder",
    name: "Payment Reminder / Invoice Ready",
    description: "Share service cost and bill details with customer",
    template: `Hello {customerName},

Here is the billing summary for your {deviceModel} service at DENISH MOBILE:

Tracking ID: {trackingId}
Total Service Amount: {cost}
Payment Options: UPI, Cash, Cards

View full service summary: {trackingUrl}
Thank you for choosing DENISH!`,
  },
  {
    id: "delivery_completed",
    name: "Delivery Completed",
    description: "Confirm device handover and express gratitude",
    template: `Hello {customerName},

Your {deviceModel} has been delivered successfully.

Tracking ID: {trackingId}
Device Handover: Completed

Thank you for choosing DENISH MOBILE REPAIRING AND SERVICE! If you enjoyed our service, please recommend us to your friends and family.`,
  },
  {
    id: "warranty_care",
    name: "Warranty and Device Care Advice",
    description: "Helpful maintenance advice and warranty guidelines",
    template: `Hello {customerName},

Quick care tips for your newly repaired {deviceModel}:

1. Avoid extreme heat and moisture.
2. Use a quality surge-protected charger.
3. Don't apply excessive screen pressure during initial curing.

Your repair has been completed by DENISH technical workshop. View details: {trackingUrl}
Store Contact: {storePhone}`,
  },
];

export function formatTemplate(
  templateStr: string,
  data: {
    customerName?: string;
    trackingId?: string;
    deviceModel?: string;
    trackingUrl?: string;
    storeName?: string;
    storePhone?: string;
    cost?: string;
    notes?: string;
  }
): string {
  return templateStr
    .replace(/{customerName}/g, data.customerName || "Valued Customer")
    .replace(/{trackingId}/g, data.trackingId || "N/A")
    .replace(/{deviceModel}/g, data.deviceModel || "Mobile Device")
    .replace(/{trackingUrl}/g, data.trackingUrl || "http://localhost:3000/track")
    .replace(/{storeName}/g, data.storeName || SYSTEM_CONFIG.storeName)
    .replace(/{storePhone}/g, data.storePhone || SYSTEM_CONFIG.phone)
    .replace(/{cost}/g, data.cost || "₹0")
    .replace(/{notes}/g, data.notes ? `Note: ${data.notes}\n` : "");
}

export function sanitizePhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

