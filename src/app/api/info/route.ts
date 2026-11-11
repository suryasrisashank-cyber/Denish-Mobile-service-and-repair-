// DENISH MOBILE REPAIRING AND SERVICE
// Workshop Information Endpoint
// Endpoint: /api/info

import { NextResponse } from "next/server";
import { BUSINESS_INFO, CORE_SERVICES } from "@/data/constants";

export async function GET() {
  return NextResponse.json({
    businessName: BUSINESS_INFO.fullTitle,
    slogan: BUSINESS_INFO.tagline,
    hotline: BUSINESS_INFO.phone,
    formattedPhone: BUSINESS_INFO.formattedPhone,
    whatsappUrl: `https://wa.me/${BUSINESS_INFO.whatsappNumber}`,
    timing: `${BUSINESS_INFO.hours} (${BUSINESS_INFO.days})`,
    warranty: BUSINESS_INFO.warranty,
    services: CORE_SERVICES.map((s) => s.name)
  });
}

