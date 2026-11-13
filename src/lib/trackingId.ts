// DENISH MOBILE REPAIRING AND SERVICE
// Tracking ID Generator & Validator
// Standard Format: DMR-YYMMDD-XXXX (e.g., DMR-261112-K9P3) — unpredictable & non-PII
// Legacy Support: DEN-<token> / 10-digit mobile lookup

import crypto from "crypto";
import { getDatabase, AppDatabase } from "./db";

// Crockford Base32-inspired uppercase charset (avoids ambiguous 0/O/1/I)
const SAFE_CHARSET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/**
 * Generates a cryptographically random alphanumeric token of requested length.
 */
export function generateRandomToken(length = 4): string {
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    const index = bytes[i] % SAFE_CHARSET.length;
    result += SAFE_CHARSET[index];
  }
  return result;
}

function formatYyMmDd(date = new Date()): string {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

/**
 * Generates a tracking ID / service reference.
 * When customer mobile number is provided, uses the clean 10-digit mobile number.
 */
export async function generateSecureTrackingId(
  customDb?: AppDatabase,
  customerPhone?: string
): Promise<string> {
  if (customerPhone) {
    const cleanPhone = customerPhone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length === 10) {
      return cleanPhone;
    }
  }

  const db = customDb || getDatabase();
  const checkStmt = db.prepare("SELECT 1 FROM repair_orders WHERE tracking_id = ?");
  const datePart = formatYyMmDd();

  for (let attempt = 0; attempt < 25; attempt++) {
    const candidate = `DMR-${datePart}-${generateRandomToken(4)}`;
    const row = await checkStmt.get(candidate);
    if (!row) {
      return candidate;
    }
  }

  // Fallback with 6 random characters if 4-char space experiences unusual collision
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = `DMR-${datePart}-${generateRandomToken(6)}`;
    const row = await checkStmt.get(candidate);
    if (!row) {
      return candidate;
    }
  }

  return `DMR-${datePart}-${generateRandomToken(8)}`;
}

/**
 * Normalizes and validates tracking ID or mobile lookup input from customer.
 * Supports:
 * - Standard: DMR-YYMMDD-XXXX (4-8 alphanumeric suffix)
 * - Legacy DEN- tokens and DEN-<10-digit>(-suffix)
 * - Raw 10-digit mobile number (when used in phone-based order tracker)
 */
export function isValidTrackingId(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  const clean = input.trim().toUpperCase();

  if (/^DMR-\d{6}-[A-Z0-9]{4,8}$/i.test(clean)) return true;
  if (/^DEN-[0-9]{10}(-[0-9A-Z]+)?$/i.test(clean)) return true;
  if (/^DEN-[2-9A-HJ-NP-Z0-9]{6,16}(-[0-9A-Z]+)?$/i.test(clean)) return true;
  if (/^[0-9]{10}$/.test(clean)) return true;

  return false;
}
