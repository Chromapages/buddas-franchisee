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

export type { NavItem };
export { primaryNavItems, utilityNavItems, publicNavItems };

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  const handleToggleMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const handleCloseMenu = () => {
    if (!isMobileMenuOpen) return;
    setIsMobileMenuOpen(false);
    menuButtonRef.current?.focus();
  };

  // Keyboard navigation & focus trap inside mobile drawer
  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!isMobileMenuOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      handleCloseMenu();
      return;
    }

    if (event.key === "Tab" && drawerRef.current) {
      const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex="0"]'
      );
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
        return;
      }
    }
  };

  // Automatically close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open to prevent layout shift & background jitter
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Auto-close menu if resized to desktop breakpoint (>= 1024px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobileMenuOpen]);

  // Focus the first interactive item inside the mobile drawer when opened
  useEffect(() => {
    if (!isMobileMenuOpen || !drawerRef.current) return;

    const firstFocusable = drawerRef.current.querySelector<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex="0"]'
    );
    firstFocusable?.focus();
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* 1. Brand Identity Anchor (Top Left) */}
            <Link
              href="/franchise"
              onClick={handleCloseMenu}
              aria-label="Budda's Hawaiian Bakery & Grill - Franchise Opportunity Home"
              tabIndex={0}
              className="flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-bds-action-primary rounded-lg p-1 shrink-0"
            >
              <Image
                src="/images/Logo.svg"
                alt="Budda's Franchising"
                width={210}
                height={42}
                className="h-8 sm:h-9 md:h-10 w-auto object-contain max-w-[140px] sm:max-w-[190px] md:max-w-[210px]"
                priority
              />
            </Link>

            {/* 2. Primary Education Curriculum (Center Navigation) */}
            <nav aria-label="Primary Navigation" className="hidden lg:flex items-center">
              <ul role="list" className="flex items-center gap-1 xl:gap-2">
                {primaryNavItems.map((item) => {
                  const isActive = pathname === item.href;
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

            {/* 3. Utility Module & Primary Action Lane (Right Cluster) */}
            <div className="hidden lg:flex items-center gap-3 xl:gap-4">
              {/* Visual Separator between Educational Curriculum and Utilities */}
              <div
                className="h-5 w-px bg-bds-teal-dark/15 mx-1"
                aria-hidden="true"
              />

              {/* Secondary Utilities Container */}
              <nav aria-label="Utility Navigation" className="bg-bds-cream/70 p-1 rounded-xl border border-bds-cocoa/10">
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

              {/* High-Contrast Primary Conversion CTA */}
              <Link
                href="/franchise/contact"
                tabIndex={0}
                aria-label="Request Franchise Information"
                className="btn-primary text-sm !py-2.5 !px-5 shadow-sm hover:shadow hover:!bg-bds-teal hover:text-white transition-all duration-200 focus-visible:ring-2 focus-visible:ring-bds-action-primary focus-visible:ring-offset-2"
              >
                Request Franchise Info
              </Link>
            </div>

            {/* 4. Mobile Top Bar: Persistent Primary CTA + Accessible Hamburger Toggle */}
            <div className="lg:hidden flex items-center gap-2 sm:gap-3">
              <Link
                href="/franchise/contact"
                tabIndex={0}
                aria-label="Request Franchise Information"
                className="btn-primary text-xs sm:text-sm !py-2 !px-3 sm:!px-4 whitespace-nowrap shadow-sm hover:!bg-bds-teal hover:text-white transition-all duration-200 focus-visible:ring-2 focus-visible:ring-bds-action-primary focus-visible:ring-offset-2"
              >
                <span className="hidden sm:inline">Request Franchise Info</span>
                <span className="sm:hidden">Request info</span>
              </Link>

              <button
                ref={menuButtonRef}
                type="button"
                onClick={handleToggleMenu}
                tabIndex={0}
                aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation-drawer"
                aria-haspopup="dialog"
                className="p-2 rounded-xl text-bds-cocoa hover:bg-bds-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-bds-action-primary"
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

        {/* 5. Mobile Drawer Overlay (absolute top-full left-0 right-0 to prevent layout shift) */}
        {isMobileMenuOpen ? (
          <div
            id="mobile-navigation-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
            className="absolute top-full left-0 right-0 w-full lg:hidden bg-white border-b border-bds-teal-dark/10 px-4 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-2 z-50 max-h-[calc(100vh-5rem)] overflow-y-auto"
          >
            {/* Primary Navigation */}
            <nav aria-label="Mobile Primary Navigation">
              <ul role="list" className="flex flex-col space-y-1">
                {primaryNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={handleCloseMenu}
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
            <nav aria-label="Mobile Utility Navigation" className="pt-3 border-t border-bds-cream flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-bds-cocoa/40 px-3 py-1">
                Utilities
              </span>
              <ul role="list" className="flex flex-col gap-1">
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
                          className="flex items-center justify-between px-3 py-2 text-sm font-medium text-bds-cocoa/80 hover:text-bds-action-primary hover:bg-bds-cream rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bds-action-primary"
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
                        onClick={handleCloseMenu}
                        tabIndex={0}
                        aria-label={item.label}
                        className="flex items-center justify-between px-3 py-2 text-sm font-medium text-bds-cocoa/80 hover:text-bds-action-primary hover:bg-bds-cream rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bds-action-primary"
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



