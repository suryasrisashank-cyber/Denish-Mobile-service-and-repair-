// DENISH MOBILE REPAIRING AND SERVICE
// WhatsApp Integration Service (Mode A: Click-to-Chat & Mode B: Meta Cloud API)

import crypto from "crypto";
import { SYSTEM_CONFIG, REPAIR_STATUSES, RepairStatus } from "./constants";
import { getDatabase } from "./db";

export interface NotificationPayload {
  orderId?: number;
  customerName: string;
  customerPhone: string;
  trackingId: string;
  deviceModel: string;
  status: RepairStatus;
  customNote?: string;
  baseUrl?: string;
}

export type NotificationType = "REGISTERED" | "STATUS_UPDATE" | "COMPLETED" | "READY_FOR_PICKUP";

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

/**
 * Sanitizes phone number to international format without plus or spaces (e.g. 918511668848)
 */
export function sanitizePhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

/**
 * Verifies the HMAC-SHA256 signature from Meta webhook requests
 */
export function verifyWhatsAppWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): { valid: boolean; reason?: string } {
  const appSecret = process.env.WHATSAPP_APP_SECRET;

  if (!appSecret) {
    return { valid: true, reason: "WHATSAPP_APP_SECRET not configured in environment." };
  }

  if (!signatureHeader) {
    return { valid: false, reason: "Missing x-hub-signature-256 header." };
  }

  const parts = signatureHeader.split("=");
  const sig = parts.length === 2 && parts[0] === "sha256" ? parts[1] : null;
  if (!sig) {
    return { valid: false, reason: "Malformed x-hub-signature-256 header." };
  }

  try {
    const expectedSig = crypto.createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");
    if (sig.length !== expectedSig.length) {
      return { valid: false, reason: "Signature length mismatch." };
    }
    const valid = crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expectedSig, "hex"));
    return { valid, reason: valid ? undefined : "Signature mismatch." };
  } catch {
    return { valid: false, reason: "Error computing signature comparison." };
  }
}

/**
 * Generates the standardized message text for a customer notification
 */
export function buildNotificationMessage(
  type: NotificationType,
  data: NotificationPayload
): string {
  const statusMeta = REPAIR_STATUSES[data.status] || REPAIR_STATUSES.RECEIVED;
  const baseUrl = data.baseUrl || "http://localhost:3000";
  const trackingUrl = `${baseUrl}/track?id=${encodeURIComponent(data.trackingId)}`;

  switch (type) {
    case "REGISTERED":
      return (
        `Hello ${data.customerName},

Your mobile repair service has been registered with ${SYSTEM_CONFIG.storeName}.

Tracking ID: ${data.trackingId}
Device: ${data.deviceModel}
Status: ${statusMeta.label}

Track your service:
${trackingUrl}

Thank you for choosing DENISH.`
      );

    case "READY_FOR_PICKUP":
      return (
        `Hello ${data.customerName},

Great news! Your ${data.deviceModel} is READY FOR PICKUP at ${SYSTEM_CONFIG.storeName}.

Tracking ID: ${data.trackingId}
Status: ${statusMeta.label}
${data.customNote ? `Note: ${data.customNote}\n` : ""}
Store Timings: ${SYSTEM_CONFIG.hours}
Location: ${SYSTEM_CONFIG.location}

View complete test report:
${trackingUrl}

Thank you for trusting DENISH.`
      );

    case "COMPLETED":
      return (
        `Hello ${data.customerName},

The repair on your ${data.deviceModel} has been COMPLETED successfully.

Tracking ID: ${data.trackingId}
Status: ${statusMeta.label}
${data.customNote ? `Note: ${data.customNote}\n` : ""}
Track service:
${trackingUrl}

Thank you for choosing DENISH.`
      );

    case "STATUS_UPDATE":
    default:
      return (
        `Hello ${data.customerName},

Update regarding your ${data.deviceModel} at ${SYSTEM_CONFIG.storeName}:

Tracking ID: ${data.trackingId}
Current Status: ${statusMeta.label}
${data.customNote ? `Technician Update: ${data.customNote}\n` : ""}
Track latest progress:
${trackingUrl}

Thank you for choosing DENISH.`
      );
  }
}

/**
 * MODE A: Generates prefilled WhatsApp click-to-chat URL (Client / Browser Redirect)
 * Note: Merely opening/generating a wa.me URL does NOT constitute a sent message.
 */
export function generateManualWhatsAppUrl(
  type: NotificationType | string,
  data: NotificationPayload | { customerPhone: string; message?: string }
): string {
  const cleanPhone = sanitizePhoneNumber(data.customerPhone);
  let message = "";
  if ("message" in data && data.message) {
    message = data.message;
  } else {
    message = buildNotificationMessage(type as NotificationType, data as NotificationPayload);
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * MODE B: Official WhatsApp Business Cloud API Integration
 */
export async function sendCloudApiWhatsApp(
  type: NotificationType,
  data: NotificationPayload
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  const cleanPhone = sanitizePhoneNumber(data.customerPhone);
  const messageBody = buildNotificationMessage(type, data);

  if (!token || !phoneId) {
    return {
      success: false,
      error: "WhatsApp Cloud API credentials not configured (WHATSAPP_API_TOKEN / WHATSAPP_PHONE_NUMBER_ID missing). Use Mode A (Manual WhatsApp).",
    };
  }

  try {
    const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhone,
        type: "text",
        text: {
          preview_url: true,
          body: messageBody,
        },
      }),
    });

    const result = await response.json();

    const db = getDatabase();
    if (response.ok && result.messages?.[0]?.id) {
      const messageId = result.messages[0].id;
      await db.prepare(`
        INSERT INTO customer_notifications (
          order_id, channel, recipient_phone, message_template, message_body, provider_message_id, status, created_at
        ) VALUES (?, 'whatsapp', ?, ?, ?, ?, 'sent', datetime('now'))
      `).run(data.orderId || null, cleanPhone, type, messageBody, messageId);

      return { success: true, messageId };
    } else {
      const errorMsg = result.error?.message || "Cloud API returned unsuccessful response";
      await db.prepare(`
        INSERT INTO customer_notifications (
          order_id, channel, recipient_phone, message_template, message_body, status, error_details, created_at
        ) VALUES (?, 'whatsapp', ?, ?, ?, 'failed', ?, datetime('now'))
      `).run(data.orderId || null, cleanPhone, type, messageBody, errorMsg);

      return { success: false, error: errorMsg };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Network error calling Meta API";
    return { success: false, error: errorMsg };
  }
}

/**
 * Direct custom WhatsApp message via Meta Cloud API with fallback detection
 */
export async function sendWhatsAppDirectMessage(params: {
  toPhone: string;
  messageText: string;
  orderId?: number;
  templateName?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string; mode: "cloud_api" | "unconfigured" }> {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const cleanPhone = sanitizePhoneNumber(params.toPhone);

  if (!token || !phoneId) {
    return {
      success: false,
      mode: "unconfigured",
      error: "WhatsApp Cloud API credentials not configured (WHATSAPP_API_TOKEN / WHATSAPP_PHONE_NUMBER_ID missing).",
    };
  }

  try {
    const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhone,
        type: "text",
        text: {
          preview_url: true,
          body: params.messageText,
        },
      }),
    });

    const result = await res.json();
    const db = getDatabase();

    if (res.ok && result.messages?.[0]?.id) {
      const messageId = result.messages[0].id;
      await db.prepare(`
        INSERT INTO customer_notifications (
          order_id, channel, recipient_phone, message_template, message_body, provider_message_id, status, created_at
        ) VALUES (?, 'whatsapp', ?, ?, ?, ?, 'sent', datetime('now'))
      `).run(params.orderId || null, cleanPhone, params.templateName || "custom_message", params.messageText, messageId);

      return { success: true, messageId, mode: "cloud_api" };
    } else {
      const errorMsg = result.error?.message || "Cloud API returned unsuccessful response";
      await db.prepare(`
        INSERT INTO customer_notifications (
          order_id, channel, recipient_phone, message_template, message_body, status, error_details, created_at
        ) VALUES (?, 'whatsapp', ?, ?, ?, 'failed', ?, datetime('now'))
      `).run(params.orderId || null, cleanPhone, params.templateName || "custom_message", params.messageText, errorMsg);

      return { success: false, error: errorMsg, mode: "cloud_api" };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Network error calling Meta API";
    return { success: false, error: errorMsg, mode: "cloud_api" };
  }
}
