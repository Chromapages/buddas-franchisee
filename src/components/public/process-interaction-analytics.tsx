"use client";

import { useEffect } from "react";
import { trackFunnelEvent, type ProcessStageId } from "@/src/lib/analytics";

const PROCESS_STAGE_IDS = new Set<ProcessStageId>([
  "initial-inquiry",
  "discovery-call",
  "fdd-disclosure",
  "discovery-day",
]);

const isProcessStageId = (value: string | undefined): value is ProcessStageId =>
  Boolean(value && PROCESS_STAGE_IDS.has(value as ProcessStageId));

/**
 * Progressive enhancement only: server-rendered anchors still navigate before
 * hydration, while one delegated listener records only governed IDs after it.
 */
export const ProcessInteractionAnalytics = () => {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;

      const link = event.target.closest<HTMLAnchorElement>("a[data-process-analytics]");
      const stageId = link?.dataset.processStageId;
      if (!link || !isProcessStageId(stageId)) return;

      if (link.dataset.processAnalytics === "overview-stage") {
        trackFunnelEvent("process_overview_stage_click", {
          page_path: "/franchise/process",
          process_interaction: "overview_stage",
          process_stage_id: stageId,
        });
        return;
      }

      if (link.dataset.processAnalytics === "related-link") {
        trackFunnelEvent("process_related_link_click", {
          page_path: "/franchise/process",
          process_interaction: "related_link",
          process_stage_id: stageId,
          process_destination_id: link.dataset.processDestinationId || "unknown",
        });
      }
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
};
