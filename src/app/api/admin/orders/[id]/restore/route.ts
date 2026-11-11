// Restore Archived Order API
// Endpoint: POST /api/admin/orders/[id]/restore

import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase, runInTransaction } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const orderId = parseInt(params.id, 10);
  if (isNaN(orderId) || orderId <= 0) {
    return NextResponse.json({ success: false, error: "Invalid order ID" }, { status: 400 });
  }

  try {
    const db = getDatabase();

    const existingOrder = db.prepare("SELECT id, tracking_id, is_archived FROM repair_orders WHERE id = ?").get(orderId) as
      | { id: number; tracking_id: string; is_archived: number }
      | undefined;

    if (!existingOrder) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    if (existingOrder.is_archived === 0) {
      return NextResponse.json({ success: false, error: "Order is already active" }, { status: 400 });
    }

    runInTransaction((txDb) => {
      txDb.prepare(`
        UPDATE repair_orders
        SET 
          is_archived = 0,
          archived_at = NULL,
          archived_by_admin_id = NULL,
          archive_reason = NULL,
          updated_at = datetime('now')
        WHERE id = ?
      `).run(orderId);

      txDb.prepare(`
        INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details, created_at)
        VALUES (?, 'RESTORE_ORDER', 'repair_orders', ?, 'Order restored to active view', datetime('now'))
      `).run(admin.adminId, String(orderId));
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        trackingId: existingOrder.tracking_id,
        message: "Order restored successfully.",
      },
    });
  } catch (err) {
    console.error("[ADMIN_RESTORE_ORDER_ERROR]", err);
    return NextResponse.json({ success: false, error: "Failed to restore order" }, { status: 500 });
  }
}

