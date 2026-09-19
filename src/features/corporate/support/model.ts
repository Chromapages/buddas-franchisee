import type { PortalSupportCase, PortalSupportMessage } from "../../portal/types.ts";
import { SUPPORT_IMPACTS } from "../../portal/support-form-options.ts";

export const SUPPORT_COMMANDS = ["REPLY", "NOTE", "ASSIGN", "WAIT", "REVIEW", "RESOLVE", "REOPEN"] as const;
export type SupportCommandKind = typeof SUPPORT_COMMANDS[number];
export type SupportActor = { userId: string; email: string; displayName?: string; corporate: boolean };
export type SupportCommand = {
  commandId: string;
  unitId: string;
  caseId: string;
  expectedVersion: number;
  kind: SupportCommandKind;
  message?: string;
  assigneeId?: string;
};
export type SupportPrivateNote = { id: string; authorId: string; authorName: string; message: string; createdAt: string };
export type SupportEvent = { id: string; kind: SupportCommandKind; actorId: string; actorName: string; createdAt: string; version: number; previousStatus: string; status: string; previousAssigneeId?: string; assignedToUserId?: string };
export type SupportDetail = { ticket: PortalSupportCase; notes: SupportPrivateNote[]; events: SupportEvent[] };
export type SupportEffect = { patch: Partial<PortalSupportCase>; publicMessage?: PortalSupportMessage; privateNote?: SupportPrivateNote; event: SupportEvent };

export function validateSupportCommand(command: SupportCommand): void {
  for (const value of [command.commandId, command.unitId, command.caseId]) {
    if (!/^[A-Za-z0-9_-]{1,128}$/.test(value)) throw new Error("Invalid support command reference.");
  }
  if (!Number.isSafeInteger(command.expectedVersion) || command.expectedVersion < 0) throw new Error("Reload the ticket to obtain its current version.");
  if (!SUPPORT_COMMANDS.includes(command.kind)) throw new Error("Unknown support action.");
  if (command.message && command.message.length > 10000) throw new Error("Keep messages under 10,001 characters.");
  if (["REPLY", "NOTE", "WAIT", "RESOLVE", "REOPEN"].includes(command.kind) && !command.message?.trim()) throw new Error("Enter a message explaining this update.");
  if (command.kind === "ASSIGN" && command.assigneeId && !/^[A-Za-z0-9_-]{1,128}$/.test(command.assigneeId)) throw new Error("Invalid assignee reference.");
}

export function applySupportCommand(ticket: PortalSupportCase, command: SupportCommand, actor: SupportActor, now: string): SupportEffect {
  validateSupportCommand(command);
  if (!actor.userId || !actor.email) throw new Error("A verified actor is required.");
  if (ticket.id !== command.caseId || ticket.locationId !== command.unitId) throw new Error("Ticket scope does not match.");
  if ((ticket.version ?? 0) !== command.expectedVersion) throw new Error("This ticket changed. Reload it before applying your update.");
  if (!actor.corporate && !["REPLY", "RESOLVE", "REOPEN"].includes(command.kind)) throw new Error("Corporate support permission is required.");
  if (!["Open", "In Review", "Waiting", "Resolved"].includes(ticket.status)) throw new Error("This ticket has an unsupported status. Contact the data administrator.");
  if (command.kind === "REOPEN" && ticket.status !== "Resolved") throw new Error("Only resolved tickets can be reopened.");
  if (["REPLY", "WAIT", "REVIEW", "RESOLVE"].includes(command.kind) && ticket.status === "Resolved") throw new Error("Reopen this ticket before changing its active conversation.");
  const version = (ticket.version ?? 0) + 1;
  const patch: Partial<PortalSupportCase> = { version, updatedAt: now };
  const text = command.message?.trim() || "";
  const authorName = actor.displayName || actor.email;
  const effect: SupportEffect = { patch, event: { id: command.commandId, kind: command.kind, actorId: actor.userId, actorName: authorName, createdAt: now, version, previousStatus: ticket.status, status: ticket.status } };
  if (command.kind === "NOTE") effect.privateNote = { id: command.commandId, authorId: actor.userId, authorName, message: text, createdAt: now };
  if (["REPLY", "WAIT", "RESOLVE", "REOPEN"].includes(command.kind)) effect.publicMessage = {
    id: command.commandId, caseId: ticket.id, locationId: ticket.locationId, authorEmail: actor.email,
    authorId: actor.userId, authorRole: actor.corporate ? "SUPPORT" : "OPERATOR", authorName,
    message: command.kind === "RESOLVE" ? `Resolved: ${text}` : command.kind === "REOPEN" ? `Reopened: ${text}` : text, createdAt: now,
  };
  if (command.kind === "ASSIGN") {
    patch.assignedToUserId = command.assigneeId || "";
    effect.event.previousAssigneeId = ticket.assignedToUserId || "";
    effect.event.assignedToUserId = command.assigneeId || "";
  }
  if (command.kind === "WAIT") Object.assign(patch, { status: "Waiting", operatorActionRequired: true });
  if (command.kind === "REVIEW") Object.assign(patch, { status: "In Review", operatorActionRequired: false });
  if (command.kind === "RESOLVE") Object.assign(patch, { status: "Resolved", resolvedAt: now, operatorActionRequired: false });
  if (command.kind === "REOPEN") Object.assign(patch, { status: "Open", reopenedAt: now, resolvedAt: "", operatorActionRequired: false });
  if (command.kind === "REPLY" && !actor.corporate) Object.assign(patch, { operatorActionRequired: false, ...(ticket.status === "Waiting" ? { status: "In Review" } : {}) });
  effect.event.status = patch.status || ticket.status;
  return effect;
}

// Project explicitly: unexpected legacy fields, notes and operational history never reach operators.
export function publicSupportTicket(id: string, unitId: string, data: Record<string, unknown>, messages: PortalSupportMessage[] = []): PortalSupportCase {
  const legacy = Array.isArray(data.messages) ? data.messages.filter((message) => message && typeof message === "object" && !("internal" in message && message.internal) && !("isInternal" in message && message.isInternal) && !("visibility" in message && message.visibility !== "PUBLIC")) as PortalSupportMessage[] : [];
  const combined = [...legacy, ...messages].map((message): PortalSupportMessage => ({
    id: String(message.id), caseId: id, locationId: unitId, authorEmail: String(message.authorEmail || ""), authorRole: message.authorRole,
    ...(message.authorId ? { authorId: String(message.authorId) } : {}), ...(message.authorName ? { authorName: String(message.authorName) } : {}),
    message: String(message.message || ""), createdAt: String(message.createdAt || ""),
  }));
  return {
    id, locationId: unitId, userEmail: String(data.userEmail || ""), subject: String(data.subject || ""), topic: String(data.topic || ""), details: String(data.details || ""),
    status: data.status as PortalSupportCase["status"], createdAt: String(data.createdAt || ""), updatedAt: String(data.updatedAt || ""), operatorActionRequired: data.operatorActionRequired === true,
    version: Number.isSafeInteger(data.version) ? Number(data.version) : 0,
    ...(typeof data.submittedByUserId === "string" ? { submittedByUserId: data.submittedByUserId } : {}),
    ...(typeof data.assignedToUserId === "string" ? { assignedToUserId: data.assignedToUserId } : {}),
    ...(typeof data.resolvedAt === "string" ? { resolvedAt: data.resolvedAt } : {}),
    ...(typeof data.reopenedAt === "string" ? { reopenedAt: data.reopenedAt } : {}),
    ...(typeof data.operationalImpact === "string" && SUPPORT_IMPACTS.some((impact) => impact === data.operationalImpact) ? { operationalImpact: data.operationalImpact as PortalSupportCase["operationalImpact"] } : {}),
    ...(typeof data.relatedOrderId === "string" ? { relatedOrderId: data.relatedOrderId } : {}),
    messages: combined.filter((message, index) => combined.findIndex((entry) => entry.id === message.id) === index).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  };
}
