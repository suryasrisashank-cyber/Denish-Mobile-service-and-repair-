// Admin Send Special WhatsApp Message to Customer (with Templates & Notification Logging)
// Endpoint: POST /api/admin/whatsapp/send-special-message

import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { 
  sendWhatsAppDirectMessage, 
  generateManualWhatsAppUrl, 
  SPECIAL_MESSAGE_TEMPLATES, 
  formatTemplate 
} from "@/lib/whatsapp";

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // Return standard available templates
  return NextResponse.json({
    success: true,
    data: {
      templates: SPECIAL_MESSAGE_TEMPLATES,
    },
  });
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      orderId,
      templateId,
      customMessage,
      customerPhone: inputPhone,
      customerName: inputName,
    } = body;

    const db = getDatabase();

    let targetPhone = inputPhone;
    let targetName = inputName;
    let trackingId = "N/A";
    let deviceModel = "Device";
    let serviceCostStr = "₹0";

    // If orderId provided, look up real order and customer data
    if (orderId) {
      const order = db.prepare(`
        SELECT 
          ro.id, ro.tracking_id, ro.device_brand, ro.device_model, ro.service_cost,
          cr.name as customer_name, cr.phone as customer_phone
        FROM repair_orders ro
        JOIN customer_records cr ON ro.customer_id = cr.id
        WHERE ro.id = ?
      `).get(orderId) as Record<string, unknown> | undefined;

      if (order) {
        targetPhone = targetPhone || String(order.customer_phone);
        targetName = targetName || String(order.customer_name);
        trackingId = String(order.tracking_id);
        deviceModel = `${order.device_brand} ${order.device_model}`;
        if (order.service_cost) {
          serviceCostStr = `₹${Number(order.service_cost).toLocaleString("en-IN")}`;
        }
      }
    }

    if (!targetPhone) {
      return NextResponse.json({ success: false, error: "Recipient phone number is required" }, { status: 400 });
    }

    let finalMessage = customMessage?.trim();

    // If templateId provided and customMessage not provided, format template
    if (templateId && !finalMessage) {
      const foundTemplate = SPECIAL_MESSAGE_TEMPLATES.find((t) => t.id === templateId);
      if (foundTemplate) {
        const host = request.headers.get("host") || "localhost:3000";
        const protocol = host.includes("localhost") ? "http" : "https";
        const trackingUrl = `${protocol}://${host}/track?id=${encodeURIComponent(trackingId)}`;

        finalMessage = formatTemplate(foundTemplate.template, {
          customerName: targetName,
          trackingId,
          deviceModel,
          trackingUrl,
          cost: serviceCostStr,
        });
      }
    }

    if (!finalMessage) {
      return NextResponse.json({ success: false, error: "Message content cannot be empty" }, { status: 400 });
    }

    // Try sending via Meta WhatsApp Cloud API
    const sendResult = await sendWhatsAppDirectMessage({
      toPhone: targetPhone,
      messageText: finalMessage,
      orderId: orderId ? Number(orderId) : undefined,
      templateName: templateId || "special_custom_message",
    });

    // Generate click-to-chat URL for instant staff fallback
    const manualWhatsAppUrl = generateManualWhatsAppUrl(templateId || "special_message", {
      orderId: orderId ? Number(orderId) : undefined,
      customerPhone: targetPhone,
      message: finalMessage,
    });

    // Record admin audit log
    db.prepare(`
      INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details, created_at)
      VALUES (?, 'SEND_SPECIAL_MESSAGE', 'customer_notifications', ?, ?, datetime('now'))
    `).run(
      admin.adminId,
      orderId ? String(orderId) : targetPhone,
      JSON.stringify({ templateId, phone: targetPhone, status: sendResult.success ? "SENT_CLOUD_API" : "FALLBACK_MANUAL" })
    );

    // Record admin notification for outbound message dispatch
    db.prepare(`
      INSERT INTO admin_notifications (
        type, title, message, order_id, tracking_id, customer_name, customer_phone, is_read, created_at
      ) VALUES (
        'OUTGOING_MESSAGE',
        'Customer Notification Dispatched',
        ?,
        ?,
        ?,
        ?,
        ?,
        0,
        datetime('now')
      )
    `).run(
      `Dispatched template '${templateId || "Custom"}' to ${targetName} (${targetPhone}).`,
      orderId ? Number(orderId) : null,
      trackingId || null,
      targetName || null,
      targetPhone
    );

    return NextResponse.json({
      success: true,
      data: {
        message: sendResult.success
          ? "Message sent successfully via Meta WhatsApp Cloud API."
          : (sendResult.mode === "unconfigured" 
              ? "Meta Cloud API not configured; click the WhatsApp link to send manually."
              : `Cloud API Error: ${sendResult.error}. Use manual WhatsApp link.`),
        cloudApiSuccess: sendResult.success,
        mode: sendResult.mode,
        providerMessageId: sendResult.messageId || null,
        manualWhatsAppUrl,
        finalMessage,
      },
    });
  } catch (err) {
    console.error("[ADMIN_SEND_SPECIAL_MESSAGE_ERROR]", err);
    return NextResponse.json({ success: false, error: "Failed to process message send" }, { status: 500 });
  }
}
