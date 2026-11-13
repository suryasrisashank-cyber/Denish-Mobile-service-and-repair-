// Admin Delete Customer API
// Endpoint: DELETE /api/admin/customers/[id]
// Permanently removes a customer and all their associated repair orders & records

import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase, runInTransaction } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const customerId = parseInt(params.id, 10);
  if (isNaN(customerId) || customerId <= 0) {
    return NextResponse.json({ success: false, error: "Invalid customer ID" }, { status: 400 });
  }

  try {
    const db = getDatabase();

    const customer = (await db
      .prepare("SELECT id, name, phone FROM customer_records WHERE id = ?")
      .get(customerId)) as { id: number; name: string; phone: string } | undefined;

    if (!customer) {
      return NextResponse.json({ success: false, error: "Customer not found." }, { status: 404 });
    }

    await runInTransaction(async (txDb) => {
      // 1. Get all repair orders for this customer
      const orders = (await txDb
        .prepare("SELECT id FROM repair_orders WHERE customer_id = ?")
        .all(customerId)) as Array<{ id: number }>;

      const orderIds = orders.map((o) => o.id);

      // 2. Delete related records for each order
      for (const orderId of orderIds) {
        await txDb.prepare("DELETE FROM repair_status_history WHERE order_id = ?").run(orderId);
        await txDb.prepare("DELETE FROM customer_notifications WHERE order_id = ?").run(orderId);
        await txDb.prepare("DELETE FROM admin_notifications WHERE order_id = ?").run(orderId);
        await txDb
          .prepare("UPDATE whatsapp_conversations SET converted_order_id = NULL WHERE converted_order_id = ?")
          .run(orderId);
        await txDb.prepare("DELETE FROM repair_orders WHERE id = ?").run(orderId);
      }

      // 3. Unlink or remove WhatsApp conversations
      await txDb
        .prepare("DELETE FROM whatsapp_conversations WHERE customer_id = ? OR customer_phone = ?")
        .run(customerId, customer.phone);

      // 4. Delete customer record
      await txDb.prepare("DELETE FROM customer_records WHERE id = ?").run(customerId);

      // 5. Audit Log
      await txDb.prepare(`
        INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details, created_at)
        VALUES (?, 'DELETE_CUSTOMER', 'customer_records', ?, ?, datetime('now'))
      `).run(
        admin.adminId,
        String(customerId),
        `Deleted customer ${customer.name} (${customer.phone}) and ${orderIds.length} associated repair orders.`
      );
    });

    return NextResponse.json({
      success: true,
      message: `Customer ${customer.name} and all associated records deleted permanently.`,
      deletedCustomerId: customerId,
    });
  } catch (err: unknown) {
    console.error("[ADMIN_DELETE_CUSTOMER_ERROR]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to delete customer record.",
      },
      { status: 500 }
    );
  }
}

