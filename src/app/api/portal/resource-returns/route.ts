import { NextResponse } from "next/server";
import { getPortalSession } from "@/src/features/auth/session";
import { recordPortalAudit } from "@/src/features/portal/audit";
import { assertOperatorResourceReturnAvailable, submitResourceReturn } from "@/src/features/resources/server";
import { uploadOperationalResourceAsset } from "@/src/lib/sanity/credential-upload";

export async function POST(request: Request) {
  const session = await getPortalSession();
  if (!session) return NextResponse.json({ message: "Your session has expired. Sign in again." }, { status: 401 });

  try {
    const formData = await request.formData();
    const resourceId = typeof formData.get("resourceId") === "string" ? String(formData.get("resourceId")).trim() : "";
    const file = formData.get("completedDocument");
    if (!resourceId || !(file instanceof File) || file.size <= 0) return NextResponse.json({ message: "Choose the completed document before submitting it for review." }, { status: 400 });
    await assertOperatorResourceReturnAvailable(session, resourceId);
    const document = await uploadOperationalResourceAsset(file);
    await submitResourceReturn(session, resourceId, document);
    await recordPortalAudit({ actor: session, action: "RESOURCE_RETURN_SUBMITTED", outcome: "SUCCESS", unitId: session.locationId, resourceType: "resource_return", resourceId });
    return NextResponse.json({ message: "Completed document sent to Corporate for review." }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The completed document could not be submitted.";
    await recordPortalAudit({ actor: session, action: "RESOURCE_RETURN_SUBMITTED", outcome: "FAILURE", unitId: session.locationId, resourceType: "resource_return", metadata: { reason: message } });
    return NextResponse.json({ message }, { status: 400 });
  }
}
