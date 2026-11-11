// Meta WhatsApp Cloud API Webhook (GET Verification & POST Inbound Messages/Delivery Receipts)
// Endpoint: /api/webhooks/whatsapp

import { NextRequest, NextResponse } from "next/server";
import { getDatabase, runInTransaction } from "@/lib/db";
import { verifyWhatsAppWebhookSignature, sanitizePhoneNumber, sendWhatsAppDirectMessage } from "@/lib/whatsapp";

const WELCOME_MESSAGE = 
`Hi! Welcome to DENISH MOBILE REPAIRING AND SERVICE.

Thank you for contacting us. We are happy to help you with your mobile repair.

Please share your mobile brand, model and the problem you are facing.

Our team will assist you shortly.

Your Mobile, Our Care.`;

// ── GET: Webhook Subscription Verification (Meta Handshake) ──
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "denish-wa-verify-token-2026";

  if (mode === "subscribe" && token === expectedToken) {
    console.log("[WHATSAPP_WEBHOOK] Meta subscription verification succeeded.");
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden verification token" }, { status: 403 });
}

// ── POST: Inbound Messages & Delivery Status Receipts ──
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    // 1. Verify HMAC-SHA256 signature if app secret is configured
    const signature = request.headers.get("x-hub-signature-256");
    const sigCheck = verifyWhatsAppWebhookSignature(rawBody, signature);
    if (!sigCheck.valid) {
      console.warn("[WHATSAPP_WEBHOOK] Signature check failed:", sigCheck.reason);
      return NextResponse.json({ error: sigCheck.reason || "Invalid webhook signature" }, { status: 401 });
    }

    let body: {
      entry?: Array<{
        changes?: Array<{
          value?: {
            statuses?: Array<{ id: string; status: string; errors?: Array<{ message: string }> }>;
            contacts?: Array<{ profile?: { name?: string } }>;
            messages?: Array<{
              id: string;
              from: string;
              type: string;
              text?: { body: string };
              image?: { id: string; caption?: string; mime_type?: string };
              document?: { id: string; filename?: string; caption?: string; mime_type?: string };
              audio?: { id: string; mime_type?: string };
              voice?: { id: string; mime_type?: string };
              location?: { latitude: number; longitude: number };
            }>;
          };
        }>;
      }>;
    };
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value) {
      return NextResponse.json({ status: "ignored_empty_payload" }, { status: 200 });
    }

    const db = getDatabase();

    // 2. Handle Message Status Updates (sent, delivered, read, failed)
    const statuses = value.statuses;
    if (Array.isArray(statuses) && statuses.length > 0) {
      for (const item of statuses) {
        const messageId = item.id;
        const status = item.status; // 'sent' | 'delivered' | 'read' | 'failed'
        const errorMsg = item.errors?.[0]?.message || null;

        if (messageId && status) {
          // Update customer_notifications
          db.prepare(`
            UPDATE customer_notifications
            SET status = ?, error_details = COALESCE(?, error_details)
            WHERE provider_message_id = ?
          `).run(status, errorMsg, messageId);

          // Update whatsapp_messages
          db.prepare(`
            UPDATE whatsapp_messages
            SET status = ?, error_details = COALESCE(?, error_details)
            WHERE whatsapp_message_id = ?
          `).run(status, errorMsg, messageId);
        }
      }
    }

    // 3. Handle Inbound WhatsApp Customer Messages
    const messages = value.messages;
    if (Array.isArray(messages) && messages.length > 0) {
      const contacts = value.contacts || [];
      const contactProfile = contacts[0]?.profile?.name || null;

      for (const msg of messages) {
        const wamId = msg.id;
        const senderRaw = msg.from;
        if (!senderRaw) continue;

        const cleanPhone = sanitizePhoneNumber(senderRaw);
        const msgType = msg.type || "text";
        let messageText = "";
        let mediaUrl: string | null = null;
        let mediaMimeType: string | null = null;

        if (msgType === "text" && msg.text?.body) {
          messageText = msg.text.body;
        } else if (msgType === "image") {
          messageText = msg.image?.caption || "[Customer sent an Image]";
          mediaUrl = msg.image?.id || null;
          mediaMimeType = msg.image?.mime_type || "image/jpeg";
        } else if (msgType === "document") {
          messageText = msg.document?.caption || msg.document?.filename || "[Customer sent a Document]";
          mediaUrl = msg.document?.id || null;
          mediaMimeType = msg.document?.mime_type || "application/pdf";
        } else if (msgType === "audio" || msgType === "voice") {
          messageText = "[Voice / Audio message]";
          mediaUrl = msg.audio?.id || msg.voice?.id || null;
          mediaMimeType = msg.audio?.mime_type || "audio/ogg";
        } else if (msgType === "location") {
          messageText = `[Shared Location: ${msg.location?.latitude}, ${msg.location?.longitude}]`;
        } else {
          messageText = `[Customer sent ${msgType} message]`;
        }

        // Deduplication: Skip if message ID was already processed
        if (wamId) {
          const existing = db.prepare("SELECT id FROM whatsapp_messages WHERE whatsapp_message_id = ?").get(wamId);
          if (existing) {
            console.log(`[WHATSAPP_WEBHOOK] Skipping duplicate message: ${wamId}`);
            continue;
          }
        }

        // Execute atomic transaction for conversation & message creation
        let isNewConv = false;
        let finalConvId = 0;

        runInTransaction((txDb) => {
          // Check if customer is registered in customer_records
          const customer = txDb.prepare(`
            SELECT id, name FROM customer_records WHERE phone = ? OR phone = ? LIMIT 1
          `).get(cleanPhone, cleanPhone.replace(/^91/, "")) as { id: number; name: string } | undefined;

          const customerId = customer?.id || null;
          const customerName = customer?.name || contactProfile || `WhatsApp User (+${cleanPhone})`;

          // Find or create conversation
          const conv = txDb.prepare("SELECT id, unread_count FROM whatsapp_conversations WHERE customer_phone = ?").get(cleanPhone) as
            | { id: number; unread_count: number }
            | undefined;

          isNewConv = !conv;
          let convId: number;
          if (conv) {
            convId = conv.id;
            txDb.prepare(`
              UPDATE whatsapp_conversations
              SET 
                last_message = ?,
                last_message_at = datetime('now'),
                unread_count = unread_count + 1,
                customer_name = COALESCE(?, customer_name),
                customer_id = COALESCE(?, customer_id),
                updated_at = datetime('now')
              WHERE id = ?
            `).run(messageText, customerName, customerId, convId);
          } else {
            const insertConv = txDb.prepare(`
              INSERT INTO whatsapp_conversations (
                customer_id, customer_phone, customer_name, last_message, last_message_at, unread_count, is_enquiry, created_at, updated_at
              ) VALUES (?, ?, ?, ?, datetime('now'), 1, 1, datetime('now'), datetime('now'))
            `).run(customerId, cleanPhone, customerName, messageText);
            convId = Number(insertConv.lastInsertRowid);
          }
          finalConvId = convId;

          // Insert incoming message
          txDb.prepare(`
            INSERT INTO whatsapp_messages (
              conversation_id, whatsapp_message_id, direction, sender_phone, recipient_phone,
              message_type, message_text, media_url, media_mime_type, status, created_at
            ) VALUES (?, ?, 'inbound', ?, ?, ?, ?, ?, ?, 'received', datetime('now'))
          `).run(
            convId,
            wamId || null,
            cleanPhone,
            process.env.WHATSAPP_PHONE_NUMBER || "DENISH_STORE",
            msgType,
            messageText,
            mediaUrl,
            mediaMimeType
          );

          // Create genuine Admin Notification for incoming WhatsApp message
          txDb.prepare(`
            INSERT INTO admin_notifications (
              type, title, message, conversation_id, customer_name, customer_phone, is_read, created_at
            ) VALUES (
              'INCOMING_WHATSAPP',
              'Incoming WhatsApp Message',
              ?,
              ?,
              ?,
              ?,
              0,
              datetime('now')
            )
          `).run(
            messageText.length > 120 ? messageText.slice(0, 117) + "..." : messageText,
            convId,
            customerName,
            cleanPhone
          );
        });

        // 4. Automatic Welcome Message (Meta Cloud API — Priority 3)
        // Dispatched only for brand new conversations when official Meta API is configured
        if (isNewConv && process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
          try {
            const welcomeResult = await sendWhatsAppDirectMessage({
              toPhone: cleanPhone,
              messageText: WELCOME_MESSAGE,
              templateName: "automatic_welcome",
            });
            if (welcomeResult.success) {
              db.prepare(`
                INSERT INTO whatsapp_messages (
                  conversation_id, whatsapp_message_id, direction, sender_phone, recipient_phone,
                  message_type, message_text, status, created_at
                ) VALUES (?, ?, 'outbound', 'DENISH_STORE', ?, 'text', ?, 'sent', datetime('now'))
              `).run(finalConvId, welcomeResult.messageId || null, cleanPhone, WELCOME_MESSAGE);
            }
          } catch (autoErr) {
            console.error("[WHATSAPP_AUTO_WELCOME_ERROR]", autoErr);
          }
        }
      }
    }

    return NextResponse.json({ success: true, status: "success" }, { status: 200 });
  } catch (err) {
    console.error("[WHATSAPP_WEBHOOK_ERROR]", err);
    return NextResponse.json({ error: "Internal processing error" }, { status: 500 });
  }
}
