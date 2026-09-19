"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Check, AlertCircle } from "lucide-react";
import type { PortalBulletin } from "@/src/features/portal/types";
import { acknowledgeBulletinAction } from "@/src/features/portal/actions";
import { usePortalContext } from "@/src/features/portal/portal-context";
import { formatAudienceBadgeText } from "@/src/features/portal/targeting";
import { formatPortalDate } from "@/src/features/portal/date-time";

export type InteractiveBulletinListProps = {
  bulletins: PortalBulletin[];
  locationId: string;
};

export const InteractiveBulletinList = ({
  bulletins,
  locationId,
}: InteractiveBulletinListProps) => {
  const { decrementCount } = usePortalContext();
  const [isPending, startTransition] = useTransition();
  const [pendingBulletinId, setPendingBulletinId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const initialAcknowledgedMap = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    bulletins.forEach((bulletin) => {
      if (bulletin.currentUserState?.acknowledgedAt) {
        map[bulletin.id] = bulletin.currentUserState.acknowledgedAt;
      }
    });
    return map;
  }, [bulletins]);

  const [acknowledgedMap, setAcknowledgedMap] =
    useState<Record<string, string>>(initialAcknowledgedMap);

  const handleAcknowledge = (bulletin: PortalBulletin) => {
    if (acknowledgedMap[bulletin.id] || isPending) {
      return;
    }

    const wasActionRequired =
      bulletin.priority === "ACTION_REQUIRED" ||
      bulletin.acknowledgement?.required;

    setPendingBulletinId(bulletin.id);

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("bulletinId", bulletin.id);
        const result = await acknowledgeBulletinAction(formData);
        if (result.status !== "success" || !result.acknowledgedAt) {
          setStatusMessage(result.message);
          return;
        }
        setAcknowledgedMap((prev) => ({ ...prev, [bulletin.id]: result.acknowledgedAt! }));
        if (wasActionRequired) decrementCount("actionRequiredBulletinCount");
        setStatusMessage(`Acknowledged bulletin: ${bulletin.title}`);
      } catch (error) {
        setStatusMessage(`Failed to acknowledge: ${bulletin.title}. Please try again.`);
      } finally {
        setPendingBulletinId(null);
      }
    });
  };

  if (bulletins.length === 0) {
    return (
      <div
        role="status"
        className="px-3 py-5 text-center text-sm text-bds-cocoa/80"
      >
        <p>No current operations bulletins for this unit.</p>
        <Link
          href="/portal/resources"
          className="mt-2 inline-flex text-xs font-bold uppercase tracking-wider text-bds-teal-dark hover:underline focus-visible:outline-2 focus-visible:outline-bds-teal-dark"
        >
          Open Resource Center
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {statusMessage ? (
        <div
          role="status"
          aria-live="polite"
          className="sr-only"
        >
          {statusMessage}
        </div>
      ) : null}

      {bulletins.map((bulletin) => {
        const acknowledgedAt = acknowledgedMap[bulletin.id];
        const isCurrentPending = pendingBulletinId === bulletin.id;
        const requiresAck =
          !acknowledgedAt &&
          (bulletin.acknowledgement?.required ||
            bulletin.priority === "ACTION_REQUIRED");
        const audienceBadge = formatAudienceBadgeText(bulletin.audience);

        return (
          <article
            key={bulletin.id}
            className="mobile-workspace-panel rounded-2xl border border-bds-teal-dark/10 bg-bds-cream/40 p-4 transition-colors"
          >
            <div className="mobile-workspace-record-header flex items-start justify-between gap-3">
              <h2 className="heading-minor text-bds-teal-dark">
                {bulletin.title}
              </h2>
              <time
                dateTime={bulletin.publishedAt}
                className="shrink-0 text-[10px] text-bds-cocoa/60"
              >
                Published {formatPortalDate(bulletin.publishedAt, locationId)}
              </time>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-bds-cocoa/80">
              {bulletin.summary}
            </p>

            {audienceBadge ? (
              <div className="mt-2 flex items-center gap-1.5">
                <span
                  className="inline-flex items-center rounded-md border border-bds-teal-dark/15 bg-white px-2 py-0.5 text-[10px] font-semibold text-bds-cocoa/80 shadow-2xs"
                  aria-label={`Targeted audience: ${audienceBadge}`}
                >
                  Audience: {audienceBadge}
                </span>
              </div>
            ) : null}

            {bulletin.type ? (
              <p className="mt-2 text-xs font-semibold text-bds-cocoa/80">
                Type: {bulletin.type}
              </p>
            ) : null}

            {bulletin.effectiveAt ? (
              <p className="mt-2 text-xs font-semibold text-bds-cocoa/80">
                Effective {formatPortalDate(bulletin.effectiveAt, locationId)}
              </p>
            ) : null}

            {bulletin.sourceOwner ? (
              <p className="mt-2 text-xs text-bds-cocoa/70">
                Source: {bulletin.sourceOwner}
              </p>
            ) : null}

            {bulletin.priority === "ACTION_REQUIRED" && !acknowledgedAt ? (
              <p className="mt-2 text-xs font-bold text-bds-orange">
                Action required
              </p>
            ) : bulletin.priority === "IMPORTANT" ? (
              <p className="mt-2 text-xs font-semibold text-bds-cocoa/80">
                Important
              </p>
            ) : null}

            {bulletin.attachments?.length ? (
              <ul className="mt-3 space-y-1" aria-label="Bulletin attachments">
                {bulletin.attachments.map((attachment) => (
                  <li key={attachment.href}>
                    <a
                      href={attachment.href}
                      className="text-xs font-semibold text-bds-teal hover:underline focus-visible:outline-2 focus-visible:outline-bds-teal"
                    >
                      {attachment.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}

            {acknowledgedAt ? (
              <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                Acknowledged on {formatPortalDate(acknowledgedAt, locationId)}
              </p>
            ) : requiresAck ? (
              <div className="mt-3">
                <button
                  type="button"
                  tabIndex={0}
                  onClick={() => handleAcknowledge(bulletin)}
                  disabled={isCurrentPending}
                  aria-label={`Acknowledge bulletin: ${bulletin.title}`}
                  className="rounded-xl border border-bds-teal/40 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-bds-teal hover:bg-bds-cream hover:border-bds-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-bds-teal disabled:opacity-50"
                >
                  {isCurrentPending ? "Acknowledging..." : "Acknowledge bulletin"}
                </button>
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
};
