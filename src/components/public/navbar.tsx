"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ExternalLink, User } from "lucide-react";
import {
  type NavItem,
  primaryNavItems,
  utilityNavItems,
  publicNavItems,
} from "@/src/features/navigation/nav-config.ts";
import { trackFunnelEvent } from "@/src/lib/analytics";

export type { NavItem };
export { primaryNavItems, utilityNavItems, publicNavItems };

const isCurrentPage = (pathname: string, href: string) => pathname === href;

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const pathname = usePathname();
  const isInquiryPage = isCurrentPage(pathname, "/franchise/contact");
  const scrollToInquiryForm = () => {
    document.querySelector(".inquiry-form")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  };

  const handleToggleMenu = () => {
    setIsMobileMenuOpen((prev) => {
      trackFunnelEvent(prev ? "mobile_nav_close" : "mobile_nav_open", { page_path: pathname });
      return !prev;
    });
  };

  const handleCloseMenu = () => {
    if (!isMobileMenuOpen) return;
    setIsMobileMenuOpen(false);
    trackFunnelEvent("mobile_nav_close", { page_path: pathname });
    menuButtonRef.current?.focus();
  };

  // Escape closes this non-modal expanded site navigation.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!isMobileMenuOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      handleCloseMenu();
    }
  };

  // Automatically close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // The full header content first fits at 1,245px; close the expanded navigation above that point.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1245 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Skip to Main Content Link for Keyboard & Screen Reader Users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2.5 focus:bg-bds-action-primary focus:text-bds-action-primary-text focus:font-semibold focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-bds-gold focus:ring-offset-2 transition-all"
      >
        Skip to main content
      </a>

      <header
        role="banner"
        onKeyDown={handleKeyDown}
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-bds-teal-dark/10"
      >
        <div className="content-wide">
          <div className="public-navbar-bar relative flex items-center justify-between h-16 nav:h-20 gap-2">
            {/* 1. Brand Identity Anchor (Top Left) */}
            <Link
              href="/franchise"
              onClick={handleCloseMenu}
              aria-label="Budda's Hawaiian Bakery & Grill - Franchise Opportunity Home"
              tabIndex={0}
              className="touch-target flex min-w-0 items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-bds-action-primary rounded-lg p-1.5 shrink-0"
            >
              <Image
                src="/images/Logo.svg"
                alt="Budda's Franchising"
                width={210}
                height={42}
                className="public-navbar-logo h-8 w-auto max-w-[112px] object-contain sm:h-9 sm:max-w-[190px] md:h-10 md:max-w-[150px] nav:max-w-[210px]"
                priority
              />
            </Link>

            {/* 2. Primary Education Curriculum (Center Navigation) */}
            <nav aria-label="Primary Navigation" className="hidden nav:flex items-center">
              <ul role="list" className="flex items-center gap-1 xl:gap-2">
                {primaryNavItems.map((item) => {
                  const isActive = isCurrentPage(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        tabIndex={0}
                        aria-label={item.label}
                        aria-current={isActive ? "page" : undefined}
                        className={`relative text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-bds-action-primary rounded-lg px-3.5 py-2 inline-flex items-center ${
                          isActive
                            ? "text-bds-action-primary font-bold bg-bds-cream shadow-xs"
                            : "text-bds-cocoa/80 hover:text-bds-action-primary hover:bg-bds-cream/60"
                        }`}
                      >
                        <span>{item.label}</span>
                        {isActive ? (
                          <>
                            <span className="sr-only"> (Current Page)</span>
                            <span
                              className="absolute bottom-0.5 left-3.5 right-3.5 h-0.5 bg-bds-action-primary rounded-full"
                              aria-hidden="true"
                            />
                          </>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* 3. Utility Module & Secondary Action Lane (Right Cluster) */}
            <div className="hidden nav:flex items-center gap-3 xl:gap-4">
              {/* Visual Separator between Educational Curriculum and Utilities */}
              <div
                className="hidden nav:block h-5 w-px bg-bds-teal-dark/15 mx-1"
                aria-hidden="true"
              />

              {/* Secondary Utilities Container */}
              <nav aria-label="Account and Reference" className="hidden nav:block bg-bds-cream/70 p-1 rounded-xl border border-bds-cocoa/10">
                <ul role="list" className="flex items-center gap-1">
                  {utilityNavItems.map((item) => {
                    if (item.external) {
                      return (
                        <li key={item.href}>
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            tabIndex={0}
                            aria-label={item.label}
                            className="flex items-center gap-1.5 text-xs font-semibold text-bds-cocoa/80 hover:text-bds-action-primary hover:bg-white px-2.5 py-1.5 rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-bds-action-primary"
                          >
                            <span>{item.label}</span>
                            <span className="sr-only"> (opens in a new tab)</span>
                            <ExternalLink className="w-3 h-3 opacity-60" aria-hidden="true" />
                          </a>
                        </li>
                      );
                    }

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          tabIndex={0}
                          aria-label={item.label}
                          className="flex items-center gap-1.5 text-xs font-semibold text-bds-cocoa/80 hover:text-bds-action-primary hover:bg-white px-2.5 py-1.5 rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-bds-action-primary"
                        >
                          <User className="w-3 h-3 opacity-60" aria-hidden="true" />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* Persistent secondary path for returning/high-intent visitors.
               * The page-level hero owns the primary conversion emphasis. */}
              {isInquiryPage ? (
                <button type="button" onClick={scrollToInquiryForm} aria-label="Request Franchise Information" aria-current="page" className="text-xs lg:text-sm !py-2.5 !px-3 lg:!px-5 rounded-xl bg-bds-action-primary text-bds-action-primary-text font-bold shadow-none transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bds-action-primary focus-visible:ring-offset-2">
                  Request Franchise Info<span className="sr-only"> (Current Page — scroll to form)</span>
                </button>
              ) : (
                <Link href="/franchise/contact" tabIndex={0} aria-label="Request Franchise Information" className="btn-outline text-xs lg:text-sm !py-2.5 !px-3 lg:!px-5 shadow-none hover:!bg-bds-cream transition-all duration-200 focus-visible:ring-2 focus-visible:ring-bds-action-primary focus-visible:ring-offset-2">
                  Request Franchise Info
                </Link>
              )}
            </div>

            {/* 4. Mobile Top Bar: Persistent secondary CTA + Accessible Hamburger Toggle */}
            <div className="public-navbar-mobile-actions absolute right-0 nav:hidden flex shrink-0 items-center gap-2 sm:gap-3">
              {isInquiryPage ? (
                <button type="button" onClick={() => { trackFunnelEvent("mobile_nav_request_info_click", { page_path: pathname, nav_destination: "#inquiry-form" }); scrollToInquiryForm(); }} aria-label="Request Franchise Information" aria-current="page" className="public-navbar-mobile-cta touch-target nav:hidden text-xs sm:text-sm !py-2 !px-3 sm:!px-4 whitespace-nowrap rounded-xl bg-bds-action-primary text-bds-action-primary-text font-bold shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bds-action-primary focus-visible:ring-offset-2">
                  <span className="hidden sm:inline">Request Franchise Info</span><span className="public-navbar-mobile-cta-default sm:hidden">Request info</span><span className="sr-only"> (Current Page — scroll to form)</span>
                </button>
              ) : (
                <Link href="/franchise/contact" onClick={() => trackFunnelEvent("mobile_nav_request_info_click", { page_path: pathname, nav_destination: "/franchise/contact" })} tabIndex={0} aria-label="Request Franchise Information" className="public-navbar-mobile-cta touch-target nav:hidden btn-outline !border-bds-action-primary/70 text-xs sm:text-sm !py-2 !px-3 sm:!px-4 whitespace-nowrap shadow-none hover:!bg-bds-cream transition-all duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bds-action-primary focus-visible:ring-offset-2">
                  <span className="hidden sm:inline">Request Franchise Info</span><span className="public-navbar-mobile-cta-default sm:hidden">Request info</span><span className="public-navbar-mobile-cta-compact hidden">Info</span>
                </Link>
              )}

              <button
                ref={menuButtonRef}
                type="button"
                onClick={handleToggleMenu}
                tabIndex={0}
                aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation-drawer"
                className="touch-target shrink-0 rounded-xl border border-bds-teal-dark/15 bg-bds-cream p-2.5 text-bds-cocoa hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-bds-action-primary"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" aria-hidden="true" />
                ) : (
                  <Menu className="w-6 h-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 5. Non-modal mobile navigation: expanded beneath the persistent header. */}
        {isMobileMenuOpen ? (
          <div
            id="mobile-navigation-drawer"
            className="absolute top-full left-0 right-0 w-full nav:hidden max-h-[calc(100dvh-4rem-env(safe-area-inset-bottom))] overflow-y-auto border-b border-bds-teal-dark/10 bg-white px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3 shadow-xl z-50"
          >
            {/* Primary Navigation */}
            <nav aria-label="Mobile Primary Navigation" className="nav:hidden">
              <ul role="list" className="flex flex-col space-y-4">
                {primaryNavItems.map((item) => {
                  const isActive = isCurrentPage(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => { trackFunnelEvent("mobile_nav_link_click", { page_path: pathname, nav_item: item.label, nav_destination: item.href }); handleCloseMenu(); }}
                        tabIndex={0}
                        aria-label={item.label}
                        aria-current={isActive ? "page" : undefined}
                        className={`px-4 py-3 rounded-xl text-base font-semibold transition-colors flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-bds-action-primary ${
                          isActive
                            ? "bg-bds-cream text-bds-action-primary font-bold"
                            : "text-bds-cocoa hover:bg-bds-cream"
                        }`}
                      >
                        <span>{item.label}</span>
                        {isActive ? (
                          <>
                            <span className="sr-only"> (Current Page)</span>
                            <span className="w-2 h-2 rounded-full bg-bds-action-primary" aria-hidden="true" />
                          </>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Utility Divider Section with Explicit Iconography */}
            <nav aria-label="Account and Reference" className="mt-4 flex flex-col gap-4 border-t border-bds-teal-dark/15 pt-4">
              <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-bds-cocoa/80">
                Utilities
              </span>
              <ul role="list" className="flex flex-col gap-4">
                {utilityNavItems.map((item) => {
                  if (item.external) {
                    return (
                      <li key={item.href}>
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          tabIndex={0}
                          aria-label={item.label}
                          onClick={() => trackFunnelEvent("mobile_nav_link_click", { page_path: pathname, nav_item: item.label, nav_destination: item.href })}
                          className="touch-target flex items-center justify-between px-3 py-2 text-sm font-medium text-bds-cocoa/80 hover:text-bds-action-primary hover:bg-bds-cream rounded-lg transition-colors motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-bds-action-primary"
                        >
                          <div className="flex items-center gap-2">
                            <ExternalLink className="w-3.5 h-3.5 opacity-60" aria-hidden="true" />
                            <span>{item.label}</span>
                            <span className="sr-only"> (opens in a new tab)</span>
                          </div>
                          <span className="text-xs text-bds-cocoa/40" aria-hidden="true">↗</span>
                        </a>
                      </li>
                    );
                  }

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => { trackFunnelEvent("mobile_nav_link_click", { page_path: pathname, nav_item: item.label, nav_destination: item.href }); handleCloseMenu(); }}
                        tabIndex={0}
                        aria-label={item.label}
                        className="touch-target flex items-center justify-between px-3 py-2 text-sm font-medium text-bds-cocoa/80 hover:text-bds-action-primary hover:bg-bds-cream rounded-lg transition-colors motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-bds-action-primary"
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 opacity-60" aria-hidden="true" />
                          <span>{item.label}</span>
                        </div>
                        <span className="text-xs text-bds-cocoa/40" aria-hidden="true">&rarr;</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        ) : null}
      </header>
    </>
  );
};
