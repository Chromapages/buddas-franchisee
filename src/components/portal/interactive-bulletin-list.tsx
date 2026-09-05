"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Check, AlertCircle } from "lucide-react";
import type { PortalBulletin } from "@/src/features/portal/types";
import { acknowledgeBulletinAction } from "@/src/features/portal/actions";
import { usePortalContext } from "@/src/features/portal/portal-context";
import { formatAudienceBadgeText } from "@/src/features/portal/targeting";

export type InteractiveBulletinListProps = {
  bulletins: PortalBulletin[];
};

export const InteractiveBulletinList = ({
  bulletins,
}: InteractiveBulletinListProps) => {
  const { decrementCount, updateCount } = usePortalContext();
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

    const todayIso = new Date().toISOString();
    const wasActionRequired =
      bulletin.priority === "ACTION_REQUIRED" ||
      bulletin.acknowledgement?.required;

    // 1. Optimistic update local to this module
    setAcknowledgedMap((prev) => ({
      ...prev,
      [bulletin.id]: todayIso,
    }));
    setPendingBulletinId(bulletin.id);
    setStatusMessage(`Acknowledged bulletin: ${bulletin.title}`);

    // 2. Scoped global notification count decrement
    if (wasActionRequired) {
      decrementCount("actionRequiredBulletinCount");
    }

    // 3. Dispatch server action in non-blocking transition
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("bulletinId", bulletin.id);
        await acknowledgeBulletinAction(formData);
      } catch (error) {
        console.error("Failed to acknowledge bulletin:", error);
        // Rollback on failure
        setAcknowledgedMap((prev) => {
          const next = { ...prev };
          delete next[bulletin.id];
          return next;
        });
        if (wasActionRequired) {
          updateCount("actionRequiredBulletinCount", (prev) => prev + 1);
        }
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
            className="rounded-2xl border border-bds-teal-dark/10 bg-bds-cream/40 p-4 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <h4 className="heading-minor text-bds-teal-dark">
                {bulletin.title}
              </h4>
              <time
                dateTime={bulletin.publishedAt}
                className="shrink-0 text-[10px] text-bds-cocoa/60"
              >
                Published {new Date(bulletin.publishedAt).toLocaleDateString()}
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
                Effective {new Date(bulletin.effectiveAt).toLocaleDateString()}
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
                Acknowledged on {new Date(acknowledgedAt).toLocaleDateString()}
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
