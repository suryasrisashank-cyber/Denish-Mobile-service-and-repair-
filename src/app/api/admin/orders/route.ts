// Admin Orders API — Real Database Operations Only
// Endpoints: GET /api/admin/orders, POST /api/admin/orders

import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase, runInTransaction } from "@/lib/db";
import { REPAIR_STATUSES, RepairStatus } from "@/lib/constants";
import { generateManualWhatsAppUrl } from "@/lib/whatsapp";

// ── GET /api/admin/orders (Query Real Database Orders with Pagination & Filters) ──
export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return NextResponse.json(
      { success: false, error: "Unauthorized access to admin orders." },
      { status: 401 }
    );
  }

  const { searchParams } = request.nextUrl;
  const statusFilter = searchParams.get("status");
  const dateRange = searchParams.get("dateRange"); // "today" | "7d" | "30d" | "all"
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder")?.toUpperCase() === "ASC" ? "ASC" : "DESC";
  const searchQuery = searchParams.get("q")?.trim();
  const showArchived = searchParams.get("archived") === "true" || searchParams.get("includeArchived") === "true";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(5, parseInt(searchParams.get("limit") || "15", 10)));
  const offset = (page - 1) * limit;

  try {
    const db = getDatabase();

    // 1. Calculate Real Statistics From Actual Active Database Records Only (Excluding Archived)
    const metricsRow = (await db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN current_status = 'NEW_REQUEST' THEN 1 ELSE 0 END) as new_requests,
        SUM(CASE WHEN current_status = 'RECEIVED' THEN 1 ELSE 0 END) as received,
        SUM(CASE WHEN current_status = 'UNDER_INSPECTION' THEN 1 ELSE 0 END) as under_inspection,
        SUM(CASE WHEN current_status = 'REPAIRING' THEN 1 ELSE 0 END) as repairing,
        SUM(CASE WHEN current_status = 'WAITING_FOR_PARTS' THEN 1 ELSE 0 END) as waiting_for_parts,
        SUM(CASE WHEN current_status = 'WAITING_FOR_APPROVAL' THEN 1 ELSE 0 END) as waiting_for_approval,
        SUM(CASE WHEN current_status = 'QUALITY_CHECK' THEN 1 ELSE 0 END) as quality_check,
        SUM(CASE WHEN current_status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN current_status = 'READY_FOR_PICKUP' THEN 1 ELSE 0 END) as ready_for_pickup,
        SUM(CASE WHEN current_status = 'DELIVERED' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN current_status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN current_status NOT IN ('COMPLETED', 'DELIVERED', 'CANCELLED') THEN 1 ELSE 0 END) as active_repairs,
        SUM(CASE WHEN current_status NOT IN ('COMPLETED', 'DELIVERED', 'CANCELLED') AND (estimated_completion < datetime('now') OR (created_at <= datetime('now', '-3 days') AND current_status != 'READY_FOR_PICKUP')) THEN 1 ELSE 0 END) as overdue_repairs,
        SUM(CASE WHEN customer_type = 'Dealer' THEN 1 ELSE 0 END) as dealer_count,
        SUM(CASE WHEN customer_type != 'Dealer' THEN 1 ELSE 0 END) as customer_count,
        SUM(CASE WHEN DATE(estimated_completion) = DATE('now') OR (current_status = 'READY_FOR_PICKUP' AND DATE(updated_at) = DATE('now')) THEN 1 ELSE 0 END) as due_today,
        SUM(CASE WHEN paid = 0 THEN COALESCE(service_cost, 0) ELSE 0 END) as pending_balance,
        SUM(CASE WHEN DATE(created_at) = DATE('now') THEN 1 ELSE 0 END) as new_jobs_today,
        SUM(CASE WHEN current_status = 'DELIVERED' AND strftime('%Y-%m', updated_at) = strftime('%Y-%m', 'now') THEN 1 ELSE 0 END) as delivered_this_month,
        SUM(CASE WHEN current_status IN ('DELIVERED', 'COMPLETED') AND strftime('%Y-%m', updated_at) = strftime('%Y-%m', 'now') THEN COALESCE(service_cost, 0) ELSE 0 END) as revenue_this_month,
        SUM(CASE WHEN paid = 1 OR current_status IN ('DELIVERED', 'COMPLETED') THEN COALESCE(service_cost, 0) ELSE 0 END) as total_revenue
      FROM repair_orders
      WHERE is_archived = 0
    `).get()) as Record<string, number>;

    // Additional global counts
    const archivedCountRow = (await db.prepare("SELECT COUNT(*) as count FROM repair_orders WHERE is_archived = 1").get()) as { count: number };
    const waCounts = (await db.prepare(`
      SELECT 
        SUM(CASE WHEN unread_count > 0 THEN 1 ELSE 0 END) as unread_wa,
        SUM(CASE WHEN is_enquiry = 1 AND converted_order_id IS NULL THEN 1 ELSE 0 END) as pending_enquiries
      FROM whatsapp_conversations
    `).get()) as { unread_wa: number; pending_enquiries: number };

    // 2. Build Dynamic Filters
    const whereClauses: string[] = [];
    const queryParams: unknown[] = [];

    if (showArchived) {
      whereClauses.push("ro.is_archived = 1");
    } else {
      whereClauses.push("ro.is_archived = 0");
    }

    if (statusFilter && statusFilter !== "ALL") {
      if (statusFilter === "IN_PROGRESS") {
        whereClauses.push("ro.current_status IN ('UNDER_INSPECTION', 'WAITING_FOR_APPROVAL', 'WAITING_FOR_PARTS', 'REPAIRING', 'QUALITY_CHECK')");
      } else if (statusFilter === "COMPLETED_GROUP") {
        whereClauses.push("ro.current_status IN ('COMPLETED', 'QUALITY_CHECK')");
      } else if (REPAIR_STATUSES[statusFilter as RepairStatus]) {
        whereClauses.push("ro.current_status = ?");
        queryParams.push(statusFilter);
      }
    }

    if (dateRange && dateRange !== "all") {
      if (dateRange === "today") {
        whereClauses.push("DATE(ro.created_at) = DATE('now')");
      } else if (dateRange === "7d") {
        whereClauses.push("ro.created_at >= datetime('now', '-7 days')");
      } else if (dateRange === "30d") {
        whereClauses.push("ro.created_at >= datetime('now', '-30 days')");
      }
    }

    if (searchQuery) {
      whereClauses.push(`(
        ro.tracking_id LIKE ? OR 
        cr.name LIKE ? OR 
        cr.phone LIKE ? OR 
        cr.location LIKE ? OR
        ro.device_model LIKE ? OR
        ro.device_brand LIKE ?
      )`);
      const wildcard = `%${searchQuery}%`;
      queryParams.push(wildcard, wildcard, wildcard, wildcard, wildcard, wildcard);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // Count total filtered
    const countStmt = db.prepare(`
      SELECT COUNT(*) as filteredCount
      FROM repair_orders ro
      JOIN customer_records cr ON ro.customer_id = cr.id
      ${whereSql}
    `);
    const { filteredCount } = (await countStmt.get(...queryParams)) as { filteredCount: number };

    // Sorting column mapping
    let orderColumn = "ro.id";
    if (sortBy === "customer") orderColumn = "cr.name";
    else if (sortBy === "status") orderColumn = "ro.current_status";
    else if (sortBy === "device") orderColumn = "ro.device_model";
    else if (sortBy === "updatedAt") orderColumn = "ro.updated_at";

    // Fetch paginated rows from real database
    const listStmt = db.prepare(`
      SELECT 
        ro.id,
        ro.tracking_id,
        ro.device_brand,
        ro.device_model,
        ro.repair_category,
        ro.reported_issue,
        ro.current_status,
        ro.pickup_ready,
        ro.service_cost,
        ro.estimated_completion,
        ro.source,
        ro.customer_type,
        ro.paid,
        ro.is_archived,
        ro.archived_at,
        ro.archive_reason,
        ro.preferred_booking_date,
        ro.preferred_contact_method,
        ro.created_at,
        ro.updated_at,
        cr.id as customer_id,
        cr.name as customer_name,
        cr.phone as customer_phone,
        cr.location as customer_location
      FROM repair_orders ro
      JOIN customer_records cr ON ro.customer_id = cr.id
      ${whereSql}
      ORDER BY ${orderColumn} ${sortOrder}
      LIMIT ? OFFSET ?
    `);

    const orders = (await listStmt.all(...queryParams, limit, offset)) as Array<{
      id: number;
      tracking_id: string;
      device_brand: string;
      device_model: string;
      repair_category: string;
      reported_issue: string;
      current_status: RepairStatus;
      pickup_ready: number;
      service_cost: number | null;
      estimated_completion: string | null;
      source?: string;
      customer_type?: string;
      paid?: number;
      is_archived?: number;
      archived_at?: string | null;
      archive_reason?: string | null;
      preferred_booking_date?: string | null;
      preferred_contact_method?: string | null;
      created_at: string;
      updated_at: string;
      customer_id: number;
      customer_name: string;
      customer_phone: string;
      customer_location: string | null;
    }>;

    // Real Customer directory summary
    const customersSummary = await db.prepare(`
      SELECT 
        cr.id, 
        cr.name, 
        cr.phone, 
        cr.location, 
        COUNT(ro.id) as order_count, 
        MAX(ro.created_at) as last_order_date,
        SUM(COALESCE(ro.service_cost, 0)) as total_spent
      FROM customer_records cr
      LEFT JOIN repair_orders ro ON cr.id = ro.customer_id AND ro.is_archived = 0
      GROUP BY cr.id
      ORDER BY last_order_date DESC
      LIMIT 100
    `).all();

    // Real device brand breakdown
    const deviceStats = await db.prepare(`
      SELECT device_brand as brand, COUNT(*) as count 
      FROM repair_orders 
      WHERE is_archived = 0
      GROUP BY device_brand 
      ORDER BY count DESC 
      LIMIT 15
    `).all();

    // Real parts / categories breakdown
    const partsStats = await db.prepare(`
      SELECT repair_category as category, COUNT(*) as count 
      FROM repair_orders 
      WHERE is_archived = 0
      GROUP BY repair_category 
      ORDER BY count DESC 
      LIMIT 15
    `).all();

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          total: metricsRow.total || 0,
          newRequests: metricsRow.new_requests || 0,
          received: metricsRow.received || 0,
          underInspection: metricsRow.under_inspection || 0,
          repairing: metricsRow.repairing || 0,
          waitingForParts: metricsRow.waiting_for_parts || 0,
          waitingForApproval: metricsRow.waiting_for_approval || 0,
          qualityCheck: metricsRow.quality_check || 0,
          completed: metricsRow.completed || 0,
          readyForPickup: metricsRow.ready_for_pickup || 0,
          delivered: metricsRow.delivered || 0,
          cancelled: metricsRow.cancelled || 0,
          inProgress: (metricsRow.under_inspection || 0) + (metricsRow.waiting_for_parts || 0) + (metricsRow.waiting_for_approval || 0) + (metricsRow.repairing || 0) + (metricsRow.quality_check || 0),
          activeRepairs: metricsRow.active_repairs || 0,
          overdueRepairs: metricsRow.overdue_repairs || 0,
          customerCount: metricsRow.customer_count || 0,
          dealerCount: metricsRow.dealer_count || 0,
          dueToday: metricsRow.due_today || 0,
          pendingBalance: metricsRow.pending_balance || 0,
          newJobsToday: metricsRow.new_jobs_today || 0,
          deliveredThisMonth: metricsRow.delivered_this_month || 0,
          revenueThisMonth: metricsRow.revenue_this_month || 0,
          totalRevenue: metricsRow.total_revenue || 0,
          archived: archivedCountRow.count || 0,
          unreadWhatsApp: waCounts?.unread_wa || 0,
          pendingWhatsAppEnquiries: waCounts?.pending_enquiries || 0,
        },
        orders: orders.map((o) => {
          const meta = REPAIR_STATUSES[o.current_status] || REPAIR_STATUSES.RECEIVED;
          return {
            id: o.id,
            serviceId: o.customer_phone, // Prompt requirement: Display normalized customer phone number as Service ID
            trackingId: o.tracking_id,
            deviceBrand: o.device_brand,
            deviceModel: o.device_model,
            repairCategory: o.repair_category,
            reportedIssue: o.reported_issue,
            currentStatus: o.current_status,
            statusLabel: meta.label,
            badgeClass: meta.badgeClass,
            stepIndex: meta.stepIndex,
            pickupReady: o.pickup_ready === 1,
            serviceCost: o.service_cost,
            amount: o.service_cost ? `₹${Number(o.service_cost).toLocaleString("en-IN")}` : "₹0",
            paid: o.paid === 1,
            isArchived: o.is_archived === 1,
            archivedAt: o.archived_at || null,
            archiveReason: o.archive_reason || null,
            preferredBookingDate: o.preferred_booking_date || null,
            preferredContactMethod: o.preferred_contact_method || "whatsapp",
            type: o.customer_type || (o.source === "ADMIN_CREATED" ? "Dealer" : "Customer"),
            due: o.estimated_completion || "Today",
            estimatedCompletion: o.estimated_completion,
            source: o.source === "ADMIN_CREATED" ? "ADMIN_CREATED" : "CUSTOMER_WEBSITE",
            createdAt: o.created_at,
            updatedAt: o.updated_at,
            customer: {
              id: o.customer_id,
              name: o.customer_name,
              phone: o.customer_phone,
              location: o.customer_location || "Gandhinagar",
            },
          };
        }),
        customers: customersSummary,
        devices: deviceStats,
        parts: partsStats,
        pagination: {
          page,
          limit,
          total: filteredCount,
          totalPages: Math.ceil(filteredCount / limit) || 1,
        },
      },
    });
  } catch (err) {
    console.error("[ADMIN_ORDERS_DATABASE_ERROR]", err);
    return NextResponse.json(
      { success: false, error: "Database Connection Error: Unable to query real repair orders from SQLite database." },
      { status: 503 }
    );
  }
}

// ── POST /api/admin/orders (Create Real Order in Database Atomically) ──
export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Admin session required." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      customerLocation,
      deviceBrand,
      deviceModel,
      imeiSerial,
      repairCategory,
      reportedIssue,
      inspectionNotes,
      estimatedCompletion,
      serviceCost,
      amount,
      customerType,
      type,
      paid = false,
      consentWhatsApp = true,
    } = body;

    const finalCost = serviceCost 
      ? Number(serviceCost) 
      : (amount ? Number(String(amount).replace(/[^0-9.]/g, "")) : null);
    const finalType = (customerType || type || "Customer") === "Dealer" ? "Dealer" : "Customer";
    const finalPaid = (paid === true || paid === 1 || paid === "true" || paid === "paid") ? 1 : 0;

    // Strict Validations
    if (!customerName || typeof customerName !== "string" || customerName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Customer name must be at least 2 characters." },
        { status: 400 }
      );
    }

    const cleanPhone = String(customerPhone || "").replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: "Customer phone number must contain at least 10 digits." },
        { status: 400 }
      );
    }

    if (!deviceBrand || !deviceModel || !repairCategory || !reportedIssue) {
      return NextResponse.json(
        { success: false, error: "Device brand, model, repair category, and reported issue are required." },
        { status: 400 }
      );
    }

    // Atomic Transaction: Customer -> Order -> Status History -> Audit Log
    const result = await runInTransaction(async (db) => {
      // 1. Use customer mobile number as Tracking ID & Service ID
      const trackingId = cleanPhone;

      // Find or create customer
      let customerId: number;
      const existingCustomer = (await db.prepare("SELECT id, location, email FROM customer_records WHERE phone = ?").get(cleanPhone)) as
        | { id: number; location: string | null; email: string | null }
        | undefined;

      if (existingCustomer) {
        customerId = existingCustomer.id;
        const finalLoc = customerLocation?.trim() || existingCustomer.location;
        const finalMail = customerEmail?.trim() || existingCustomer.email;
        await db.prepare(`
          UPDATE customer_records 
          SET name = ?, location = ?, email = ?, updated_at = datetime('now')
          WHERE id = ?
        `).run(customerName.trim(), finalLoc, finalMail, customerId);
      } else {
        const insertCustomer = await db.prepare(`
          INSERT INTO customer_records (name, phone, location, email, consent_whatsapp, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `).run(
          customerName.trim(),
          cleanPhone,
          customerLocation?.trim() || "Gandhinagar",
          customerEmail?.trim() || null,
          consentWhatsApp ? 1 : 0
        );
        customerId = Number(insertCustomer.lastInsertRowid);
      }

      // Insert Repair Order with source = 'ADMIN_CREATED'
      const insertOrder = await db.prepare(`
        INSERT INTO repair_orders (
          tracking_id, customer_id, device_brand, device_model, imei_serial,
          repair_category, reported_issue, inspection_notes, estimated_completion,
          service_cost, current_status, pickup_ready, source, customer_type, paid, is_archived, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'RECEIVED', 0, 'ADMIN_CREATED', ?, ?, 0, datetime('now'), datetime('now'))
      `).run(
        trackingId,
        customerId,
        deviceBrand.trim(),
        deviceModel.trim(),
        imeiSerial?.trim() || null,
        repairCategory.trim(),
        reportedIssue.trim(),
        inspectionNotes?.trim() || null,
        estimatedCompletion?.trim() || null,
        finalCost,
        finalType,
        finalPaid
      );

      const orderId = Number(insertOrder.lastInsertRowid);

      // Create Initial Status History (RECEIVED)
      await db.prepare(`
        INSERT INTO repair_status_history (
          order_id, previous_status, new_status, customer_note, internal_note, updated_by_admin_id, created_at
        ) VALUES (?, NULL, 'RECEIVED', 'Device checked in at Gandhinagar Technical Center.', ?, ?, datetime('now'))
      `).run(orderId, inspectionNotes?.trim() || "Initial intake inspection completed.", admin.adminId);

      // Audit Log
      await db.prepare(`
        INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details, created_at)
        VALUES (?, 'CREATE_ORDER', 'repair_orders', ?, ?, datetime('now'))
      `).run(
        admin.adminId,
        String(orderId),
        JSON.stringify({ trackingId, customerPhone: cleanPhone, deviceBrand, deviceModel })
      );

      return { orderId, trackingId, customerId };
    });

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const trackingUrl = `${protocol}://${host}/track?id=${result.trackingId}`;

    const whatsAppUrl = generateManualWhatsAppUrl("REGISTERED", {
      orderId: result.orderId,
      customerName: customerName.trim(),
      customerPhone: cleanPhone,
      trackingId: result.trackingId,
      deviceModel: `${deviceBrand} ${deviceModel}`,
      status: "RECEIVED",
      baseUrl: `${protocol}://${host}`,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          orderId: result.orderId,
          trackingId: result.trackingId,
          trackingUrl,
          whatsAppUrl,
          customerName: customerName.trim(),
          deviceModel: `${deviceBrand} ${deviceModel}`,
          source: "ADMIN_CREATED",
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[ADMIN_CREATE_ORDER_DATABASE_ERROR]", err);
    return NextResponse.json(
      { success: false, error: "Database transaction failed while creating repair order." },
      { status: 500 }
    );
  }
}
