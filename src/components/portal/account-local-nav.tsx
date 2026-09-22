"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, CreditCard, LockKeyhole, ShieldCheck, User } from "lucide-react";

const sections = [
  { href: "/portal/account", label: "Overview", icon: User },
  { href: "/portal/account/business-billing", label: "Business & Billing", icon: CreditCard },
  { href: "/portal/account/compliance", label: "Compliance", icon: ShieldCheck },
  { href: "/portal/account/units-access", label: "Units & Access", icon: Building2 },
  { href: "/portal/account/security", label: "Security", icon: LockKeyhole },
] as const;

export function AccountLocalNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return <nav className={`account-local-nav${mobile ? " account-local-nav-mobile" : ""}`} aria-label="Account navigation">
    {sections.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}><Icon aria-hidden="true" />{label}</Link>)}
  </nav>;
}
