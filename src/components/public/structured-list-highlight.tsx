import { Banknote, CalendarClock, Clock3, GraduationCap, MapPinned, Moon, PackageCheck, Sun } from "lucide-react";

export type StructuredListItem = {
  label: string;
  detail: string;
  icon: "sun" | "clock" | "moon" | "banknote" | "map" | "package" | "training" | "calendar";
};

export type StructuredListData = {
  ariaLabel: string;
  items: StructuredListItem[];
};

const icons = {
  sun: Sun,
  clock: Clock3,
  moon: Moon,
  banknote: Banknote,
  map: MapPinned,
  package: PackageCheck,
  training: GraduationCap,
  calendar: CalendarClock,
};

export const StructuredListHighlight = ({
  data,
  layout = "inline",
}: {
  data: StructuredListData;
  layout?: "inline" | "panel" | "reference";
}) => (
  <ul aria-label={data.ariaLabel} className={(layout === "inline" ? "mt-5 border-t border-brand-sand pt-4 sm:grid-cols-3" : "mt-5 border-t border-brand-sand pt-3 grid-cols-1") + " grid gap-2"}>
    {data.items.map((item) => {
      const Icon = icons[item.icon];
      return <li key={item.label} className="flex min-h-12 items-center gap-3"><Icon className="h-5 w-5 shrink-0 text-bds-action-primary" aria-hidden="true" /><span className="text-sm leading-relaxed text-brand-charcoal"><strong>{item.label}</strong><span className="text-brand-charcoal/70">{layout === "reference" ? "" : " · "}{item.detail}</span></span></li>;
    })}
  </ul>
);
