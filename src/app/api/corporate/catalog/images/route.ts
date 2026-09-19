import { NextResponse } from "next/server";
import { assertCorporatePermission } from "@/src/features/corporate/authorization";
import { getCorporateSession } from "@/src/features/corporate/session";
import { firebaseDb } from "@/src/lib/firebase/admin";
import { uploadCatalogImageAsset } from "@/src/lib/sanity/credential-upload";

const skuPattern = /^[A-Z0-9][A-Z0-9_-]{1,31}$/;

export async function POST(request: Request) {
  const session = await getCorporateSession();
  if (!session) return NextResponse.json({ message: "Your corporate session has expired. Sign in again." }, { status: 401 });
  try {
    assertCorporatePermission(session, "MANAGE_CATALOG");
    if (session.isDevelopmentPreview) return NextResponse.json({ message: "Product image uploads are unavailable in this preview session." }, { status: 400 });
    const formData = await request.formData();
    const sku = String(formData.get("sku") || "").trim().toUpperCase();
    const name = String(formData.get("name") || "").normalize("NFKC").trim().slice(0, 128);
    const image = formData.get("image");
    if (!skuPattern.test(sku) || !name || !(image instanceof File)) return NextResponse.json({ message: "Enter the item name and SKU before selecting a product image." }, { status: 400 });
    const asset = await uploadCatalogImageAsset(image, sku);
    if (firebaseDb) {
      const audit = firebaseDb.collection("corporateAuditEvents").doc();
      await audit.create({ id: audit.id, recordId: sku, recordType: "catalog_image", locationId: null, organizationId: null, regionId: null, actorId: session.userId, actorName: session.displayName, action: "CATALOG_IMAGE_UPLOADED", occurredAt: new Date().toISOString(), commandId: audit.id, previousVersion: null, nextVersion: 1, changes: { storage: { before: null, after: asset.id }, mimeType: { before: null, after: asset.mimeType }, size: { before: null, after: asset.size } } });
    }
    return NextResponse.json({ imageUrl: asset.url, imageAlt: `${name} (${sku})`, assetId: asset.id, mimeType: asset.mimeType, size: asset.size }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Product image upload could not be completed.";
    return NextResponse.json({ message }, { status: /access|permission|scope/i.test(message) ? 403 : 400 });
  }
}
