// DENISH MOBILE REPAIRING AND SERVICE
// Customer Service Request Intake API
// Endpoint: /api/requests

import { NextRequest, NextResponse } from "next/server";
import { runInTransaction } from "@/lib/db";
import { generateSecureTrackingId } from "@/lib/trackingId";
import { SYSTEM_CONFIG } from "@/lib/constants";

// ── In-Memory Rate Limiting & Anti-Duplicate Bucket ──
interface RateLimitEntry {
  timestamps: number[];
  lastHash?: string;
  lastHashTime?: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 25;

function checkRateLimit(clientIp: string, submissionHash: string): { allowed: boolean; reason?: string } {
  const now = Date.now();
  let entry = rateLimitMap.get(clientIp);
  if (!entry) {
    entry = { timestamps: [] };
    rateLimitMap.set(clientIp, entry);
  }

  // Filter out timestamps outside window
  entry.timestamps = entry.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  // Check rate limit
  if (entry.timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, reason: "Too many requests. Please wait a moment before trying again." };
  }

  // Prevent immediate duplicate submissions (within 10 seconds with same payload hash)
  if (entry.lastHash === submissionHash && entry.lastHashTime && now - entry.lastHashTime < 10000) {
    return { allowed: false, reason: "Duplicate submission detected. Please wait a few seconds." };
  }

  entry.timestamps.push(now);
  entry.lastHash = submissionHash;
  entry.lastHashTime = now;
  return { allowed: true };
}

function sanitize(input?: unknown, maxLength: number = 250): string {
  if (!input || typeof input !== "string") return "";
  return input
    .slice(0, maxLength)
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .trim();
}

export async function POST(request: NextRequest) {
  // 1. IP Resolution
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : realIp || "127.0.0.1";

  try {
    const rawBody = await request.json().catch(() => null);
    if (!rawBody || typeof rawBody !== "object") {
      return NextResponse.json({ success: false, error: "Invalid JSON payload." }, { status: 400 });
    }

    const body = rawBody as Record<string, unknown>;

    // Support flexible naming between frontend forms (name/customerName, issue/repairCategory, etc.)
    const name = sanitize(body.name || body.customerName, 70);
    const rawPhone = String(body.phone || body.customerPhone || "");
    const cleanPhone = rawPhone.replace(/\D/g, "").slice(0, 15);
    const location = sanitize(body.location || body.customerLocation || "Gandhinagar", 100);
    let deviceBrand = sanitize(body.deviceBrand || body.brand, 50);
    let deviceModel = sanitize(body.deviceModel || body.model, 60);
    let repairCategory = sanitize(body.repairCategory || body.issue || body.serviceType, 80);
    const customBrand = sanitize(body.customBrand || body.otherBrand, 60);
    const customIssue = sanitize(body.customIssue || body.otherIssue, 120);

    // Support "Other" brand & custom issue inputs seamlessly
    if ((deviceBrand === "Other" || deviceBrand.toLowerCase().includes("other")) && customBrand) {
      deviceBrand = customBrand;
    }
    if ((repairCategory === "Other" || repairCategory.toLowerCase().includes("other")) && customIssue) {
      repairCategory = customIssue;
    }
    if (!deviceModel && customBrand) {
      deviceModel = customBrand;
    } else if (!deviceModel) {
      deviceModel = `${deviceBrand || "Smartphone"} Handset`;
    }

    const problemDescription = sanitize(
      body.problemDescription || body.description || body.problem || body.reportedIssue || body.issueDescription || customIssue || "Diagnostic check requested",
      1000
    );
    const preferredContact = body.preferredContact === "phone" ? "phone" : "whatsapp";

    // 2. Strict Validations
    if (!name || name.length < 2) {
      return NextResponse.json(
        { success: false, error: "Please provide your full name (minimum 2 characters)." },
        { status: 400 }
      );
    }

    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit mobile phone number." },
        { status: 400 }
      );
    }

    if (!deviceBrand) {
      return NextResponse.json(
        { success: false, error: "Please select your smartphone brand." },
        { status: 400 }
      );
    }

    if (!deviceModel || deviceModel.length < 2) {
      return NextResponse.json(
        { success: false, error: "Please enter your device model (e.g. Vivo V29, iPhone 14)." },
        { status: 400 }
      );
    }

    if (!repairCategory) {
      return NextResponse.json(
        { success: false, error: "Please select the required repair service category." },
        { status: 400 }
      );
    }

    // 3. Anti-Spam / Rate-limiting check
    const payloadHash = `${clientIp}_${cleanPhone}_${deviceModel}`;
    const rateCheck = checkRateLimit(clientIp, payloadHash);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: rateCheck.reason || "Too many requests. Please wait a moment." },
        { status: 429 }
      );
    }

    // 4. Atomic Database Transaction: Save customer, generate ID, save order, add initial status
    const result = runInTransaction((txDb) => {
      // Step A: Find existing customer by phone or create new record
      let customerId: number;
      const existingCustomer = txDb
        .prepare("SELECT id FROM customer_records WHERE phone = ? ORDER BY id DESC LIMIT 1")
        .get(cleanPhone) as { id: number } | undefined;

      if (existingCustomer) {
        customerId = existingCustomer.id;
        // Update customer location and name if updated
        txDb
          .prepare(
            "UPDATE customer_records SET name = ?, location = COALESCE(?, location), updated_at = datetime('now') WHERE id = ?"
          )
          .run(name, location, customerId);
      } else {
        const insertCustomer = txDb.prepare(`
          INSERT INTO customer_records (name, phone, location, consent_whatsapp, created_at, updated_at)
          VALUES (?, ?, ?, 1, datetime('now'), datetime('now'))
        `);
        const info = insertCustomer.run(name, cleanPhone, location);
        customerId = Number(info.lastInsertRowid);
      }

      // Step B: Generate unique random tracking ID with conflict handling
      let trackingId = "";
      let orderId = 0;
      let inserted = false;

      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          trackingId = generateSecureTrackingId(txDb, cleanPhone);
          const insertOrder = txDb.prepare(`
            INSERT INTO repair_orders (
              tracking_id, customer_id, device_brand, device_model,
              repair_category, reported_issue, inspection_notes, current_status,
              source, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, 'Registered via online customer portal.', 'NEW_REQUEST', 'CUSTOMER_WEBSITE', datetime('now'), datetime('now'))
          `);
          const info = insertOrder.run(
            trackingId,
            customerId,
            deviceBrand,
            deviceModel,
            repairCategory,
            problemDescription
          );
          orderId = Number(info.lastInsertRowid);
          inserted = true;
          break;
        } catch (dbErr: unknown) {
          // Check for unique constraint collision and retry
          const errMsg = dbErr instanceof Error ? dbErr.message : String(dbErr);
          if (errMsg.includes("UNIQUE constraint failed")) {
            continue;
          }
          throw dbErr;
        }
      }

      if (!inserted || !orderId) {
        throw new Error("Failed to assign a unique tracking ID after multiple attempts.");
      }

      // Step C: Create initial status history entry
      txDb.prepare(`
        INSERT INTO repair_status_history (
          order_id, previous_status, new_status, customer_note, internal_note, created_at
        ) VALUES (?, NULL, 'NEW_REQUEST', 'Online service request registered and queued for technical intake.', 'Auto-registered from customer website form.', datetime('now'))
      `).run(orderId);

      // Step D: Create genuine Admin Notification for new service request
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
        `Customer ${name} registered ${deviceBrand} ${deviceModel} for ${repairCategory}.`,
        orderId,
        trackingId,
        name,
        cleanPhone
      );

      return { orderId, trackingId, customerId };
    });

    // 5. Build official WhatsApp Click-to-Chat URL
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    const trackingUrl = `${protocol}://${host}/track?id=${encodeURIComponent(result.trackingId)}`;

    // Standardized Message according to Priority 3:
    const whatsAppMessage = 
`Hello DENISH MOBILE REPAIRING AND SERVICE,

I have submitted a mobile repair request.

Tracking ID: ${result.trackingId}
Customer: ${name}
Phone: ${cleanPhone}
Location: ${location}
Device: ${deviceBrand} ${deviceModel}
Service: ${repairCategory}
Problem: ${problemDescription}

Track my service:
${trackingUrl}`;

    const whatsAppUrl = `https://wa.me/${SYSTEM_CONFIG.whatsappNumber}?text=${encodeURIComponent(whatsAppMessage)}`;

    return NextResponse.json(
      {
        success: true,
        trackingId: result.trackingId,
        trackingUrl,
        whatsAppUrl,
        data: {
          orderId: result.orderId,
          trackingId: result.trackingId,
          customerName: name,
          customerPhone: cleanPhone,
          location,
          deviceBrand,
          deviceModel,
          repairCategory,
          problemDescription,
          currentStatus: "NEW_REQUEST",
          preferredContact,
          trackingUrl,
          whatsAppUrl,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[CUSTOMER_REQUEST_API_ERROR]", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while saving your service request. Please try again." },
      { status: 500 }
    );
  }
}
