// DENISH MOBILE REPAIRING AND SERVICE
// Orders API - Full SQLite Integration
// Supports BookingForm from Customer Website & AdminPortal
// Strictly genuine orders: source = CUSTOMER_WEBSITE or ADMIN_CREATED

import { NextRequest, NextResponse } from "next/server";
import { runInTransaction, getDatabase } from "@/lib/db";
import { generateSecureTrackingId } from "@/lib/trackingId";

function sanitize(input?: unknown, maxLength: number = 250): string {
  if (!input || typeof input !== "string") return "";
  return input
    .slice(0, maxLength)
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .trim();
}

function normalizePhone(phone: string): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json().catch(() => null);
    if (!rawBody || typeof rawBody !== "object") {
      return NextResponse.json({ success: false, error: "Invalid booking payload." }, { status: 400 });
    }

    const body = rawBody as Record<string, unknown>;
    const customerName = sanitize(body.customerName || body.name, 80);
    const rawPhone = String(body.phone || body.customerPhone || "");
    const cleanPhone = normalizePhone(rawPhone);
    let brand = sanitize(body.brand || body.deviceBrand, 60);
    const customBrand = sanitize(body.customBrand || body.otherBrand, 60);
    if ((brand.toLowerCase().includes("other") || brand === "Other") && customBrand) {
      brand = customBrand;
    }
    const model = sanitize(body.model || body.deviceModel, 80);
    let serviceType = sanitize(body.serviceType || body.repairCategory, 80);
    const customService = sanitize(body.customService || body.customIssue, 80);
    if ((serviceType.toLowerCase().includes("other") || serviceType === "Other") && customService) {
      serviceType = customService;
    }
    const issueDescription = sanitize(body.issueDescription || body.problemDescription, 1000) || "Customer requested inspection & component replacement.";
    const estimatedPrice = sanitize(body.estimatedPrice, 60);

    if (!customerName || customerName.length < 2) {
      return NextResponse.json({ success: false, error: "Please enter your full name (at least 2 characters)." }, { status: 400 });
    }
    if (cleanPhone.length < 10) {
      return NextResponse.json({ success: false, error: "Please enter a valid 10-digit mobile number." }, { status: 400 });
    }
    if (!brand) {
      return NextResponse.json({ success: false, error: "Please select your device brand." }, { status: 400 });
    }
    if (!model || model.length < 2) {
      return NextResponse.json({ success: false, error: "Please enter your smartphone model." }, { status: 400 });
    }

    const result = runInTransaction((db) => {
      // 1. Upsert customer record
      let customer = db
        .prepare("SELECT id, name, phone FROM customer_records WHERE phone = ?")
        .get(cleanPhone) as { id: number; name: string; phone: string } | undefined;

      if (!customer) {
        const insertCustomer = db
          .prepare(
            `INSERT INTO customer_records (name, phone, location, consent_whatsapp, notes, created_at, updated_at)
             VALUES (?, ?, ?, 1, ?, datetime('now'), datetime('now'))`
          )
          .run(customerName, cleanPhone, "Gandhinagar", "Website Booking Desk");
        customer = { id: Number(insertCustomer.lastInsertRowid), name: customerName, phone: cleanPhone };
      } else {
        db.prepare(
          "UPDATE customer_records SET name = ?, updated_at = datetime('now') WHERE id = ?"
        ).run(customerName, customer.id);
      }

      // 2. Generate secure tracking ID
      const trackingId = generateSecureTrackingId(db, cleanPhone);

      // 3. Insert repair order with explicit source CUSTOMER_WEBSITE
      const insertOrder = db
        .prepare(
          `INSERT INTO repair_orders (
             tracking_id, customer_id, device_brand, device_model,
             repair_category, reported_issue, inspection_notes,
             current_status, pickup_ready, source, customer_type, paid, is_archived,
             created_at, updated_at
           ) VALUES (
             ?, ?, ?, ?,
             ?, ?, ?,
             'NEW_REQUEST', 0, 'CUSTOMER_WEBSITE', 'Customer', 0, 0,
             datetime('now'), datetime('now')
           )`
        )
        .run(
          trackingId,
          customer.id,
          brand,
          model,
          serviceType,
          issueDescription,
          estimatedPrice ? `Estimated: ${estimatedPrice}` : "Registered via customer website booking."
        );

      const orderId = Number(insertOrder.lastInsertRowid);

      // 4. Record initial status history in repair_status_history
      db.prepare(
        `INSERT INTO repair_status_history (
           order_id, previous_status, new_status, customer_note, internal_note, created_at
         ) VALUES (?, NULL, 'NEW_REQUEST', 'Online service request registered and queued for technical intake.', 'Auto-registered from customer website form.', datetime('now'))`
      ).run(orderId);

      // 5. Send automated notification to admin portal
      db.prepare(
        `INSERT INTO admin_notifications (
           type, title, message, order_id, tracking_id, customer_name, customer_phone, is_read, created_at
         ) VALUES (
           'SERVICE_REQUEST',
           'New Service Request',
           ?,
           ?,
           ?,
           ?,
           ?,
           0,
           datetime('now')
         )`
      ).run(
        `Customer ${customerName} registered ${brand} ${model} for ${serviceType}.`,
        orderId,
        trackingId,
        customerName,
        cleanPhone
      );

      return {
        orderId,
        trackingId,
        customerName,
        phone: cleanPhone,
        brand,
        model,
        serviceType,
        issueDescription,
        estimatedPrice,
        createdAt: new Date().toISOString()
      };
    });

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    const trackingUrl = `${protocol}://${host}/track?id=${encodeURIComponent(result.trackingId)}`;

    const formattedOrder = {
      id: result.trackingId,
      trackingId: result.trackingId,
      serviceId: result.phone,
      customerName: result.customerName,
      phone: result.phone,
      brand: result.brand,
      model: result.model,
      serviceType: result.serviceType,
      issueDescription: result.issueDescription,
      trackingUrl,
      status: "Pending" as const,
      adminMessage: "Your repair request has been registered at our workshop counter. Technician diagnosis will begin shortly.",
      adminUpdatedAt: result.createdAt,
      createdAt: result.createdAt,
      source: "website" as const
    };

    return NextResponse.json(
      {
        success: true,
        order: formattedOrder,
        trackingId: result.trackingId,
        trackingUrl,
        serviceId: result.phone,
        message: "Repair booking created successfully"
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[API_ORDERS] Error creating booking:", error);
    return NextResponse.json({ success: false, error: "Unable to process booking. Please try again." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = getDatabase();
    const rows = db.prepare(`
      SELECT 
        o.id,
        o.tracking_id,
        o.device_brand,
        o.device_model,
        o.repair_category,
        o.reported_issue,
        o.current_status,
        o.service_cost,
        o.created_at,
        c.name as customer_name,
        c.phone as customer_phone
      FROM repair_orders o
      JOIN customer_records c ON o.customer_id = c.id
      WHERE o.is_archived = 0
      ORDER BY o.id DESC
      LIMIT 100
    `).all() as Array<{
      id: number;
      tracking_id: string;
      device_brand: string;
      device_model: string;
      repair_category: string;
      reported_issue: string;
      current_status: string;
      service_cost: number | null;
      created_at: string;
      customer_name: string;
      customer_phone: string;
    }>;

    const orders = rows.map((r) => ({
      id: r.tracking_id,
      trackingId: r.tracking_id,
      serviceId: r.customer_phone,
      customerName: r.customer_name,
      phone: r.customer_phone,
      brand: r.device_brand,
      model: r.device_model,
      serviceType: r.repair_category,
      issueDescription: r.reported_issue,
      status: r.current_status === "COMPLETED" || r.current_status === "READY_FOR_PICKUP" ? "Completed" : r.current_status === "REPAIRING" ? "In Progress" : "Pending",
      createdAt: r.created_at,
      source: "website"
    }));

    return NextResponse.json({ success: true, orders });
  } catch (err: unknown) {
    console.error("[API_ORDERS] GET error:", err);
    return NextResponse.json({ success: false, error: "Database query failed" }, { status: 500 });
  }
}
