import { z } from "zod";
import { FRANCHISE_INVESTMENT_DISCLOSURE } from "../financials/financial-data.ts";

export const investmentRangeOptions =
  FRANCHISE_INVESTMENT_DISCLOSURE.inquiryOptions;

export const preferredTimelineOptions = [
  "0 - 6 months",
  "6 - 12 months",
  "12 - 24 months",
  "24+ months",
] as const;

export const inquiryFieldLimits = {
  firstName: 60,
  lastName: 60,
  email: 254,
  phone: 40,
  cityState: 120,
  marketInterest: 120,
  experience: 700,
  message: 900,
  brokerId: 64,
} as const;

export const inquiryExperienceMinimumLength = 20;

export const inquiryFieldNames = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "cityState",
  "marketInterest",
  "experience",
  "investmentRange",
  "preferredTimeline",
  "message",
  "brokerId",
  "consent",
] as const;

const forbiddenInlineCharacters =
  /[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]/u;
const forbiddenMultilineCharacters =
  /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]/u;

export const normalizeText = (value: string): string => {
  return value.replace(/\r\n?/g, "\n").normalize("NFKC").trim();
};

const boundedRawString = (max: number) =>
  z
    .string()
    .max(
      max * 2,
      `This response is too long to process. Please use ${max} characters or fewer.`,
    );

const requiredInlineText = (
  label: string,
  max: number,
  requiredMessage: string,
) => {
  return boundedRawString(max)
    .transform(normalizeText)
    .pipe(
      z
        .string()
        .min(1, requiredMessage)
        .max(max, `${label} must be ${max} characters or fewer.`)
        .refine(
          (value) => !forbiddenInlineCharacters.test(value),
          `${label} contains unsupported control characters.`,
        ),
    );
};

const multilineText = (
  max: number,
  options: { required?: boolean; requiredMessage?: string } = {},
) => {
  const base = boundedRawString(max)
    .transform(normalizeText)
    .pipe(
      z
        .string()
        .max(max, `Please keep this response to ${max} characters or fewer.`)
        .refine(
          (value) => !forbiddenMultilineCharacters.test(value),
          "This response contains unsupported control characters.",
        ),
    );

  if (options.required) {
    return base
      .refine(
        (value) => value.length > 0,
        options.requiredMessage ?? "This response is required.",
      )
      .refine(
        (value) => value.length >= inquiryExperienceMinimumLength,
        "Please provide at least " + inquiryExperienceMinimumLength + " characters of relevant experience.",
      );
  }

  return base;
};

const emailSchema = z
  .string()
  .max(
    inquiryFieldLimits.email * 2,
    `Email address must be ${inquiryFieldLimits.email} characters or fewer.`,
  )
  .transform((value) => normalizeText(value).toLowerCase())
  .pipe(
    z
      .string()
      .min(1, "Email address is required.")
      .max(
        inquiryFieldLimits.email,
        `Email address must be ${inquiryFieldLimits.email} characters or fewer.`,
      )
      .email("Enter a valid email address."),
  );

const phoneSchema = z
  .string()
  .max(
    inquiryFieldLimits.phone * 2,
    `Phone number must be ${inquiryFieldLimits.phone} characters or fewer.`,
  )
  .transform(normalizeText)
  .pipe(
    z
      .string()
      .min(1, "Phone number is required.")
      .max(
        inquiryFieldLimits.phone,
        `Phone number must be ${inquiryFieldLimits.phone} characters or fewer.`,
      )
      .regex(
        /^[+0-9().\- ]+(?: *(?:x|ext\.?) *\d{1,6})?$/i,
        "Enter a valid phone number.",
      )
      .refine(
        (value) => !forbiddenInlineCharacters.test(value),
        "Phone number contains unsupported control characters.",
      )
      .refine((value) => {
        const mainNumber = value.replace(/(?:x|ext\.?)\s*\d{1,6}$/i, "");
        const digitCount = mainNumber.replace(/\D/g, "").length;
        return digitCount >= 7 && digitCount <= 15;
      }, "Enter a phone number with 7 to 15 digits.")
      .refine(
        (value) => {
          const openIndex = value.indexOf("(");
          const closeIndex = value.indexOf(")");
          const openCount = value.match(/\(/g)?.length ?? 0;
          const closeCount = value.match(/\)/g)?.length ?? 0;
          return (
            openCount === closeCount &&
            openCount <= 1 &&
            (openIndex === -1 || openIndex < closeIndex)
          );
        },
        "Enter a phone number with matching parentheses.",
      ),
  );

export const inquirySchema = z.object({
  firstName: requiredInlineText(
    "First name",
    inquiryFieldLimits.firstName,
    "First name is required.",
  ),
  lastName: requiredInlineText(
    "Last name",
    inquiryFieldLimits.lastName,
    "Last name is required.",
  ),
  email: emailSchema,
  phone: phoneSchema,
  cityState: requiredInlineText(
    "City and state",
    inquiryFieldLimits.cityState,
    "City and state are required.",
  ),
  marketInterest: requiredInlineText(
    "Market or territory",
    inquiryFieldLimits.marketInterest,
    "Market or territory of interest is required.",
  ),
  experience: multilineText(inquiryFieldLimits.experience, {
    required: true,
    requiredMessage: "Relevant business or hospitality experience is required.",
  }),
  investmentRange: z.enum(investmentRangeOptions, {
    required_error: "Please select an estimated available investment range.",
    invalid_type_error: "Please select an estimated available investment range.",
  }),
  preferredTimeline: z.enum(preferredTimelineOptions, {
    required_error: "Please select a preferred timeline.",
    invalid_type_error: "Please select a preferred timeline.",
  }),
  message: multilineText(inquiryFieldLimits.message),
  brokerId: z
    .string()
    .max(inquiryFieldLimits.brokerId)
    .optional()
    .transform((val) => (val ? normalizeText(val) : undefined)),
  consent: z.literal("on", {
    required_error: "Consent is required before submitting the inquiry.",
    invalid_type_error: "Consent is required before submitting the inquiry.",
  }),
});

export const validateInquiryField = (
  field: (typeof inquiryFieldNames)[number],
  value: string,
): string | undefined => {
  const result = inquirySchema.shape[field].safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
};

export type InquiryValues = z.infer<typeof inquirySchema>;
export type InquiryFieldName = keyof InquiryValues;
