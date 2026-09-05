import { redirect } from "next/navigation";
import { requirePortalPermission } from "@/src/features/portal/authorization-server";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ resourceId: string }> },
) {
  const session = await requirePortalPermission("VIEW_RESOURCES");
  const { resourceId } = await params;
  const resources = await defaultPortalStorage.getResourcesByLocation(session.locationId);
  const resource = resources.find((candidate) => candidate.id === resourceId);

  if (!resource || !resource.downloadUrl.startsWith("/resources/")) {
    return new Response(null, { status: 404 });
  }

  redirect(resource.downloadUrl);
}
