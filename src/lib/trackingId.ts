// DENISH MOBILE REPAIRING AND SERVICE
// Tracking ID Generator & Validator
// Format: Based on customer mobile number `DEN-<10-DIGIT-PHONE>` with collision handling
// Privacy: Public lookup NEVER reveals customer phone, address, or unmasked name.

import crypto from "crypto";
import { getDatabase } from "./db";

// Crockford Base32-inspired charset for fallback tokens
const SAFE_CHARSET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/**
 * Generates an unpredictable random token of requested length.
 */
export function generateRandomToken(length = 10): string {
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    const index = bytes[i] % SAFE_CHARSET.length;
    result += SAFE_CHARSET[index];
  }
  return result;
}

/**
 * Generates a unique tracking ID in format `DEN-<MOBILE>` based on the customer's phone number.
 * If customer creates multiple orders, handles collision cleanly with `-2`, `-3`, etc.
 * Supports passing an active transaction database instance.
 */
export function generateSecureTrackingId(
  customDb?: import("better-sqlite3").Database,
  customerPhone?: string
): string {
  const db = customDb || getDatabase();
  const checkStmt = db.prepare("SELECT 1 FROM repair_orders WHERE tracking_id = ?");

  if (customerPhone) {
    const digits = customerPhone.replace(/\D/g, "");
    if (digits.length >= 10) {
      const phone10 = digits.slice(-10);
      const baseCandidate = `DEN-${phone10}`;
      if (!checkStmt.get(baseCandidate)) {
        return baseCandidate;
      }

      // Suffix collision handling (e.g. DEN-9825012345-2)
      for (let suffix = 2; suffix <= 99; suffix++) {
        const candidate = `${baseCandidate}-${suffix}`;
        if (!checkStmt.get(candidate)) {
          return candidate;
        }
      }
    }
  }

  // Fallback to secure random token if no phone was supplied or high collision
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = `DEN-${generateRandomToken(10)}`;
    const existing = checkStmt.get(candidate);
    if (!existing) {
      return candidate;
    }
  }

  return `DEN-${generateRandomToken(12)}`;
}

/**
 * Normalizes and validates tracking ID input from customer.
 * Supports:
 * - DEN-<10-DIGIT-PHONE> (e.g., DEN-9825012345)
 * - DEN-<10-DIGIT-PHONE>-<SUFFIX> (e.g., DEN-9825012345-2)
 * - Raw 10-digit mobile number (e.g., 9825012345)
 * - Legacy alphanumeric tokens (e.g., DEN-W4CTDDQAZS, DMR-XXXXXX-XXXX)
 */
export function isValidTrackingId(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  const clean = input.trim().toUpperCase();

  // Raw 10-digit phone
  if (/^[0-9]{10}$/.test(clean)) return true;

  // DEN- prefixed phone or alphanumeric token
  if (/^DEN-[0-9]{10}(-[0-9A-Z]+)?$/i.test(clean)) return true;
  if (/^DEN-[2-9A-HJ-NP-Z0-9]{6,16}(-[0-9A-Z]+)?$/i.test(clean)) return true;
  if (/^DMR-\d{6}-\d{4}$/i.test(clean)) return true;

  return false;
}
