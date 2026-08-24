export type InquiryActionState = {
  status: "idle" | "success" | "duplicate" | "error";
  message?: string;
  submittedAt?: string;
  fieldErrors?: Record<string, string | undefined>;
  values?: Record<string, string>;
};

export const initialInquiryState: InquiryActionState = {
  status: "idle",
  fieldErrors: {},
  values: {},
};
