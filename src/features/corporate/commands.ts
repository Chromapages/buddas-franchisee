import { createHash } from "node:crypto";

export class CorporateCommandError extends Error {
  readonly code: "CONFLICT" | "INVALID_COMMAND" | "NOT_FOUND" | "UNAVAILABLE";
  constructor(code: "CONFLICT" | "INVALID_COMMAND" | "NOT_FOUND" | "UNAVAILABLE", message: string) {
    super(message);
    this.code = code;
    this.name = "CorporateCommandError";
  }
}

const canonicalize = (input: unknown): unknown => {
  if (input === undefined) return null;
  if (input === null || typeof input === "string" || typeof input === "boolean") return input;
  if (typeof input === "number" && Number.isFinite(input)) return input;
  if (Array.isArray(input)) return input.map(canonicalize);
  if (typeof input === "object" && Object.getPrototypeOf(input) === Object.prototype) {
    return Object.fromEntries(Object.entries(input as Record<string, unknown>).filter(([, value]) => value !== undefined)
      .sort(([left], [right]) => left.localeCompare(right)).map(([key, value]) => [key, canonicalize(value)]));
  }
  throw new CorporateCommandError("INVALID_COMMAND", "The command contains an unsupported value.");
};

export const digestCommandPayload = (payload: unknown): string => createHash("sha256").update(JSON.stringify(canonicalize(payload))).digest("hex");

export const assertCommandVersion = (currentVersion: number, expectedVersion: number): void => {
  if (!Number.isSafeInteger(expectedVersion) || expectedVersion < 0) throw new CorporateCommandError("INVALID_COMMAND", "Reload this record before submitting a change.");
  if (currentVersion !== expectedVersion) throw new CorporateCommandError("CONFLICT", "This record changed since you opened it. Reload and review the latest version before trying again.");
};

export const assertIdempotencyKey = (key: string): void => {
  if (typeof key !== "string" || !/^[a-zA-Z0-9_-]{16,128}$/.test(key)) throw new CorporateCommandError("INVALID_COMMAND", "A valid submission reference is required.");
};

export const getCommandRecordId = (actorId: string, key: string): string => {
  assertIdempotencyKey(key);
  return digestCommandPayload({ actorId, key });
};

export const assertSameCommand = (storedDigest: string, digest: string): void => {
  if (storedDigest !== digest) throw new CorporateCommandError("CONFLICT", "This submission reference was already used for different changes. Review and submit a new action.");
};
