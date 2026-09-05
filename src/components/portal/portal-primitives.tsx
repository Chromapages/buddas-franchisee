import type { ReactNode } from "react";

export type StatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  trend?: string;
};

export const StatCard = ({
  title,
  value,
  description,
  icon,
  trend,
}: StatCardProps) => {
  return (
    <div className="bg-white border border-bds-teal-dark/15 rounded-2xl p-6 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-bds-cocoa/70">
          {title}
        </span>
        <div className="w-10 h-10 rounded-xl bg-bds-cream flex items-center justify-center text-bds-teal-dark">
          {icon}
        </div>
      </div>
      <div className="space-y-3">
        <div className="text-3xl font-black font-heading text-bds-teal-dark tracking-tight">
          {value}
        </div>
        {description ? (
          <p className="text-xs text-bds-cocoa/80">{description}</p>
        ) : null}
        {trend ? (
          <span className="inline-block text-[11px] font-bold text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        ) : null}
      </div>
    </div>
  );
};
