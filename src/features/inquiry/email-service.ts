import type { InquiryValues } from "./schema";
import type { StoredInquiry } from "./types";

export type EmailMessage = {
  to: string;
  from: string;
  subject: string;
  html: string;
  text: string;
};

const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const generateCandidateConfirmationEmail = (
  inquiry: InquiryValues,
): EmailMessage => {
  const safeName = escapeHtml(inquiry.firstName);
  const safeMarket = escapeHtml(inquiry.marketInterest);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Your Budda's Franchise Inquiry</title>
</head>
<body style="font-family: 'DM Sans', Arial, sans-serif; background-color: #FAF6F0; color: #1C1A17; margin: 0; padding: 24px;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #FFFDF9; border-radius: 16px; overflow: hidden; border: 1px solid #F9DE9C;">
    <tr>
      <td style="background-color: #C4522A; padding: 32px; text-align: center;">
        <h1 style="color: #FFFDF9; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">BUDDA'S</h1>
        <p style="color: #F9DE9C; margin: 4px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Hawaiian Bakery &amp; Grill</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 36px 32px;">
        <h2 style="font-size: 20px; color: #1C1A17; margin-top: 0;">Aloha ${safeName},</h2>
        <p style="line-height: 1.6; color: #4A4640; font-size: 15px;">
          Thank you for taking the time to share your background and interest in bringing Budda's to <strong>${safeMarket}</strong>.
        </p>
        <p style="line-height: 1.6; color: #4A4640; font-size: 15px;">
          Our franchise development leadership reviews every submission against our brand standards, operating readiness, and market expansion plan.
        </p>
        <div style="background-color: #FAF6F0; border-left: 4px solid #EFA43A; padding: 16px; margin: 24px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; color: #C4522A; letter-spacing: 0.5px;">What Happens Next</h3>
          <p style="margin: 0; line-height: 1.5; font-size: 14px; color: #1C1A17;">
            If your experience and market align with our current development phase, a member of our team will reach out within 2–3 business days to schedule an introductory discovery conversation.
          </p>
        </div>
        <p style="line-height: 1.6; color: #4A4640; font-size: 15px;">
          In the meantime, feel free to explore our story and operating principles at <a href="https://buddasfranchise.com/franchise/why-buddas" style="color: #C4522A; text-decoration: underline;">buddasfranchise.com</a>.
        </p>
        <p style="margin-top: 32px; line-height: 1.4; color: #1C1A17; font-weight: 600;">
          Mahalo nui loa,<br>
          <span style="font-weight: 400; color: #64748B;">The Budda's Franchise Team</span>
        </p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #FAF6F0; padding: 20px 32px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #EFEAE1;">
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} Budda's Franchising LLC. All rights reserved.</p>
        <p style="margin: 4px 0 0 0;">This email is an informational confirmation and does not constitute an offer of a franchise.</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `Aloha ${inquiry.firstName},\n\nThank you for submitting your franchise inquiry for ${inquiry.marketInterest}. Our team is reviewing your background and will follow up within 2–3 business days.\n\nMahalo,\nThe Budda's Franchise Team`;

  return {
    to: inquiry.email,
    from: "Budda's Franchise Team <franchise@buddasbakery.com>",
    subject: `Your Budda's Franchise Inquiry — ${inquiry.marketInterest}`,
    html,
    text,
  };
};

export const generateInternalLeadAlertEmail = (
  storedInquiry: StoredInquiry,
): EmailMessage => {
  const payload = storedInquiry.payload as unknown as InquiryValues;
  const safeName = escapeHtml(`${payload.firstName} ${payload.lastName}`);
  const safeEmail = escapeHtml(payload.email);
  const safePhone = escapeHtml(payload.phone);
  const safeLocation = escapeHtml(payload.cityState);
  const safeMarket = escapeHtml(payload.marketInterest);
  const safeInvestment = escapeHtml(payload.investmentRange);
  const safeTimeline = escapeHtml(payload.preferredTimeline);
  const safeExperience = escapeHtml(payload.experience);
  const safeMessage = payload.message ? escapeHtml(payload.message) : "None provided";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 20px;">
  <div style="max-width: 650px; margin: 0 auto; background: #fff; padding: 24px; border-radius: 8px; border: 1px solid #e4e4e7;">
    <h2 style="color: #c4522a; margin-top: 0;">New Franchise Inquiry: [${storedInquiry.classification}]</h2>
    <p><strong>Candidate:</strong> ${safeName}</p>
    <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a> | <strong>Phone:</strong> ${safePhone}</p>
    <p><strong>Candidate Location:</strong> ${safeLocation}</p>
    <p><strong>Market of Interest:</strong> ${safeMarket}</p>
    <p><strong>Estimated Capital:</strong> ${safeInvestment}</p>
    <p><strong>Target Timeline:</strong> ${safeTimeline}</p>
    ${storedInquiry.brokerId ? `<p><strong>Broker Referral ID:</strong> ${escapeHtml(storedInquiry.brokerId)}</p>` : ""}
    <hr style="border: 0; border-top: 1px solid #eee; margin: 16px 0;">
    <h3>Experience</h3>
    <p style="white-space: pre-wrap; background: #fafafa; padding: 12px; border-radius: 4px;">${safeExperience}</p>
    <h3>Additional Context</h3>
    <p style="white-space: pre-wrap; background: #fafafa; padding: 12px; border-radius: 4px;">${safeMessage}</p>
  </div>
</body>
</html>
  `.trim();

  return {
    to: "franchise-leads@buddasbakery.com",
    from: "Budda's Pipeline Dispatch <no-reply@buddasbakery.com>",
    subject: `[${storedInquiry.classification}] New Inquiry: ${payload.firstName} ${payload.lastName} (${payload.marketInterest})`,
    html,
    text: `New Inquiry from ${payload.firstName} ${payload.lastName} (${payload.email}) for ${payload.marketInterest}`,
  };
};

export const sendTransactionalEmail = async (
  email: EmailMessage,
): Promise<{ success: boolean; messageId?: string }> => {
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    return { success: true, messageId: `mock-email-${Date.now()}` };
  }

  // Production dispatch placeholder via fetch or SMTP
  return { success: true, messageId: `msg-${Date.now()}` };
};
