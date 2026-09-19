import { assertCorporatePermission, hasCorporatePermission } from "../authorization.ts";
import type { CorporatePermission, CorporateSession } from "../types.ts";
import type { SupportCommand } from "./model.ts";
import type { SupportRepository } from "./repository.ts";

export async function listCorporateSupport(session: CorporateSession, repository: SupportRepository) {
  assertCorporatePermission(session, "VIEW_SUPPORT");
  const units = (await repository.locations()).filter((unit) => hasCorporatePermission(session, "VIEW_SUPPORT", unit));
  const lists = await Promise.all(units.map(async (unit) => (await repository.list(unit.locationId)).map((ticket) => ({ ...ticket, locationName: unit.name, organizationId: unit.organizationId || null }))));
  return lists.flat().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getCorporateSupportDetail(session: CorporateSession, repository: SupportRepository, unitId: string, caseId: string) {
  const unit = (await repository.locations()).find((entry) => entry.locationId === unitId);
  if (!unit) throw new Error("Support unit was not found.");
  assertCorporatePermission(session, "VIEW_SUPPORT", unit);
  const detail = await repository.detail(unitId, caseId, hasCorporatePermission(session, "VIEW_INTERNAL_NOTES", unit));
  return detail ? { ...detail, locationName: unit.name, scope: unit } : null;
}

export async function executeCorporateSupportCommand(session: CorporateSession, repository: SupportRepository, command: SupportCommand, resolveAssignee?: (userId: string) => Promise<CorporateSession | null>) {
  const unit = (await repository.locations()).find((entry) => entry.locationId === command.unitId);
  if (!unit) throw new Error("Support unit was not found.");
  const permission: CorporatePermission = command.kind === "NOTE" ? "WRITE_INTERNAL_NOTES" : command.kind === "ASSIGN" ? "ASSIGN_SUPPORT" : "MANAGE_SUPPORT";
  assertCorporatePermission(session, "VIEW_SUPPORT", unit);
  assertCorporatePermission(session, permission, unit);
  if (command.kind === "ASSIGN" && command.assigneeId) {
    const assignee = command.assigneeId === session.userId ? session : await resolveAssignee?.(command.assigneeId);
    if (!assignee || !hasCorporatePermission(assignee, "MANAGE_SUPPORT", unit)) throw new Error("Choose an active support handler authorized for this unit.");
  }
  return repository.execute(command, { userId: session.userId, email: session.email, displayName: session.displayName, corporate: true });
}
