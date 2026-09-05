"use server";

import { headers } from "next/headers";
import {
  inquiryFieldNames,
  inquirySchema,
  normalizeText,
} from "./schema";
import { getInquiryDeliveryUrl } from "./delivery-config";
import { verifyInquiryFormSession } from "./form-token";
import {
  classifyInquiry,
  defaultInquiryStorage,
} from "./storage-adapter";
import {
  generateCandidateConfirmationEmail,
  generateInternalLeadAlertEmail,
  sendTransactionalEmail,
} from "./email-service";
import {
  getInquiryProtectionResult,
  markInquiryRetryable,
  releaseInquiryReservation,
  recordDeliveredInquiry,
  reserveInquiry,
} from "./protection";
import type { InquiryActionState } from "./state";
import type { InquiryAttribution } from "./types";

const WEBHOOK_TIMEOUT_MS = 10_000;

const getSourceAddress = async (): Promise<string | undefined> => {
  const sourceHeader = process.env.INQUIRY_SOURCE_IP_HEADER?.trim().toLowerCase();
  if (!sourceHeader) return undefined;

  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get(sourceHeader);

  if (!forwardedFor) return undefined;
  return forwardedFor.split(",")[0]?.trim() || undefined;
};

const getFormValues = (
  formData: FormData,
): Record<(typeof inquiryFieldNames)[number], string> | null => {
  const values = {} as Record<(typeof inquiryFieldNames)[number], string>;

  for (const key of inquiryFieldNames) {
    const entries = formData.getAll(key);
    if (entries.length > 1 || entries.some((entry) => typeof entry !== "string")) {
      return null;
    }
    values[key] = typeof entries[0] === "string" ? entries[0] : "";
  }

  return values;
};

const getSingleString = (formData: FormData, name: string): string | null => {
  const entries = formData.getAll(name);
  if (entries.length !== 1 || typeof entries[0] !== "string") return null;
  return entries[0];
};

const getAttribution = (formData: FormData): InquiryAttribution => {
  const fields: Array<[keyof InquiryAttribution, string]> = [
    ["sourcePage", "attribution_sourcePage"],
    ["utmSource", "attribution_utmSource"],
    ["utmMedium", "attribution_utmMedium"],
    ["utmCampaign", "attribution_utmCampaign"],
    ["utmContent", "attribution_utmContent"],
    ["utmTerm", "attribution_utmTerm"],
  ];
  return fields.reduce<InquiryAttribution>((attribution, [key, name]) => {
    const value = getSingleString(formData, name);
    if (value) attribution[key] = normalizeText(value).slice(0, 128);
    return attribution;
  }, {});
};

const getSubmissionMetadata = (formData: FormData) => {
  const token = getSingleString(formData, "submissionToken");
  const website = getSingleString(formData, "website");

  if (website) return { kind: "rejected" as const };

  const metadata = verifyInquiryFormSession(token);
  if (metadata.kind !== "valid") return metadata;

  return {
    kind: "valid" as const,
    data: metadata.data,
    submissionToken: token!,
  };
};

const acceptedState = (): InquiryActionState => {
  return {
    status: "success",
    submittedAt: new Date().toISOString(),
    message:
      "Thank you. Your inquiry has been submitted for internal review. A member of our franchise development team will contact you within 2 business days if there appears to be a potential fit.",
    fieldErrors: {},
    values: {},
  };
};

const duplicateState = (): InquiryActionState => {
  return {
    status: "duplicate",
    message: "We already received this inquiry. No additional submission was created.",
    fieldErrors: {},
    values: {},
  };
};

export const submitFranchiseInquiry = async (
  _prevState: InquiryActionState,
  formData: FormData,
): Promise<InquiryActionState> => {
  const values = getFormValues(formData);
  if (!values) {
    return {
      status: "error",
      message: "We could not read that inquiry. Please reload the page and try again.",
      fieldErrors: {},
      values: {},
    };
  }
  const attribution = getAttribution(formData);

  const metadata = getSubmissionMetadata(formData);
  if (metadata.kind === "rejected") {
    console.warn("Franchise inquiry rejected by honeypot.");
    return {
      status: "error",
      message: "We could not verify that inquiry. Please contact Budda's directly.",
      fieldErrors: {},
      values,
    };
  }

  if (metadata.kind === "expired") {
    return {
      status: "error",
      message: "This form has expired. Please refresh the page to submit your inquiry.",
      fieldErrors: {},
      values,
    };
  }

  if (metadata.kind === "invalid") {
    return {
      status: "error",
      message: "We could not verify that inquiry token. Please reload the page and try again.",
      fieldErrors: {},
      values,
    };
  }

  const parsed = inquirySchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      status: "error",
      message: "Please correct the highlighted fields before requesting franchise information.",
      values,
      fieldErrors: {
        firstName: fieldErrors.firstName?.[0],
        lastName: fieldErrors.lastName?.[0],
        email: fieldErrors.email?.[0],
        phone: fieldErrors.phone?.[0],
        cityState: fieldErrors.cityState?.[0],
        marketInterest: fieldErrors.marketInterest?.[0],
        experience: fieldErrors.experience?.[0],
        investmentRange: fieldErrors.investmentRange?.[0],
        preferredTimeline: fieldErrors.preferredTimeline?.[0],
        message: fieldErrors.message?.[0],
        brokerId: fieldErrors.brokerId?.[0],
        consent: fieldErrors.consent?.[0],
      },
    };
  }

  const deliveryUrl = getInquiryDeliveryUrl();
  if (!deliveryUrl) {
    return {
      status: "error",
      message: "We cannot accept franchise inquiries right now. Please email buddasbakery@gmail.com.",
      fieldErrors: {},
      values,
    };
  }

  const sourceAddress = await getSourceAddress();
  const protection = getInquiryProtectionResult(
    parsed.data,
    sourceAddress,
    metadata.submissionToken,
    metadata.data.id,
  );

  if (!protection.allowed) {
    if (protection.reason === "delivered") return duplicateState();

    const message =
      protection.reason === "pending"
        ? "An identical inquiry is currently being processed. Please wait before trying again."
        : protection.reason === "retry-later"
          ? "We could not confirm delivery yet. Please wait a few seconds before trying again."
          : protection.reason === "retry-exhausted"
            ? "We could not confirm delivery after several attempts. Please contact Budda's directly."
            : "We cannot accept more inquiries from these contact details right now.";

    return {
      status: "error",
      message,
      fieldErrors: {},
      values,
    };
  }

  reserveInquiry(protection);
  const inquiryId = protection.inquiryId;
  const classification = classifyInquiry(parsed.data);
  const submissionTimestamp = new Date().toISOString();

  await defaultInquiryStorage.save({
    id: inquiryId,
    submittedAt: submissionTimestamp,
    classification,
    deliveryStatus: "PENDING",
    payload: parsed.data,
    attempts: 1,
    brokerId: parsed.data.brokerId,
    attribution,
  });

  try {
    const response = await fetch(deliveryUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": inquiryId,
        ...(process.env.INQUIRY_WEBHOOK_TOKEN
          ? { Authorization: `Bearer ${process.env.INQUIRY_WEBHOOK_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({
        inquiryId,
        submittedAt: submissionTimestamp,
        classification,
        inquiry: parsed.data,
        attribution,
      }),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
    });

    if (!response.ok) {
      releaseInquiryReservation(protection);
      await defaultInquiryStorage.updateStatus(
        inquiryId,
        "FAILED",
        `HTTP ${response.status}`,
      );
      return {
        status: "error",
        message: "We could not submit your inquiry. Please try again or contact Budda's directly.",
        fieldErrors: {},
        values,
      };
    }
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "TimeoutError";
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    if (timedOut) {
      markInquiryRetryable(protection);
      await defaultInquiryStorage.updateStatus(inquiryId, "RETRYING", errorMessage);
    } else {
      releaseInquiryReservation(protection);
      await defaultInquiryStorage.updateStatus(inquiryId, "FAILED", errorMessage);
    }

    return {
      status: "error",
      message: timedOut
        ? "We could not confirm delivery. Please do not submit again right away; our team is processing your request."
        : "We could not submit your inquiry. Please try again or contact Budda's directly.",
      fieldErrors: {},
      values,
    };
  }

  recordDeliveredInquiry(protection);
  await defaultInquiryStorage.updateStatus(inquiryId, "DELIVERED");

  // Asynchronously trigger confirmation emails
  const storedRecord = await defaultInquiryStorage.getById(inquiryId);
  if (storedRecord) {
    const confirmationEmail = generateCandidateConfirmationEmail(parsed.data);
    const internalAlertEmail = generateInternalLeadAlertEmail(storedRecord);

    void Promise.allSettled([
      sendTransactionalEmail(confirmationEmail),
      sendTransactionalEmail(internalAlertEmail),
    ]).catch((err) => {
      console.error("Transactional email dispatch error:", err);
    });
  }

  return acceptedState();
};
