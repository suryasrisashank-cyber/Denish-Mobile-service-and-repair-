import { NextResponse } from "next/server";
import { runInTransaction } from "@/lib/db";
import { generateSecureTrackingId } from "@/lib/trackingId";
import { SYSTEM_CONFIG } from "@/lib/constants";

export interface EnquiryPayload {
  name: string;
  phone: string;
  deviceBrand: string;
  deviceModel: string;
  issue: string;
  location?: string;
  description?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  preferredContact?: "whatsapp" | "phone";
}

// ── In-Memory Rate Limiting Bucket (Sliding Window) ──────────────────────────
// Limits: Max 5 submissions per 60 seconds per IP
interface RateLimitEntry {
  timestamps: number[];
}
const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

// Cleanup stale entries every 5 minutes to prevent memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    rateLimitMap.forEach((entry, ip) => {
      entry.timestamps = entry.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
      if (entry.timestamps.length === 0) {
        rateLimitMap.delete(ip);
      }
    });
  }, 5 * 60 * 1000);
}

function checkRateLimit(clientIp: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  let entry = rateLimitMap.get(clientIp);

  if (!entry) {
    entry = { timestamps: [] };
    rateLimitMap.set(clientIp, entry);
  }

  // Filter out timestamps outside the active window
  entry.timestamps = entry.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  if (entry.timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldestTimestamp = entry.timestamps[0];
    const retryAfter = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldestTimestamp)) / 1000);
    return { allowed: false, retryAfter: Math.max(1, retryAfter) };
  }

  entry.timestamps.push(now);
  return { allowed: true };
}

// ── String Sanitization & XSS Mitigation ─────────────────────────────────────
function sanitizeInput(input?: string, maxLength: number = 250): string {
  if (!input || typeof input !== "string") return "";
  return input
    .slice(0, maxLength)
    .replace(/[<>]/g, "") // Strip raw angle brackets preventing HTML/script tags
    .replace(/javascript:/gi, "") // Neutralize javascript: pseudo-protocol
    .trim();
}

export async function POST(request: Request) {
  try {
    // 1. Origin / Host Validation (CORS & CSRF Defense)
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    if (origin && host) {
      try {
        const originUrl = new URL(origin);
        // Allow same-host or localhost for development
        const isSameHost = originUrl.host === host || host.includes("localhost") || host.includes("127.0.0.1");
        if (!isSameHost && !originUrl.host.includes("denish-mobile-repair")) {
          return NextResponse.json(
            { success: false, error: "Cross-origin submission rejected." },
            { status: 403 }
          );
        }
      } catch {
        // Invalid origin URL format
      }
    }

    // 2. Client IP Resolution & Rate Limiting
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : realIp || "127.0.0.1";

    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many repair enquiries submitted. Please wait a moment before trying again.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateCheck.retryAfter || 60),
          },
        }
      );
    }

    // 3. Payload Parsing & Size Limit Guard
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Malformed JSON payload." },
        { status: 400 }
      );
    }

    if (!rawBody || typeof rawBody !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid payload format." },
        { status: 400 }
      );
    }

    const body = rawBody as Record<string, unknown>;

    // 4. Strict Field Validation and Sanitization
    const name = sanitizeInput(String(body.name || ""), 60);
    if (!name || name.length < 2) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid full name." },
        { status: 400 }
      );
    }

    const rawPhone = String(body.phone || "");
    const cleanPhone = rawPhone.replace(/\D/g, "").slice(0, 15);
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    let deviceBrand = sanitizeInput(String(body.deviceBrand || ""), 50);
    const customBrand = sanitizeInput(String(body.customBrand || body.otherBrand || ""), 60);
    const customIssue = sanitizeInput(String(body.customIssue || body.otherIssue || ""), 120);

    if ((deviceBrand === "Other" || deviceBrand.toLowerCase().includes("other")) && customBrand) {
      deviceBrand = customBrand;
    }

    if (!deviceBrand || deviceBrand.length === 0) {
      return NextResponse.json(
        { success: false, error: "Please select your device brand." },
        { status: 400 }
      );
    }

    let deviceModel = sanitizeInput(String(body.deviceModel || ""), 60);
    if (!deviceModel && customBrand) {
      deviceModel = customBrand;
    }
    if (!deviceModel || deviceModel.length < 2) {
      return NextResponse.json(
        { success: false, error: "Please enter your device model (e.g., iPhone 13, Galaxy S21)." },
        { status: 400 }
      );
    }

    let issue = sanitizeInput(String(body.issue || ""), 80);
    if ((issue === "Other" || issue.toLowerCase().includes("other")) && customIssue) {
      issue = customIssue;
    }
    if (!issue || issue.length === 0) {
      return NextResponse.json(
        { success: false, error: "Please select the repair service needed." },
        { status: 400 }
      );
    }

    const location = sanitizeInput(String(body.location || body.customerLocation || "Gandhinagar"), 100);
    const description = sanitizeInput(String(body.description || ""), 1000);
    const appointmentDate = sanitizeInput(String(body.appointmentDate || ""), 30);
    const appointmentTime = sanitizeInput(String(body.appointmentTime || ""), 30);
    const preferredContact = body.preferredContact === "phone" ? "phone" : "whatsapp";

    const extraNotes = [
      appointmentDate ? `Preferred Date: ${appointmentDate}` : null,
      appointmentTime ? `Preferred Time: ${appointmentTime}` : null,
      preferredContact ? `Contact: ${preferredContact}` : null,
    ].filter(Boolean).join(" | ");

    const reportedProblem = [description, extraNotes].filter(Boolean).join("\n") || "Online diagnostic booking";

    // 5. Atomic Database Transaction: Save customer, generate ID, save order, add initial status
    const result = runInTransaction((txDb) => {
      let customerId: number;
      const existingCustomer = txDb
        .prepare("SELECT id FROM customer_records WHERE phone = ? ORDER BY id DESC LIMIT 1")
        .get(cleanPhone) as { id: number } | undefined;

      if (existingCustomer) {
        customerId = existingCustomer.id;
        txDb
          .prepare(
            "UPDATE customer_records SET name = ?, location = COALESCE(?, location), updated_at = datetime('now') WHERE id = ?"
          )
          .run(name, location, customerId);
      } else {
        const info = txDb
          .prepare("INSERT INTO customer_records (name, phone, location, consent_whatsapp, created_at, updated_at) VALUES (?, ?, ?, 1, datetime('now'), datetime('now'))")
          .run(name, cleanPhone, location);
        customerId = Number(info.lastInsertRowid);
      }

      let trackingId = "";
      let orderId = 0;
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          trackingId = generateSecureTrackingId(txDb, cleanPhone);
          const info = txDb
            .prepare(`
              INSERT INTO repair_orders (
                tracking_id, customer_id, device_brand, device_model,
                repair_category, reported_issue, inspection_notes, current_status,
                source, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, 'Registered via online customer enquiry.', 'NEW_REQUEST', 'CUSTOMER_WEBSITE', datetime('now'), datetime('now'))
            `)
            .run(trackingId, customerId, deviceBrand, deviceModel, issue, reportedProblem);
          orderId = Number(info.lastInsertRowid);
          break;
        } catch (dbErr: unknown) {
          const errMsg = dbErr instanceof Error ? dbErr.message : String(dbErr);
          if (errMsg.includes("UNIQUE constraint failed")) continue;
          throw dbErr;
        }
      }

      if (!orderId) throw new Error("Could not assign unique tracking ID");

      txDb.prepare(`
        INSERT INTO repair_status_history (order_id, previous_status, new_status, customer_note, internal_note, created_at)
        VALUES (?, NULL, 'NEW_REQUEST', 'Online service request registered and queued for technical intake.', 'Auto-registered from customer website form.', datetime('now'))
      `).run(orderId);

      // Create genuine Admin Notification for new service request
      txDb.prepare(`
        INSERT INTO admin_notifications (
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
        )
      `).run(
        `Customer ${name} registered ${deviceBrand} ${deviceModel} for ${issue}.`,
        orderId,
        trackingId,
        name,
        cleanPhone
      );

      return { orderId, trackingId, customerId };
    });

    const trackingId = result.trackingId;
    const referenceId = trackingId; // backward compatibility

    // 6. Host & URLs
    const appHost = host || "localhost:3000";
    const protocol = appHost.includes("localhost") || appHost.includes("127.0.0.1") ? "http" : "https";
    const trackingUrl = `${protocol}://${appHost}/track?id=${encodeURIComponent(trackingId)}`;

    // 7. Standardized WhatsApp message
    const whatsAppMessage = 
`Hello DENISH MOBILE REPAIRING AND SERVICE,

I have submitted a mobile repair request.

Tracking ID: ${trackingId}
Customer: ${name}
Phone: ${cleanPhone}
Location: ${location}
Device: ${deviceBrand} ${deviceModel}
Service: ${issue}
Problem: ${description || "Diagnostic check requested"}

Track my service:
${trackingUrl}`;

    const directWhatsAppUrl = `https://wa.me/${SYSTEM_CONFIG.whatsappNumber}?text=${encodeURIComponent(whatsAppMessage)}`;

    return NextResponse.json({
      success: true,
      referenceId,
      trackingId,
      trackingUrl,
      directWhatsAppUrl,
      data: {
        orderId: result.orderId,
        trackingId,
        referenceId,
        customerName: name,
        customerPhone: cleanPhone,
        location,
        deviceBrand,
        deviceModel,
        repairCategory: issue,
        trackingUrl,
        whatsAppUrl: directWhatsAppUrl,
      },
      message: "Enquiry successfully recorded in service database. You can track your repair progress or message our technician on WhatsApp.",
    });
  } catch {
    // Return sanitized generic message; do not leak stack traces or internal errors to untrusted clients
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while processing your enquiry. Please tap Call Now to contact us directly.",
      },
      { status: 500 }
    );
  }
}
