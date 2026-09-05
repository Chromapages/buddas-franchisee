const unitTimeZones: Record<string, string> = {
  "HNL-014": "Pacific/Honolulu",
  "OAH-207": "Pacific/Honolulu",
  "SLC-302": "America/Denver",
};

export const getUnitTimeZone = (unitId: string) => unitTimeZones[unitId] || "America/Los_Angeles";
export const formatPortalDate = (value: string, unitId: string) => new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: getUnitTimeZone(unitId) }).format(new Date(value));
export const formatPortalDateTime = (value: string, unitId: string) => new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: getUnitTimeZone(unitId),
  timeZoneName: "short",
}).format(new Date(value));
