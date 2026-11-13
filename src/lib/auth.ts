// DENISH MOBILE REPAIRING AND SERVICE
// Server-Side Authentication & Session Management

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "./db";
import {
  SESSION_COOKIE_NAME,
  SESSION_EXPIRY_SECONDS,
  type AdminSession,
  createSessionToken,
  verifySessionToken,
} from "./session-token";

export type { AdminSession };
export { SESSION_COOKIE_NAME, SESSION_EXPIRY_SECONDS, createSessionToken, verifySessionToken };

/**
 * Extracts and verifies the current admin session from incoming NextRequest or cookie store.
 */
export async function getCurrentAdmin(req?: NextRequest): Promise<AdminSession | null> {
  let token: string | undefined;

  if (req) {
    const cookieToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const authHeader = req.headers.get("Authorization");
    const bearerToken =
      authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7).trim() : undefined;

    if (bearerToken && (await verifySessionToken(bearerToken))) {
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
  const session = await verifySessionToken(token);
  if (!session) return null;

  // Verify the admin user still exists and is active in the database
  try {
    const db = getDatabase();
    const admin = (await db
      .prepare("SELECT is_active, role FROM admin_users WHERE id = ?")
      .get(session.adminId)) as { is_active: number; role: "super_admin" | "technician" } | undefined;
    if (!admin || admin.is_active !== 1) {
      return null;
    }
    session.role = admin.role;
  } catch (err) {
    console.error("[AUTH_DB_CHECK_ERROR]", err);
    return null;
  }

  return session;
}

/**
 * Attaches the secure session cookie to a NextResponse
 */
export function setSessionCookie(response: NextResponse, token: string, isHttps = false): void {
  const secureFlag =
    isHttps || process.env.COOKIE_SECURE === "true" || process.env.VERCEL === "1";
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
  const secureFlag = isHttps || process.env.COOKIE_SECURE === "true";
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
