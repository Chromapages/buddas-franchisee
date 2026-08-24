import {
  ESTIMATED_INITIAL_INVESTMENT_TABLE,
  PUBLISHED_FINANCIAL_THRESHOLDS,
} from "@/src/features/financials/financial-data";
import { DollarSign, ShieldCheck, PieChart, Wallet } from "lucide-react";

export type FinancialDisclosureProps = {
  isActiveOffering: boolean;
};

export const FinancialDisclosure = ({
  isActiveOffering,
}: FinancialDisclosureProps) => {
  if (!isActiveOffering) {
    return (
      <div className="bg-brand-sand border border-brand-charcoal/10 rounded-3xl p-8 sm:p-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-butter flex items-center justify-center text-brand-charcoal">
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-heading text-brand-charcoal">
              Financial Information Status
            </h3>
            <p className="text-sm text-brand-charcoal/70">
              Current investment disclosures &amp; active evaluation boundaries.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-brand-charcoal/10">
            <h4 className="text-sm font-bold text-brand-charcoal mb-1">
              Territory Availability
            </h4>
            <p className="text-sm text-brand-charcoal/70">
              Reviewed mutually during qualification; initial inquiry does not reserve territory.
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-brand-charcoal/10">
            <h4 className="text-sm font-bold text-brand-charcoal mb-1">
              Franchise Fee &amp; Royalty
            </h4>
            <p className="text-sm text-brand-charcoal/70">
              Delivered formally through the Franchise Disclosure Document (FDD) upon mutual qualification.
            </p>
          </div>
        </div>

        <p className="text-xs text-brand-charcoal/60 border-t border-brand-charcoal/10 pt-4">
          <strong>Disclosure boundary:</strong> Budda&apos;s does not publish initial investment ranges or fee structures on this public site until prospective candidates complete preliminary mutual qualification and receive the active FDD.
        </p>
      </div>
    );
  }

  // Active Offering Mode (Release 2)
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-8" id="financials">
      {/* 4 Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-brand-charcoal/10 rounded-3xl p-6 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-brand-sand flex items-center justify-center text-brand-clay">
            <DollarSign className="w-5 h-5" aria-hidden="true" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/60">
            Initial Franchise Fee
          </p>
          <p className="text-3xl font-black font-heading text-brand-charcoal">
            {formatCurrency(PUBLISHED_FINANCIAL_THRESHOLDS.initialFranchiseFee)}
          </p>
          <p className="text-xs text-brand-charcoal/70">
            Due upon execution of Franchise Agreement
          </p>
        </div>

        <div className="bg-white border border-brand-charcoal/10 rounded-3xl p-6 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-brand-butter flex items-center justify-center text-brand-charcoal">
            <Wallet className="w-5 h-5" aria-hidden="true" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/60">
            Estimated Investment
          </p>
          <p className="text-3xl font-black font-heading text-brand-charcoal">
            $425K – $875K
          </p>
          <p className="text-xs text-brand-charcoal/70">
            Includes buildout, equipment, and opening stock
          </p>
        </div>

        <div className="bg-white border border-brand-charcoal/10 rounded-3xl p-6 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-brand-sand flex items-center justify-center text-brand-clay">
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/60">
            Liquid Capital Required
          </p>
          <p className="text-3xl font-black font-heading text-brand-charcoal">
            {formatCurrency(PUBLISHED_FINANCIAL_THRESHOLDS.liquidCapitalRequirement)}
          </p>
          <p className="text-xs text-brand-charcoal/70">
            Verifiable liquid funds per candidate/group
          </p>
        </div>

        <div className="bg-white border border-brand-charcoal/10 rounded-3xl p-6 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-brand-sand flex items-center justify-center text-brand-charcoal">
            <PieChart className="w-5 h-5" aria-hidden="true" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/60">
            Ongoing Royalty &amp; Brand
          </p>
          <p className="text-3xl font-black font-heading text-brand-charcoal">
            5% / 1.5%
          </p>
          <p className="text-xs text-brand-charcoal/70">
            5% Royalty + 1.5% Brand Fund of Gross Sales
          </p>
        </div>
      </div>

      {/* Item 7 Estimated Initial Investment Table */}
      <div className="bg-white border border-brand-charcoal/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-2xl font-bold font-heading text-brand-charcoal">
            Item 7: Estimated Initial Investment Breakdown
          </h3>
          <p className="text-sm text-brand-charcoal/70 leading-relaxed mt-1">
            The detailed cost breakdown below outlines the estimated initial capital required to develop a standard Budda&apos;s Bakery &amp; Grill restaurant footprint (1,800 to 2,600 sq. ft.).
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-brand-charcoal/10">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-brand-sand text-brand-charcoal font-heading font-bold border-b border-brand-charcoal/10">
                <th className="py-4 px-5">Expenditure Category</th>
                <th className="py-4 px-5">Low Estimate</th>
                <th className="py-4 px-5">High Estimate</th>
                <th className="py-4 px-5">Payment Method</th>
                <th className="py-4 px-5">To Whom Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-charcoal/5">
              {ESTIMATED_INITIAL_INVESTMENT_TABLE.map((item) => (
                <tr key={item.category} className="hover:bg-brand-cream/60 transition-colors">
                  <td className="py-4 px-5">
                    <div className="font-semibold text-brand-charcoal">{item.category}</div>
                    <div className="text-xs text-brand-charcoal/60 mt-0.5">{item.notes}</div>
                  </td>
                  <td className="py-4 px-5 font-bold text-brand-charcoal">
                    {formatCurrency(item.lowEstimate)}
                  </td>
                  <td className="py-4 px-5 font-bold text-brand-charcoal">
                    {formatCurrency(item.highEstimate)}
                  </td>
                  <td className="py-4 px-5 text-brand-charcoal/80">{item.paymentMethod}</td>
                  <td className="py-4 px-5 text-brand-charcoal/80">{item.toWhomPaid}</td>
                </tr>
              ))}
              <tr className="bg-brand-sand/50 font-heading font-bold text-base border-t-2 border-brand-charcoal/20">
                <td className="py-4 px-5 text-brand-charcoal">ESTIMATED TOTAL INITIAL INVESTMENT</td>
                <td className="py-4 px-5 text-brand-clay font-black">
                  {formatCurrency(PUBLISHED_FINANCIAL_THRESHOLDS.estimatedInvestmentLow)}
                </td>
                <td className="py-4 px-5 text-brand-clay font-black">
                  {formatCurrency(PUBLISHED_FINANCIAL_THRESHOLDS.estimatedInvestmentHigh)}
                </td>
                <td colSpan={2} className="py-4 px-5 text-xs text-brand-charcoal/60 font-body">
                  Costs vary by regional market, lease terms, and building conditions.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
