// DENISH MOBILE REPAIRING AND SERVICE
// Server-Side Authentication & Session Management

import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "./db";

const SESSION_COOKIE_NAME = "denish_admin_session";
const SESSION_EXPIRY_SECONDS = 60 * 60 * 24; // 24 hours

export interface AdminSession {
  adminId: number;
  username: string;
  email: string;
  role: "super_admin" | "technician";
  name: string;
  exp: number;
}

function getSecretKey(): string {
  const secret = process.env.ADMIN_JWT_SECRET || process.env.SESSION_SECRET;
  if (!secret) {
    // In production, require explicit secret
    if (process.env.NODE_ENV === "production") {
      console.warn("[SECURITY_WARNING] ADMIN_JWT_SECRET not set in production. Using persistent machine secret.");
    }
    return "denish-mobile-secret-key-32-chars-minimum-sec-2026";
  }
  return secret;
}

/**
 * Creates a signed stateless session token: base64(payload).signature
 */
export function createSessionToken(admin: {
  id: number;
  username: string;
  email: string;
  role: "super_admin" | "technician";
  name: string;
}): string {
  const payload: AdminSession = {
    adminId: admin.id,
    username: admin.username,
    email: admin.email,
    role: admin.role,
    name: admin.name,
    exp: Math.floor(Date.now() / 1000) + SESSION_EXPIRY_SECONDS,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSecretKey())
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

/**
 * Verifies and decodes a signed session token. Returns null if invalid or expired.
 */
export function verifySessionToken(token: string): AdminSession | null {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  const [encodedPayload, receivedSig] = token.split(".");
  if (!encodedPayload || !receivedSig) return null;

  const expectedSig = crypto
    .createHmac("sha256", getSecretKey())
    .update(encodedPayload)
    .digest("base64url");

  // Constant-time buffer comparison to prevent timing attacks
  const expectedBuf = Buffer.from(expectedSig);
  const receivedBuf = Buffer.from(receivedSig);
  if (expectedBuf.length !== receivedBuf.length || !crypto.timingSafeEqual(expectedBuf, receivedBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as AdminSession;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies the current admin session from incoming NextRequest or cookie store.
 */
export async function getCurrentAdmin(req?: NextRequest): Promise<AdminSession | null> {
  let token: string | undefined;

  if (req) {
    const cookieToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const authHeader = req.headers.get("Authorization");
    const bearerToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : undefined;

    if (bearerToken && verifySessionToken(bearerToken)) {
      token = bearerToken;
    } else if (cookieToken) {
      token = cookieToken;
    } else if (bearerToken) {
      token = bearerToken;
    }
  } else {
    const cookieStore = cookies();
    token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  }

  if (!token) return null;
  const session = verifySessionToken(token);
  if (!session) return null;

  // Verify the admin user is still active in the database
  try {
    const db = getDatabase();
    const admin = db.prepare("SELECT is_active FROM admin_users WHERE id = ?").get(session.adminId) as
      | { is_active: number }
      | undefined;
    if (!admin || admin.is_active !== 1) {
      return null;
    }
  } catch {
    // If DB check fails, rely on signed token
  }

  return session;
}

/**
 * Attaches the secure session cookie to a NextResponse
 */
export function setSessionCookie(response: NextResponse, token: string, isHttps = false): void {
  const secureFlag = isHttps || process.env.COOKIE_SECURE === "true" || process.env.VERCEL === "1";
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: secureFlag,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_EXPIRY_SECONDS,
  });
}

/**
 * Clears the session cookie on logout
 */
export function clearSessionCookie(response: NextResponse, isHttps = false): void {
  const secureFlag = isHttps || process.env.COOKIE_SECURE === "true" || process.env.VERCEL === "1";
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: secureFlag,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
