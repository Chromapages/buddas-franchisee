export type SemanticStatus = "PROCESSING" | "DELIVERED" | "DELAYED" | "ACTION_REQUIRED" | "INFORMATION" | "ERROR" | "SUCCESS" | "LOADING" | "UNAVAILABLE";

export const SEMANTIC_STATUS: Record<SemanticStatus, { label: string; description: string; icon: "clock" | "check" | "alert" | "info" | "spinner" | "unavailable"; className: string; textClassName: string }> = {
  PROCESSING: { label: "Processing", description: "Work is underway.", icon: "clock", className: "bg-bds-cream", textClassName: "text-bds-teal-dark" },
  DELIVERED: { label: "Delivered", description: "Delivery is complete.", icon: "check", className: "bg-emerald-100", textClassName: "text-emerald-950" },
  DELAYED: { label: "Delayed", description: "Timing changed and requires review.", icon: "alert", className: "bg-amber-100", textClassName: "text-amber-950" },
  ACTION_REQUIRED: { label: "Action required", description: "Operator follow-up is required.", icon: "alert", className: "bg-red-100", textClassName: "text-red-950" },
  INFORMATION: { label: "Information", description: "Informational operational update.", icon: "info", className: "bg-bds-cream", textClassName: "text-bds-teal-dark" },
  ERROR: { label: "Error", description: "The requested operation could not complete.", icon: "alert", className: "bg-red-100", textClassName: "text-red-950" },
  SUCCESS: { label: "Success", description: "The requested operation completed.", icon: "check", className: "bg-emerald-100", textClassName: "text-emerald-950" },
  LOADING: { label: "Loading", description: "Current data is loading.", icon: "spinner", className: "bg-bds-cream", textClassName: "text-bds-teal-dark" },
  UNAVAILABLE: { label: "Unavailable", description: "Current data cannot be retrieved.", icon: "unavailable", className: "bg-bds-cream", textClassName: "text-bds-teal-dark" },
};
