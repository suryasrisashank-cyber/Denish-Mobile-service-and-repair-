// DENISH MOBILE REPAIRING AND SERVICE
// Orders API - Full SQLite Integration
// Supports BookingForm from Customer Website & Admin Operations

import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { handleCreateBookingRequest } from "@/lib/booking-service";

export async function POST(request: NextRequest) {
  return handleCreateBookingRequest(request, { successStatus: 201 });
}

export async function GET(request: NextRequest) {
  // Customer PII must NEVER be exposed without verified admin authentication
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Admin authentication required." },
      { status: 401 }
    );
  }

  try {
    const db = getDatabase();
    const rows = db
      .prepare(
        `SELECT 
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
        LIMIT 100`
      )
      .all() as Array<{
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
      status:
        r.current_status === "COMPLETED" || r.current_status === "READY_FOR_PICKUP"
          ? "Completed"
          : r.current_status === "REPAIRING"
          ? "In Progress"
          : "Pending",
      createdAt: r.created_at,
      source: "website",
    }));

    return NextResponse.json({ success: true, orders });
  } catch (err: unknown) {
    console.error("[API_ORDERS] GET error:", err);
    return NextResponse.json({ success: false, error: "Database query failed" }, { status: 500 });
  }
}
