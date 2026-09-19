import { redirect } from "next/navigation";
import { requirePortalPermission } from "@/src/features/portal/authorization-server";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";
import { getOperatorResourcePublication } from "@/src/features/resources/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ resourceId: string }> },
) {
  const session = await requirePortalPermission("VIEW_RESOURCES");
  const { resourceId } = await params;
  const resources = await defaultPortalStorage.getResourcesByLocation(session.locationId, session.role);
  const resource = resources.find((candidate) => candidate.id === resourceId);
  const targeting = resource
    ? await defaultPortalStorage.explainResourceForUnit(resourceId, session.locationId, session.role)
    : null;

  if (!resource || !targeting?.isTargeted) {
    return new Response(null, { status: 404 });
  }

  if (resource.resourcePublicationId === resourceId) {
    const publication = await getOperatorResourcePublication(session, resourceId);
    if (!publication?.document) return new Response(null, { status: 404 });
    redirect(publication.document.url);
  }

  if (!resource.downloadUrl.startsWith("/resources/")) return new Response(null, { status: 404 });

  redirect(resource.downloadUrl);
}
