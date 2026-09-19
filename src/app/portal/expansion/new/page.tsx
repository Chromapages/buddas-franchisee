import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CircleHelp, FileText, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { requirePortalPermission } from "@/src/features/portal/authorization-server";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";
import { getAccountEntityRecord } from "@/src/features/portal/account-private-records";
import { ExpansionRequestForm } from "@/src/components/portal/expansion-request-form";

export const metadata: Metadata = { title: "Request Another Location" };

export default async function NewExpansionRequestPage() {
  const session = await requirePortalPermission("ACCESS_WORKSPACE");
  if (session.role === "admin") redirect("/portal/expansion");
  const [corporateEntity, workingLocation] = await Promise.all([
    getAccountEntityRecord(session),
    defaultPortalStorage.getLocationById(session.locationId).catch(() => null),
  ]);

  return <div className="growth-request-form-page">
    <header className="growth-request-form-header"><div><p className="portal-page-eyebrow">Portfolio growth</p><h1 className="portal-page-title">Request another location</h1><p>Share the proposed market, timing, and operating plan for Franchise Development review.</p></div><Link href="/franchise/process">How development requests work <ArrowRight aria-hidden="true" /></Link></header>
    <div className="growth-request-form-layout">
      <main><section className="expansion-compose" aria-label="New development request"><ExpansionRequestForm key={session.locationId} workingUnitId={session.locationId} workingUnitName={session.locationName} entityName={corporateEntity?.legalName || workingLocation?.franchiseeName} /></section></main>
      <aside className="growth-request-form-rail" aria-label="Request guidance">
        <section><FileText aria-hidden="true" /><div><h2>What happens next?</h2><p>After you review and submit, Franchise Development evaluates your request and follows up with next steps.</p><Link href="/franchise/process">View the development process <ArrowRight aria-hidden="true" /></Link></div></section>
        <section><CircleHelp aria-hidden="true" /><div><h2>Need help?</h2><p>Questions about the request or development process? Operations Support can help.</p><Link href="/portal/support">Contact Operations Support <ArrowRight aria-hidden="true" /></Link></div></section>
        <section className="growth-request-important"><ShieldCheck aria-hidden="true" /><div><h2>Important</h2><p>Submitting a request does not reserve territory. Territory rights depend on the approved review process and an executed agreement.</p></div></section>
      </aside>
    </div>
  </div>;
}
