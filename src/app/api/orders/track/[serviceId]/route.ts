// DENISH MOBILE REPAIRING AND SERVICE
// Order Tracking by Phone / Service ID / Tracking ID
// Strict zero PII leakage: masks customer name, exposes no raw phone numbers

import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

function maskCustomerName(fullName: string): string {
  if (!fullName) return "Valued Customer";
  const parts = fullName.trim().split(/\s+/);
  return parts
    .map((part) => {
      if (part.length <= 1) return part;
      if (part.length === 2) return part[0] + "*";
      return part[0] + "*".repeat(part.length - 2) + part[part.length - 1];
    })
    .join(" ");
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  try {
    const rawId = params.serviceId || "";
    const cleanDigits = rawId.replace(/\D/g, "");
    const cleanId = rawId.trim().toUpperCase();

    if (!cleanDigits && !cleanId) {
      return NextResponse.json({ success: false, error: "Please provide a valid tracking ID or phone number." }, { status: 400 });
    }

    const db = getDatabase();

    // Query either by 10-digit phone number or by tracking_id
    const rows = db.prepare(`
      SELECT 
        o.id,
        o.tracking_id,
        o.device_brand,
        o.device_model,
        o.repair_category,
        o.reported_issue,
        o.inspection_notes,
        o.estimated_completion,
        o.service_cost,
        o.current_status,
        o.pickup_ready,
        o.created_at,
        o.updated_at,
        c.name as customer_name,
        c.phone as customer_phone
      FROM repair_orders o
      JOIN customer_records c ON o.customer_id = c.id
      WHERE o.tracking_id = ? 
         OR c.phone = ? 
         OR c.phone LIKE ?
      ORDER BY o.id DESC
      LIMIT 10
    `).all(cleanId, cleanDigits, `%${cleanDigits}%`) as Array<{
      id: number;
      tracking_id: string;
      device_brand: string;
      device_model: string;
      repair_category: string;
      reported_issue: string;
      inspection_notes: string | null;
      estimated_completion: string | null;
      service_cost: number | null;
      current_status: string;
      pickup_ready: number;
      created_at: string;
      updated_at: string;
      customer_name: string;
      customer_phone: string;
    }>;

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        serviceId: cleanId,
        found: false,
        orders: [],
        message: "No active repair orders found for this reference."
      });
    }

    const formattedOrders = rows.map((r) => {
      let uiStatus: "Pending" | "In Progress" | "Completed" | "Cancelled" = "Pending";
      if (r.current_status === "COMPLETED" || r.current_status === "READY_FOR_PICKUP" || r.current_status === "DELIVERED") {
        uiStatus = "Completed";
      } else if (r.current_status === "REPAIRING" || r.current_status === "QUALITY_CHECK" || r.current_status === "WAITING_FOR_PARTS") {
        uiStatus = "In Progress";
      } else if (r.current_status === "CANCELLED") {
        uiStatus = "Cancelled";
      }

      return {
        id: r.tracking_id,
        serviceId: r.tracking_id,
        customerName: maskCustomerName(r.customer_name),
        phone: "**********", // Never expose PII
        brand: r.device_brand,
        model: r.device_model,
        serviceType: r.repair_category,
        issueDescription: r.reported_issue,
        estimatedPrice: undefined,
        status: uiStatus,
        adminMessage: r.inspection_notes || "Device received and registered at workshop counter.",
        adminUpdatedAt: r.updated_at,
        createdAt: r.created_at,
        source: "website" as const
      };
    });

    return NextResponse.json({
      serviceId: cleanId,
      found: true,
      orders: formattedOrders
    });
  } catch (err: unknown) {
    console.error("[API_ORDER_TRACK] Error:", err);
    return NextResponse.json({ success: false, error: "Database query failed" }, { status: 500 });
  }
}
