"use client";

import { useEffect, useState } from "react";

type ReadinessItem = {
  id: string;
  label: string;
  description: string;
};

type CandidateReadinessCheckProps = {
  items: readonly ReadinessItem[];
};

const STORAGE_KEY = "buddas:candidate-readiness-v1";

export const CandidateReadinessCheck = ({ items }: CandidateReadinessCheckProps) => {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(STORAGE_KEY);
      if (stored) setChecked(JSON.parse(stored) as Record<string, boolean>);
    } catch {
      // This optional orientation aid remains fully usable without storage.
    }
  }, []);

  const updateItem = (id: string, value: boolean) => {
    const next = { ...checked, [id]: value };
    setChecked(next);

    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Do not block a local self-check when session storage is unavailable.
    }
  };

  const clear = () => {
    setChecked({});
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // No persistent state is required for this optional checklist.
    }
  };

  return (
    <section aria-labelledby="candidate-readiness-heading" className="mt-10 border-t border-bds-teal-dark/25 pt-6">
      <div className="grid gap-5 xl:grid-cols-[minmax(15rem,0.55fr)_minmax(0,1.45fr)] xl:gap-10">
        <div>
          <p className="text-[0.8125rem] font-bold uppercase tracking-[0.1em] text-bds-teal-dark">Optional self-orientation</p>
          <h3 id="candidate-readiness-heading" className="mt-2 heading-compact text-brand-charcoal">Candidate Readiness Self-Check</h3>
          <p className="mt-2 text-base leading-7 text-brand-charcoal/75">Private to this browser session. Checking an item does not submit information, start an application, or affect any qualification decision.</p>
        </div>

        <div>
          <fieldset>
            <legend className="sr-only">Review published baseline criteria privately</legend>
            <div className="border-y border-bds-teal-dark/15">
              {items.map((item, index) => (
                <label key={item.id} className={`flex min-h-14 cursor-pointer items-start gap-4 py-4 ${index > 0 ? "border-t border-bds-teal-dark/15" : ""}`}>
                  <input
                    type="checkbox"
                    checked={checked[item.id] ?? false}
                    onChange={(event) => updateItem(item.id, event.target.checked)}
                    className="mt-1 h-5 w-5 shrink-0 rounded border-2 border-brand-charcoal/70 text-bds-teal-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bds-teal-dark"
                  />
                  <span>
                    <span className="block text-base font-semibold text-brand-charcoal">{item.label}</span>
                    <span className="mt-1 block text-[15px] leading-6 text-brand-charcoal/70">{item.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <button type="button" onClick={clear} className="mt-4 min-h-11 text-sm font-semibold text-bds-teal-dark underline underline-offset-4 hover:text-brand-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bds-teal-dark focus-visible:ring-offset-2">Clear self-check</button>
        </div>
      </div>
    </section>
  );
};
