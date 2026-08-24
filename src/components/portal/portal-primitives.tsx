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
    <div className="bg-white border border-brand-charcoal/10 rounded-3xl p-6 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/60">
          {title}
        </span>
        <div className="w-10 h-10 rounded-xl bg-brand-sand flex items-center justify-center text-brand-clay">
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-3xl font-black font-heading text-brand-charcoal tracking-tight">
          {value}
        </div>
        {description ? (
          <p className="text-xs text-brand-charcoal/70">{description}</p>
        ) : null}
        {trend ? (
          <span className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        ) : null}
      </div>
    </div>
  );
};
