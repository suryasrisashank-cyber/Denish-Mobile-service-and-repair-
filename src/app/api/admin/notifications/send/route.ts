// Admin Notification Dispatch API
// Endpoint: /api/admin/notifications/send

import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { sendCloudApiWhatsApp, generateManualWhatsAppUrl, NotificationType } from "@/lib/whatsapp";
import { RepairStatus } from "@/lib/constants";

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { orderId, mode = "manual", type = "STATUS_UPDATE", customNote } = body;

    const db = getDatabase();
    const order = (await db.prepare(`
      SELECT ro.*, cr.name as customer_name, cr.phone as customer_phone
      FROM repair_orders ro
      JOIN customer_records cr ON ro.customer_id = cr.id
      WHERE ro.id = ?
    `).get(orderId)) as Record<string, unknown> | undefined;

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    const notificationPayload = {
      orderId: Number(order.id),
      customerName: String(order.customer_name),
      customerPhone: String(order.phone || order.customer_phone),
      trackingId: String(order.tracking_id),
      deviceModel: `${order.device_brand} ${order.device_model}`,
      status: order.current_status as RepairStatus,
      customNote: customNote || undefined,
      baseUrl,
    };

    if (mode === "cloud_api") {
      const cloudResult = await sendCloudApiWhatsApp(type as NotificationType, notificationPayload);
      return NextResponse.json(cloudResult);
    } else {
      const manualUrl = generateManualWhatsAppUrl(type as NotificationType, notificationPayload);
      return NextResponse.json({
        success: true,
        whatsAppUrl: manualUrl,
      });
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Notification dispatch failed";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
