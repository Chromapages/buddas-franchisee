"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  AlertCircle,
  Bookmark,
  BookmarkPlus,
  CheckCircle2,
  Clock,
  HelpCircle,
  MessageSquare,
  PlusCircle,
  RotateCcw,
  Search,
  Send,
  User,
  X,
  XCircle,
} from "lucide-react";
import type {
  PortalSupportCase,
  PortalSupportMessage,
} from "@/src/features/portal/types";
import {
  closeSupportCaseAction,
  reopenSupportCaseAction,
  replySupportCaseAction,
} from "@/src/features/portal/actions";
import { usePortalContext } from "@/src/features/portal/portal-context";
import {
  areSupportCriteriaEqual,
  deleteCustomView,
  loadCustomViews,
  saveCustomView,
  SYSTEM_SUPPORT_VIEWS,
  type SavedSupportView,
  type SupportViewCriteria,
  type SupportViewMode,
} from "@/src/features/portal/saved-views";
import { SupportForm } from "./support-form";
import { TableLine } from "@/src/components/portal/table-line";
import { formatPortalDate, formatPortalDateTime } from "@/src/features/portal/date-time";

type SupportViewFilter = SupportViewMode;

type SupportWorkspaceProps = {
  tickets: PortalSupportCase[];
  locationId: string;
  locationName: string;
  initialTicketId?: string;
};

const ReplySubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="touch-target btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
    >
      <Send className="h-3.5 w-3.5" aria-hidden="true" />
      {pending ? "Sending..." : "Send Reply"}
    </button>
  );
};

const CloseSubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="touch-target btn-outline inline-flex items-center gap-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
    >
      <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
      {pending ? "Resolving..." : "Mark Resolved"}
    </button>
  );
};

const ReopenSubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="touch-target btn-outline inline-flex items-center gap-2 border-amber-600 text-amber-800 hover:bg-amber-50 px-4 py-2 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
    >
      <RotateCcw className="h-4 w-4 text-amber-600" aria-hidden="true" />
      {pending ? "Reopening..." : "Reopen Ticket"}
    </button>
  );
};

export const SupportWorkspace = ({
  tickets,
  locationId,
  locationName,
  initialTicketId,
}: SupportWorkspaceProps) => {
  const { decrementCount } = usePortalContext();
  const [ticketsList, setTicketsList] = useState<PortalSupportCase[]>(tickets);

  useEffect(() => {
    setTicketsList(tickets);
  }, [tickets]);

  // Safe validation: strictly match initial ticket within unit's authorized tickets
  const safeInitialId = useMemo(() => {
    if (!initialTicketId) return ticketsList[0]?.id ?? null;
    const found = ticketsList.find((t) => t.id === initialTicketId);
    return found ? found.id : ticketsList[0]?.id ?? null;
  }, [ticketsList, initialTicketId]);

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(safeInitialId);
  const [filter, setFilter] = useState<SupportViewFilter>(
    initialTicketId && ticketsList.some((t) => t.id === initialTicketId && t.operatorActionRequired)
      ? "needs-attention"
      : "all",
  );
  const [query, setQuery] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [customViews, setCustomViews] = useState<SavedSupportView[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [newViewName, setNewViewName] = useState("");
  const [lastDeletedView, setLastDeletedView] = useState<SavedSupportView | null>(null);
  const [undoNotice, setUndoNotice] = useState<string | null>(null);

  useEffect(() => {
    setCustomViews(loadCustomViews<SavedSupportView>("support", locationId));
  }, [locationId]);

  const currentCriteria = useMemo<SupportViewCriteria>(
    () => ({
      query,
      filter,
    }),
    [query, filter],
  );

  const activeMatchedView = useMemo(() => {
    const all = [...SYSTEM_SUPPORT_VIEWS, ...customViews];
    return all.find((item) => areSupportCriteriaEqual(item.criteria, currentCriteria)) ?? null;
  }, [customViews, currentCriteria]);

  const isDefaultView = useMemo(
    () => areSupportCriteriaEqual(currentCriteria, SYSTEM_SUPPORT_VIEWS[0].criteria),
    [currentCriteria],
  );

  const handleApplyCriteria = (criteria: SupportViewCriteria) => {
    setQuery(criteria.query);
    setFilter(criteria.filter);
  };

  const handleResetToDefault = () => {
    handleApplyCriteria(SYSTEM_SUPPORT_VIEWS[0].criteria);
  };

  const handleOpenSaveModal = () => {
    const initialName = query.trim()
      ? `Search: ${query.trim()}`
      : filter !== "all"
        ? `${filter === "needs-attention" ? "Needs Attention" : filter === "open" ? "Open" : "Resolved"} Tickets`
        : "Custom Support View";
    setNewViewName(initialName);
    setIsSaveModalOpen(true);
  };

  const handleCloseSaveModal = () => {
    setIsSaveModalOpen(false);
    setNewViewName("");
  };

  const handleSaveCustomView = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = newViewName.trim();
    if (!trimmedName) return;

    const newView: SavedSupportView = {
      id: `sup-view-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: trimmedName,
      isSystem: false,
      criteria: { ...currentCriteria },
    };

    const updated = saveCustomView<SavedSupportView>("support", locationId, newView);
    setCustomViews(updated);
    handleCloseSaveModal();
  };

  const handleDeleteCustomView = (viewId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const target = customViews.find((v) => v.id === viewId);
    const updated = deleteCustomView<SavedSupportView>("support", locationId, viewId);
    setCustomViews(updated);
    if (target) {
      setLastDeletedView(target);
      setUndoNotice(`View "${target.name}" removed.`);
    }
  };

  const handleUndoDeleteView = () => {
    if (!lastDeletedView) return;
    const restored = saveCustomView<SavedSupportView>("support", locationId, lastDeletedView);
    setCustomViews(restored);
    setUndoNotice(`Restored view "${lastDeletedView.name}".`);
    setLastDeletedView(null);
  };

  const filteredTickets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return ticketsList.filter((ticket) => {
      // 1. Filter tab
      if (filter === "needs-attention" && (!ticket.operatorActionRequired || ticket.status === "Resolved")) {
        return false;
      }
      if (filter === "open" && ticket.status === "Resolved") {
        return false;
      }
      if (filter === "resolved" && ticket.status !== "Resolved") {
        return false;
      }

      // 2. Query match
      if (!normalizedQuery) return true;
      return (
        ticket.id.toLowerCase().includes(normalizedQuery) ||
        ticket.subject.toLowerCase().includes(normalizedQuery) ||
        ticket.topic.toLowerCase().includes(normalizedQuery) ||
        ticket.userEmail.toLowerCase().includes(normalizedQuery) ||
        ticket.details.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [ticketsList, filter, query]);

  const selectedTicket = useMemo(() => {
    if (!selectedTicketId) return null;
    return ticketsList.find((t) => t.id === selectedTicketId) || null;
  }, [ticketsList, selectedTicketId]);

  const needsAttentionCount = useMemo(
    () => ticketsList.filter((t) => t.operatorActionRequired && t.status !== "Resolved").length,
    [ticketsList],
  );

  const handleSelectTicket = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setIsCreatingNew(false);
    setActionFeedback(null);
  };

  const handleOpenCreateForm = () => {
    setIsCreatingNew(true);
    setActionFeedback(null);
  };

  const handleCloseCreateForm = () => {
    setIsCreatingNew(false);
  };

  const handleReplyAction = async (formData: FormData) => {
    setActionFeedback(null);
    const caseId = (formData.get("caseId") as string)?.trim();
    const message = (formData.get("message") as string)?.trim();

    if (caseId && message) {
      setTicketsList((prev) =>
        prev.map((ticket) => {
          if (ticket.id !== caseId) return ticket;
          if (ticket.operatorActionRequired) {
            decrementCount("actionRequiredSupportCount");
          }
          const newMessage: PortalSupportMessage = {
            id: `msg-opt-${Date.now()}`,
            caseId,
            locationId,
            authorEmail: ticket.userEmail,
            authorRole: "OPERATOR",
            authorName: "Store Operator",
            message,
            createdAt: new Date().toISOString(),
          };
          return {
            ...ticket,
            operatorActionRequired: false,
            updatedAt: new Date().toISOString(),
            messages: [...(ticket.messages ?? []), newMessage],
          };
        }),
      );
    }

    const result = await replySupportCaseAction(formData);
    setActionFeedback({
      type: result.status,
      message: result.message,
    });
  };

  const handleCloseAction = async (formData: FormData) => {
    setActionFeedback(null);
    const caseId = (formData.get("caseId") as string)?.trim();

    if (caseId) {
      setTicketsList((prev) =>
        prev.map((ticket) => {
          if (ticket.id !== caseId) return ticket;
          if (ticket.operatorActionRequired) {
            decrementCount("actionRequiredSupportCount");
          }
          return {
            ...ticket,
            status: "Resolved" as const,
            operatorActionRequired: false,
            resolvedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }),
      );
    }

    const result = await closeSupportCaseAction(formData);
    setActionFeedback({
      type: result.status,
      message: result.message,
    });
  };

  const handleReopenAction = async (formData: FormData) => {
    setActionFeedback(null);
    const caseId = (formData.get("caseId") as string)?.trim();
    const reason = (formData.get("reason") as string)?.trim();

    if (caseId) {
      setTicketsList((prev) =>
        prev.map((ticket) => {
          if (ticket.id !== caseId) return ticket;
          const reopenMsg: PortalSupportMessage = {
            id: `msg-opt-${Date.now()}`,
            caseId,
            locationId,
            authorEmail: ticket.userEmail,
            authorRole: "OPERATOR",
            authorName: "Store Operator",
            message: reason ? `[Ticket Reopened] Reason: ${reason}` : "[Ticket Reopened by Operator]",
            createdAt: new Date().toISOString(),
          };
          return {
            ...ticket,
            status: "Open" as const,
            reopenedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messages: [...(ticket.messages ?? []), reopenMsg],
          };
        }),
      );
    }

    const result = await reopenSupportCaseAction(formData);
    setActionFeedback({
      type: result.status,
      message: result.message,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {!isCreatingNew ? <button
            type="button"
            onClick={handleOpenCreateForm}
            className={`touch-target inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
              isCreatingNew
                ? "bg-bds-teal-dark text-white shadow-sm"
                : "bg-white border border-bds-teal-dark/15 text-bds-teal-dark hover:bg-bds-cream"
            }`}
          >
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            Open New Ticket
          </button> : null}
          {isCreatingNew ? (
            <button
              type="button"
              onClick={handleCloseCreateForm}
              className="touch-target-inline text-xs font-bold uppercase tracking-wider text-bds-cocoa/70 hover:text-bds-teal-dark"
            >
              &larr; Back to tickets list
            </button>
          ) : null}
        </div>

      </div>

      {isCreatingNew ? (
        <div className="support-compose-container">
          <SupportForm key={locationId} locationId={locationId} locationName={locationName} />
        </div>
      ) : ticketsList.length === 0 ? (
        <section role="status" className="portal-empty-state space-y-1">
          <h2 className="heading-minor text-bds-teal-dark">No support tickets yet</h2>
          <p className="text-sm text-bds-cocoa/80">Requests opened for this unit will appear here with their conversation history and status.</p>
        </section>
      ) : (
        <>
          {/* Controls Bar */}
          <section
            aria-label="Support ticket controls"
            className="space-y-4 rounded-2xl border border-bds-teal-dark/15 bg-white p-4 shadow-sm sm:p-5"
          >
            {/* Saved Views / System Presets Rail */}
            <div className="flex flex-col gap-3 pb-3 border-b border-bds-teal-dark/10 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2" role="region" aria-label="Saved views and common ticket filters">
                <span className="text-xs font-bold uppercase tracking-wider text-bds-cocoa/70 mr-1">Views:</span>
                {SYSTEM_SUPPORT_VIEWS.map((sysView) => {
                  const isSelected = activeMatchedView?.id === sysView.id;
                  const countSuffix =
                    sysView.criteria.filter === "needs-attention" && needsAttentionCount > 0
                      ? ` (${needsAttentionCount})`
                      : "";
                  return (
                    <button
                      key={sysView.id}
                      type="button"
                      tabIndex={0}
                      onClick={() => handleApplyCriteria(sysView.criteria)}
                      className={`touch-target-inline rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                        isSelected
                          ? "bg-bds-teal-dark text-white shadow-sm"
                          : "bg-bds-cream text-bds-teal-dark hover:bg-bds-gold/30 border border-bds-teal-dark/10"
                      }`}
                      aria-pressed={isSelected}
                      aria-label={`View ${sysView.name}${countSuffix}`}
                    >
                      {sysView.name}{countSuffix}
                    </button>
                  );
                })}

                {/* Custom Saved Views */}
                {customViews.map((cView) => {
                  const isSelected = activeMatchedView?.id === cView.id;
                  return (
                    <div
                      key={cView.id}
                      className={`inline-flex items-center rounded-xl transition-colors ${
                        isSelected
                          ? "bg-bds-teal-dark text-white shadow-sm"
                          : "bg-bds-cream text-bds-teal-dark hover:bg-bds-gold/30 border border-bds-teal-dark/10"
                      }`}
                    >
                      <button
                        type="button"
                        tabIndex={0}
                        onClick={() => handleApplyCriteria(cView.criteria)}
                        className="touch-target-inline inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 text-xs font-bold uppercase tracking-wider"
                        aria-pressed={isSelected}
                        aria-label={`Apply saved view ${cView.name}`}
                      >
                        <Bookmark className="h-3 w-3" aria-hidden="true" />
                        <span>{cView.name}</span>
                      </button>
                      <button
                        type="button"
                        tabIndex={0}
                        onClick={(event) => handleDeleteCustomView(cView.id, event)}
                        className={`touch-target-inline mr-1.5 p-1 rounded-full text-xs transition-opacity hover:opacity-100 ${
                          isSelected ? "text-white/80 hover:bg-white/20 hover:text-white" : "text-bds-cocoa/60 hover:bg-bds-teal-dark/10 hover:text-bds-teal-dark"
                        }`}
                        aria-label={`Delete saved view ${cView.name}`}
                      >
                        <X className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Action to Save View or Reset Filters */}
              <div className="flex items-center gap-2 shrink-0">
                {!activeMatchedView && (
                  <button
                    type="button"
                    tabIndex={0}
                    onClick={handleOpenSaveModal}
                    className="touch-target-inline inline-flex items-center gap-1.5 rounded-xl border border-bds-teal/40 bg-bds-cream/60 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-bds-teal-dark hover:bg-bds-cream"
                    aria-label="Save current filter combination as a view"
                  >
                    <BookmarkPlus className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Save view</span>
                  </button>
                )}

                {!isDefaultView && (
                  <button
                    type="button"
                    tabIndex={0}
                    onClick={handleResetToDefault}
                    className="touch-target-inline inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-bds-cocoa/70 hover:text-bds-teal-dark"
                    aria-label="Reset all filters to default"
                  >
                    <RotateCcw className="h-3 w-3" aria-hidden="true" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {undoNotice && (
              <div
                role="status"
                aria-live="polite"
                className="flex items-center justify-between gap-3 rounded-2xl border border-bds-teal-dark/10 bg-bds-cream px-4 py-2.5 text-xs text-bds-teal-dark"
              >
                <span>{undoNotice}</span>
                {lastDeletedView && (
                  <button
                    type="button"
                    tabIndex={0}
                    onClick={handleUndoDeleteView}
                    className="font-bold text-bds-teal-dark underline underline-offset-2 hover:text-bds-teal focus:outline-none focus:ring-2 focus:ring-bds-gold rounded"
                    aria-label={`Undo deletion of view ${lastDeletedView.name}`}
                  >
                    Undo
                  </button>
                )}
              </div>
            )}

            {/* Modal / Dialog for Saving Custom View */}
            {isSaveModalOpen && (
              <form
                onSubmit={handleSaveCustomView}
                className="flex flex-col gap-3 rounded-2xl border border-bds-teal-dark/20 bg-bds-cream/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                aria-label="Save custom support view form"
              >
                <div className="flex-1 space-y-1">
                  <label htmlFor="support-view-name" className="text-xs font-bold uppercase tracking-wider text-bds-teal-dark">
                    Name your view
                  </label>
                  <input
                    id="support-view-name"
                    type="text"
                    required
                    maxLength={40}
                    value={newViewName}
                    onChange={(event) => setNewViewName(event.target.value)}
                    placeholder="e.g. Urgent Equipment Inquiries"
                    className="w-full rounded-xl border border-bds-teal-dark/20 bg-white px-3 py-2 text-sm text-bds-teal-dark outline-none focus:ring-2 focus:ring-bds-teal"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2 sm:pt-4">
                  <button
                    type="submit"
                    tabIndex={0}
                    className="touch-target btn-primary !px-4 !py-2 text-xs font-bold uppercase tracking-wider"
                  >
                    Save View
                  </button>
                  <button
                    type="button"
                    tabIndex={0}
                    onClick={handleCloseSaveModal}
                    className="touch-target btn-outline !px-3 !py-2 text-xs font-bold uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Search refines the selected saved/common view without repeating it. */}
            <div className="relative w-full sm:max-w-xl">
                <label htmlFor="ticket-search" className="sr-only">
                  Search tickets
                </label>
                <Search
                  className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-bds-cocoa/45"
                  aria-hidden="true"
                />
                <input
                  id="ticket-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search subject, topic, or SUP-#..."
                  className="w-full rounded-xl border border-bds-teal-dark/20 bg-bds-cream/40 py-2.5 pl-9 pr-3 text-sm text-bds-teal-dark outline-none focus:ring-2 focus:ring-bds-teal placeholder:text-bds-cocoa/50"
                />
            </div>
          </section>

          {/* Master-Detail Layout */}
          <div className={`grid gap-5 ${filteredTickets.length > 0 ? "lg:grid-cols-5" : ""}`}>
            {/* Left Column: Master List */}
            <section
              aria-label="Tickets list"
              className={filteredTickets.length > 0 ? "space-y-3 lg:col-span-2" : "space-y-3"}
            >
              {filteredTickets.length === 0 ? (
                <div role="status" className="portal-empty-state space-y-1">
                  <p className="text-sm font-semibold text-bds-cocoa/80">
                    No support tickets match the current filter.
                  </p>
                  <p className="text-xs text-bds-cocoa/60">
                    {filter === "needs-attention"
                      ? "No tickets currently have pending operator action."
                      : "Open a new ticket if you need Operations Support."}
                  </p>
                </div>
              ) : (
                filteredTickets.map((ticket) => {
                  const isSelected = selectedTicket?.id === ticket.id;
                  const isResolved = ticket.status === "Resolved";
                  const isInReview = ticket.status === "In Review";

                  return (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={() => handleSelectTicket(ticket.id)}
                      aria-pressed={isSelected}
                      className={`touch-target w-full rounded-2xl border p-4 text-left transition-all ${
                        isSelected
                          ? "border-bds-teal-dark bg-bds-cream/60 shadow-md ring-2 ring-bds-teal/40"
                          : "border-bds-teal-dark/10 bg-white hover:border-bds-teal hover:bg-bds-cream/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-bds-teal-dark">
                              {ticket.id}
                            </span>
                            <span className="text-xs text-bds-cocoa/40">·</span>
                            <span className="text-[11px] font-medium text-bds-cocoa/80 truncate">
                              {ticket.topic}
                            </span>
                          </div>
                          <p className="mt-1 text-sm font-bold text-bds-teal-dark line-clamp-1">
                            {ticket.subject}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            isResolved
                              ? "bg-bds-cream text-bds-teal-dark border border-bds-teal-dark/10"
                              : isInReview
                                ? "bg-amber-100 text-amber-900"
                                : "bg-emerald-100 text-emerald-900"
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </div>

                      {ticket.operatorActionRequired && !isResolved ? (
                        <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-bds-orange/15 px-2 py-1 text-[11px] font-bold text-bds-orange">
                          <AlertCircle className="h-3.5 w-3.5 text-bds-orange shrink-0" aria-hidden="true" />
                          <span>Action required from you</span>
                        </div>
                      ) : null}

                      <div className="mt-3 flex items-center justify-between text-[11px] text-bds-cocoa/60">
                        <span>Updated {formatPortalDate(ticket.updatedAt, locationId)}</span>
                        {ticket.messages && ticket.messages.length > 0 ? (
                          <span className="inline-flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" aria-hidden="true" />
                            {ticket.messages.length} message{ticket.messages.length === 1 ? "" : "s"}
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })
              )}
            </section>

            {filteredTickets.length > 0 ? (
            /* Right Column: Detail View */
            <section
              aria-label="Selected ticket detail"
              className="lg:col-span-3"
            >
              {selectedTicket ? (
                <div className="space-y-6 rounded-2xl border border-bds-teal-dark/15 bg-white p-6 sm:p-8 shadow-sm">
                  {/* Feedback notification */}
                  {actionFeedback ? (
                    <div
                      role="alert"
                      className={`flex items-start gap-2 rounded-2xl p-4 text-xs font-semibold ${
                        actionFeedback.type === "success"
                          ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                          : "bg-red-50 text-red-800 border border-red-200"
                      }`}
                    >
                      {actionFeedback.type === "success" ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                      ) : (
                        <XCircle className="h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
                      )}
                      <span>{actionFeedback.message}</span>
                    </div>
                  ) : null}

                  {/* Header */}
                  <div className="flex flex-col gap-4 border-b border-bds-teal-dark/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-bds-teal-dark">
                          {selectedTicket.id}
                        </span>
                        <span className="text-xs text-bds-cocoa/40">·</span>
                        <span className="text-xs font-semibold text-bds-cocoa/80">
                          {selectedTicket.topic}
                        </span>
                      </div>
                      <h2 className="heading-compact text-bds-teal-dark [overflow-wrap:anywhere]">
                        {selectedTicket.subject}
                      </h2>
                      <TableLine className="w-24 pt-1" />
                      <p className="text-xs text-bds-cocoa/70">
                        Submitted by <strong>{selectedTicket.userEmail}</strong> for unit <strong>{locationName}</strong> ({locationId})
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                          selectedTicket.status === "Resolved"
                            ? "bg-bds-cream text-bds-teal-dark border border-bds-teal-dark/10"
                            : selectedTicket.status === "In Review"
                              ? "bg-amber-100 text-amber-900"
                              : "bg-emerald-100 text-emerald-900"
                        }`}
                      >
                        {selectedTicket.status}
                      </span>
                    </div>
                  </div>

                  {/* Operator action banner if pending */}
                  {selectedTicket.operatorActionRequired && selectedTicket.status !== "Resolved" ? (
                    <div
                      role="alert"
                      className="flex items-start gap-3 rounded-2xl border border-bds-orange/30 bg-bds-orange/10 p-4 text-xs font-semibold text-bds-orange"
                    >
                      <AlertCircle className="h-5 w-5 shrink-0 text-bds-orange" aria-hidden="true" />
                      <div>
                        <p className="font-bold">Operations Support is waiting for your response</p>
                        <p className="mt-0.5 text-bds-orange/90">
                          Review the latest message below and reply with the requested details or serials to advance this issue.
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {/* Initial issue details */}
                  <div className="rounded-2xl border border-bds-teal-dark/10 bg-bds-cream/40 p-5 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-bds-teal-dark block">
                      Initial Request Details
                    </span>
                    <p className="text-sm text-bds-cocoa/90 leading-relaxed whitespace-pre-wrap">
                      {selectedTicket.details}
                    </p>
                    <div className="pt-2 text-[11px] text-bds-cocoa/60 flex items-center gap-1.5">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      <span>Filed on {formatPortalDateTime(selectedTicket.createdAt, locationId)}</span>
                    </div>
                  </div>

                  {/* Conversation Timeline */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-bds-teal-dark/10 pb-3">
                      <MessageSquare className="h-4 w-4 text-bds-teal-dark" aria-hidden="true" />
                      <h3 className="heading-minor text-bds-teal-dark">
                        Conversation History ({selectedTicket.messages?.length || 0})
                      </h3>
                    </div>

                    <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
                      {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                        selectedTicket.messages.map((msg) => {
                          const isOperator = msg.authorRole === "OPERATOR";

                          return (
                            <div
                              key={msg.id}
                              className={`rounded-2xl p-4 space-y-1.5 text-xs ${
                                isOperator
                                  ? "ml-4 border border-bds-teal-dark/10 bg-bds-cream/40 text-bds-teal-dark"
                                  : "mr-4 border border-bds-gold/30 bg-bds-cream text-bds-teal-dark"
                              }`}
                            >
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold uppercase tracking-wider text-bds-teal-dark flex items-center gap-1.5">
                                  {isOperator ? (
                                    <>
                                      <User className="h-3 w-3 text-bds-teal-dark" aria-hidden="true" />
                                      {msg.authorName || "Store Operator"} ({msg.authorEmail})
                                    </>
                                  ) : (
                                    <>
                                      <HelpCircle className="h-3 w-3 text-bds-teal-dark" aria-hidden="true" />
                                      {msg.authorName || "Operations Support"}
                                    </>
                                  )}
                                </span>
                                <time dateTime={msg.createdAt} className="text-bds-cocoa/60">
                                  {formatPortalDateTime(msg.createdAt, locationId)}
                                </time>
                              </div>
                              <p className="text-sm whitespace-pre-wrap leading-relaxed text-bds-cocoa/90">
                                {msg.message}
                              </p>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-bds-cocoa/70 italic py-2">
                          No follow-up messages yet. Use the reply box below to send an update.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="border-t border-bds-teal-dark/10 pt-6 space-y-4">
                    {selectedTicket.status !== "Resolved" ? (
                      <div className="space-y-4">
                        {/* Reply Form */}
                        <form action={handleReplyAction} className="space-y-3">
                          <input type="hidden" name="caseId" value={selectedTicket.id} />
                          <label htmlFor="reply-message" className="block text-xs font-bold uppercase tracking-wider text-bds-teal-dark">
                            Reply to Operations Support
                          </label>
                          <textarea
                            id="reply-message"
                            name="message"
                            rows={3}
                            required
                            placeholder="Add additional details, answers to questions, or update notes..."
                            className="w-full rounded-2xl border border-bds-teal-dark/20 bg-white p-3.5 text-sm text-bds-teal-dark placeholder:text-bds-cocoa/50 outline-none focus:ring-2 focus:ring-bds-teal"
                          />
                          <div className="flex items-center justify-between gap-3">
                            <ReplySubmitButton />
                          </div>
                        </form>

                        {/* Resolve ticket form */}
                        <div className="border-t border-bds-teal-dark/10 pt-4">
                          <form action={handleCloseAction} className="flex flex-wrap items-center justify-between gap-3">
                            <input type="hidden" name="caseId" value={selectedTicket.id} />
                            <div className="flex-1 min-w-[15rem]">
                              <label htmlFor="close-note" className="sr-only">
                                Optional resolution note
                              </label>
                              <input
                                id="close-note"
                                name="note"
                                type="text"
                                placeholder="Optional resolution note (e.g. Parts arrived, issue resolved)..."
                                className="w-full rounded-xl border border-bds-teal-dark/20 bg-bds-cream/40 px-3 py-2 text-xs text-bds-teal-dark placeholder:text-bds-cocoa/50 outline-none focus:ring-2 focus:ring-bds-teal"
                              />
                            </div>
                            <CloseSubmitButton />
                          </form>
                        </div>
                      </div>
                    ) : (
                      /* Resolved status & Reopen Form */
                      <div className="space-y-4 rounded-2xl bg-bds-cream/40 border border-bds-teal-dark/10 p-5">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
                          <span>
                            This ticket was marked as resolved{" "}
                            {selectedTicket.resolvedAt
                              ? `on ${formatPortalDate(selectedTicket.resolvedAt, locationId)}`
                              : ""}
                            .
                          </span>
                        </div>
                        <p className="text-xs text-bds-cocoa/80">
                          If this issue recurs or the resolution was incomplete, you can reopen this ticket below.
                        </p>

                        <form action={handleReopenAction} className="space-y-2">
                          <input type="hidden" name="caseId" value={selectedTicket.id} />
                          <label htmlFor="reopen-reason" className="block text-xs font-bold uppercase tracking-wider text-bds-teal-dark">
                            Reason for reopening *
                          </label>
                          <textarea
                            id="reopen-reason"
                            name="reason"
                            rows={2}
                            required
                            placeholder="Explain why this issue requires further operations assistance..."
                            className="w-full rounded-xl border border-bds-teal-dark/20 bg-white p-3 text-xs text-bds-teal-dark placeholder:text-bds-cocoa/50 outline-none focus:ring-2 focus:ring-bds-teal"
                          />
                          <ReopenSubmitButton />
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </section>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};
