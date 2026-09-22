import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AccountWorkspace, type AccountSection } from "../account-workspace";

const titles: Record<Exclude<AccountSection, "overview">, string> = {
  "business-billing": "Business & Billing",
  compliance: "Compliance",
  "units-access": "Units & Access",
  security: "Security",
};

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  return { title: titles[section as keyof typeof titles] || "Account & Access" };
}

export default async function AccountSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!Object.hasOwn(titles, section)) notFound();
  return <AccountWorkspace section={section as keyof typeof titles} />;
}
