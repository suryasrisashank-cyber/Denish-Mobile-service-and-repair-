// Admin Single Order Detail, Edit, Status Transition & Archival API
// Endpoint: /api/admin/orders/[id]

import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase, runInTransaction } from "@/lib/db";
import { REPAIR_STATUSES, RepairStatus } from "@/lib/constants";
import { generateManualWhatsAppUrl, NotificationType } from "@/lib/whatsapp";

// ── GET /api/admin/orders/[id] ──
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return NextResponse.json(
      { success: false, error: "Unauthorized access to order details." },
      { status: 401 }
    );
  }

  const orderId = parseInt(params.id, 10);
  if (isNaN(orderId) || orderId <= 0) {
    return NextResponse.json({ success: false, error: "Invalid order ID" }, { status: 400 });
  }

  try {
    const db = getDatabase();

    // 1. Fetch Order with Customer Details
    const orderStmt = db.prepare(`
      SELECT 
        ro.id,
        ro.tracking_id,
        ro.device_brand,
        ro.device_model,
        ro.imei_serial,
        ro.repair_category,
        ro.reported_issue,
        ro.inspection_notes,
        ro.estimated_completion,
        ro.service_cost,
        ro.current_status,
        ro.pickup_ready,
        ro.source,
        ro.customer_type,
        ro.paid,
        ro.is_archived,
        ro.archived_at,
        ro.archive_reason,
        ro.created_at,
        ro.updated_at,
        cr.id as customer_id,
        cr.name as customer_name,
        cr.phone as customer_phone,
        cr.email as customer_email,
        cr.location as customer_location,
        cr.consent_whatsapp
      FROM repair_orders ro
      JOIN customer_records cr ON ro.customer_id = cr.id
      WHERE ro.id = ?
    `);

    interface DbOrder {
      id: number;
      tracking_id: string;
      device_brand: string;
      device_model: string;
      imei_serial: string | null;
      repair_category: string;
      reported_issue: string;
      inspection_notes: string | null;
      estimated_completion: string | null;
      service_cost: number | null;
      current_status: RepairStatus;
      pickup_ready: number;
      source: string;
      customer_type: string;
      paid: number;
      is_archived: number;
      archived_at: string | null;
      archive_reason: string | null;
      created_at: string;
      updated_at: string;
      customer_id: number;
      customer_name: string;
      customer_phone: string;
      customer_location: string | null;
      customer_email: string | null;
      consent_whatsapp: number;
    }

    const order = (await orderStmt.get(orderId)) as DbOrder | undefined;
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // 2. Fetch Full Status History with Admin Names
    interface DbHistory {
      id: number;
      previous_status: string | null;
      new_status: RepairStatus;
      customer_note: string | null;
      internal_note: string | null;
      created_at: string;
      admin_name: string | null;
      admin_username: string | null;
    }

    const history = (await db.prepare(`
      SELECT 
        rsh.id,
        rsh.previous_status,
        rsh.new_status,
        rsh.customer_note,
        rsh.internal_note,
        rsh.created_at,
        au.name as admin_name,
        au.username as admin_username
      FROM repair_status_history rsh
      LEFT JOIN admin_users au ON rsh.updated_by_admin_id = au.id
      WHERE rsh.order_id = ?
      ORDER BY rsh.id ASC
    `).all(orderId)) as DbHistory[];

    // 3. Fetch Notification History
    const notifications = await db.prepare(`
      SELECT 
        id, channel, recipient_phone, message_template, status, created_at
      FROM customer_notifications
      WHERE order_id = ?
      ORDER BY id DESC
    `).all(orderId);

    const statusMeta = REPAIR_STATUSES[order.current_status] || REPAIR_STATUSES.RECEIVED;

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        serviceId: order.customer_phone, // Prompt requirement: Display normalized customer phone number in admin details as Service ID
        trackingId: order.tracking_id,
        deviceBrand: order.device_brand,
        deviceModel: order.device_model,
        imeiSerial: order.imei_serial,
        repairCategory: order.repair_category,
        reportedIssue: order.reported_issue,
        inspectionNotes: order.inspection_notes,
        estimatedCompletion: order.estimated_completion,
        serviceCost: order.service_cost,
        currentStatus: order.current_status,
        statusLabel: statusMeta.label,
        badgeClass: statusMeta.badgeClass,
        stepIndex: statusMeta.stepIndex,
        pickupReady: order.pickup_ready === 1,
        source: order.source,
        customerType: order.customer_type,
        paid: order.paid === 1,
        isArchived: order.is_archived === 1,
        archivedAt: order.archived_at,
        archiveReason: order.archive_reason,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        customer: {
          id: order.customer_id,
          name: order.customer_name,
          phone: order.customer_phone,
          location: order.customer_location || "Gandhinagar",
          email: order.customer_email,
          consentWhatsApp: order.consent_whatsapp === 1,
        },
        statusHistory: history.map((h) => ({
          id: h.id,
          previousStatus: h.previous_status,
          newStatus: h.new_status,
          statusLabel: REPAIR_STATUSES[h.new_status]?.label || h.new_status,
          customerNote: h.customer_note,
          internalNote: h.internal_note,
          updatedBy: h.admin_name ? `${h.admin_name} (@${h.admin_username})` : "System / Technician",
          createdAt: h.created_at,
        })),
        notifications,
      },
    });
  } catch (err) {
    console.error("[ADMIN_GET_ORDER_ERROR]", err);
    return NextResponse.json({ success: false, error: "Failed to load order detail" }, { status: 500 });
  }
}

// ── PUT /api/admin/orders/[id] (Full Order & Customer Details Editing) ──
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const orderId = parseInt(params.id, 10);
  if (isNaN(orderId) || orderId <= 0) {
    return NextResponse.json({ success: false, error: "Invalid order ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerLocation,
      customerEmail,
      deviceBrand,
      deviceModel,
      imeiSerial,
      repairCategory,
      reportedIssue,
      inspectionNotes,
      estimatedCompletion,
      serviceCost,
      currentStatus,
      paid,
      customerType,
      internalNote,
    } = body;

    const db = getDatabase();

    const existingOrder = (await db.prepare(`
      SELECT ro.*, cr.name as customer_name, cr.phone as customer_phone
      FROM repair_orders ro
      JOIN customer_records cr ON ro.customer_id = cr.id
      WHERE ro.id = ?
    `).get(orderId)) as Record<string, unknown> | undefined;

    if (!existingOrder) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    const previousStatus = existingOrder.current_status as RepairStatus;
    const targetStatus = currentStatus && REPAIR_STATUSES[currentStatus as RepairStatus]
      ? (currentStatus as RepairStatus)
      : previousStatus;

    const cleanPhone = customerPhone ? String(customerPhone).replace(/\D/g, "") : String(existingOrder.customer_phone);
    const cost = serviceCost !== undefined && serviceCost !== null ? Number(serviceCost) : (existingOrder.service_cost as number | null);
    const paidVal = paid !== undefined ? (paid ? 1 : 0) : (existingOrder.paid as number);
    const pickupReadyVal = targetStatus === "READY_FOR_PICKUP" ? 1 : (existingOrder.pickup_ready as number);

    const finalCustomerName = customerName?.trim() || (existingOrder.customer_name as string);
    const finalCustomerPhone = cleanPhone || (existingOrder.customer_phone as string);
    const finalCustomerLocation = customerLocation !== undefined ? (customerLocation?.trim() || null) : (existingOrder.customer_location as string | null);
    const finalCustomerEmail = customerEmail !== undefined ? (customerEmail?.trim() || null) : (existingOrder.customer_email as string | null);

    const finalDeviceBrand = deviceBrand?.trim() || (existingOrder.device_brand as string);
    const finalDeviceModel = deviceModel?.trim() || (existingOrder.device_model as string);
    const finalImeiSerial = imeiSerial !== undefined ? (imeiSerial?.trim() || null) : (existingOrder.imei_serial as string | null);
    const finalRepairCategory = repairCategory?.trim() || (existingOrder.repair_category as string);
    const finalReportedIssue = reportedIssue?.trim() || (existingOrder.reported_issue as string);
    const finalInspectionNotes = inspectionNotes !== undefined ? (inspectionNotes?.trim() || null) : (existingOrder.inspection_notes as string | null);
    const finalEstimatedCompletion = estimatedCompletion !== undefined ? estimatedCompletion : (existingOrder.estimated_completion as string | null);
    const finalCustomerType = customerType?.trim() || (existingOrder.customer_type as string);

    await runInTransaction(async (txDb) => {
      // 1. Update customer record
      await txDb.prepare(`
        UPDATE customer_records
        SET 
          name = ?,
          phone = ?,
          location = ?,
          email = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `).run(
        finalCustomerName,
        finalCustomerPhone,
        finalCustomerLocation,
        finalCustomerEmail,
        existingOrder.customer_id
      );

      // 2. Update repair order
      await txDb.prepare(`
        UPDATE repair_orders
        SET 
          device_brand = ?,
          device_model = ?,
          imei_serial = ?,
          repair_category = ?,
          reported_issue = ?,
          inspection_notes = ?,
          estimated_completion = ?,
          service_cost = ?,
          current_status = ?,
          pickup_ready = ?,
          paid = ?,
          customer_type = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `).run(
        finalDeviceBrand,
        finalDeviceModel,
        finalImeiSerial,
        finalRepairCategory,
        finalReportedIssue,
        finalInspectionNotes,
        finalEstimatedCompletion,
        cost,
        targetStatus,
        pickupReadyVal,
        paidVal,
        finalCustomerType,
        orderId
      );

      // 3. Status History if status changed or notes provided
      if (targetStatus !== previousStatus || internalNote) {
        await txDb.prepare(`
          INSERT INTO repair_status_history (
            order_id, previous_status, new_status, customer_note, internal_note, updated_by_admin_id, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        `).run(
          orderId,
          previousStatus,
          targetStatus,
          null,
          internalNote?.trim() || "Order details updated by administrator.",
          admin.adminId
        );
      }

      // 4. Audit Log
      await txDb.prepare(`
        INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details, created_at)
        VALUES (?, 'EDIT_ORDER', 'repair_orders', ?, ?, datetime('now'))
      `).run(
        admin.adminId,
        String(orderId),
        JSON.stringify({
          updatedFields: {
            customerName,
            customerPhone: cleanPhone,
            deviceBrand,
            deviceModel,
            repairCategory,
            cost,
            targetStatus,
          },
        })
      );
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        trackingId: existingOrder.tracking_id,
        message: "Order successfully updated.",
      },
    });
  } catch (err) {
    console.error("[ADMIN_EDIT_ORDER_ERROR]", err);
    return NextResponse.json({ success: false, error: "Failed to update order details" }, { status: 500 });
  }
}

// ── PATCH /api/admin/orders/[id] (Status Transition & Quick Update) ──
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Admin session required." },
      { status: 401 }
    );
  }

  const orderId = parseInt(params.id, 10);
  if (isNaN(orderId) || orderId <= 0) {
    return NextResponse.json({ success: false, error: "Invalid order ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const targetStatusRaw = body.newStatus || body.status || body.currentStatus;
    const {
      customerNote,
      internalNote,
      estimatedCompletion,
      serviceCost,
      pickupReady,
      paid,
      customerType,
    } = body;

    const db = getDatabase();

    // 1. Fetch current order
    const currentOrder = (await db.prepare(`
      SELECT ro.*, cr.name as customer_name, cr.phone as customer_phone
      FROM repair_orders ro
      JOIN customer_records cr ON ro.customer_id = cr.id
      WHERE ro.id = ?
    `).get(orderId)) as Record<string, unknown> | undefined;

    if (!currentOrder) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    const previousStatus = currentOrder.current_status as RepairStatus;
    const targetStatus = targetStatusRaw && REPAIR_STATUSES[targetStatusRaw as RepairStatus]
      ? (targetStatusRaw as RepairStatus)
      : previousStatus;

    const isPickupReady = targetStatus === "READY_FOR_PICKUP"
      ? 1
      : pickupReady !== undefined
      ? (pickupReady ? 1 : 0)
      : (currentOrder.pickup_ready as number);

    const paidVal = paid !== undefined ? (paid ? 1 : 0) : null;

    const finalEstimatedCompletion = estimatedCompletion !== undefined ? estimatedCompletion : (currentOrder.estimated_completion as string | null);
    const finalServiceCost = serviceCost !== undefined && serviceCost !== null ? Number(serviceCost) : (currentOrder.service_cost as number | null);
    const finalInspectionNotes = internalNote ? internalNote : (currentOrder.inspection_notes as string | null);
    const finalPaid = paidVal !== null ? paidVal : (currentOrder.paid as number);
    const finalCustomerType = customerType || (currentOrder.customer_type as string);

    // 2. Perform atomic update in transaction
    await runInTransaction(async (txDb) => {
      // Update order
      await txDb.prepare(`
        UPDATE repair_orders
        SET 
          current_status = ?,
          pickup_ready = ?,
          estimated_completion = ?,
          service_cost = ?,
          inspection_notes = ?,
          paid = ?,
          customer_type = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `).run(
        targetStatus,
        isPickupReady,
        finalEstimatedCompletion,
        finalServiceCost,
        finalInspectionNotes,
        finalPaid,
        finalCustomerType,
        orderId
      );

      // If status changed or a customer note was provided, insert status history
      if (targetStatus !== previousStatus || customerNote || internalNote) {
        await txDb.prepare(`
          INSERT INTO repair_status_history (
            order_id, previous_status, new_status, customer_note, internal_note, updated_by_admin_id, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        `).run(
          orderId,
          previousStatus,
          targetStatus,
          customerNote?.trim() || null,
          internalNote?.trim() || null,
          admin.adminId
        );

        // Genuine Admin Notification for Status Update
        const statusLabel = REPAIR_STATUSES[targetStatus]?.label || targetStatus;
        await txDb.prepare(`
          INSERT INTO admin_notifications (
            type, title, message, order_id, tracking_id, customer_name, customer_phone, is_read, created_at
          ) VALUES (
            'STATUS_UPDATE',
            'Repair Status Updated',
            ?,
            ?,
            ?,
            ?,
            ?,
            0,
            datetime('now')
          )
        `).run(
          `Order ${currentOrder.tracking_id} updated to ${statusLabel}.`,
          orderId,
          String(currentOrder.tracking_id),
          String(currentOrder.customer_name || "Customer"),
          String(currentOrder.customer_phone || "")
        );
      }

      // Record audit log
      await txDb.prepare(`
        INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details, created_at)
        VALUES (?, 'UPDATE_ORDER_STATUS', 'repair_orders', ?, ?, datetime('now'))
      `).run(
        admin.adminId,
        String(orderId),
        `Status transitioned from ${previousStatus} to ${targetStatus}. Admin note: ${internalNote || "None"}`
      );
    });

    // 3. Generate suggested WhatsApp notification link for staff
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    let notificationType: NotificationType = "STATUS_UPDATE";
    if (targetStatus === "READY_FOR_PICKUP") notificationType = "READY_FOR_PICKUP";
    else if (targetStatus === "COMPLETED") notificationType = "COMPLETED";

    const whatsAppUrl = generateManualWhatsAppUrl(notificationType, {
      orderId,
      customerName: String(currentOrder.customer_name),
      customerPhone: String(currentOrder.customer_phone),
      trackingId: String(currentOrder.tracking_id),
      deviceModel: `${currentOrder.device_brand} ${currentOrder.device_model}`,
      status: targetStatus,
      customNote: customerNote?.trim() || undefined,
      baseUrl,
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        trackingId: currentOrder.tracking_id,
        currentStatus: targetStatus,
        statusLabel: REPAIR_STATUSES[targetStatus]?.label,
        pickupReady: isPickupReady === 1,
        whatsAppUrl,
      },
    });
  } catch (err) {
    console.error("[ADMIN_UPDATE_ORDER_ERROR]", err);
    return NextResponse.json({ success: false, error: "Failed to update repair order." }, { status: 500 });
  }
}

// ── DELETE /api/admin/orders/[id] (Soft-Delete / Archive Order) ──
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const orderId = parseInt(params.id, 10);
  if (isNaN(orderId) || orderId <= 0) {
    return NextResponse.json({ success: false, error: "Invalid order ID" }, { status: 400 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const reason = (body?.reason || "Archived by administrator").trim();

    const db = getDatabase();

    const existingOrder = (await db.prepare("SELECT id, tracking_id FROM repair_orders WHERE id = ?").get(orderId)) as
      | { id: number; tracking_id: string }
      | undefined;

    if (!existingOrder) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    await runInTransaction(async (txDb) => {
      await txDb.prepare(`
        UPDATE repair_orders
        SET 
          is_archived = 1,
          archived_at = datetime('now'),
          archived_by_admin_id = ?,
          archive_reason = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `).run(admin.adminId, reason, orderId);

      await txDb.prepare(`
        INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details, created_at)
        VALUES (?, 'ARCHIVE_ORDER', 'repair_orders', ?, ?, datetime('now'))
      `).run(admin.adminId, String(orderId), `Order archived: ${reason}`);
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        trackingId: existingOrder.tracking_id,
        message: "Order successfully archived.",
      },
    });
  } catch (err) {
    console.error("[ADMIN_ARCHIVE_ORDER_ERROR]", err);
    return NextResponse.json({ success: false, error: "Failed to archive order" }, { status: 500 });
  }
}
