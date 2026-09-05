"use client";

import { memo, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Clock,
  FolderOpen,
  HelpCircle,
  User,
  LogOut,
  Menu,
  X,
  Store,
  MapPinned,
} from "lucide-react";
import { logoutAction, switchPortalLocationAction } from "@/src/features/auth/actions";
import type { PortalSession } from "@/src/lib/auth/auth-provider";
import type { PortalLocation } from "@/src/features/portal/types";
import { hasPortalPermission, type PortalPermission } from "@/src/features/portal/authorization";
import {
  PortalCartBadge,
  PortalNavBadge,
  type ScopedNotificationCounts,
} from "@/src/features/portal/portal-context";

export type PortalShellProps = {
  session: PortalSession;
  locations: PortalLocation[];
  children: ReactNode;
};

const PortalShellComponent = ({
  session,
  locations,
  children,
}: PortalShellProps) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const wasMobileMenuOpen = useRef(false);

  const navItems = [
    { href: "/portal", label: "Dashboard", icon: LayoutDashboard, permission: "ACCESS_WORKSPACE", countKey: "actionRequiredBulletinCount" as const },
    { href: "/portal/supplies", label: "Supplies Catalog", icon: Package, permission: "VIEW_CATALOG" },
    { href: "/portal/cart", label: "Wholesale Cart", icon: ShoppingCart, permission: "MANAGE_CART", countKey: "cartItemCount" as const },
    { href: "/portal/orders", label: "Orders & Shipments", icon: Clock, permission: "VIEW_ORDERS" },
    { href: "/portal/resources", label: "Resource Center", icon: FolderOpen, permission: "VIEW_RESOURCES" },
    { href: "/portal/support", label: "Operations Support", icon: HelpCircle, permission: "VIEW_SUPPORT", countKey: "actionRequiredSupportCount" as const },
    { href: "/portal/expansion", label: "Growth Requests", icon: MapPinned, permission: "ACCESS_WORKSPACE" },
    { href: "/portal/account", label: "Account Profile", icon: User, permission: "VIEW_ACCOUNT" },
  ] satisfies Array<{
    href: string;
    label: string;
    icon: typeof LayoutDashboard;
    permission: PortalPermission;
    countKey?: keyof ScopedNotificationCounts;
  }>;
  const visibleNavItems = navItems.filter((item) => hasPortalPermission(session, item.permission));
  const authorizedUnitCount = session.managedLocationIds.length;

  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      mobileMenuRef.current?.querySelector<HTMLElement>("nav a")?.focus();
    } else if (wasMobileMenuOpen.current) {
      menuButtonRef.current?.focus();
    }
    wasMobileMenuOpen.current = isMobileMenuOpen;
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-bds-cream/40 flex flex-col nav:h-dvh nav:overflow-hidden nav:flex-row">
      <a
        href="#portal-main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:font-bold focus:text-bds-teal-dark focus:ring-4 focus:ring-bds-gold"
      >
        Skip to workspace content
      </a>

      {/* Sidebar for Desktop */}
      <aside
        aria-label="Operator Workspace sidebar"
        className="portal-sidebar hidden nav:h-dvh nav:overflow-hidden nav:flex w-[var(--bds-portal-rail-width)] shrink-0 flex-col justify-between border-r border-bds-teal-dark/20 bg-bds-teal-dark text-white"
      >
        <div>
          {/* Brand Header */}
          <div className="portal-sidebar-brand p-5 border-b border-white/10">
            <Link
              href="/portal"
              className="inline-block rounded-lg p-1 transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-bds-teal focus-visible:ring-2 focus-visible:ring-bds-teal"
              aria-label="Budda's Franchising Operator Portal Home"
            >
              <Image
                src="/images/Logo-white.svg"
                alt="Budda's Franchising"
                width={190}
                height={38}
                className="h-8 w-auto object-contain"
                priority
              />
            </Link>
            <div className="mt-2 text-xs font-bold uppercase tracking-widest text-bds-teal">
              Operator Workspace
            </div>
          </div>

          {/* Active operating context */}
          <div className="portal-sidebar-unit p-3.5 mx-3.5 my-3.5 bg-white/5 rounded-xl border border-white/10 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-bds-teal">
              <Store className="w-4 h-4 shrink-0" aria-hidden="true" />
              Working unit
            </div>
            {locations.length > 1 ? (
              <form action={switchPortalLocationAction} className="space-y-2">
                <label htmlFor="portal-working-unit" className="sr-only">
                  Switch working unit
                </label>
                <select
                  id="portal-working-unit"
                  name="locationId"
                  defaultValue={session.locationId}
                  className="w-full rounded-lg border border-white/20 bg-bds-teal-dark px-2.5 py-2 text-sm font-semibold text-white outline-none focus-visible:border-bds-teal focus-visible:ring-2 focus-visible:ring-bds-teal"
                >
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} · {location.id}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="touch-target-inline text-xs font-bold uppercase tracking-wider text-bds-teal hover:text-white focus-visible:outline-2 focus-visible:outline-white focus-visible:ring-2 focus-visible:ring-bds-teal rounded-md px-1.5 py-1"
                >
                  Switch unit
                </button>
              </form>
            ) : (
              <p className="text-sm font-semibold text-white truncate">
                {session.locationName}
              </p>
            )}
          </div>

          {/* Navigation Links */}
          <nav aria-label="Workspace primary navigation" className="portal-sidebar-nav px-4 space-y-1.5">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/portal"
                  ? pathname === "/portal"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
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
        </div>

        {/* Account context and session action */}
        <div className="portal-sidebar-footer">
          <Link
            href="/portal/account"
            className="portal-sidebar-account"
            aria-label={`Open account profile for ${session.displayName || session.email}`}
          >
            <div className="portal-sidebar-avatar" aria-hidden="true">
              {(session.displayName || session.email)[0].toUpperCase()}
            </div>
            <span className="portal-sidebar-account-copy">
              <strong>{session.displayName || "Account profile"}</strong>
              <span>{session.displayName ? session.email : "Account profile"}</span>
            </span>
            <User className="portal-sidebar-account-arrow" size={16} aria-hidden="true" />
          </Link>

          <form action={logoutAction}>
            <button
              type="submit"
              className="portal-sidebar-signout"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="portal-shell-workspace flex min-w-0 flex-1 flex-col nav:h-dvh nav:min-h-0 nav:overflow-y-auto nav:overscroll-contain">
        {/* Top Mobile/Tablet Header */}
        <header
          role="banner"
          aria-label="Workspace header"
          className="portal-shell-header sticky top-0 z-20 bg-white border-b border-bds-teal-dark/15 flex flex-wrap items-start justify-between gap-3 shadow-xs"
        >
          <div className="flex min-w-0 items-start gap-3 nav:hidden">
            <button
              ref={menuButtonRef}
              type="button"
              onClick={handleToggleMobileMenu}
              className="touch-target nav:hidden inline-flex items-center gap-2 px-3 py-2 rounded-xl text-bds-teal-dark bg-bds-cream hover:bg-bds-gold/30 border border-bds-teal-dark/15 focus-visible:outline-2 focus-visible:outline-bds-teal focus-visible:ring-2 focus-visible:ring-bds-gold"
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="portal-mobile-navigation"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 shrink-0" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5 shrink-0" aria-hidden="true" />
              )}
              <span className="text-xs font-bold uppercase tracking-wider">
                {isMobileMenuOpen ? "Close" : "Menu"}
              </span>
            </button>
            <div className="flex min-w-0 flex-col">
              <p className="heading-compact text-bds-teal-dark [overflow-wrap:anywhere]">
                {session.locationName}
              </p>
              <span className="mt-0.5 text-xs leading-tight text-bds-cocoa/80 [overflow-wrap:anywhere]">
                {session.locationId} &bull; {authorizedUnitCount} accessible unit{authorizedUnitCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 sm:gap-4 ml-auto">
            <Link
              href="/franchise"
              className="touch-target-inline hidden sm:inline-flex items-center text-xs font-bold uppercase tracking-wider text-bds-teal-dark hover:underline focus-visible:outline-2 focus-visible:outline-bds-teal focus-visible:ring-2 focus-visible:ring-bds-gold rounded-lg px-2 py-1"
            >
              &larr; View Public Hub
            </Link>
            <Link
              href="/portal/cart"
              className="touch-target inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-bds-cream hover:bg-bds-gold/30 text-bds-teal-dark transition-colors focus-visible:outline-2 focus-visible:outline-bds-teal focus-visible:ring-2 focus-visible:ring-bds-gold border border-bds-teal-dark/15"
              aria-label="View Store Supply Cart"
            >
              <ShoppingCart className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-wider">Cart</span>
              <PortalCartBadge />
            </Link>
          </div>
        </header>
        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen ? (
          <div
            ref={mobileMenuRef}
            id="portal-mobile-navigation"
            className="nav:hidden bg-bds-teal-dark text-white p-4 space-y-3 shadow-xl"
          >
            <div className="pb-3 border-b border-white/10">
              <Link
                href="/portal"
                onClick={handleCloseMobileMenu}
                className="inline-block rounded-lg p-1 transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-bds-teal focus-visible:ring-2 focus-visible:ring-bds-teal"
                aria-label="Budda's Franchising Operator Portal Home"
              >
                <Image
                  src="/images/Logo-white.svg"
                  alt="Budda's Franchising"
                  width={160}
                  height={32}
                  className="h-7 w-auto object-contain"
                />
              </Link>
            </div>
            <nav aria-label="Mobile workspace navigation" className="space-y-1.5">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/portal"
                    ? pathname === "/portal"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleCloseMobileMenu}
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
          </div>
        ) : null}

        {/* Page Body */}
        <main
          id="portal-main-content"
          tabIndex={-1}
          aria-label="Workspace main content"
          className="content-wide portal-main-content portal-shell-main flex-1 focus:outline-none"
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export const PortalShell = memo(PortalShellComponent);
