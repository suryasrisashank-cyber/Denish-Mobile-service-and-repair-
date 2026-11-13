// Admin Authentication Login API
// Endpoint: /api/admin/login

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDatabase } from "@/lib/db";
import { createSessionToken, setSessionCookie } from "@/lib/auth";

// In-memory brute force protection: 10 attempts per 10 minutes per IP
const loginAttempts = new Map<string, { count: number; lockUntil: number }>();
const MAX_ATTEMPTS = 10;
const LOCK_TIME_MS = 10 * 60 * 1000;

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const now = Date.now();
  const attempt = loginAttempts.get(ip);
  if (attempt && attempt.lockUntil > now) {
    const minutesLeft = Math.ceil((attempt.lockUntil - now) / 60000);
    return NextResponse.json(
      {
        success: false,
        error: `Too many failed login attempts. Try again in ${minutesLeft} minute(s).`,
      },
      { status: 429 }
    );
  }

  let body: { username?: unknown; password?: unknown };
  try {
    body = (await request.json()) as { username?: unknown; password?: unknown };
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid login request format. Please refresh the page and try again." },
      { status: 400 }
    );
  }

  try {
    const { username, password } = body;

    if (!username || !password || typeof username !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Username and password are required." },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const rawPassword = password;
    const trimmedPassword = password.trim();

    if (!cleanUsername || !rawPassword) {
      return NextResponse.json(
        { success: false, error: "Username and password are required." },
        { status: 400 }
      );
    }

    const db = getDatabase();

    interface DbAdminRow {
      id: number;
      username: string;
      email: string;
      password_hash: string;
      role: "super_admin" | "technician";
      name: string;
      is_active: number;
    }

    let admin: DbAdminRow | undefined;
    try {
      admin = (await db.prepare(`
        SELECT id, username, email, password_hash, role, name, is_active
        FROM admin_users
        WHERE LOWER(username) = ? 
           OR LOWER(email) = ? 
           OR (LOWER(username) = 'denish_admin' AND ? IN ('denish', 'denishadmin', 'denish_admin'))
        LIMIT 1
      `).get(cleanUsername, cleanUsername, cleanUsername)) as DbAdminRow | undefined;
    } catch (dbErr) {
      console.error("[ADMIN_LOGIN_DB_ERROR]", dbErr);
      return NextResponse.json(
        { success: false, error: "Database temporarily busy. Please retry in a few seconds." },
        { status: 503 }
      );
    }

    if (!admin || admin.is_active !== 1) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { success: false, error: "Invalid username or password." },
        { status: 401 }
      );
    }

    let passwordMatches = false;
    try {
      passwordMatches = await bcrypt.compare(rawPassword, admin.password_hash);
      if (!passwordMatches && trimmedPassword !== rawPassword) {
        passwordMatches = await bcrypt.compare(trimmedPassword, admin.password_hash);
      }
    } catch {
      passwordMatches = false;
    }

    if (!passwordMatches) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { success: false, error: "Invalid username or password." },
        { status: 401 }
      );
    }

    // Reset failed attempts on success
    loginAttempts.delete(ip);

    // Create session token
    let token: string;
    try {
      token = await createSessionToken({
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        name: admin.name,
      });
    } catch (tokenErr) {
      console.error("[ADMIN_LOGIN_TOKEN_ERROR]", tokenErr);
      return NextResponse.json(
        { success: false, error: "Authentication system configuration error. Please contact administrator." },
        { status: 500 }
      );
    }

    // Record audit log safely - must NEVER crash login
    try {
      const cleanIp = (ip || "unknown").slice(0, 90);
      await db.prepare(`
        INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details, ip_address, created_at)
        VALUES (?, 'ADMIN_LOGIN', 'admin_users', ?, 'Successful admin portal sign-in', ?, datetime('now'))
      `).run(admin.id, String(admin.id), cleanIp);
    } catch (auditErr) {
      console.warn("[ADMIN_LOGIN_AUDIT_WARNING] Audit log write non-fatal warning:", auditErr);
    }

    const proto = request.headers.get("x-forwarded-proto") || (request.url.startsWith("https://") ? "https" : "http");
    const isHttps = proto === "https";

    const response = NextResponse.json({
      success: true,
      data: {
        adminId: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        email: admin.email,
        token,
      },
    });

    setSessionCookie(response, token, isHttps);
    return response;
  } catch (err: unknown) {
    const errorDetails = err instanceof Error ? err.message : String(err);
    console.error("[ADMIN_LOGIN_ERROR]", errorDetails, err);
    return NextResponse.json(
      { success: false, error: "Login could not be completed. Please retry in a moment." },
      { status: 500 }
    );
  }
}

function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const item = loginAttempts.get(ip) || { count: 0, lockUntil: 0 };
  item.count += 1;
  if (item.count >= MAX_ATTEMPTS) {
    item.lockUntil = now + LOCK_TIME_MS;
  }
  loginAttempts.set(ip, item);
}
