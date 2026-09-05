import {
  ESTIMATED_INITIAL_INVESTMENT_TABLE,
  FRANCHISE_INVESTMENT_DISCLOSURE,
  UNAPPROVED_FINANCIAL_THRESHOLDS,
} from "@/src/features/financials/financial-data";
import { OPPORTUNITY_DOSSIER_CONTENT } from "@/src/features/franchise/opportunity-content";

export type FinancialDisclosureProps = {
  isActiveOffering: boolean;
};

export const FinancialDisclosure = ({
  isActiveOffering,
}: FinancialDisclosureProps) => {
  if (!isActiveOffering) {
    return (
      <section id="financial-requirements" className="border-y border-bds-teal-dark/25 py-6 sm:py-8">
        <div id="financials">
          <h3 className="heading-compact text-brand-charcoal">{OPPORTUNITY_DOSSIER_CONTENT.financialDisclosure.guide.text}</h3>
          <dl className="mt-5 border-y border-bds-teal-dark/25">
            {OPPORTUNITY_DOSSIER_CONTENT.financialDisclosure.rows.map((row, index) => (
              <div key={row.label.text} className={`py-5 ${index > 0 ? "border-t border-bds-teal-dark/15" : ""}`}>
                <dt className="text-sm font-bold uppercase tracking-[0.08em] text-bds-teal-dark">{row.label.text}</dt>
                <dd className="mt-2 max-w-[62ch] text-base leading-7 text-brand-charcoal/75">{row.description.text}</dd>
                <dd className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm leading-6 text-brand-charcoal/65">
                  <span><span className="font-bold uppercase tracking-[0.06em] text-bds-teal-dark">Reference: </span>{row.reference.text}</span>
                  <span><span className="font-bold uppercase tracking-[0.06em] text-bds-teal-dark">Status: </span>{row.status.text}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
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
  const publicFinancialRows = [
    {
      label: "Initial franchise fee",
      value: formatCurrency(UNAPPROVED_FINANCIAL_THRESHOLDS.initialFranchiseFee),
      note: "Due upon execution of Franchise Agreement",
    },
    {
      label: "Estimated initial investment",
      value: FRANCHISE_INVESTMENT_DISCLOSURE.displayRange,
      note: "Includes buildout, equipment, and opening stock",
    },
    {
      label: "Candidate liquid capital requirement",
      value: formatCurrency(UNAPPROVED_FINANCIAL_THRESHOLDS.liquidCapitalRequirement),
      note: "Verifiable liquid funds per candidate/group",
    },
    {
      label: "Ongoing royalty & brand fund",
      value: "5% / 1.5%",
      note: "5% Royalty + 1.5% Brand Fund of Gross Sales",
    },
  ] as const;

  return (
    <section id="financial-requirements" className="space-y-8">
      <div id="financials">
      <dl className="border-y border-bds-teal-dark/25">
        {publicFinancialRows.map((row, index) => (
          <div key={row.label} className={`grid gap-2 py-5 md:grid-cols-[minmax(12rem,0.8fr)_minmax(12rem,0.45fr)_minmax(0,1fr)] md:items-baseline md:gap-6 ${index > 0 ? "border-t border-bds-teal-dark/15" : ""}`}>
            <dt className="text-sm font-semibold text-brand-charcoal">{row.label}</dt>
            <dd className="font-heading text-2xl font-black text-bds-teal-dark">{row.value}</dd>
            <dd className="text-sm leading-6 text-brand-charcoal/70">{row.note}</dd>
          </div>
        ))}
      </dl>

      {/* Item 7 Estimated Initial Investment Table */}
      <div className="bg-white border border-brand-charcoal/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="heading-compact text-brand-charcoal">
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
                <tr key={item.category} className="hover:bg-brand-cream/60 transition-colors motion-reduce:transition-none">
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
                <td className="py-4 px-5 text-bds-teal-dark font-black">
                  {formatCurrency(UNAPPROVED_FINANCIAL_THRESHOLDS.estimatedInvestmentLow)}
                </td>
                <td className="py-4 px-5 text-bds-teal-dark font-black">
                  {formatCurrency(UNAPPROVED_FINANCIAL_THRESHOLDS.estimatedInvestmentHigh)}
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
    </section>
  );
};
