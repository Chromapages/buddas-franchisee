"use client";

import { useEffect, useRef } from "react";
import { trackFunnelEvent } from "@/src/lib/analytics";

export const InquirySidebarFraming = () => {
  const framingRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const sidebar = framingRef.current?.closest<HTMLElement>("[data-inquiry-sidebar]");
    if (!sidebar) return;
    let step: 1 | 2 | 3 = 1;
    let hasStarted = false;
    const setWeight = () => sidebar.classList.toggle("opacity-80", step > 1);
    const onStep = (event: Event) => { step = (event as CustomEvent<{ step: 1 | 2 | 3 }>).detail.step; setWeight(); };
    const onStart = () => { hasStarted = true; };
    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="mailto:"], a[href^="tel:"]');
      if (hasStarted && link && sidebar.contains(link)) trackFunnelEvent("sidebar_contact_click", { form_step: step });
    };
    window.addEventListener("buddas:inquiry-step-change", onStep);
    window.addEventListener("buddas:inquiry-form-started", onStart);
    sidebar.addEventListener("click", onClick);
    return () => { window.removeEventListener("buddas:inquiry-step-change", onStep); window.removeEventListener("buddas:inquiry-form-started", onStart); sidebar.removeEventListener("click", onClick); };
  }, []);

  return <p ref={framingRef} className="text-sm leading-relaxed text-brand-charcoal/80">Prefer to talk to someone directly before completing the form? Reach our development team here.</p>;
};
