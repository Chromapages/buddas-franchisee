"use client";

import { memo, useCallback, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { OperatorProofPillar } from "@/src/features/franchise/operator-proof-content";
import { trackFunnelEvent } from "@/src/lib/analytics";

type OperatorProofMobileStackProps = {
  pillars: readonly OperatorProofPillar[];
};

const pillarIndex: Record<OperatorProofPillar["id"], 1 | 2 | 3 | 4 | 5> = {
  product: 1,
  production: 2,
  operator: 3,
  hospitality: 4,
  growth: 5,
};

type OperatorProofMobileItemProps = {
  pillar: OperatorProofPillar;
  isOpen: boolean;
  onToggle: (id: OperatorProofPillar["id"]) => void;
};

const OperatorProofMobileItem = memo(({ pillar, isOpen, onToggle }: OperatorProofMobileItemProps) => {
  const triggerId = `operator-proof-trigger-${pillar.id}`;
  const panelId = `operator-proof-panel-${pillar.id}`;

  return (
    <li id={`operator-proof-${pillar.id}`} className="border-t border-bds-teal-dark/35 first:border-t-0">
      <article className="text-left">
        <h3>
          <button
            id={triggerId}
            type="button"
            aria-expanded={isOpen}
            aria-controls={panelId}
            onClick={() => onToggle(pillar.id)}
            className="grid min-h-16 w-full grid-cols-[2.5rem_minmax(0,1fr)_1.5rem] items-start gap-3 px-4 py-4 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bds-teal-dark focus-visible:ring-offset-2"
          >
            <span className="font-heading text-[12px] font-semibold tabular-nums leading-[1.5] tracking-[0.1em] text-bds-teal-dark" aria-hidden="true">{pillar.index}</span>
            <span className="min-w-0">
              <span className="block font-heading text-[12px] font-semibold uppercase leading-[1.5] tracking-[0.12em] text-bds-teal-dark">{pillar.category}</span>
              <span className="mt-1.5 block font-heading text-[18px] font-bold leading-[1.3] text-bds-teal-dark [text-wrap:balance]">{pillar.headline}</span>
            </span>
            {isOpen ? <Minus className="mt-1 h-5 w-5 shrink-0 text-bds-teal-dark" aria-hidden="true" /> : <Plus className="mt-1 h-5 w-5 shrink-0 text-bds-teal-dark" aria-hidden="true" />}
          </button>
        </h3>
        <div
          id={panelId}
          role="region"
          aria-labelledby={triggerId}
          aria-hidden={!isOpen}
          inert={!isOpen}
          className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none ${isOpen ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0"}`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="operator-proof-mobile-detail grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 px-4 pb-6 pt-5">
              <div aria-hidden="true" />
              <div>
                <p className="font-body text-[15px] leading-[1.5] text-bds-cocoa">{pillar.body}</p>
                {pillar.evidenceItems.map((evidence) => (
                  <dl key={evidence.label} className="mt-3 border-l-2 border-bds-teal-dark/35 pl-3">
                    <dt className="font-heading text-[12px] font-semibold uppercase leading-[1.5] tracking-[0.1em] text-bds-teal-dark">{evidence.label}</dt>
                    <dd className="mt-1 font-body text-[15px] leading-[1.5] text-bds-cocoa">{evidence.value}</dd>
                  </dl>
                ))}
                {pillar.media ? (
                  <figure className="relative mt-4 aspect-[4/3] overflow-hidden rounded-xl border border-bds-teal-dark/15 bg-bds-cream">
                    <Image
                      src={pillar.media.src}
                      alt={pillar.media.alt}
                      fill
                      loading="lazy"
                      sizes="(max-width: 767px) calc(100vw - 5.5rem), 24rem"
                      className="object-cover"
                      style={{ objectPosition: pillar.media.objectPosition }}
                    />
                  </figure>
                ) : null}
                {pillar.href && pillar.linkLabel ? <Link href={pillar.href} onClick={() => trackFunnelEvent("franchise_advantage_deep_link_clicked", { page_path: "/franchise", placement: "operator_proof_stack", item: pillar.id, index: pillarIndex[pillar.id], destination: pillar.href })} className="touch-target-inline mt-2 font-heading text-sm font-semibold text-bds-teal-dark underline underline-offset-4">{pillar.linkLabel}</Link> : null}
              </div>
            </div>
          </div>
        </div>
      </article>
    </li>
  );
});

/** Product begins open; only the prior and next panel rows update on a toggle. */
export const OperatorProofMobileStack = ({ pillars }: OperatorProofMobileStackProps) => {
  const [openPillar, setOpenPillar] = useState<OperatorProofPillar["id"] | null>("product");
  const openPillarRef = useRef<OperatorProofPillar["id"] | null>("product");
  const handleToggle = useCallback((id: OperatorProofPillar["id"]) => {
    const next = openPillarRef.current === id ? null : id;
    openPillarRef.current = next;
    setOpenPillar(next);
    if (next) trackFunnelEvent("franchise_advantage_item_opened", {
      page_path: "/franchise",
      placement: "operator_proof_stack",
      item: id,
      index: pillarIndex[id],
    });
  }, []);

  return <ol className="operator-proof-mobile-stack border-y-2 border-bds-teal-dark/55 lg:hidden" aria-label="Operator model pillars">
    {pillars.map((pillar) => <OperatorProofMobileItem key={pillar.id} pillar={pillar} isOpen={openPillar === pillar.id} onToggle={handleToggle} />)}
  </ol>;
};
