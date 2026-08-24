"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction } from "@/src/features/auth/actions";
import { Lock, Store, ShieldCheck, AlertCircle } from "lucide-react";
import type { PortalLocation } from "@/src/features/portal/types";

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary w-full py-4 text-base font-bold shadow-md hover:shadow-lg transition-all"
    >
      {pending ? "Authenticating..." : "Sign In to Operator Workspace"}
    </button>
  );
};

export const LoginForm = ({ locations }: { locations: PortalLocation[] }) => {
  const [state, formAction] = useActionState(loginAction, {
    status: "idle",
  });

  return (
    <form action={formAction} className="bg-white border border-brand-charcoal/10 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-brand-sand">
        <div className="w-10 h-10 rounded-xl bg-brand-sand flex items-center justify-center text-brand-clay">
          <Lock className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-xl font-bold font-heading text-brand-charcoal">
            Authorized Operator Access
          </h3>
          <p className="text-xs text-brand-charcoal/70">
            Sign in to access wholesale ordering, resources, and unit operations.
          </p>
        </div>
      </div>

      {state.status === "error" && state.message ? (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          <span>{state.message}</span>
        </div>
      ) : null}

      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal mb-2">
            Operator Email Address *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue="operator@buddasdemo.com"
            className="w-full px-4 py-3.5 bg-brand-sand/50 border border-brand-charcoal/20 rounded-xl text-base font-semibold text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-clay"
            placeholder="operator@buddasdemo.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal mb-2">
            Password *
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            defaultValue="AlohaBudda2026!"
            className="w-full px-4 py-3.5 bg-brand-sand/50 border border-brand-charcoal/20 rounded-xl text-base font-semibold text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-clay"
            placeholder="••••••••••••"
          />
        </div>

        <div>
          <label htmlFor="locationId" className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal mb-2">
            Operating Unit (Store Location)
          </label>
          <select
            id="locationId"
            name="locationId"
            defaultValue="HNL-014"
            className="w-full px-4 py-3.5 bg-brand-sand/50 border border-brand-charcoal/20 rounded-xl text-base font-semibold text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-clay"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({loc.city}, {loc.state}) — {loc.id}
              </option>
            ))}
          </select>
        </div>
      </div>

      <SubmitButton />

      {/* Demo Credentials Box */}
      <div className="p-4 rounded-2xl bg-brand-sand/60 border border-brand-charcoal/10 text-xs text-brand-charcoal/70 space-y-2">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-brand-clay text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
          Demo Environment Credentials
        </div>
        <div className="space-y-1 font-mono text-[11px]">
          <p><strong>Franchisee:</strong> operator@buddasdemo.com / AlohaBudda2026!</p>
          <p><strong>Administrator:</strong> admin@buddasdemo.com / AlohaAdmin2026!</p>
        </div>
      </div>
    </form>
  );
};
