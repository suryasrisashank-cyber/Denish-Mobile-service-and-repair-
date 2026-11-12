// DENISH MOBILE REPAIRING AND SERVICE
// Order Tracking by Tracking Reference (DMR-YYMMDD-XXXX / DEN-...) or Exact 10-Digit Mobile
// Strict zero PII leakage: masks customer name, never exposes raw phone or internal admin notes

import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60_000 });
    return true;
  }
  if (entry.count >= 30) return false;
  entry.count += 1;
  return true;
}

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
  request: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { success: false, error: "Too many lookup requests. Please try again in a minute." },
      { status: 429 }
    );
  }

  try {
    const rawId = decodeURIComponent(params.serviceId || "").trim();
    const cleanId = rawId.toUpperCase();
    const digitsCandidate = rawId.replace(/\D/g, "");
    const isPhoneQuery = /^[0-9+\-\s()]{10,15}$/.test(rawId) && digitsCandidate.length >= 10;
    const phone10 = isPhoneQuery ? digitsCandidate.slice(-10) : "";

    if (!cleanId || cleanId.length < 4) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid repair reference (e.g. DMR-261112-XXXX) or 10-digit mobile number." },
        { status: 400 }
      );
    }

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
          o.estimated_completion,
          o.current_status,
          o.pickup_ready,
          o.created_at,
          o.updated_at,
          c.name as customer_name,
          (
            SELECT h.customer_note
            FROM repair_status_history h
            WHERE h.order_id = o.id
            ORDER BY h.id DESC
            LIMIT 1
          ) as latest_customer_note
        FROM repair_orders o
        JOIN customer_records c ON o.customer_id = c.id
        WHERE o.is_archived = 0
          AND (
            UPPER(o.tracking_id) = ?
            OR (? = 1 AND c.phone = ?)
          )
        ORDER BY o.id DESC
        LIMIT 10`
      )
      .all(cleanId, isPhoneQuery ? 1 : 0, phone10) as Array<{
      id: number;
      tracking_id: string;
      device_brand: string;
      device_model: string;
      repair_category: string;
      reported_issue: string;
      estimated_completion: string | null;
      current_status: string;
      pickup_ready: number;
      created_at: string;
      updated_at: string;
      customer_name: string;
      latest_customer_note: string | null;
    }>;

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        serviceId: cleanId,
        found: false,
        orders: [],
        message: "No active repair orders found for this reference.",
      });
    }

    const formattedOrders = rows.map((r) => {
      let uiStatus: "Pending" | "In Progress" | "Completed" | "Cancelled" = "Pending";
      if (
        r.current_status === "COMPLETED" ||
        r.current_status === "READY_FOR_PICKUP" ||
        r.current_status === "DELIVERED"
      ) {
        uiStatus = "Completed";
      } else if (
        r.current_status === "UNDER_INSPECTION" ||
        r.current_status === "WAITING_FOR_APPROVAL" ||
        r.current_status === "WAITING_FOR_PARTS" ||
        r.current_status === "REPAIRING" ||
        r.current_status === "QUALITY_CHECK"
      ) {
        uiStatus = "In Progress";
      } else if (r.current_status === "CANCELLED") {
        uiStatus = "Cancelled";
      }

      return {
        id: r.tracking_id,
        serviceId: r.tracking_id,
        customerName: maskCustomerName(r.customer_name),
        phone: "**********",
        brand: r.device_brand,
        model: r.device_model,
        serviceType: r.repair_category,
        issueDescription: r.reported_issue,
        estimatedPrice: undefined,
        status: uiStatus,
        adminMessage:
          r.latest_customer_note ||
          "Your repair request has been registered and is queued with our workshop technician.",
        adminUpdatedAt: r.updated_at,
        createdAt: r.created_at,
        source: "website" as const,
      };
    });

    return NextResponse.json(
      {
        serviceId: cleanId,
        found: true,
        orders: formattedOrders,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err: unknown) {
    console.error("[API_ORDER_TRACK] Error:", err);
    return NextResponse.json({ success: false, error: "Database query failed" }, { status: 500 });
  }
}
