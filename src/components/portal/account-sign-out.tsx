"use client";

import { useFormStatus } from "react-dom";
import { LogOut } from "lucide-react";

export const AccountSignOut = () => {
  const { pending } = useFormStatus();
  return <><button type="submit" className="btn-outline account-sign-out" disabled={pending}><LogOut size={17} aria-hidden="true" />{pending ? "Signing out…" : "Sign out"}</button><span className="sr-only" role="status">{pending ? "Signing out of Operator Workspace." : ""}</span></>;
};
