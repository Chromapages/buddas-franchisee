import { PasswordResetRequestForm } from "@/src/components/portal/password-reset-request-form";

export const metadata = { title: "Reset Password — Budda's Operator Workspace", robots: { index: false, follow: false, nocache: true } };

export default function ResetPasswordPage() {
  return <main className="mx-auto w-full max-w-[480px] px-4 py-8 sm:px-6 lg:py-12"><h1 className="operator-login-heading text-center">Reset your password</h1><p className="mt-3 text-center text-sm text-bds-cocoa/80">Enter your operator email address to request reset instructions.</p><div className="mt-8"><PasswordResetRequestForm /></div></main>;
}
