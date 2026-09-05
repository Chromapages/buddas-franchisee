import {
  ITEM_19_FPR_DATA,
  ITEM_19_LEGAL_DISCLAIMER,
} from "@/src/features/financials/financial-data";
import { Info } from "lucide-react";

export const Item19FprTable = () => {
  return (
    <div className="bg-white border border-brand-charcoal/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-sand text-brand-clay text-xs font-bold uppercase tracking-wider">
          <Info className="w-3.5 h-3.5" aria-hidden="true" />
          Item 19 Financial Performance Representation (FPR)
        </div>
        <h3 className="heading-compact text-brand-charcoal">
          Historical Operating Financial Benchmarks
        </h3>
        <p className="text-sm text-brand-charcoal/70 leading-relaxed max-w-3xl prose-measure">
          The table below reflects historical operating metrics for qualifying restaurant locations operating under the Budda&apos;s system during the measured reporting periods.
        </p>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto rounded-2xl border border-brand-charcoal/10">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-brand-sand text-brand-charcoal font-heading font-bold border-b border-brand-charcoal/10">
              <th className="py-4 px-5">Financial Benchmark Metric</th>
              <th className="py-4 px-5 text-brand-clay font-black">Top Quartile (25%)</th>
              <th className="py-4 px-5">Mid Quartile (50%)</th>
              <th className="py-4 px-5">System Average</th>
              <th className="py-4 px-5 text-xs text-brand-charcoal/60">Operating Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-charcoal/5">
            {ITEM_19_FPR_DATA.map((row) => (
              <tr key={row.metric} className="hover:bg-brand-cream/60 transition-colors">
                <td className="py-4 px-5 font-semibold text-brand-charcoal">
                  {row.metric}
                </td>
                <td className="py-4 px-5 font-bold text-brand-clay text-base">
                  {row.topQuartile}
                </td>
                <td className="py-4 px-5 text-brand-charcoal/90">
                  {row.midQuartile}
                </td>
                <td className="py-4 px-5 font-semibold text-brand-charcoal">
                  {row.systemAverage}
                </td>
                <td className="py-4 px-5 text-xs text-brand-charcoal/60 max-w-xs">
                  {row.notes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FTC Disclaimer Callout */}
      <div className="p-4 sm:p-5 rounded-2xl bg-brand-sand/60 border border-brand-charcoal/10 text-xs text-brand-charcoal/70 leading-relaxed space-y-2">
        <p className="font-bold text-brand-charcoal uppercase tracking-wider text-[11px]">
          FTC Franchise Rule Mandatory Disclosure:
        </p>
        <p className="prose-measure">{ITEM_19_LEGAL_DISCLAIMER}</p>
      </div>
    </div>
  );
};
