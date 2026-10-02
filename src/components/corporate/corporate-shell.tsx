"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Building2,
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Headphones,
  LayoutDashboard,
  MessageSquareMore,
  PackageSearch,
  ReceiptText,
  ChartNoAxesCombined,
  Settings,
  UsersRound,
} from "lucide-react";
import { useDesktopSidebarPreference } from "@/src/components/shared/use-desktop-sidebar-preference";
import { CorporateHeader } from "@/src/components/corporate/corporate-header";

export type CorporateNavAccess = {
  requests: boolean;
  inquiries: boolean;
  catalog: boolean;
  orders: boolean;
  support: boolean;
  directory: boolean;
  resources: boolean;
  administration: boolean;
  reporting: boolean;
};

type CorporateShellProps = {
  children: ReactNode;
  displayName: string;
  email: string;
  scopeLabel: string;
  access: CorporateNavAccess;
};

const primaryItems = [
  { href: "/corporate", label: "My work", icon: LayoutDashboard, access: null, group: "Work" },
  { href: "/corporate/work", label: "Work queue", icon: ClipboardList, access: null, group: "Work" },
  { href: "/corporate/requests", label: "Requests", icon: ClipboardCheck, access: "requests", group: "Work" },
  { href: "/corporate/catalog", label: "Store catalog", icon: PackageSearch, access: "catalog", group: "Operations" },
  { href: "/corporate/orders", label: "Orders", icon: ReceiptText, access: "orders", group: "Operations" },
  { href: "/corporate/reporting/orders", label: "Reporting", icon: ChartNoAxesCombined, access: "reporting", group: "Operations" },
  { href: "/corporate/support", label: "Support", icon: Headphones, access: "support", group: "Operations" },
  { href: "/corporate/directory", label: "Directory", icon: UsersRound, access: "directory", group: "Operations" },
  { href: "/corporate/resources", label: "Resources", icon: BookOpen, access: "resources", group: "Operations" },
  { href: "/corporate/inquiries", label: "Franchise inquiries", icon: MessageSquareMore, access: "inquiries", group: "Growth" },
] as const;

export function CorporateShell({ children, displayName, email, scopeLabel, access }: CorporateShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  const { collapsed, toggle } = useDesktopSidebarPreference("corporate");
  const accountInitials = displayName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || email[0]?.toUpperCase() || "C";
  const visibleItems = primaryItems.filter((item) => item.access === null || access[item.access]);
  const navigationGroups = (["Work", "Operations", "Growth"] as const).map((group) => ({ group, items: visibleItems.filter((item) => item.group === group) })).filter((entry) => entry.items.length > 0);

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  useEffect(() => {
    if (menuOpen) drawer.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    else if (wasOpen.current) menuButton.current?.focus();
    wasOpen.current = menuOpen;
  }, [menuOpen]);

  const navigation = (onNavigate?: () => void) => (
    <nav aria-label="Corporate operations">
      <div className="corporate-nav-groups">
        {navigationGroups.map(({ group, items }) => <section key={group} className="corporate-nav-group" aria-labelledby={`corporate-nav-${group.toLowerCase()}`}>
          <p id={`corporate-nav-${group.toLowerCase()}`}>{group}</p>
          <ul className="corporate-nav-list">
            {items.map((item) => {
              const Icon = item.icon;
              const current = item.href === "/corporate" ? pathname === item.href : pathname.startsWith(item.href);
              return <li key={item.href}><Link href={item.href} onClick={onNavigate} aria-current={current ? "page" : undefined} aria-label={item.label} title={item.label} className="corporate-nav-link"><Icon size={18} aria-hidden="true" /><span className="corporate-nav-label">{item.label}</span></Link></li>;
            })}
          </ul>
        </section>)}
        {access.administration ? <section className="corporate-nav-group corporate-nav-admin" aria-labelledby="corporate-nav-governance">
          <p id="corporate-nav-governance">Governance</p>
          <Link href="/corporate/administration" onClick={onNavigate} aria-current={pathname.startsWith("/corporate/administration") ? "page" : undefined} aria-label="Administration" title="Administration" className="corporate-nav-link"><Settings size={18} aria-hidden="true" /><span className="corporate-nav-label">Administration</span></Link>
        </section> : null}
      </div>
    </nav>
  );

  return (
    <div className="corporate-shell" data-sidebar-collapsed={collapsed || undefined}>
      <a className="corporate-skip-link" href="#corporate-main">Skip to corporate workspace</a>
      <aside id="corporate-desktop-sidebar" className="corporate-rail" aria-label="Corporate operations sidebar">
        <div className="corporate-rail-heading">
          <div className="corporate-brand">
            <Link href="/corporate" className="corporate-brand-link" aria-label="Budda's corporate operations home">
              <Image className="corporate-brand-logo" src="/images/Logo-white.svg" width={178} height={36} alt="Budda's Franchising" priority />
              <Image className="corporate-brand-mark" src="/images/favicon.svg" width={32} height={32} alt="" aria-hidden="true" />
            </Link>
            <p>Corporate operations</p>
          </div>
          <div className="corporate-rail-context" aria-label={`Portfolio: ${scopeLabel}`} title={scopeLabel}>
            <Building2 size={26} aria-hidden="true" />
            <span><strong>Portfolio</strong><small>{scopeLabel}</small></span>
          </div>
        </div>
        <div className="corporate-rail-scroll">
          {navigation()}
        </div>
        <div className="corporate-sidebar-footer">
          <button type="button" className="corporate-sidebar-toggle" onClick={toggle} aria-label={collapsed ? "Expand navigation" : "Collapse navigation"} aria-controls="corporate-desktop-sidebar" aria-expanded={!collapsed} title={collapsed ? "Expand navigation" : "Collapse navigation"}>
            {collapsed ? <ChevronRight size={20} aria-hidden="true" /> : <ChevronLeft size={20} aria-hidden="true" />}
            <span className="corporate-sidebar-toggle-label">{collapsed ? "Expand sidebar" : "Collapse sidebar"}</span>
          </button>
        </div>
      </aside>

      <div className="corporate-workspace">
        <CorporateHeader displayName={displayName} email={email} initials={accountInitials} scopeLabel={scopeLabel} access={access} mobileMenuOpen={menuOpen} mobileMenuButton={menuButton} onToggleMobileMenu={() => setMenuOpen((value) => !value)} />
        {menuOpen ? <div ref={drawer} id="corporate-mobile-nav" className="corporate-mobile-nav">{navigation(() => setMenuOpen(false))}</div> : null}
        <main id="corporate-main" tabIndex={-1} className="corporate-main">{children}</main>
      </div>
    </div>
  );
}
