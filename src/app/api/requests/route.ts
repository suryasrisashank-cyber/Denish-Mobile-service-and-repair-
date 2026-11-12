// DENISH MOBILE REPAIRING AND SERVICE
// Customer Service Request Intake API
// Endpoint: /api/requests

import { NextRequest } from "next/server";
import { handleCreateBookingRequest } from "@/lib/booking-service";

export async function POST(request: NextRequest) {
  return handleCreateBookingRequest(request, { successStatus: 200 });
}
