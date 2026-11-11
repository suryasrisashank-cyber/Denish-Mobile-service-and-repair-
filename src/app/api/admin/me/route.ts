// Admin Current Session API
// Endpoint: /api/admin/me

import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin(request);

  if (!admin) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Session expired or invalid." },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      adminId: admin.adminId,
      username: admin.username,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
  });
}
