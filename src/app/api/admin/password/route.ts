// DENISH MOBILE REPAIRING AND SERVICE
// Admin Password Change API
// Endpoint: POST /api/admin/password

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/db";

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Admin session required." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Current password and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "New password and confirmation do not match." },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // Verify current password against database
    const userRow = (await db.prepare("SELECT password_hash FROM admin_users WHERE id = ?").get(admin.adminId)) as
      | { password_hash: string }
      | undefined;

    if (!userRow) {
      return NextResponse.json({ success: false, error: "Admin user not found." }, { status: 404 });
    }

    const matches = bcrypt.compareSync(currentPassword, userRow.password_hash);
    if (!matches) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect." },
        { status: 400 }
      );
    }

    // Hash new password
    const newHash = bcrypt.hashSync(newPassword, 12);

    // Update password in database
    await db.prepare(`
      UPDATE admin_users 
      SET password_hash = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(newHash, admin.adminId);

    // Write audit log
    await db.prepare(`
      INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details, created_at)
      VALUES (?, 'CHANGE_PASSWORD', 'admin_users', ?, 'Admin password updated securely', datetime('now'))
    `).run(admin.adminId, String(admin.adminId));

    return NextResponse.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (err) {
    console.error("[ADMIN_CHANGE_PASSWORD_ERROR]", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while updating password." },
      { status: 500 }
    );
  }
}

