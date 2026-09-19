import { NextResponse } from "next/server";
import { getCorporateSession } from "@/src/features/corporate/session";
import { reviewResourceReturn } from "@/src/features/resources/server";

export async function POST(request: Request) {
  const session = await getCorporateSession();
  if (!session) return NextResponse.json({ message: "Your corporate session has expired. Sign in again." }, { status: 401 });

  try {
    const body = await request.json() as Record<string, unknown>;
    const resourceId = typeof body.resourceId === "string" ? body.resourceId : "";
    const locationId = typeof body.locationId === "string" ? body.locationId : "";
    const returnId = typeof body.returnId === "string" ? body.returnId : "";
    const decision = body.decision === "ACCEPT" ? "ACCEPT" : body.decision === "REQUEST_CHANGES" ? "REQUEST_CHANGES" : null;
    const reviewNote = typeof body.reviewNote === "string" ? body.reviewNote : "";
    if (!decision) return NextResponse.json({ message: "Choose whether to accept the return or request changes." }, { status: 400 });
    await reviewResourceReturn(session, resourceId, locationId, returnId, decision, reviewNote);
    return NextResponse.json({ message: decision === "ACCEPT" ? "Completed document accepted." : "Changes requested from the store." });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "The return could not be reviewed." }, { status: 400 });
  }
}
