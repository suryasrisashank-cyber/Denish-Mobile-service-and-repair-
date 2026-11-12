// DENISH MOBILE REPAIRING AND SERVICE
// Shared Customer Repair Booking Service (Server-Side Validation, Rate Limit, Dedup, Atomic DB Save)

import crypto from "crypto";
import { NextResponse } from "next/server";
import { runInTransaction } from "@/lib/db";
import { generateSecureTrackingId } from "@/lib/trackingId";
import { SYSTEM_CONFIG } from "@/lib/constants";

interface RateLimitEntry {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const recentHashMap = new Map<string, number>();

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;
const MEMORY_DEDUP_WINDOW_MS = 30 * 1000; // 30 seconds identical payload hash guard

export function sanitizeText(input: unknown, maxLength = 250): string {
  if (!input || typeof input !== "string") return "";
  return input
    .slice(0, maxLength)
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .trim();
}

export function normalizePhone10(raw: string): string {
  if (!raw || typeof raw !== "string") return "";
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length > 10 && digits.length <= 13 && (digits.startsWith("91") || digits.startsWith("0"))) {
    return digits.slice(-10);
  }
  return "";
}

export function resolveClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return (forwarded ? forwarded.split(",")[0].trim() : realIp?.trim()) || "127.0.0.1";
}

function checkRateLimit(clientIp: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  let entry = rateLimitMap.get(clientIp);
  if (!entry) {
    entry = { timestamps: [] };
    rateLimitMap.set(clientIp, entry);
  }
  entry.timestamps = entry.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  if (entry.timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - entry.timestamps[0])) / 1000);
    return { allowed: false, retryAfter: Math.max(1, retryAfter) };
  }

  entry.timestamps.push(now);
  return { allowed: true };
}

function validateBookingDate(dateStr: string): { valid: boolean; error?: string } {
  if (!dateStr) return { valid: true };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return { valid: false, error: "Invalid preferred booking date format. Use YYYY-MM-DD." };
  }

  const parsed = new Date(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return { valid: false, error: "Invalid preferred booking date." };
  }

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;

  if (dateStr < todayStr) {
    return { valid: false, error: "Preferred booking date cannot be in the past." };
  }

  // Workshop operates Monday to Saturday (6 Days Working)
  if (parsed.getUTCDay() === 0) {
    return {
      valid: false,
      error: "Our workshop operates Monday to Saturday (9:00 AM – 9:00 PM). Please choose a Monday–Saturday date.",
    };
  }

  return { valid: true };
}

export interface CreateBookingOptions {
  successStatus?: 200 | 201;
  requireEmailConsentCheck?: boolean;
}

export async function handleCreateBookingRequest(
  request: Request,
  options: CreateBookingOptions = {}
): Promise<NextResponse> {
  try {
    const clientIp = resolveClientIp(request);

    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many repair enquiries submitted. Please wait a moment before trying again.",
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateCheck.retryAfter || 60) },
        }
      );
    }

    const rawBody = await request.json().catch(() => null);
    if (!rawBody || typeof rawBody !== "object" || Array.isArray(rawBody)) {
      return NextResponse.json({ success: false, error: "Invalid JSON payload." }, { status: 400 });
    }

    const body = rawBody as Record<string, unknown>;

    // Anti-spam honeypot field guard
    const honeypot = sanitizeText(body.website || body.companyWebsite || body.hp, 100);
    if (honeypot) {
      return NextResponse.json(
        { success: false, error: "Spam protection triggered. Submission rejected." },
        { status: 400 }
      );
    }

    // Normalize fields across both EnquiryForm (/api/enquire, /api/requests) & BookingForm (/api/orders)
    const name = sanitizeText(body.name || body.customerName, 80);
    if (!name || name.length < 2) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid full name (at least 2 characters)." },
        { status: 400 }
      );
    }

    const cleanPhone = normalizePhone10(String(body.phone || body.customerPhone || ""));
    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    let deviceBrand = sanitizeText(body.deviceBrand || body.brand, 60);
    const customBrand = sanitizeText(body.customBrand || body.otherBrand, 60);
    if ((deviceBrand === "Other" || deviceBrand.toLowerCase().includes("other")) && customBrand) {
      deviceBrand = customBrand;
    }
    if (!deviceBrand) {
      return NextResponse.json(
        { success: false, error: "Please select your device brand." },
        { status: 400 }
      );
    }

    let deviceModel = sanitizeText(body.deviceModel || body.model, 80);
    if (!deviceModel && customBrand) {
      deviceModel = customBrand;
    }
    if (!deviceModel || deviceModel.length < 2) {
      return NextResponse.json(
        { success: false, error: "Please enter your device model (e.g., iPhone 13, Galaxy S23)." },
        { status: 400 }
      );
    }

    let repairService = sanitizeText(body.repairCategory || body.issue || body.serviceType, 80);
    const customIssue = sanitizeText(body.customIssue || body.otherIssue || body.customService, 120);
    if ((repairService === "Other" || repairService.toLowerCase().includes("other")) && customIssue) {
      repairService = customIssue;
    }
    if (!repairService) {
      return NextResponse.json(
        { success: false, error: "Please select the repair service needed." },
        { status: 400 }
      );
    }

    const descriptionInput = sanitizeText(
      body.description || body.problemDescription || body.issueDescription || body.reportedIssue || body.problem,
      1000
    );
    const location = sanitizeText(body.location || body.customerLocation || "Gandhinagar", 100) || "Gandhinagar";
    const appointmentDate = sanitizeText(body.appointmentDate || body.preferredDate, 20);
    const appointmentTime = sanitizeText(body.appointmentTime || body.preferredTime, 40);

    const dateValidation = validateBookingDate(appointmentDate);
    if (!dateValidation.valid) {
      return NextResponse.json({ success: false, error: dateValidation.error }, { status: 400 });
    }

    const rawPreferredContact = sanitizeText(body.preferredContact || body.preferredContactMethod, 20).toLowerCase();
    if (rawPreferredContact && rawPreferredContact !== "whatsapp" && rawPreferredContact !== "phone") {
      return NextResponse.json(
        { success: false, error: "Preferred contact method must be 'whatsapp' or 'phone'." },
        { status: 400 }
      );
    }
    const preferredContact: "whatsapp" | "phone" = rawPreferredContact === "phone" ? "phone" : "whatsapp";

    const extraNotes = [
      appointmentDate ? `Preferred Date: ${appointmentDate}` : null,
      appointmentTime ? `Preferred Time: ${appointmentTime}` : null,
      `Preferred Contact: ${preferredContact === "phone" ? "Phone Call" : "WhatsApp"}`,
    ]
      .filter(Boolean)
      .join(" | ");

    const reportedProblem = [descriptionInput, extraNotes].filter(Boolean).join("\n") || "Online diagnostic booking";

    // Fast in-memory duplicate guard (30s window)
    const now = Date.now();
    const dedupKey = crypto
      .createHash("sha256")
      .update(`${cleanPhone}|${deviceBrand.toLowerCase()}|${deviceModel.toLowerCase()}|${repairService.toLowerCase()}|${descriptionInput.toLowerCase()}`)
      .digest("hex");

    const prevHashTime = recentHashMap.get(dedupKey);
    if (prevHashTime && now - prevHashTime < MEMORY_DEDUP_WINDOW_MS) {
      return NextResponse.json(
        {
          success: false,
          error: "Duplicate booking submission detected. Please wait a moment before submitting again.",
        },
        { status: 409 }
      );
    }

    // Check database for identical booking within last 5 minutes & commit atomically
    const txResult = runInTransaction((txDb) => {
      const recentDuplicate = txDb
        .prepare(
          `SELECT o.tracking_id
           FROM repair_orders o
           JOIN customer_records c ON o.customer_id = c.id
           WHERE c.phone = ?
             AND LOWER(o.device_brand) = LOWER(?)
             AND LOWER(o.device_model) = LOWER(?)
             AND LOWER(o.repair_category) = LOWER(?)
             AND o.is_archived = 0
             AND o.created_at >= datetime('now', '-5 minutes')
           ORDER BY o.id DESC
           LIMIT 1`
        )
        .get(cleanPhone, deviceBrand, deviceModel, repairService) as { tracking_id: string } | undefined;

      if (recentDuplicate) {
        return { duplicateTrackingId: recentDuplicate.tracking_id } as const;
      }

      // Upsert customer record
      let customerId: number;
      const existingCustomer = txDb
        .prepare("SELECT id FROM customer_records WHERE phone = ? ORDER BY id DESC LIMIT 1")
        .get(cleanPhone) as { id: number } | undefined;

      if (existingCustomer) {
        customerId = existingCustomer.id;
        txDb
          .prepare(
            "UPDATE customer_records SET name = ?, location = COALESCE(NULLIF(?, ''), location), updated_at = datetime('now') WHERE id = ?"
          )
          .run(name, location, customerId);
      } else {
        const info = txDb
          .prepare(
            "INSERT INTO customer_records (name, phone, location, consent_whatsapp, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))"
          )
          .run(name, cleanPhone, location, preferredContact === "whatsapp" ? 1 : 0, "Website Booking Desk");
        customerId = Number(info.lastInsertRowid);
      }

      let trackingId = "";
      let orderId = 0;
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          trackingId = generateSecureTrackingId(txDb);
          const info = txDb
            .prepare(
              `INSERT INTO repair_orders (
                 tracking_id, customer_id, device_brand, device_model,
                 repair_category, reported_issue, inspection_notes,
                 preferred_booking_date, preferred_contact_method,
                 current_status, pickup_ready, source, customer_type, paid, is_archived,
                 created_at, updated_at
               ) VALUES (
                 ?, ?, ?, ?,
                 ?, ?, 'Registered via online customer booking.',
                 ?, ?,
                 'NEW_REQUEST', 0, 'CUSTOMER_WEBSITE', 'Customer', 0, 0,
                 datetime('now'), datetime('now')
               )`
            )
            .run(
              trackingId,
              customerId,
              deviceBrand,
              deviceModel,
              repairService,
              reportedProblem,
              appointmentDate || null,
              preferredContact
            );
          orderId = Number(info.lastInsertRowid);
          break;
        } catch (dbErr: unknown) {
          const msg = dbErr instanceof Error ? dbErr.message : String(dbErr);
          if (msg.includes("UNIQUE constraint failed")) continue;
          throw dbErr;
        }
      }

      if (!orderId) {
        throw new Error("Could not assign unique repair reference.");
      }

      txDb
        .prepare(
          `INSERT INTO repair_status_history (
             order_id, previous_status, new_status, customer_note, internal_note, created_at
           ) VALUES (
             ?, NULL, 'NEW_REQUEST',
             'Booking received online and queued for technician intake.',
             'Auto-registered from customer website booking form.',
             datetime('now')
           )`
        )
        .run(orderId);

      txDb
        .prepare(
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
        )
        .run(
          `Customer ${name} registered ${deviceBrand} ${deviceModel} for ${repairService}.`,
          orderId,
          trackingId,
          name,
          cleanPhone
        );

      return {
        orderId,
        trackingId,
        customerId,
        createdAt: new Date().toISOString(),
      } as const;
    });

    if ("duplicateTrackingId" in txResult) {
      return NextResponse.json(
        {
          success: false,
          trackingId: txResult.duplicateTrackingId,
          error: `A booking for this ${deviceBrand} ${deviceModel} (${repairService}) was already submitted recently. Use reference ${txResult.duplicateTrackingId} to track your repair.`,
        },
        { status: 409 }
      );
    }

    recentHashMap.set(dedupKey, now);

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    const trackingUrl = `${protocol}://${host}/track-repair?id=${encodeURIComponent(txResult.trackingId)}`;

    const whatsAppMessage = `Hello DENISH MOBILE REPAIRING AND SERVICE,

I have submitted a mobile repair request.

Repair Reference: ${txResult.trackingId}
Customer: ${name}
Phone: ${cleanPhone}
Location: ${location}
Device: ${deviceBrand} ${deviceModel}
Service: ${repairService}
Preferred Contact: ${preferredContact === "phone" ? "Phone Call" : "WhatsApp"}
${appointmentDate ? `Preferred Date: ${appointmentDate}\n` : ""}Problem: ${descriptionInput || "Diagnostic check requested"}

Track my service:
${trackingUrl}`;

    const directWhatsAppUrl = `https://wa.me/${SYSTEM_CONFIG.whatsappNumber}?text=${encodeURIComponent(
      whatsAppMessage
    )}`;

    const formattedOrder = {
      id: txResult.trackingId,
      trackingId: txResult.trackingId,
      serviceId: cleanPhone,
      customerName: name,
      phone: cleanPhone,
      brand: deviceBrand,
      model: deviceModel,
      serviceType: repairService,
      issueDescription: reportedProblem,
      preferredBookingDate: appointmentDate || null,
      preferredContactMethod: preferredContact,
      trackingUrl,
      status: "Pending" as const,
      adminMessage: "Booking received. Our technician desk will review and confirm your intake shortly.",
      adminUpdatedAt: txResult.createdAt,
      createdAt: txResult.createdAt,
      source: "website" as const,
    };

    return NextResponse.json(
      {
        success: true,
        referenceId: txResult.trackingId,
        trackingId: txResult.trackingId,
        serviceId: cleanPhone,
        trackingUrl,
        directWhatsAppUrl,
        whatsAppUrl: directWhatsAppUrl,
        order: formattedOrder,
        data: {
          orderId: txResult.orderId,
          trackingId: txResult.trackingId,
          referenceId: txResult.trackingId,
          customerName: name,
          customerPhone: cleanPhone,
          location,
          deviceBrand,
          deviceModel,
          repairCategory: repairService,
          preferredBookingDate: appointmentDate || null,
          preferredContactMethod: preferredContact,
          trackingUrl,
          whatsAppUrl: directWhatsAppUrl,
        },
        message: "Booking confirmed and saved! Save your repair reference to track live progress.",
      },
      { status: options.successStatus || 200 }
    );
  } catch (err) {
    console.error("[BOOKING_CREATE_ERROR]", err);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while saving your booking. Please tap Call Now to contact us directly.",
      },
      { status: 500 }
    );
  }
}

