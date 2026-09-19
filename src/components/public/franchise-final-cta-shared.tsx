import Link from "next/link";

export type FranchiseFinalCtaPresentationProps = {
  fullBleed: boolean;
  contactHref: string;
  eyebrow: string;
  title: string;
  description: string;
  qualificationBenchmark: {
    label: string;
    items: readonly { label: string; description: string }[];
  };
  expectation: string | null;
  boundary: string;
  primaryActionLabel: string;
  processHref: string;
  processActionLabel: string;
  onPrimaryClick: () => void;
  onProcessLinkClick: () => void;
};

export const FinalCtaAction = ({ href, label, onPrimaryClick, fullWidth = false }: Pick<FranchiseFinalCtaPresentationProps, "onPrimaryClick"> & { href: string; label: string; fullWidth?: boolean }) => (
  <div>
    <div className={`mx-auto w-full ${fullWidth ? "max-w-none" : "max-w-sm lg:mx-0"}`}>
      <Link href={href} onClick={onPrimaryClick} className={`flex min-h-[52px] items-center justify-center rounded-xl bg-bds-cream px-6 font-heading text-sm font-semibold text-bds-teal-dark transition-colors duration-200 hover:bg-white active:bg-white motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bds-cream focus-visible:ring-offset-2 focus-visible:ring-offset-bds-teal-dark sm:px-8 ${fullWidth ? "w-full" : "w-full sm:w-auto sm:min-w-[300px]"}`}>{label}</Link>
    </div>
  </div>
);

export const FinalCtaQualificationBenchmark = ({ label, items, variant = "default" }: FranchiseFinalCtaPresentationProps["qualificationBenchmark"] & { variant?: "default" | "desktop" }) => (
  variant === "desktop" ? <ul className="franchise-final-criteria" aria-label={label}>
    {items.map((item, index) => <li key={item.label}>
      <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
      <div><strong>{item.label}</strong><p>{item.description}</p></div>
    </li>)}
  </ul> :
  <div className="border-y border-white/20 py-4 text-left" aria-label="Preliminary candidate benchmark">
    <p className="font-heading text-xs font-semibold uppercase tracking-[0.1em] text-bds-cream/90">{label}</p>
    <ul className="mt-3 grid max-w-2xl gap-x-8 gap-y-3 font-body text-sm leading-5 text-bds-cream sm:grid-cols-3">
      {items.map((item) => <li key={item.label} className="flex gap-2 before:mt-2 before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-bds-cream/90">{item.label}</li>)}
    </ul>
  </div>
);
