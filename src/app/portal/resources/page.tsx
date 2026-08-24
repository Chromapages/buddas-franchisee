import { getPortalSession } from "@/src/features/auth/session";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";
import { FileText, Download, FolderOpen } from "lucide-react";

export default async function ResourcesPage() {
  const session = (await getPortalSession())!;
  const resources = await defaultPortalStorage.getResourcesByLocation(session.locationId);

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-brand-clay">
          Brand &amp; Operations Center
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brand-charcoal">
          Operations Manuals &amp; SOPs
        </h2>
        <p className="text-sm text-brand-charcoal/70 mt-1">
          Authorized training guides, recipes, and marketing toolkits for <strong>{session.locationName}</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resources.map((res) => (
          <div
            key={res.id}
            className="bg-white border border-brand-charcoal/10 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6 hover:border-brand-mango transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-sand text-brand-clay">
                  {res.category}
                </span>
                <span className="text-xs font-semibold text-brand-charcoal/50">
                  Version {res.version}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold font-heading text-brand-charcoal">
                  {res.title}
                </h3>
                <p className="text-xs text-brand-charcoal/60 mt-1">
                  Updated: {new Date(res.updatedAt).toLocaleDateString()} &bull; File Size: {res.fileSize}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-brand-sand flex items-center justify-between">
              <span className="text-xs text-brand-charcoal/50">Confidential / Franchisee Only</span>
              <a
                href={res.downloadUrl}
                download
                className="btn-outline !py-2 !px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                Download PDF
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
