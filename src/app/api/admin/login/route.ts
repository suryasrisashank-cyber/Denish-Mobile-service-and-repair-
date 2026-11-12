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

  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password || typeof username !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Username and password are required." },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password;
    if (!cleanUsername || !cleanPassword) {
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

    const admin = db.prepare(`
      SELECT id, username, email, password_hash, role, name, is_active
      FROM admin_users
      WHERE LOWER(username) = ? OR LOWER(email) = ?
      LIMIT 1
    `).get(cleanUsername, cleanUsername) as DbAdminRow | undefined;

    if (!admin || admin.is_active !== 1) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { success: false, error: "Invalid username or password." },
        { status: 401 }
      );
    }

    let passwordMatches = false;
    try {
      passwordMatches = await bcrypt.compare(cleanPassword, admin.password_hash);
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
    const token = await createSessionToken({
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      name: admin.name,
    });

    // Record audit log
    db.prepare(`
      INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details, ip_address, created_at)
      VALUES (?, 'ADMIN_LOGIN', 'admin_users', ?, 'Successful admin portal sign-in', ?, datetime('now'))
    `).run(admin.id, String(admin.id), ip);

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
  } catch (err) {
    console.error("[ADMIN_LOGIN_ERROR]", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during login." },
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
