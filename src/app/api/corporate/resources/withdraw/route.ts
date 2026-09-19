import { NextResponse } from "next/server";
import { getCorporateSession } from "@/src/features/corporate/session";
import { withdrawResourcePublication } from "@/src/features/resources/server";

export async function POST(request: Request) {
  const session = await getCorporateSession();
  if (!session) return NextResponse.json({ message: "Your corporate session has expired. Sign in again." }, { status: 401 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const resourceId = typeof body.resourceId === "string" ? body.resourceId.trim() : "";
    await withdrawResourcePublication(session, resourceId);
    return NextResponse.json({ message: "Resource withdrawn from the selected store resource centers." });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "The resource could not be withdrawn." }, { status: 400 });
  }
}
