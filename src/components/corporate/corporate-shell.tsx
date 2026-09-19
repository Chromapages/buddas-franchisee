"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Bell,
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  ChevronDown,
  Headphones,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareMore,
  PanelLeftClose,
  PanelLeftOpen,
  PackageSearch,
  ReceiptText,
  ChartNoAxesCombined,
  Search,
  Settings,
  UsersRound,
  X,
} from "lucide-react";
import { logoutAction } from "@/src/features/auth/actions";
import { useDesktopSidebarPreference } from "@/src/components/shared/use-desktop-sidebar-preference";

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
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLDivElement>(null);
  const accountArea = useRef<HTMLDivElement>(null);
  const accountMenu = useRef<HTMLDivElement>(null);
  const accountButton = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const { collapsed, toggle } = useDesktopSidebarPreference("corporate");
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

  useEffect(() => {
    if (!isAccountMenuOpen) return;
    const closeMenu = (restoreFocus: boolean) => {
      setIsAccountMenuOpen(false);
      if (restoreFocus) requestAnimationFrame(() => accountButton.current?.focus());
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Element && event.target.closest(".corporate-sidebar-toggle")) return;
      if (event.target instanceof Node && !accountArea.current?.contains(event.target)) closeMenu(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => accountMenu.current?.querySelector<HTMLElement>("a, button")?.focus());
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isAccountMenuOpen]);

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
        <div>
          <div className="corporate-brand">
            <Link href="/corporate" className="corporate-brand-link" aria-label="Budda's corporate operations home">
              <Image className="corporate-brand-logo" src="/images/Logo-white.svg" width={178} height={36} alt="Budda's Franchising" priority />
              <Image className="corporate-brand-mark" src="/images/favicon.svg" width={32} height={32} alt="" aria-hidden="true" />
            </Link>
            <p>Corporate operations</p>
          </div>
          {navigation()}
        </div>
        <div ref={accountArea} className="corporate-account">
          <button ref={accountButton} type="button" className="corporate-account-trigger" onClick={() => setIsAccountMenuOpen((value) => !value)} aria-label={`Open account menu for ${displayName || email}`} aria-haspopup="dialog" aria-expanded={isAccountMenuOpen} aria-controls="corporate-account-menu" title={`Account: ${displayName || email}`}>
            <span className="corporate-avatar" aria-hidden="true">{(displayName || email).slice(0, 1).toUpperCase()}</span>
            <span className="corporate-account-copy"><strong>{displayName || "Corporate user"}</strong><small>{email}</small></span>
            <ChevronDown className="corporate-account-arrow" size={16} aria-hidden="true" />
          </button>
          <button type="button" className="corporate-sidebar-toggle" onClick={() => { setIsAccountMenuOpen(false); toggle(); }} aria-label={collapsed ? "Expand navigation" : "Collapse navigation"} aria-controls="corporate-desktop-sidebar" aria-expanded={!collapsed} title={collapsed ? "Expand navigation" : "Collapse navigation"}>
            {collapsed ? <PanelLeftOpen size={18} aria-hidden="true" /> : <PanelLeftClose size={18} aria-hidden="true" />}
          </button>
          {isAccountMenuOpen ? <div ref={accountMenu} id="corporate-account-menu" role="dialog" aria-label="Account menu" className="corporate-account-menu">
            <div className="corporate-account-menu-summary"><span className="corporate-avatar" aria-hidden="true">{(displayName || email).slice(0, 1).toUpperCase()}</span><span><strong>{displayName || "Corporate user"}</strong><small>{email}</small></span></div>
            <div className="corporate-account-menu-actions">
              {access.administration ? <Link href="/corporate/administration" onClick={() => setIsAccountMenuOpen(false)}><Settings size={16} aria-hidden="true" />Administration</Link> : null}
              {access.support ? <Link href="/corporate/support" onClick={() => setIsAccountMenuOpen(false)}><Headphones size={16} aria-hidden="true" />Support</Link> : null}
            </div>
            <form action={logoutAction}><button type="submit" className="corporate-account-menu-signout"><LogOut size={16} aria-hidden="true" />Sign out</button></form>
          </div> : null}
        </div>
      </aside>

      <div className="corporate-workspace">
        <header className="corporate-topbar">
          <button ref={menuButton} type="button" className="corporate-menu-button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-controls="corporate-mobile-nav">
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            <span>{menuOpen ? "Close" : "Menu"}</span>
          </button>
          <div className="corporate-scope">
            <span>Portfolio</span>
            <p>{scopeLabel}</p>
          </div>
          <div className="corporate-top-actions">
            <Link href="/corporate/work?search=1" aria-label="Search permitted records"><Search size={19} aria-hidden="true" /><span>Search</span></Link>
            <Link href="/corporate/administration/notifications" aria-label="Notifications"><Bell size={19} aria-hidden="true" /><span>Notifications</span></Link>
          </div>
        </header>
        {menuOpen ? <div ref={drawer} id="corporate-mobile-nav" className="corporate-mobile-nav">{navigation(() => setMenuOpen(false))}</div> : null}
        <main id="corporate-main" tabIndex={-1} className="corporate-main">{children}</main>
      </div>
    </div>
  );
}
