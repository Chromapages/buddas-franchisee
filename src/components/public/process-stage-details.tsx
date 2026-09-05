"use client";

import { useState, type ReactNode } from "react";
import { trackFunnelEvent, type ProcessStageId } from "@/src/lib/analytics";

export const ProcessStageDetails = ({
  stageId,
  label,
  children,
}: {
  stageId: ProcessStageId;
  label: string;
  children: ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonId = `${stageId}-details-trigger`;
  const panelId = `${stageId}-details-panel`;

  const toggleDetails = () => {
    setIsOpen((open) => {
      const next = !open;
      trackFunnelEvent(next ? "process_stage_detail_open" : "process_stage_detail_close", {
        page_path: "/franchise/process",
        process_interaction: "detail_disclosure",
        process_stage_id: stageId,
      });
      return next;
    });
  };

  return (
    <section className="mt-5 border-t border-bds-teal-dark/15 pt-4">
      <h4>
        <button
          type="button"
          id={buttonId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={toggleDetails}
          className="touch-target flex min-h-11 w-full items-center text-left text-sm font-bold text-bds-teal-dark underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bds-teal-dark focus-visible:ring-offset-2"
        >
          {label}
        </button>
      </h4>
      <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen} inert={!isOpen} className="mt-4 space-y-5">
        {children}
      </div>
    </section>
  );
};
