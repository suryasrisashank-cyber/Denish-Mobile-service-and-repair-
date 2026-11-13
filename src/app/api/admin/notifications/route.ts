// DENISH MOBILE REPAIRING AND SERVICE
// Admin Operational Notifications API
// Endpoints: GET /api/admin/notifications, PATCH /api/admin/notifications

import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/db";

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return NextResponse.json(
      { success: false, error: "Unauthorized access to notifications." },
      { status: 401 }
    );
  }

  const { searchParams } = request.nextUrl;
  const source = searchParams.get("source"); // 'customer_dispatches' | 'admin'
  const typeFilter = searchParams.get("type"); // 'ALL' | 'SERVICE_REQUEST' | 'INCOMING_WHATSAPP' | 'STATUS_UPDATE' | 'OUTGOING_MESSAGE'
  const unreadOnly = searchParams.get("unread") === "true";

  try {
    const db = getDatabase();

    // ── Branch A: Customer Dispatches (Outbound WhatsApp Log) ──
    if (source === "customer_dispatches") {
      const notifications = await db.prepare(`
        SELECT 
          cn.id,
          cn.order_id,
          cn.channel,
          cn.recipient_phone,
          cn.message_template,
          cn.message_body,
          cn.status,
          cn.created_at,
          ro.tracking_id,
          ro.device_model,
          ro.current_status
        FROM customer_notifications cn
        LEFT JOIN repair_orders ro ON cn.order_id = ro.id
        ORDER BY cn.id DESC
        LIMIT 50
      `).all();

      const totalCount = (await db.prepare("SELECT COUNT(*) as c FROM customer_notifications").get()) as { c: number };

      return NextResponse.json({
        success: true,
        data: {
          notifications,
          total: totalCount.c,
        },
      });
    }

    // ── Branch B: Operational Admin Notifications (Default) ──
    const whereClauses: string[] = [];
    const params: unknown[] = [];

    if (typeFilter && typeFilter !== "ALL") {
      whereClauses.push("an.type = ?");
      params.push(typeFilter.toUpperCase());
    }

    if (unreadOnly) {
      whereClauses.push("an.is_read = 0");
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const notifications = await db.prepare(`
      SELECT 
        an.id,
        an.type,
        an.title,
        an.message,
        an.order_id,
        an.conversation_id,
        an.tracking_id,
        an.customer_name,
        an.customer_phone,
        an.is_read,
        an.created_at,
        ro.device_model,
        ro.current_status
      FROM admin_notifications an
      LEFT JOIN repair_orders ro ON an.order_id = ro.id
      ${whereSql}
      ORDER BY an.id DESC
      LIMIT 100
    `).all(...params);

    // Global category & unread counts
    const counts = (await db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread,
        SUM(CASE WHEN type = 'SERVICE_REQUEST' THEN 1 ELSE 0 END) as service_requests,
        SUM(CASE WHEN type = 'INCOMING_WHATSAPP' THEN 1 ELSE 0 END) as incoming_whatsapp,
        SUM(CASE WHEN type = 'STATUS_UPDATE' THEN 1 ELSE 0 END) as status_updates,
        SUM(CASE WHEN type = 'OUTGOING_MESSAGE' THEN 1 ELSE 0 END) as outgoing_messages
      FROM admin_notifications
    `).get()) as Record<string, number>;

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        counts: {
          total: counts.total || 0,
          unread: counts.unread || 0,
          serviceRequests: counts.service_requests || 0,
          incomingWhatsApp: counts.incoming_whatsapp || 0,
          statusUpdates: counts.status_updates || 0,
          outgoingMessages: counts.outgoing_messages || 0,
        },
      },
    });
  } catch (err) {
    console.error("[ADMIN_NOTIFICATIONS_ERROR]", err);
    return NextResponse.json(
      { success: false, error: "Failed to load notifications log." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return NextResponse.json(
      { success: false, error: "Unauthorized access." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { id, markAllRead, clearRead } = body;
    const db = getDatabase();

    if (markAllRead) {
      await db.prepare("UPDATE admin_notifications SET is_read = 1 WHERE is_read = 0").run();
      return NextResponse.json({ success: true, message: "All notifications marked as read." });
    }

    if (clearRead) {
      await db.prepare("DELETE FROM admin_notifications WHERE is_read = 1").run();
      return NextResponse.json({ success: true, message: "Read notifications cleared." });
    }

    if (id) {
      await db.prepare("UPDATE admin_notifications SET is_read = 1 WHERE id = ?").run(Number(id));
      return NextResponse.json({ success: true, message: `Notification #${id} marked as read.` });
    }

    return NextResponse.json({ success: false, error: "No valid action provided." }, { status: 400 });
  } catch (err) {
    console.error("[ADMIN_NOTIFICATIONS_PATCH_ERROR]", err);
    return NextResponse.json(
      { success: false, error: "Failed to update notifications." },
      { status: 500 }
    );
  }
}
