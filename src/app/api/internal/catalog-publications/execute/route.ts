import { NextRequest, NextResponse } from "next/server";
import { executeDueCatalogPublicationBatches } from "@/src/features/corporate/catalog";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  try {
    const result = await executeDueCatalogPublicationBatches(secret);
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Unauthorized scheduler request." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
}
