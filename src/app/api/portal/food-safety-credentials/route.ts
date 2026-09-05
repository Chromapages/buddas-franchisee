import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getPortalSession } from "@/src/features/auth/session";
import { hasPortalPermission } from "@/src/features/portal/authorization";
import { recordPortalAudit } from "@/src/features/portal/audit";
import { firebaseDb } from "@/src/lib/firebase/admin";
import { uploadCredentialAsset } from "@/src/lib/sanity/credential-upload";

const validTypes = new Set(["SERVSAFE", "STATE_HEALTH_CERTIFICATION", "FOOD_HANDLER_CARD"]);

export async function POST(request: Request) {
  const session = await getPortalSession();
  if (!session || !hasPortalPermission(session, "MANAGE_FOOD_SAFETY_CREDENTIALS") || !firebaseDb) {
    return NextResponse.json({ message: "You are not authorized to submit a credential." }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const unitId = String(formData.get("unitId") ?? "");
    const type = String(formData.get("credentialType") ?? "");
    const holderName = String(formData.get("holderName") ?? "").trim();
    const expiresAtValue = String(formData.get("expiresAt") ?? "").trim();
    const file = formData.get("credentialFile");
    if (unitId !== session.locationId || !validTypes.has(type) || holderName.length < 2 || holderName.length > 128 || !(file instanceof File)) {
      return NextResponse.json({ message: "Review the credential type, holder name, and attached file." }, { status: 400 });
    }
    const expiresAt = expiresAtValue && Number.isFinite(new Date(expiresAtValue).getTime()) ? new Date(expiresAtValue).toISOString() : undefined;
    if (expiresAtValue && !expiresAt) return NextResponse.json({ message: "Enter a valid expiration date or leave it blank." }, { status: 400 });

    const asset = await uploadCredentialAsset(file);
    const credentialId = `cred-${randomUUID()}`;
    const submittedAt = new Date().toISOString();
    await firebaseDb.collection("units").doc(session.locationId).collection("foodSafetyCredentials").doc(credentialId).set({
      type,
      holderName,
      status: "SUBMITTED",
      ...(expiresAt ? { expiresAt } : {}),
      sanityAssetId: asset.id,
      documentUrl: asset.url,
      mimeType: asset.mimeType,
      fileSize: asset.size,
      submittedByUserId: session.userId,
      submittedAt,
    });
    await recordPortalAudit({ actor: session, action: "FOOD_SAFETY_CREDENTIAL_SUBMITTED", outcome: "SUCCESS", unitId: session.locationId, resourceType: "food_safety_credential", resourceId: credentialId, metadata: { credentialType: type, sanityAssetId: asset.id } });
    return NextResponse.json({ id: credentialId, message: "Credential submitted for review." }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error && error.message === "Use a PDF, JPEG, or PNG file up to 10 MB." ? error.message : "Credential submission could not be completed. Please try again.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
