export const getInquiryDeliveryUrl = (): string | null => {
  const configured =
    process.env.INQUIRY_DELIVERY_WEBHOOK_URL ||
    process.env.INQUIRY_WEBHOOK_URL;

  if (configured && configured.trim().length > 0) {
    return configured.trim();
  }

  return process.env.NODE_ENV === "development"
    ? "https://api.buddasfranchise.com/v1/inquiries/webhook"
    : null;
};
