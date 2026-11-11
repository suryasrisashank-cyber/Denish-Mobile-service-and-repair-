// Admin WhatsApp Messages in Conversation (Read & Reply)
// Endpoints: GET /api/admin/whatsapp/conversations/[id]/messages, POST /api/admin/whatsapp/conversations/[id]/messages

import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase, runInTransaction } from "@/lib/db";
import { sendWhatsAppDirectMessage, generateManualWhatsAppUrl } from "@/lib/whatsapp";

// ── GET: Load conversation history and mark as read ──
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const convId = parseInt(params.id, 10);
  if (isNaN(convId) || convId <= 0) {
    return NextResponse.json({ success: false, error: "Invalid conversation ID" }, { status: 400 });
  }

  try {
    const db = getDatabase();

    // 1. Fetch conversation details
    const conv = db.prepare(`
      SELECT 
        wc.*,
        ro.tracking_id as converted_tracking_id,
        ro.current_status as converted_order_status
      FROM whatsapp_conversations wc
      LEFT JOIN repair_orders ro ON wc.converted_order_id = ro.id
      WHERE wc.id = ?
    `).get(convId) as Record<string, unknown> | undefined;

    if (!conv) {
      return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });
    }

    // 2. Fetch all messages
    const messages = db.prepare(`
      SELECT 
        id,
        conversation_id,
        whatsapp_message_id,
        direction,
        sender_phone,
        recipient_phone,
        message_type,
        message_text,
        media_url,
        media_mime_type,
        status,
        error_details,
        created_at
      FROM whatsapp_messages
      WHERE conversation_id = ?
      ORDER BY id ASC
    `).all(convId);

    // 3. Mark conversation as read
    db.prepare("UPDATE whatsapp_conversations SET unread_count = 0 WHERE id = ?").run(convId);

    return NextResponse.json({
      success: true,
      data: {
        conversation: conv,
        messages,
      },
    });
  } catch (err) {
    console.error("[ADMIN_WA_MESSAGES_GET_ERROR]", err);
    return NextResponse.json({ success: false, error: "Failed to load messages" }, { status: 500 });
  }
}

// ── POST: Send Admin Reply to Customer ──
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const convId = parseInt(params.id, 10);
  if (isNaN(convId) || convId <= 0) {
    return NextResponse.json({ success: false, error: "Invalid conversation ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const messageText = body.messageText || body.text;

    if (!messageText || typeof messageText !== "string" || messageText.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Message text cannot be empty" }, { status: 400 });
    }

    const db = getDatabase();

    // Check conversation exists
    const conv = db.prepare("SELECT * FROM whatsapp_conversations WHERE id = ?").get(convId) as
      | { id: number; customer_phone: string; customer_name: string }
      | undefined;

    if (!conv) {
      return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });
    }

    const cleanPhone = conv.customer_phone;
    const trimmedText = messageText.trim();

    // Try sending via Meta Cloud API
    const sendResult = await sendWhatsAppDirectMessage({
      toPhone: cleanPhone,
      messageText: trimmedText,
    });

    const status = sendResult.success ? "sent" : "failed";
    const errorDetails = sendResult.error || (sendResult.mode === "unconfigured" ? "Meta WhatsApp Cloud API not configured (use manual click-to-chat fallback)" : null);
    const wamId = sendResult.messageId || null;

    // Save outbound message in whatsapp_messages & update conversation
    const result = runInTransaction((txDb) => {
      const insertMsg = txDb.prepare(`
        INSERT INTO whatsapp_messages (
          conversation_id, whatsapp_message_id, direction, sender_phone, recipient_phone,
          message_type, message_text, status, error_details, created_at
        ) VALUES (?, ?, 'outbound', 'DENISH_ADMIN', ?, 'text', ?, ?, ?, datetime('now'))
      `).run(convId, wamId, cleanPhone, trimmedText, status, errorDetails);

      txDb.prepare(`
        UPDATE whatsapp_conversations
        SET last_message = ?, last_message_at = datetime('now'), updated_at = datetime('now')
        WHERE id = ?
      `).run(trimmedText, convId);

      return { messageId: Number(insertMsg.lastInsertRowid) };
    });

    const manualUrl = generateManualWhatsAppUrl("manual_reply", {
      customerPhone: cleanPhone,
      message: trimmedText,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: result.messageId,
        conversationId: convId,
        status,
        providerMessageId: wamId,
        cloudApiAttempted: sendResult.mode === "cloud_api",
        cloudApiSuccess: sendResult.success,
        manualWhatsAppUrl: manualUrl,
        error: sendResult.error,
      },
    });
  } catch (err) {
    console.error("[ADMIN_WA_SEND_REPLY_ERROR]", err);
    return NextResponse.json({ success: false, error: "Failed to send WhatsApp reply" }, { status: 500 });
  }
}
