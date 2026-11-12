import { NextResponse } from "next/server";
import { handleCreateBookingRequest } from "@/lib/booking-service";

export interface EnquiryPayload {
  name: string;
  phone: string;
  deviceBrand: string;
  deviceModel: string;
  issue: string;
  location?: string;
  description?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  preferredContact?: "whatsapp" | "phone";
}

export async function POST(request: Request) {
  // Origin / Host Validation (CORS & CSRF Defense)
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host) {
    try {
      const originUrl = new URL(origin);
      const isSameHost =
        originUrl.host === host || host.includes("localhost") || host.includes("127.0.0.1");
      if (!isSameHost && !originUrl.host.includes("denish-mobile")) {
        return NextResponse.json(
          { success: false, error: "Cross-origin submission rejected." },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid request origin." },
        { status: 403 }
      );
    }
  }

  return handleCreateBookingRequest(request, { successStatus: 200 });
}
