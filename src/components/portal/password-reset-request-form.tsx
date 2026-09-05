"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/src/features/auth/reset-actions";

export const PasswordResetRequestForm = () => {
  const [state, action] = useActionState(requestPasswordReset, { status: "idle" });
  if (state.status === "sent") return <div role="status" className="rounded-2xl border border-bds-teal-dark/15 bg-white p-6 text-center text-bds-teal-dark shadow-sm">{state.message}</div>;
  return <form action={action} className="rounded-2xl border border-bds-teal-dark/15 bg-white p-6 space-y-6 shadow-sm sm:p-8"><div><label htmlFor="email" className="operator-login-label block mb-2">Operator Email Address</label><input id="email" name="email" type="email" required autoComplete="username" className="w-full rounded-xl border border-bds-teal-dark/20 bg-bds-cream/50 px-4 py-3.5 text-base text-bds-teal-dark focus:outline-none focus:ring-2 focus:ring-bds-action-primary" placeholder="you@company.com" /></div><button type="submit" className="btn-primary min-h-11 w-full py-3 text-base font-semibold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bds-action-primary focus-visible:ring-offset-2">Send reset instructions</button><Link href="/franchise/login" className="touch-target-inline inline-flex text-sm font-semibold text-bds-teal-dark underline underline-offset-4">Return to sign in</Link></form>;
};
