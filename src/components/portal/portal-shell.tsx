"use client";

import { memo, useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import {
  House,
  Package,
  ShoppingCart,
  Truck,
  BookOpen,
  HelpCircle,
  User,
  LogOut,
  MoreHorizontal,
  X,
  Store,
  BarChart3,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Info,
  ArrowLeft,
  Search,
} from "lucide-react";
import { logoutAction, switchPortalLocationAction } from "@/src/features/auth/actions";
import type { PortalSession } from "@/src/lib/auth/auth-provider";
import type { PortalLocation } from "@/src/features/portal/types";
import { hasPortalPermission, type PortalPermission } from "@/src/features/portal/authorization";
import { ordersListHref, parseOrdersListQuery } from "@/src/features/portal/orders-query";
import {
  PortalCartBadge,
  PortalNavBadge,
  usePortalContext,
  type ScopedNotificationCounts,
} from "@/src/features/portal/portal-context";
import { consumeConfirmedOperatorLocationSwitch, markOperatorLocationSwitch, trackOperatorWorkspaceEvent, type OperatorAnalyticsProperties } from "@/src/lib/analytics";
import { useDesktopSidebarPreference } from "@/src/components/shared/use-desktop-sidebar-preference";
import { AccountLocalNav } from "@/src/components/portal/account-local-nav";

export type PortalShellProps = {
  session: PortalSession;
  locations: PortalLocation[];
  children: ReactNode;
};

type LocationSelectorProps = {
  id: string;
  session: PortalSession;
  locations: PortalLocation[];
  returnTo: string;
  tone: "header" | "sidebar";
};

const UnitPicker = ({ id, session, locations, tone }: Omit<LocationSelectorProps, "returnTo">) => {
  const { pending } = useFormStatus();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const filteredLocations = locations.filter((location) =>
    (location.name + " " + location.id + " " + location.city + " " + location.state).toLowerCase().includes(query.trim().toLowerCase()),
  );
  const current = locations.find((location) => location.id === session.locationId);
  const label = selectedLabel || (current ? current.name + " · " + current.id : session.locationName + " · " + session.locationId);

  useEffect(() => {
    if (pending) setIsOpen(false);
  }, [pending]);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setIsOpen(false);
      requestAnimationFrame(() => triggerRef.current?.focus());
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return <div ref={containerRef} className={"portal-location-selector portal-location-selector-" + tone} data-pending={pending || undefined}>
    <button ref={triggerRef} type="button" onClick={() => setIsOpen((value) => !value)} disabled={pending} aria-expanded={isOpen} aria-controls={id + "-options"} aria-label={`Choose working location: ${label}`} title={label} className="portal-location-trigger">
      <Store size={16} aria-hidden="true" />
      <span><strong>{session.locationName}</strong><small>{session.locationId}</small></span>
      <ChevronDown size={16} aria-hidden="true" />
    </button>
    <span className="sr-only" role="status" aria-live="polite">{pending ? "Switching to " + label + "." : ""}</span>
    {isOpen ? <div id={id + "-options"} role="group" aria-label="Choose working unit" className="portal-location-options">
      {locations.length > 8 ? <label className="portal-location-search"><Search size={15} aria-hidden="true" /><span className="sr-only">Search locations</span><input autoFocus type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search locations" /></label> : null}
      <ul>{filteredLocations.map((location) => <li key={location.id}><button type="submit" name="locationId" value={location.id} disabled={pending} onClick={() => { setSelectedLabel(location.name + " · " + location.id); if (location.id !== session.locationId) markOperatorLocationSwitch(location.id); }} aria-current={location.id === session.locationId ? "true" : undefined}><span><strong>{location.name}</strong><small>{location.id}</small></span>{location.id === session.locationId ? <span className="portal-location-current">Current</span> : null}</button></li>)}</ul>
      {!filteredLocations.length ? <p className="portal-location-empty">No authorized locations match that search.</p> : null}
    </div> : null}
  </div>;
};

const LocationSelector = ({ id, session, locations, returnTo, tone }: LocationSelectorProps) => {
  if (locations.length <= 1) return <div className={"portal-location-static portal-location-static-" + tone} aria-label={`Working location: ${session.locationName} ${session.locationId}`} title={`${session.locationName} ${session.locationId}`}><Store size={16} aria-hidden="true" /><span><strong>{session.locationName}</strong><small>{session.locationId}</small></span></div>;
  return <form action={switchPortalLocationAction} className="portal-location-form"><input type="hidden" name="returnTo" value={returnTo} /><UnitPicker id={id} session={session} locations={locations} tone={tone} /></form>;
};

const HeaderCartLink = () => {
  const { counts } = usePortalContext();
  const itemCount = counts.cartItemCount;
  const hasItems = itemCount !== null && itemCount > 0;
  const label = hasItems ? "Open current supply order with " + itemCount + " item" + (itemCount === 1 ? "." : "s.") : itemCount === null ? "Open supply cart. Item count unavailable." : "Open supply cart. Cart is empty.";
  return <Link href="/portal/cart" className={"portal-header-cart" + (hasItems ? " portal-header-cart-has-items" : "")} aria-label={label}>
    <ShoppingCart className="w-4 h-4 shrink-0" aria-hidden="true" />
    {hasItems ? <><span className="portal-header-cart-label">Current order</span><PortalCartBadge /></> : <span className="sr-only">Cart</span>}
  </Link>;
};

const PortalShellComponent = ({
  session,
  locations,
  children,
}: PortalShellProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAccountSettingsRoute = pathname === "/portal/account" || ["business-billing", "compliance", "units-access", "security"].some((section) => pathname === `/portal/account/${section}`);
  const orderListHref = pathname.startsWith("/portal/orders/")
    ? ordersListHref(parseOrdersListQuery(Object.fromEntries(searchParams.entries())))
    : "/portal/orders";
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const { collapsed: sidebarCollapsed, toggle: toggleSidebar } = useDesktopSidebarPreference("operator");
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMoreRef = useRef<HTMLDivElement>(null);
  const sidebarFooterRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const accountButtonRef = useRef<HTMLButtonElement>(null);
  const wasMobileMoreOpen = useRef(false);
  const restoreMoreTriggerFocus = useRef(false);
  const mobileNavigationRef = useRef<HTMLElement>(null);

  const navItems = [
    { href: "/portal", label: "Dashboard", sidebarLabel: "Dashboard", icon: House, permission: "ACCESS_WORKSPACE", group: "Work" },
    { href: "/portal/orders", label: "Orders & Shipments", sidebarLabel: "Orders", icon: Truck, permission: "VIEW_ORDERS", group: "Work" },
    { href: "/portal/supplies", label: "Supplies Catalog", sidebarLabel: "Supplies", icon: Package, permission: "VIEW_CATALOG", group: "Work" },
    { href: "/portal/resources", label: "Resource Center", sidebarLabel: "Resources", icon: BookOpen, permission: "VIEW_RESOURCES", group: "Operations" },
    { href: "/portal/bulletins", label: "Corporate Bulletins", sidebarLabel: "Bulletins", icon: Bell, permission: "ACCESS_WORKSPACE", group: "Operations", countKey: "actionRequiredBulletinCount" as const },
    { href: "/portal/support", label: "Operations Support", sidebarLabel: "Support", icon: HelpCircle, permission: "VIEW_SUPPORT", group: "Operations", countKey: "actionRequiredSupportCount" as const },
    { href: "/portal/expansion", label: "Growth Requests", sidebarLabel: "Growth Requests", icon: BarChart3, permission: "ACCESS_WORKSPACE", group: "Growth" },
    { href: "/portal/account", label: "Account Profile", sidebarLabel: "Account", icon: User, permission: "VIEW_ACCOUNT", group: "Account" },
  ] satisfies Array<{
    href: string;
    label: string;
    sidebarLabel: string;
    icon: typeof House;
    permission: PortalPermission;
    group: "Work" | "Operations" | "Growth" | "Account";
    countKey?: keyof ScopedNotificationCounts;
  }>;
  const visibleNavItems = navItems.filter((item) => hasPortalPermission(session, item.permission));
  const desktopNavGroups = (["Work", "Operations", "Growth"] as const).map((group) => ({ group, items: visibleNavItems.filter((item) => item.group === group) })).filter((entry) => entry.items.length > 0);
  const mobilePrimaryNavItems = ["/portal", "/portal/orders", "/portal/supplies", "/portal/resources"].flatMap((href) => visibleNavItems.filter((item) => item.href === href));
  const mobileSecondaryNavItems = visibleNavItems.filter((item) => !mobilePrimaryNavItems.includes(item));
  const accountInitials = session.displayName?.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || session.email[0].toUpperCase();
  const accountRole = session.role === "admin" ? "Administrator" : "Franchisee";
  const returnTo = pathname + (searchParams.size ? "?" + searchParams.toString() : "");
  const analyticsRoute = (href: string): OperatorAnalyticsProperties["route"] =>
    href === "/portal" || href === "/portal/cart" || href === "/portal/checkout" || href === "/portal/orders" || href === "/portal/support" || href === "/portal/resources" || href === "/portal/supplies" || href === "/portal/bulletins" ? href : undefined;

  useEffect(() => {
    if (consumeConfirmedOperatorLocationSwitch(session.locationId)) {
      trackOperatorWorkspaceEvent("operator_location_switched", {
        role_category: session.role,
        location_scope_count: locations.length,
      });
    }
  }, [locations.length, session.locationId, session.role]);

  useEffect(() => {
    setIsAccountMenuOpen(false);
    setIsMobileMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileMoreOpen) return;
    const bodyOverflow = document.body.style.overflow;
    const rootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = rootOverflow;
    };
  }, [isMobileMoreOpen]);

  const handleToggleMobileMore = () => {
    setIsMobileMoreOpen((prev) => !prev);
  };

  const handleCloseMobileMore = (shouldRestoreFocus = true) => {
    restoreMoreTriggerFocus.current = shouldRestoreFocus;
    setIsMobileMoreOpen(false);
  };

  const handleMobileMoreKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const focusable = mobileMoreRef.current?.querySelectorAll<HTMLElement>("button, a, select, input, textarea, [tabindex]:not([tabindex='-1'])");
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMobileMoreOpen) {
        event.preventDefault();
        handleCloseMobileMore();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isMobileMoreOpen]);

  useEffect(() => {
    if (!isAccountMenuOpen) return;
    const closeMenu = (restoreFocus: boolean) => {
      setIsAccountMenuOpen(false);
      if (restoreFocus) requestAnimationFrame(() => accountButtonRef.current?.focus());
    };
    const onClick = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest(".portal-sidebar-toggle")) return;
      if (event.target instanceof Node && !sidebarFooterRef.current?.contains(event.target)) closeMenu(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
      }
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => accountMenuRef.current?.querySelector<HTMLElement>("a, button")?.focus());
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isAccountMenuOpen]);

  useEffect(() => {
    const navigation = mobileNavigationRef.current;
    const workspace = navigation?.parentElement;
    if (!navigation || !workspace) return;
    const updateHeight = () => workspace.style.setProperty("--portal-mobile-tabbar-measured-height", navigation.getBoundingClientRect().height + "px");
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(navigation);
    window.addEventListener("resize", updateHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
      workspace.style.removeProperty("--portal-mobile-tabbar-measured-height");
    };
  }, []);

  useEffect(() => {
    const keepVisible = (event: globalThis.FocusEvent) => {
      const navigation = mobileNavigationRef.current;
      const target = event.target;
      const main = document.getElementById("portal-main-content");
      if (!navigation?.offsetHeight || !(target instanceof HTMLElement) || !main?.contains(target)) return;
      const moveAboveNavigation = () => {
        if (document.activeElement !== target) return;
        const clearance = 16;
        const overlap = target.getBoundingClientRect().bottom - navigation.getBoundingClientRect().top + clearance;
        if (overlap <= 0) return;
        const workspace = navigation.parentElement;
        if (workspace instanceof HTMLElement && workspace.scrollHeight > workspace.clientHeight) {
          workspace.scrollBy({ top: overlap, behavior: "auto" });
          return;
        }
        if (document.scrollingElement) document.scrollingElement.scrollTop += overlap;
      };
      window.setTimeout(moveAboveNavigation, 0);
      window.setTimeout(moveAboveNavigation, 160);
    };
    document.addEventListener("focusin", keepVisible);
    return () => document.removeEventListener("focusin", keepVisible);
  }, []);

  useEffect(() => {
    if (isMobileMoreOpen) {
      mobileMoreRef.current?.querySelector<HTMLElement>("button, a, select")?.focus();
    } else if (wasMobileMoreOpen.current && restoreMoreTriggerFocus.current) {
      requestAnimationFrame(() => moreButtonRef.current?.focus());
    }
    wasMobileMoreOpen.current = isMobileMoreOpen;
  }, [isMobileMoreOpen]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 64rem)");
    const closeForDesktop = () => {
      if (!desktop.matches) return;
      restoreMoreTriggerFocus.current = false;
      setIsMobileMoreOpen(false);
    };
    closeForDesktop();
    desktop.addEventListener("change", closeForDesktop);
    return () => desktop.removeEventListener("change", closeForDesktop);
  }, []);

  return (
    <div className="portal-shell bg-white flex flex-col lg:h-dvh lg:overflow-hidden lg:flex-row" data-sidebar-collapsed={sidebarCollapsed || undefined}>
      <a
        href="#portal-main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:font-bold focus:text-bds-teal-dark focus:ring-4 focus:ring-bds-gold"
      >
        Skip to workspace content
      </a>

      {/* Sidebar for Desktop */}
      <aside
        id="operator-desktop-sidebar"
        aria-label="Operator Workspace sidebar"
        className="portal-sidebar hidden lg:h-dvh lg:overflow-hidden lg:flex w-[var(--bds-portal-rail-width)] shrink-0 flex-col justify-between border-r border-bds-teal-dark/20 bg-bds-teal-dark text-white"
      >
        <div className="portal-sidebar-heading">
          {/* Brand Header */}
          <div className="portal-sidebar-brand p-5 border-b border-white/10">
            <Link
              href="/portal"
              className="inline-block rounded-lg p-1 transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-bds-teal focus-visible:ring-2 focus-visible:ring-bds-teal"
              aria-label="Budda's Franchising Operator Portal Home"
            >
              <Image
                className="portal-sidebar-full-logo h-8 w-auto object-contain"
                src="/images/Logo-white.svg"
                alt="Budda's Franchising"
                width={190}
                height={38}
                priority
              />
              <Image className="portal-sidebar-compact-mark" src="/images/favicon.svg" alt="" aria-hidden="true" width={32} height={32} />
            </Link>
            <div className="portal-sidebar-kicker mt-2 text-xs font-bold uppercase tracking-widest">
              Operator Workspace
            </div>
          </div>

          {/* Active operating context */}
          <div className={`portal-sidebar-unit ${locations.length <= 1 ? "portal-sidebar-unit-single" : "portal-sidebar-unit-multi"}`}>
            <LocationSelector id="portal-sidebar-unit" session={session} locations={locations} returnTo={returnTo} tone="sidebar" />
          </div>
        </div>

        {/* Navigation Links */}
        <nav aria-label="Workspace primary navigation" className="portal-sidebar-nav px-4">
            {desktopNavGroups.map(({ group, items }) => <section key={group} className="portal-sidebar-nav-group" aria-labelledby={`portal-nav-${group.toLowerCase()}`}><h2 id={`portal-nav-${group.toLowerCase()}`}>{group}</h2>{items.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/portal"
                  ? pathname === "/portal"
                  : pathname.startsWith(item.href);
              const itemClassName = `portal-sidebar-nav-link${isActive ? " is-active" : ""}`;
              const itemContent = <><Icon className="portal-sidebar-nav-icon" aria-hidden="true" /><span className="portal-sidebar-nav-label">{item.sidebarLabel}</span>{item.countKey ? <PortalNavBadge countKey={item.countKey} labelPrefix={`${item.sidebarLabel.toLowerCase()} items needing attention`} className="portal-sidebar-badge" /> : null}</>;

              return isActive ? <span key={item.href} className={itemClassName} aria-current="page" aria-label={item.sidebarLabel} title={item.sidebarLabel}>{itemContent}<span className="sr-only">(Current page)</span></span> : <Link key={item.href} href={item.href} onClick={() => trackOperatorWorkspaceEvent("operator_sidebar_nav_selected", { role_category: session.role, location_scope_count: locations.length, viewport_group: "desktop", route: analyticsRoute(item.href) })} className={itemClassName} aria-label={item.sidebarLabel} title={item.sidebarLabel}>{itemContent}</Link>;
            })}</section>)}
        </nav>

        {/* Account context and session action */}
        <div ref={sidebarFooterRef} className="portal-sidebar-footer">
          <button
            ref={accountButtonRef}
            type="button"
            onClick={() => setIsAccountMenuOpen((value) => !value)}
            className="portal-sidebar-account"
            aria-label={`Open account menu for ${session.displayName || session.email}`}
            aria-haspopup="dialog"
            aria-expanded={isAccountMenuOpen}
            aria-controls="portal-account-menu"
            title={`Account: ${session.displayName || session.email}`}
          >
            <div className="portal-sidebar-avatar" aria-hidden="true">{accountInitials}</div>
            <span className="portal-sidebar-account-copy">
              <strong>{session.displayName || "Account profile"}</strong>
              <span>{accountRole}</span>
            </span>
            <ChevronDown className="portal-sidebar-account-arrow" size={16} aria-hidden="true" />
          </button>
          <button type="button" className="portal-sidebar-toggle" onClick={() => { setIsAccountMenuOpen(false); toggleSidebar(); }} aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} aria-controls="operator-desktop-sidebar" aria-expanded={!sidebarCollapsed} title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {sidebarCollapsed ? <ChevronRight size={20} aria-hidden="true" /> : <ChevronLeft size={20} aria-hidden="true" />}
            <span className="portal-sidebar-toggle-label">{sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}</span>
          </button>
          {isAccountMenuOpen ? <div ref={accountMenuRef} id="portal-account-menu" role="dialog" aria-label="Account menu" className="portal-account-menu">
            <div className="portal-account-menu-summary"><div className="portal-sidebar-avatar" aria-hidden="true">{accountInitials}</div><span><strong title={session.displayName || "Account profile"}>{session.displayName || "Account profile"}</strong><small>{accountRole}</small></span><button type="button" onClick={() => { setIsAccountMenuOpen(false); accountButtonRef.current?.focus(); }} aria-label="Close account menu"><ChevronDown size={20} aria-hidden="true" /></button></div>
            <div className="portal-account-menu-body">
              {hasPortalPermission(session, "VIEW_ACCOUNT") ? <section className="portal-account-menu-section" aria-label="Your account"><h2><User size={14} aria-hidden="true" />Your account</h2><Link className="portal-account-menu-row" href="/portal/account" onClick={() => setIsAccountMenuOpen(false)}><User size={22} aria-hidden="true" /><span><strong>Account &amp; Access</strong><small>Manage your profile, access, and settings</small></span><ChevronRight size={18} aria-hidden="true" /></Link></section> : null}
              <section className="portal-account-menu-section" aria-label={locations.length > 1 ? "Switch working unit" : "Working unit"}>
                <h2><Store size={14} aria-hidden="true" />{locations.length > 1 ? "Switch working unit" : "Working unit"}</h2>
                {locations.length > 1 ? <><form action={switchPortalLocationAction}><input type="hidden" name="returnTo" value={returnTo} /><ul className="portal-account-menu-units">{locations.map((location) => <li key={location.id}>{location.id === session.locationId ? <div className="portal-account-menu-unit-current" aria-current="true"><Store size={22} aria-hidden="true" /><span><strong>{location.name}</strong><small>{location.id}</small></span><Check size={19} aria-label="Current unit" /></div> : <button type="submit" name="locationId" value={location.id} onClick={() => markOperatorLocationSwitch(location.id)}><Store size={22} aria-hidden="true" /><span><strong>{location.name}</strong><small>{location.id}</small></span></button>}</li>)}</ul></form>{hasPortalPermission(session, "VIEW_ACCOUNT") ? <Link className="portal-account-menu-view-all" href="/portal/account/units-access" onClick={() => setIsAccountMenuOpen(false)}>View all units<ChevronRight size={18} aria-hidden="true" /></Link> : null}</> : <><div className="portal-account-menu-current"><Store size={22} aria-hidden="true" /><span><strong>{session.locationName}</strong><small>{session.locationId}</small></span><span>Current</span></div><p className="portal-account-menu-note"><Info size={17} aria-hidden="true" />You only have access to one unit. If you need access to additional units, please contact your administrator.</p></>}
              </section>
              {hasPortalPermission(session, "VIEW_SUPPORT") ? <Link className="portal-account-menu-row portal-account-menu-help" href="/portal/support" onClick={() => setIsAccountMenuOpen(false)}><HelpCircle size={23} aria-hidden="true" /><span><strong>Account access help</strong><small>Get help with your account or access</small></span><ChevronRight size={18} aria-hidden="true" /></Link> : null}
            </div>
            <form action={logoutAction} className="portal-account-menu-logout"><button type="submit" className="portal-account-menu-signout"><LogOut size={22} aria-hidden="true" /><span><strong>Sign out</strong><small>End your current session</small></span></button></form>
          </div> : null}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="portal-shell-workspace flex min-w-0 flex-1 flex-col lg:h-dvh lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain">
        {/* Top Mobile/Tablet Header */}
        <header
          role="banner"
          aria-label="Workspace header"
          inert={isMobileMoreOpen}
          className="portal-shell-header sticky top-0 z-20 bg-white border-b border-bds-teal-dark/15 flex items-center gap-2 shadow-xs"
        >
          <div className={pathname === "/portal/expansion/new" ? "portal-mobile-location hidden lg:hidden" : "portal-mobile-location lg:hidden"}><LocationSelector id="portal-mobile-unit" session={session} locations={locations} returnTo={returnTo} tone="header" /></div>
          {pathname.startsWith("/portal/supplies/") ? <Link href="/portal/supplies" className="portal-header-context-link hidden lg:inline-flex"><ArrowLeft size={16} aria-hidden="true" />Back to supplies</Link> : null}
          {pathname.startsWith("/portal/orders/") ? <Link href={orderListHref} className="portal-header-context-link hidden lg:inline-flex"><ArrowLeft size={16} aria-hidden="true" />All orders</Link> : null}
          {pathname === "/portal/expansion/new" ? <Link href="/portal/expansion" className="portal-header-context-link inline-flex"><ArrowLeft size={16} aria-hidden="true" />Back to growth requests</Link> : null}
          {isAccountSettingsRoute ? <Link href="/portal" className="portal-header-context-link hidden lg:inline-flex"><ArrowLeft size={16} aria-hidden="true" />Back to dashboard</Link> : null}
          <div id="portal-header-local-nav" className="portal-header-local-nav">{isAccountSettingsRoute ? <AccountLocalNav /> : null}</div>

          <div className="portal-shell-actions flex shrink-0 items-center gap-2 ml-auto">
            <Link
              href="/franchise"
              className="portal-header-public-hub touch-target-inline hidden sm:inline-flex items-center text-xs font-bold uppercase tracking-wider text-bds-teal-dark hover:underline focus-visible:outline-2 focus-visible:outline-bds-teal focus-visible:ring-2 focus-visible:ring-bds-gold rounded-lg px-2 py-1"
            >
              &larr; View Public Hub
            </Link>
            {hasPortalPermission(session, "MANAGE_CART") ? <HeaderCartLink /> : null}
          </div>
        </header>
        {/* Mobile secondary navigation: a compact, single-level sheet. */}
        {isMobileMoreOpen ? (
          <><div className="portal-mobile-more-backdrop lg:hidden" aria-hidden="true" onClick={() => handleCloseMobileMore()} />
          <div
            ref={mobileMoreRef}
            id="portal-mobile-more"
            role="dialog"
            aria-modal="true"
            aria-labelledby="portal-mobile-more-title"
            onKeyDown={handleMobileMoreKeyDown}
            className="portal-mobile-more lg:hidden bg-bds-teal-dark text-white p-4 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div><p className="portal-sidebar-kicker text-xs font-bold uppercase tracking-wider">Operator workspace</p><h2 id="portal-mobile-more-title" className="mt-1 text-base font-bold text-white">More</h2></div>
              <button type="button" onClick={() => handleCloseMobileMore()} className="touch-target inline-flex items-center justify-center rounded-lg text-white hover:bg-white/10" aria-label="Close more navigation"><X className="h-5 w-5" aria-hidden="true" /></button>
            </div>
            <p className="portal-mobile-unit-context"><Store className="h-4 w-4" aria-hidden="true" /><span><strong>{session.locationName}</strong><small>{session.locationId}</small></span></p>
            <nav aria-label="More workspace destinations" className="space-y-1.5">
              {mobileSecondaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/portal"
                    ? pathname === "/portal"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => handleCloseMobileMore(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all focus-visible:outline-2 focus-visible:outline-white focus-visible:ring-2 focus-visible:ring-bds-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bds-teal-dark ${
                      isActive
                        ? "bg-white/15 text-white font-bold border-l-4 border-bds-teal shadow-sm"
                        : "text-white/80 hover:text-white hover:bg-white/10 border-l-4 border-transparent"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                    {item.countKey ? <PortalNavBadge countKey={item.countKey} /> : null}
                    {isActive ? <span className="sr-only">(Current page)</span> : null}
                  </Link>
                );
              })}
            </nav>
            <div className="pt-3 border-t border-white/10">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="touch-target w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-rose-200 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-white focus-visible:ring-2 focus-visible:ring-bds-teal"
                >
                  <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Sign Out</span>
                </button>
              </form>
            </div>
          </div></>
        ) : null}

        {/* Page Body */}
        <main
          id="portal-main-content"
          tabIndex={-1}
          aria-label="Workspace main content"
          inert={isMobileMoreOpen}
          className="content-wide portal-main-content portal-shell-main lg:flex-1 focus:outline-none"
        >
          {children}
        </main>
        <nav ref={mobileNavigationRef} className="portal-mobile-tabbar lg:hidden" style={{ "--portal-mobile-tab-count": mobilePrimaryNavItems.length + 1 } as CSSProperties} aria-label="Operator Workspace primary navigation">
          {mobilePrimaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/portal" ? pathname === "/portal" : pathname.startsWith(item.href);
            return <Link key={item.href} href={item.href} inert={isMobileMoreOpen} aria-hidden={isMobileMoreOpen || undefined} aria-current={isActive ? "page" : undefined} className={isActive ? "is-active" : undefined} onClick={() => { const route = analyticsRoute(item.href); const context = { role_category: session.role, location_scope_count: locations.length }; trackOperatorWorkspaceEvent("operator_bottom_nav_selected", { ...context, route }); if (item.href === "/portal/support") trackOperatorWorkspaceEvent("operator_support_opened", { ...context, route: "/portal/support" }); }}>
              <Icon className="h-5 w-5" aria-hidden="true" /><span>{item.label === "Supplies Catalog" ? "Supplies" : item.label === "Orders & Shipments" ? "Orders" : item.label === "Resource Center" ? "Resources" : item.label}</span>{item.countKey ? <PortalNavBadge countKey={item.countKey} /> : null}
            </Link>;
          })}
          <button ref={moreButtonRef} type="button" onClick={handleToggleMobileMore} aria-expanded={isMobileMoreOpen} aria-controls="portal-mobile-more" aria-current={mobileSecondaryNavItems.some((item) => pathname.startsWith(item.href)) ? "page" : undefined} className={mobileSecondaryNavItems.some((item) => pathname.startsWith(item.href)) ? "is-active" : undefined}>
            <MoreHorizontal className="h-5 w-5" aria-hidden="true" /><span>More</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export const PortalShell = memo(PortalShellComponent);
