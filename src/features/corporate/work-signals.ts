import type { WorkRecord } from "./types";

export const needsCorporateAttention = (record: WorkRecord, userId: string, now = Date.now()) =>
  !record.isClosed && (!record.assignedToUserId || record.priority !== "NORMAL" || Boolean(record.followUpAt && Date.parse(record.followUpAt) <= now));
