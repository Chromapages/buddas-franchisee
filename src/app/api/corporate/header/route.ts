import { NextResponse } from "next/server";
import { loadCorporateWork } from "@/src/components/corporate/corporate-data";
import { hasCorporatePermission } from "@/src/features/corporate/authorization";
import { getCorporateSession } from "@/src/features/corporate/session";
import { getCorporateStorage } from "@/src/features/corporate/storage";
import { listCorporateResourcePublications } from "@/src/features/resources/server";

export async function GET() {
  const session = await getCorporateSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const storage = getCorporateStorage();
  const [locationsResult, workResult, resourcesResult, publicationsResult] = await Promise.allSettled([
    hasCorporatePermission(session, "VIEW_DIRECTORY") ? storage.getLocations(session) : Promise.resolve([]),
    loadCorporateWork(session),
    hasCorporatePermission(session, "VIEW_RESOURCES") ? storage.getResources(session) : Promise.resolve([]),
    hasCorporatePermission(session, "VIEW_RESOURCES") ? listCorporateResourcePublications(session) : Promise.resolve([]),
  ]);
  const locations = locationsResult.status === "fulfilled" ? locationsResult.value : [];
  const work = workResult.status === "fulfilled" ? workResult.value : [];
  const resources = resourcesResult.status === "fulfilled" ? resourcesResult.value : [];
  const publications = publicationsResult.status === "fulfilled" ? publicationsResult.value : [];
  const safeWorkHref = (href: string) => href.startsWith("/corporate/") ? href : "/corporate/work";
  const openWork = work.filter((record) => !record.isClosed);
  const attentionWork = openWork.filter((record) => record.priority !== "NORMAL" || record.assignedToUserId === session.userId);
  const recentWork = [...openWork].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const activity = [...new Map([...attentionWork.slice(0, 5), ...recentWork].map((record) => [record.id, record] as const)).values()].slice(0, 8);

  // ponytail: Cap quick-result payload; use a server-side query if search must cover older records inline.
  return NextResponse.json({
    locations: locations.slice(0, 80).map((location) => ({ id: location.id, name: location.name, code: location.code })),
    locationCount: locations.length,
    searchItems: [
      ...work.slice(0, 100).map((record) => ({ id: record.id, category: record.type, title: record.subject, detail: `${record.reference} · ${record.locationName || record.state}`, href: safeWorkHref(record.href) })),
      ...locations.slice(0, 80).map((location) => ({ id: `location:${location.id}`, category: "units", title: location.name, detail: location.code, href: `/corporate/directory/locations/${encodeURIComponent(location.id)}` })),
      ...publications.slice(0, 60).map((resource) => ({ id: `publication:${resource.id}`, category: "resources", title: resource.title, detail: resource.category, href: `/corporate/resources/${encodeURIComponent(resource.id)}` })),
      ...resources.slice(0, 40).map((resource) => ({ id: `resource:${resource.id}`, category: "resources", title: resource.title, detail: resource.category, href: "/corporate/resources" })),
    ],
    activity: activity.map((record) => ({
      id: record.id, reference: record.reference, title: record.subject, detail: record.locationName || record.state,
      href: safeWorkHref(record.href), updatedAt: record.updatedAt,
      needsAttention: record.priority !== "NORMAL" || record.assignedToUserId === session.userId,
    })),
    attentionCount: attentionWork.length,
    availability: { locations: locationsResult.status === "fulfilled", work: workResult.status === "fulfilled", resources: resourcesResult.status === "fulfilled" && publicationsResult.status === "fulfilled" },
  }, { headers: { "Cache-Control": "private, no-store" } });
}
