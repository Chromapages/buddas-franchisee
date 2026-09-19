import { NextResponse } from "next/server";
import { getPortalSession } from "@/src/features/auth/session";
import { recordPortalAudit } from "@/src/features/portal/audit";
import { acknowledgeResource } from "@/src/features/resources/server";

export async function POST(request: Request) {
  const session = await getPortalSession();
  if (!session) return NextResponse.json({ message: "Your session has expired. Sign in again." }, { status: 401 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const resourceId = typeof body.resourceId === "string" ? body.resourceId.trim() : "";
    if (!resourceId) return NextResponse.json({ message: "This resource could not be identified." }, { status: 400 });
    await acknowledgeResource(session, resourceId);
    await recordPortalAudit({ actor: session, action: "RESOURCE_ACKNOWLEDGED", outcome: "SUCCESS", unitId: session.locationId, resourceType: "resource", resourceId });
    return NextResponse.json({ message: "Acknowledgement recorded." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The acknowledgement could not be recorded.";
    await recordPortalAudit({ actor: session, action: "RESOURCE_ACKNOWLEDGED", outcome: "FAILURE", unitId: session.locationId, resourceType: "resource", metadata: { reason: message } });
    return NextResponse.json({ message }, { status: 400 });
  }
}
