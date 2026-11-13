// Admin WhatsApp Conversations API
// Endpoint: GET /api/admin/whatsapp/conversations

import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/db";

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const filter = searchParams.get("filter") || "all"; // 'all' | 'enquiries' | 'unread'
  const search = searchParams.get("q")?.trim();

  try {
    const db = getDatabase();

    const whereClauses: string[] = [];
    const params: unknown[] = [];

    if (filter === "enquiries") {
      whereClauses.push("wc.is_enquiry = 1 AND wc.converted_order_id IS NULL");
    } else if (filter === "unread") {
      whereClauses.push("wc.unread_count > 0");
    }

    if (search) {
      whereClauses.push("(wc.customer_phone LIKE ? OR wc.customer_name LIKE ? OR wc.last_message LIKE ?)");
      const wildcard = `%${search}%`;
      params.push(wildcard, wildcard, wildcard);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const conversations = await db.prepare(`
      SELECT 
        wc.id,
        wc.customer_id,
        wc.customer_phone,
        wc.customer_name,
        wc.last_message,
        wc.last_message_at,
        wc.unread_count,
        wc.is_enquiry,
        wc.converted_order_id,
        wc.created_at,
        wc.updated_at,
        ro.tracking_id as converted_tracking_id,
        ro.current_status as converted_order_status
      FROM whatsapp_conversations wc
      LEFT JOIN repair_orders ro ON wc.converted_order_id = ro.id
      ${whereSql}
      ORDER BY wc.last_message_at DESC, wc.id DESC
      LIMIT 100
    `).all(...params);

    // Global counts
    const counts = (await db.prepare(`
      SELECT 
        COUNT(*) as total_conversations,
        SUM(CASE WHEN unread_count > 0 THEN 1 ELSE 0 END) as unread_conversations,
        SUM(CASE WHEN is_enquiry = 1 AND converted_order_id IS NULL THEN 1 ELSE 0 END) as pending_enquiries,
        SUM(CASE WHEN converted_order_id IS NOT NULL THEN 1 ELSE 0 END) as converted_enquiries
      FROM whatsapp_conversations
    `).get()) as Record<string, number>;

    return NextResponse.json({
      success: true,
      data: {
        conversations,
        counts: {
          total: counts.total_conversations || 0,
          unread: counts.unread_conversations || 0,
          pendingEnquiries: counts.pending_enquiries || 0,
          convertedEnquiries: counts.converted_enquiries || 0,
        },
      },
    });
  } catch (err) {
    console.error("[ADMIN_WA_CONVERSATIONS_ERROR]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch WhatsApp conversations" }, { status: 500 });
  }
}

