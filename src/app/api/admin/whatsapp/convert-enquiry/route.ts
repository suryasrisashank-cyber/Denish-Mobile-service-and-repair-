// Convert WhatsApp Customer Enquiry into Confirmed Repair Order
// Endpoint: POST /api/admin/whatsapp/convert-enquiry

import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase, runInTransaction } from "@/lib/db";
import { generateSecureTrackingId } from "@/lib/trackingId";

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      conversationId,
      customerName,
      customerLocation = "Gandhinagar",
      deviceBrand,
      deviceModel,
      repairCategory,
      reportedIssue,
      inspectionNotes,
      estimatedCompletion,
      serviceCost,
      customerType = "Customer",
    } = body;

    const convId = parseInt(conversationId, 10);
    if (isNaN(convId) || convId <= 0) {
      return NextResponse.json({ success: false, error: "Valid conversation ID required" }, { status: 400 });
    }

    if (!deviceBrand || !deviceModel || !repairCategory || !reportedIssue) {
      return NextResponse.json(
        { success: false, error: "Device brand, model, repair category, and reported issue are required to create a repair order." },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // 1. Fetch conversation
    const conv = (await db.prepare("SELECT * FROM whatsapp_conversations WHERE id = ?").get(convId)) as
      | { id: number; customer_id: number | null; customer_phone: string; customer_name: string; converted_order_id: number | null }
      | undefined;

    if (!conv) {
      return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });
    }

    if (conv.converted_order_id) {
      return NextResponse.json(
        { success: false, error: "This conversation has already been converted to repair order #" + conv.converted_order_id },
        { status: 400 }
      );
    }

    const cleanPhone = conv.customer_phone;
    const finalName = (customerName?.trim() || conv.customer_name || "Valued Customer").trim();
    const cost = serviceCost ? Number(serviceCost) : null;

    // 2. Generate Tracking ID
    const trackingId = await generateSecureTrackingId();

    // 3. Atomic transaction: Customer -> Repair Order -> Status History -> Update Conversation -> Audit Log
    const result = await runInTransaction(async (txDb) => {
      // Find or create customer
      let customerId = conv.customer_id;
      if (!customerId) {
        const existingCust = (await txDb.prepare("SELECT id FROM customer_records WHERE phone = ?").get(cleanPhone)) as { id: number } | undefined;
        if (existingCust) {
          customerId = existingCust.id;
        } else {
          const insertCust = await txDb.prepare(`
            INSERT INTO customer_records (name, phone, location, consent_whatsapp, created_at, updated_at)
            VALUES (?, ?, ?, 1, datetime('now'), datetime('now'))
          `).run(finalName, cleanPhone, customerLocation.trim());
          customerId = Number(insertCust.lastInsertRowid);
        }
      }

      // Insert Repair Order (source: 'ADMIN_CREATED')
      const insertOrder = await txDb.prepare(`
        INSERT INTO repair_orders (
          tracking_id, customer_id, device_brand, device_model,
          repair_category, reported_issue, inspection_notes, estimated_completion,
          service_cost, current_status, pickup_ready, source, customer_type, is_archived, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'RECEIVED', 0, 'ADMIN_CREATED', ?, 0, datetime('now'), datetime('now'))
      `).run(
        trackingId,
        customerId,
        deviceBrand.trim(),
        deviceModel.trim(),
        repairCategory.trim(),
        reportedIssue.trim(),
        inspectionNotes?.trim() || `Converted from WhatsApp enquiry (#${convId}).`,
        estimatedCompletion || null,
        cost,
        customerType === "Dealer" ? "Dealer" : "Customer"
      );

      const orderId = Number(insertOrder.lastInsertRowid);

      // Insert status history
      await txDb.prepare(`
        INSERT INTO repair_status_history (
          order_id, previous_status, new_status, customer_note, internal_note, updated_by_admin_id, created_at
        ) VALUES (?, NULL, 'RECEIVED', 'Device checked in following customer WhatsApp enquiry.', 'Converted from WhatsApp enquiry.', ?, datetime('now'))
      `).run(orderId, admin.adminId);

      // Update conversation to mark as converted and no longer pending enquiry
      await txDb.prepare(`
        UPDATE whatsapp_conversations
        SET 
          converted_order_id = ?,
          is_enquiry = 0,
          customer_id = ?,
          customer_name = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `).run(orderId, customerId, finalName, convId);

      // Insert system note message in conversation
      await txDb.prepare(`
        INSERT INTO whatsapp_messages (
          conversation_id, direction, sender_phone, recipient_phone,
          message_type, message_text, status, created_at
        ) VALUES (?, 'outbound', 'DENISH_SYSTEM', ?, 'text', ?, 'sent', datetime('now'))
      `).run(convId, cleanPhone, `[System]: Converted enquiry into Repair Order #${orderId} (Tracking ID: ${trackingId})`);

      // Audit log
      await txDb.prepare(`
        INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details, created_at)
        VALUES (?, 'CONVERT_WHATSAPP_ENQUIRY', 'repair_orders', ?, ?, datetime('now'))
      `).run(
        admin.adminId,
        String(orderId),
        JSON.stringify({ conversationId: convId, trackingId, cleanPhone, deviceBrand, deviceModel })
      );

      return { orderId, trackingId, customerId };
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId: result.orderId,
        trackingId: result.trackingId,
        customerName: finalName,
        phone: cleanPhone,
        message: "Enquiry successfully converted to confirmed repair order.",
      },
    });
  } catch (err) {
    console.error("[ADMIN_CONVERT_ENQUIRY_ERROR]", err);
    return NextResponse.json({ success: false, error: "Failed to convert enquiry to order" }, { status: 500 });
  }
}

