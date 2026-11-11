// Public Customer Tracking API
// Endpoint: /api/track/[trackingId]
// Security: Strict rate limiting, strict whitelisting (Zero PII or internal admin leaks)

import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { REPAIR_STATUSES, RepairStatus } from "@/lib/constants";
import { isValidTrackingId } from "@/lib/trackingId";

// In-memory IP rate limiter for public tracking queries (max 30 requests per minute per IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const client = rateLimitMap.get(ip);

  if (!client || now > client.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (client.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  client.count += 1;
  return true;
}

function maskCustomerName(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  return parts
    .map((p) => {
      if (p.length <= 1) return p;
      return p[0] + "*".repeat(Math.min(p.length - 1, 5));
    })
    .join(" ");
}

const TIMELINE_STAGES: Array<{ code: RepairStatus; label: string; stepIndex: number }> = [
  { code: "NEW_REQUEST", label: "Request Registered", stepIndex: 0 },
  { code: "RECEIVED", label: "Device Received", stepIndex: 1 },
  { code: "UNDER_INSPECTION", label: "Inspection & Diagnosis", stepIndex: 2 },
  { code: "WAITING_FOR_APPROVAL", label: "Customer Approval", stepIndex: 3 },
  { code: "WAITING_FOR_PARTS", label: "Spares Allocated", stepIndex: 3 },
  { code: "REPAIRING", label: "Bench Repair", stepIndex: 4 },
  { code: "QUALITY_CHECK", label: "Quality Testing", stepIndex: 5 },
  { code: "COMPLETED", label: "Repair Completed", stepIndex: 6 },
  { code: "READY_FOR_PICKUP", label: "Ready for Pickup", stepIndex: 7 },
];

export async function GET(
  request: NextRequest,
  { params }: { params: { trackingId: string } }
) {
  // 1. IP Rate Limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      {
        success: false,
        error: "Too many tracking requests. Please wait a minute before trying again.",
      },
      { status: 429 }
    );
  }

  const rawTrackingId = params.trackingId;

  // 2. Format Validation
  if (!isValidTrackingId(rawTrackingId)) {
    return NextResponse.json(
      {
        success: false,
        errorTitle: "Invalid Tracking ID",
        error: "We couldn't find a service request with this tracking ID. Please check the ID and try again.",
      },
      { status: 404 }
    );
  }

  const cleanTrackingId = rawTrackingId.trim().toUpperCase();
  const digitsOnly = cleanTrackingId.replace(/\D/g, "");
  const denPrefixed = cleanTrackingId.startsWith("DEN-") ? cleanTrackingId : `DEN-${cleanTrackingId}`;

  try {
    const db = getDatabase();

    // 3. Query Repair Order (Strict whitelist - NEVER select customer phone, address, internal notes or cost)
    // Matches by exact tracking_id, DEN-prefixed tracking_id, or customer phone (10 digits)
    interface DbOrderRow {
      id: number;
      tracking_id: string;
      device_brand: string;
      device_model: string;
      repair_category: string;
      reported_issue: string;
      estimated_completion: string | null;
      current_status: RepairStatus;
      pickup_ready: number;
      created_at: string;
      updated_at: string;
      customer_name: string;
    }

    const order = db.prepare(`
      SELECT 
        ro.id,
        ro.tracking_id,
        ro.device_brand,
        ro.device_model,
        ro.repair_category,
        ro.reported_issue,
        ro.estimated_completion,
        ro.current_status,
        ro.pickup_ready,
        ro.created_at,
        ro.updated_at,
        cr.name as customer_name
      FROM repair_orders ro
      JOIN customer_records cr ON ro.customer_id = cr.id
      WHERE (
        ro.tracking_id = ? 
        OR ro.tracking_id = ?
        OR (length(?) >= 10 AND cr.phone LIKE ?)
      )
      ORDER BY ro.id DESC
      LIMIT 1
    `).get(
      cleanTrackingId,
      denPrefixed,
      digitsOnly,
      `%${digitsOnly.slice(-10)}%`
    ) as DbOrderRow | undefined;

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          errorTitle: "Invalid Tracking ID",
          error: "We couldn't find a service request with this tracking ID. Please check the ID and try again.",
        },
        { status: 404 }
      );
    }

    // 4. Query Public Status History (ONLY customer_note is exposed, NEVER internal_note or admin IDs)
    interface DbHistoryRow {
      new_status: RepairStatus;
      customer_note: string | null;
      created_at: string;
    }

    const history = db.prepare(`
      SELECT 
        new_status,
        customer_note,
        created_at
      FROM repair_status_history
      WHERE order_id = ?
      ORDER BY id ASC
    `).all(order.id) as DbHistoryRow[];

    const statusMeta = REPAIR_STATUSES[order.current_status] || REPAIR_STATUSES.RECEIVED;

    // 5. Construct sanitized customer response
    const customerPayload = {
      trackingId: order.tracking_id,
      customerName: maskCustomerName(order.customer_name),
      deviceBrand: order.device_brand,
      deviceModel: order.device_model,
      repairCategory: order.repair_category,
      reportedIssue: order.reported_issue,
      currentStatus: order.current_status,
      statusLabel: statusMeta.label,
      statusDescription: statusMeta.customerDescription,
      stepIndex: statusMeta.stepIndex,
      badgeClass: statusMeta.badgeClass,
      dotColor: statusMeta.dotColor,
      pickupReady: order.pickup_ready === 1,
      receivedDate: order.created_at,
      lastUpdatedDate: order.updated_at,
      estimatedCompletionDate: order.estimated_completion || null,
      timeline: TIMELINE_STAGES.map((s) => ({
        code: s.code,
        label: s.label,
        stepIndex: s.stepIndex,
        isCurrent: order.current_status === s.code,
        isCompleted: statusMeta.stepIndex > s.stepIndex || ["COMPLETED", "READY_FOR_PICKUP", "DELIVERED"].includes(order.current_status),
      })),
      statusHistory: history.map((h) => {
        const meta = REPAIR_STATUSES[h.new_status] || REPAIR_STATUSES.RECEIVED;
        return {
          status: h.new_status,
          statusLabel: meta.label,
          customerNote: h.customer_note || null,
          timestamp: h.created_at,
        };
      }),
    };

    return NextResponse.json(
      {
        success: true,
        data: customerPayload,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (err) {
    console.error("[TRACK_API_ERROR]", err);
    return NextResponse.json(
      {
        success: false,
        errorTitle: "Service Unavailable",
        error: "Unable to check tracking status right now. Please try again.",
      },
      { status: 500 }
    );
  }
}
