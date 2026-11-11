// Admin Logout API
// Endpoint: /api/admin/logout

import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin, clearSessionCookie } from "@/lib/auth";
import { getDatabase } from "@/lib/db";

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin(request);

  if (admin) {
    try {
      const db = getDatabase();
      db.prepare(`
        INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details, created_at)
        VALUES (?, 'ADMIN_LOGOUT', 'admin_users', ?, 'Admin logged out', datetime('now'))
      `).run(admin.adminId, String(admin.adminId));
    } catch {}
  }

  const proto = request.headers.get("x-forwarded-proto") || (request.url.startsWith("https://") ? "https" : "http");
  const isHttps = proto === "https";

  const response = NextResponse.json({ success: true, message: "Logged out successfully" });
  clearSessionCookie(response, isHttps);
  return response;
}
