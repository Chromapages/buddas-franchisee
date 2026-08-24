"use client";

import { useState } from "react";
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
} from "lucide-react";
import { logoutAction } from "@/src/features/auth/actions";
import type { PortalSession } from "@/src/lib/auth/auth-provider";
import type { PortalLocation } from "@/src/features/portal/types";

export type PortalShellProps = {
  session: PortalSession;
  locations: PortalLocation[];
  children: ReactNode;
};

export const PortalShell = ({
  session,
  locations,
  children,
}: PortalShellProps) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/portal", label: "Dashboard", icon: LayoutDashboard },
    { href: "/portal/supplies", label: "Supplies Catalog", icon: Package },
    { href: "/portal/cart", label: "Wholesale Cart", icon: ShoppingCart },
    { href: "/portal/orders", label: "Orders & Shipments", icon: Clock },
    { href: "/portal/resources", label: "Resource Center", icon: FolderOpen },
    { href: "/portal/support", label: "Operations Support", icon: HelpCircle },
    { href: "/portal/account", label: "Account Profile", icon: User },
  ];

  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-brand-sand/40 flex flex-col lg:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-72 bg-brand-charcoal text-white flex-col justify-between shrink-0 border-r border-brand-charcoal/20">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-white/10">
            <Link href="/portal" className="inline-block bg-white/95 rounded-2xl px-3.5 py-2 hover:bg-white transition-colors">
              <Image
                src="/images/Logo.svg"
                alt="Budda's Franchising"
                width={190}
                height={38}
                className="h-8 w-auto object-contain"
                priority
              />
            </Link>
            <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-brand-mango">
              Operator Workspace
            </div>
          </div>

          {/* Location Context Banner */}
          <div className="p-4 mx-4 my-4 bg-white/5 rounded-2xl border border-white/10 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-butter">
              <Store className="w-3.5 h-3.5" aria-hidden="true" />
              Active Unit
            </div>
            <p className="text-sm font-semibold text-white truncate">
              {session.locationName}
            </p>
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-clay text-white">
              Role: {session.role}
            </span>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Portal Navigation" className="px-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/portal"
                  ? pathname === "/portal"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-brand-clay text-white shadow-sm font-bold"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer / Sign out */}
        <div className="p-6 border-t border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-clay flex items-center justify-center font-bold text-white text-xs">
              {session.email[0].toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate">
                {session.email}
              </span>
              <span className="text-[10px] text-white/50">
                Unit {session.locationId}
              </span>
            </div>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Mobile/Tablet Header */}
        <header className="bg-white border-b border-brand-charcoal/10 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl text-brand-charcoal hover:bg-brand-sand focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl font-bold font-heading text-brand-charcoal leading-none">
                {session.locationName}
              </h1>
              <span className="text-xs text-brand-charcoal/60 mt-0.5">
                Location Code: {session.locationId} &bull; {locations.length} accessible unit(s)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/franchise"
              className="hidden sm:inline-flex text-xs font-bold uppercase tracking-wider text-brand-clay hover:underline"
            >
              &larr; View Public Hub
            </Link>
            <Link
              href="/portal/cart"
              className="p-2.5 rounded-xl bg-brand-sand hover:bg-brand-butter text-brand-charcoal transition-colors relative"
              aria-label="View Cart"
            >
              <ShoppingCart className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen ? (
          <div className="lg:hidden bg-brand-charcoal text-white p-4 space-y-3 shadow-xl">
            <div className="pb-3 border-b border-white/10">
              <div className="bg-white/95 rounded-2xl px-3 py-1.5 inline-block">
                <Image
                  src="/images/Logo.svg"
                  alt="Budda's Franchising"
                  width={160}
                  height={32}
                  className="h-7 w-auto object-contain"
                />
              </div>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleCloseMobileMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="pt-3 border-t border-white/10">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-red-300 hover:bg-white/10"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        ) : null}

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
