import { NextResponse } from "next/server";
import { assertCorporatePermission } from "@/src/features/corporate/authorization";
import { getCorporateSession } from "@/src/features/corporate/session";
import { saveResourcePublication } from "@/src/features/resources/server";
import { uploadOperationalResourceAsset } from "@/src/lib/sanity/credential-upload";

const value = (formData: FormData, key: string) => typeof formData.get(key) === "string" ? String(formData.get(key)) : "";

export async function POST(request: Request) {
  const session = await getCorporateSession();
  if (!session) return NextResponse.json({ message: "Your corporate session has expired. Sign in again." }, { status: 401 });

  try {
    assertCorporatePermission(session, "PUBLISH_RESOURCES");
    if (session.isDevelopmentPreview) return NextResponse.json({ message: "Resource publishing is unavailable in the fictional preview." }, { status: 400 });
    const formData = await request.formData();
    const intentValue = value(formData, "intent");
    const intent = intentValue === "PUBLISH" ? "PUBLISH" : intentValue === "DRAFT" ? "DRAFT" : null;
    if (!intent) return NextResponse.json({ message: "Choose whether to save a draft or publish the resource." }, { status: 400 });
    const attachment = formData.get("document");
    const document = attachment instanceof File && attachment.size > 0 ? await uploadOperationalResourceAsset(attachment) : undefined;
    const resource = await saveResourcePublication(session, {
      resourceId: value(formData, "resourceId") || undefined,
      intent,
      title: value(formData, "title"),
      category: value(formData, "category"),
      version: value(formData, "version"),
      requiredAction: value(formData, "requiredAction"),
      instructions: value(formData, "instructions"),
      dueAt: value(formData, "dueAt"),
      locationIds: formData.getAll("locationIds").filter((item): item is string => typeof item === "string"),
      ...(document ? { document } : {}),
    });
    return NextResponse.json({ id: resource.id, state: resource.state, message: resource.state === "DRAFT" ? "Resource draft saved." : `Resource published to ${resource.recipientCount} store${resource.recipientCount === 1 ? "" : "s"}.` }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The resource could not be saved.";
    const status = /session|access|scope|permission/i.test(message) ? 403 : 400;
    return NextResponse.json({ message }, { status });
  }
}
