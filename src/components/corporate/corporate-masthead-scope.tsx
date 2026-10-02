"use client";

import Link from "next/link";
import { Building2, Check, ChevronDown, Store } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type LocationOption = { id: string; name: string; code: string };

export function CorporateMastheadScope({ locations, selected, baseHref = "/corporate" }: { locations: LocationOption[]; selected: LocationOption | null; baseHref?: string }) {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !container.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      requestAnimationFrame(() => trigger.current?.focus());
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return <div ref={container} className="corporate-masthead-scope">
    <button ref={trigger} type="button" className="corporate-masthead-scope-trigger" aria-label={`Choose location: ${selected?.name || "All locations"}`} aria-expanded={open} aria-controls="corporate-masthead-location-options" onClick={() => setOpen((value) => !value)}>
      <span className="corporate-masthead-scope-icon">{selected ? <Store size={23} aria-hidden="true" /> : <Building2 size={23} aria-hidden="true" />}</span>
      <span><small>{selected ? "Location" : "Portfolio"}</small><strong>{selected?.name || "All locations"}</strong></span>
      <ChevronDown size={18} aria-hidden="true" />
    </button>
    {open ? <div id="corporate-masthead-location-options" className="corporate-masthead-scope-menu" role="region" aria-label="Location filter">
      <Link href={baseHref} onClick={() => setOpen(false)} aria-current={!selected ? "page" : undefined}><Building2 size={20} aria-hidden="true" /><span><strong>All locations</strong><small>Permitted portfolio</small></span>{!selected ? <Check size={18} aria-hidden="true" /> : null}</Link>
      {locations.map((location) => <Link key={location.id} href={`${baseHref}?locationId=${encodeURIComponent(location.id)}`} onClick={() => setOpen(false)} aria-current={selected?.id === location.id ? "page" : undefined}><Store size={20} aria-hidden="true" /><span><strong>{location.name}</strong><small>{location.code}</small></span>{selected?.id === location.id ? <Check size={18} aria-hidden="true" /> : null}</Link>)}
    </div> : null}
  </div>;
}
